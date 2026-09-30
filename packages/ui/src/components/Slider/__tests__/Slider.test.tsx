import React from 'react';
import { View, PanResponder } from 'react-native';
import { render, act } from '@testing-library/react-native';
import { Slider, RangeSlider } from '../Slider';

const palette = ['#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777'];
// The real default theme, with the palettes the slider paints with stubbed.
const mockDefaultTheme = jest.requireActual('../../../core/theme/defaultTheme').DEFAULT_THEME;
const mockTheme = {
  ...mockDefaultTheme,
  colors: { ...mockDefaultTheme.colors, primary: palette, gray: palette },
};

jest.mock('../../../core/theme/ThemeProvider', () => ({
  ...jest.requireActual('../../../core/theme/ThemeProvider'),
  useTheme: () => mockTheme,
}));

let panResponderSpy: jest.SpyInstance | undefined;

beforeAll(() => {
  panResponderSpy = jest.spyOn(PanResponder, 'create').mockImplementation((config: any) => ({
    panHandlers: config,
  }));
});

afterAll(() => {
  panResponderSpy?.mockRestore();
});

// `PanResponder.create` is mocked to hand its config back as `panHandlers`, so
// the rail view carries the raw `onPanResponder*` callbacks as props.
/** A rendered host View instance (not a native View ref). */
type SliderTrack = ReturnType<ReturnType<typeof render>['UNSAFE_getAllByType']>[number];

const findInteractiveView = (api: ReturnType<typeof render>, matcher: (props: Record<string, any>) => boolean) => {
  const view = api.UNSAFE_getAllByType(View).find((instance) => (
    typeof instance.props.onPanResponderGrant === 'function' && matcher(instance.props)
  ));

  if (!view) {
    throw new Error('Unable to locate slider track view');
  }

  return view;
};

/**
 * `useDragGesture` derives the rail origin from `pageX - locationX` on grant, so
 * a press at a given offset is expressed by matching page and location values.
 */
const pressEvent = (coords: { locationX?: number; locationY?: number }) => {
  const locationX = coords.locationX ?? 0;
  const locationY = coords.locationY ?? 0;
  return {
    nativeEvent: {
      locationX,
      locationY,
      pageX: locationX,
      pageY: locationY,
    },
  } as any;
};

