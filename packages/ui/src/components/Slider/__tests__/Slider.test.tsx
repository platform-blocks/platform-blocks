import React from 'react';
import { View, PanResponder } from 'react-native';
import { render, act } from '@testing-library/react-native';
import { Slider, RangeSlider } from '../Slider';

const palette = ['#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777'];
const mockTheme = {
  colors: {
    primary: palette,
    gray: palette,
  },
  text: {
    primary: '#101010',
    secondary: '#505050',
  },
  semantic: {
    borderSubtle: '#e5e5e5',
  },
  backgrounds: {
    border: '#d0d0d0',
  },
  shadows: {
    sm: '0px 1px 2px rgba(0,0,0,0.15)',
    md: '0px 2px 4px rgba(0,0,0,0.2)',
    lg: '0px 4px 10px rgba(0,0,0,0.25)',
    xl: '0px 8px 20px rgba(0,0,0,0.3)',
  },
};

jest.mock('../../../core/theme', () => ({
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
    track: View,
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
  const pressRangeTrack = (track: View, coords: { locationX?: number; locationY?: number }) => {
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