describe('Slider - behavior', () => {
  const pressTrack = (
    track: SliderTrack,
    coords: { locationX?: number; locationY?: number }
  ) => {
    act(() => {
      track.props.onPanResponderGrant?.(pressEvent(coords));
    });
  };

  it('calls onChange with the derived value when the track is pressed', () => {
    const handleChange = jest.fn();
    const api = render(<Slider onChange={handleChange} />);
    const track = findInteractiveView(api, () => true);

    pressTrack(track, { locationX: 160 });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(54);
  });

  it('snaps to the nearest tick when restrictToTicks is enabled', () => {
    const handleChange = jest.fn();
    const ticks = [0, 25, 50, 75, 100].map((value) => ({ value }));
    const api = render(
      <Slider
        min={0}
        max={100}
        ticks={ticks}
        restrictToTicks
        showTicks
        onChange={handleChange}
      />
    );
    const track = findInteractiveView(api, () => true);

    pressTrack(track, { locationX: 140 });

    expect(handleChange).toHaveBeenCalledWith(50);
  });

  it('ignores presses when disabled', () => {
    const handleChange = jest.fn();
    const api = render(<Slider disabled onChange={handleChange} />);
    const track = findInteractiveView(api, () => true);

    pressTrack(track, { locationX: 200 });

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('maps vertical presses so the top of the track corresponds to the max value', () => {
    const handleChange = jest.fn();
    const api = render(
      <Slider orientation="vertical" min={0} max={100} onChange={handleChange} />
    );
    const track = findInteractiveView(api, () => true);

    pressTrack(track, { locationY: 0 });

    expect(handleChange).toHaveBeenCalledWith(100);
  });
});

describe('RangeSlider - behavior', () => {
  const pressRangeTrack = (track: SliderTrack, coords: { locationX?: number; locationY?: number }) => {
    act(() => {
      track.props.onPanResponderGrant?.(pressEvent(coords));
    });
  };

  it('moves the closest thumb when the shared track is pressed', () => {
    const handleChange = jest.fn();
    const api = render(
      <RangeSlider
        value={[20, 80]}
        min={0}
        max={100}
        onChange={handleChange}
      />
    );
    const track = findInteractiveView(api, (props) => props.collapsable === false);

    pressRangeTrack(track, { locationX: 40 });

    expect(handleChange).toHaveBeenCalledWith([11, 80]);
  });

  it('updates the max thumb when pressing close to the end of the track', () => {
    const handleChange = jest.fn();
    const api = render(
      <RangeSlider
        value={[20, 80]}
        min={0}
        max={100}
        onChange={handleChange}
      />
    );
    const track = findInteractiveView(api, (props) => props.collapsable === false);

    pressRangeTrack(track, { locationX: 280 });

    expect(handleChange).toHaveBeenCalledWith([20, 96]);
  });

  it('does not react to presses when disabled', () => {
    const handleChange = jest.fn();
    const api = render(
      <RangeSlider
        value={[10, 40]}
        min={0}
        max={100}
        disabled
        onChange={handleChange}
      />
    );
    const track = findInteractiveView(api, (props) => props.collapsable === false);

    pressRangeTrack(track, { locationX: 180 });

    expect(handleChange).not.toHaveBeenCalled();
  });
});

describe('Slider - value, a11y and new props', () => {
  const release = (track: SliderTrack, coords: { locationX?: number; locationY?: number }) => {
    act(() => {
      track.props.onPanResponderRelease?.(pressEvent(coords), {} as any);
    });
  };

  it('fires onChangeEnd once when the drag is released', () => {
    const handleChange = jest.fn();
    const handleChangeEnd = jest.fn();
    const api = render(<Slider onChange={handleChange} onChangeEnd={handleChangeEnd} label="Volume" />);
    const track = findInteractiveView(api, () => true);

    act(() => {
      track.props.onPanResponderGrant?.(pressEvent({ locationX: 160 }));
    });
    expect(handleChangeEnd).not.toHaveBeenCalled();
    release(track, { locationX: 160 });

    expect(handleChangeEnd).toHaveBeenCalledTimes(1);
    expect(handleChangeEnd).toHaveBeenCalledWith(54);
  });

  it('works uncontrolled from defaultValue', () => {
    const api = render(<Slider defaultValue={30} label="Level" testID="level" />);
    expect(api.getByTestId('level-thumb').props['aria-valuenow']).toBe(30);
  });

  it('puts the adjustable semantics on the thumb, named by the label', () => {
    const api = render(<Slider value={40} label="Brightness" testID="b" />);
    const thumb = api.getByTestId('b-thumb');
    expect(thumb.props.role).toBe('slider');
    expect(thumb.props['aria-label']).toBe('Brightness');
    expect(thumb.props['aria-valuemin']).toBe(0);
    expect(thumb.props['aria-valuemax']).toBe(100);
    expect(thumb.props['aria-valuetext']).toBe('40');
  });

  it('adjusts through the increment / decrement accessibility actions and reports the end', () => {
    const handleChange = jest.fn();
    const handleChangeEnd = jest.fn();
    const api = render(
      <Slider defaultValue={10} step={5} label="Step" testID="s" onChange={handleChange} onChangeEnd={handleChangeEnd} />
    );
    act(() => {
      api.getByTestId('s-thumb').props.onAccessibilityAction({ nativeEvent: { actionName: 'increment' } });
    });
    expect(handleChange).toHaveBeenCalledWith(15);
    expect(handleChangeEnd).toHaveBeenCalledWith(15);
  });

  it('maps presses from the other end when inverted', () => {
    const handleChange = jest.fn();
    const api = render(<Slider inverted onChange={handleChange} label="Inverted" />);
    const track = findInteractiveView(api, () => true);

    // 10px from the left is the maximum end of an inverted track.
    act(() => {
      track.props.onPanResponderGrant?.(pressEvent({ locationX: 10 }));
    });
    expect(handleChange).toHaveBeenCalledWith(100);
  });

  it('labels the ends with showMarks', () => {
    const api = render(<Slider showMarks min={0} max={50} label="Marks" />);
    expect(api.getByText('0')).toBeTruthy();
    expect(api.getByText('50')).toBeTruthy();
  });

  it('shows the value label only while interacting by default, never with tooltip="never"', () => {
    const api = render(<Slider value={33} label="Hover" valueLabel={(v) => `v${v}`} />);
    expect(api.queryByText('v33', { includeHiddenElements: true })).toBeNull();

    api.rerender(<Slider value={33} label="Hover" valueLabel={(v) => `v${v}`} tooltip="always" />);
    expect(api.getByText('v33', { includeHiddenElements: true })).toBeTruthy();

    api.rerender(<Slider value={33} label="Hover" valueLabel={(v) => `v${v}`} tooltip="never" />);
    expect(api.queryByText('v33', { includeHiddenElements: true })).toBeNull();
  });

  it('forwards its ref to the track', () => {
    const ref = React.createRef<View>();
    render(<Slider ref={ref} label="Ref" />);
    expect(ref.current).toBeTruthy();
  });
});

describe('RangeSlider - value, a11y and new props', () => {
  it('works uncontrolled from defaultValue', () => {
    const handleChange = jest.fn();
    const api = render(<RangeSlider defaultValue={[10, 40]} onChange={handleChange} label="Range" testID="r" />);
    expect(api.getByTestId('r-thumb-min').props['aria-valuenow']).toBe(10);
    expect(api.getByTestId('r-thumb-max').props['aria-valuenow']).toBe(40);

    act(() => {
      api.getByTestId('r-thumb-min').props.onAccessibilityAction({ nativeEvent: { actionName: 'increment' } });
    });
    expect(handleChange).toHaveBeenCalledWith([11, 40]);
    expect(api.getByTestId('r-thumb-min').props['aria-valuenow']).toBe(11);
  });

  it('names each thumb and bounds it by the other', () => {
    const api = render(<RangeSlider value={[20, 70]} label="Price" testID="p" />);
    const low = api.getByTestId('p-thumb-min');
    const high = api.getByTestId('p-thumb-max');
    expect(low.props['aria-label']).toBe('Price, Minimum');
    expect(high.props['aria-label']).toBe('Price, Maximum');
    expect(low.props['aria-valuemax']).toBe(70);
    expect(high.props['aria-valuemin']).toBe(20);
  });

  it('uses rangeLabels for the thumb names', () => {
    const api = render(<RangeSlider value={[20, 70]} rangeLabels={['From', 'To']} testID="p" />);
    expect(api.getByTestId('p-thumb-min').props['aria-label']).toBe('From');
    expect(api.getByTestId('p-thumb-max').props['aria-label']).toBe('To');
  });

  it('keeps minRange between the thumbs', () => {
    const handleChange = jest.fn();
    const api = render(<RangeSlider value={[20, 30]} minRange={10} onChange={handleChange} label="Gap" testID="g" />);
    act(() => {
      api.getByTestId('g-thumb-min').props.onAccessibilityAction({ nativeEvent: { actionName: 'increment' } });
    });
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('lets a dragged thumb cross the other with allowCross', () => {
    const handleChange = jest.fn();
    const api = render(<RangeSlider value={[20, 40]} min={0} max={100} allowCross onChange={handleChange} label="Cross" />);
    const track = findInteractiveView(api, (props) => props.collapsable === false);

    act(() => {
      track.props.onPanResponderGrant?.(pressEvent({ locationX: 70 }));
    });
    // Pressing at ~21 grabs the min thumb; dragging it to ~57 carries it past the max.
    act(() => {
      track.props.onPanResponderMove?.(pressEvent({ locationX: 170 }), {} as any);
    });
    expect(handleChange).toHaveBeenLastCalledWith([40, 57]);
  });
});
