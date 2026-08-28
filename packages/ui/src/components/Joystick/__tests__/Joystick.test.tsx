import React from 'react';
import { PanResponder, View } from 'react-native';
import { render, act } from '@testing-library/react-native';

import { Joystick } from '../Joystick';
import { applyDeadZone, clampToShape, resolveJoystickValue, valueToOffset } from '../utils';

let panResponderSpy: jest.SpyInstance | undefined;

beforeAll(() => {
  panResponderSpy = jest
    .spyOn(PanResponder, 'create')
    .mockImplementation((config: any) => ({ panHandlers: config }));
});

afterAll(() => panResponderSpy?.mockRestore());

describe('clampToShape', () => {
  it('rides the rim of a circle at full deflection', () => {
    const clamped = clampToShape(3, 4, 'circle');
    expect(clamped.x).toBeCloseTo(0.6);
    expect(clamped.y).toBeCloseTo(0.8);
  });

  it('leaves a point inside the disc alone', () => {
    expect(clampToShape(0.3, 0.4, 'circle')).toEqual({ x: 0.3, y: 0.4 });
  });

  it('lets a square reach its corners', () => {
    expect(clampToShape(3, 4, 'square')).toEqual({ x: 1, y: 1 });
  });
});

describe('applyDeadZone', () => {
  it('reports nothing inside the dead zone', () => {
    expect(applyDeadZone({ x: 0.1, y: 0 }, 0.2, 'circle')).toEqual({ x: 0, y: 0 });
  });

  it('rescales past the threshold so full deflection is still 1', () => {
    const value = applyDeadZone({ x: 1, y: 0 }, 0.2, 'circle');
    expect(value.x).toBeCloseTo(1);
  });

  it('starts from zero just outside the threshold rather than jumping to it', () => {
    const value = applyDeadZone({ x: 0.2001, y: 0 }, 0.2, 'circle');
    expect(value.x).toBeLessThan(0.01);
  });

  it('treats each axis independently on a square pad', () => {
    const value = applyDeadZone({ x: 0.1, y: 1 }, 0.2, 'square');
    expect(value.x).toBe(0);
    expect(value.y).toBeCloseTo(1);
  });
});

describe('resolveJoystickValue', () => {
  const base = { shape: 'circle' as const, deadZone: 0, step: 0, invertY: true };

  it('reports a positive Y when the handle is pushed up', () => {
    // Screen Y grows downward, so "up" arrives as a negative raw Y.
    expect(resolveJoystickValue(0, -1, base)).toEqual({ x: 0, y: 1 });
  });

  it('follows screen space when invertY is off', () => {
    expect(resolveJoystickValue(0, -1, { ...base, invertY: false })).toEqual({ x: 0, y: -1 });
  });

  it('zeroes the locked axis', () => {
    expect(resolveJoystickValue(1, 1, { ...base, lockAxis: 'x' })).toEqual({ x: 1, y: 0 });
    expect(resolveJoystickValue(1, 1, { ...base, lockAxis: 'y' })).toEqual({ x: 0, y: -1 });
  });

  it('snaps each axis to the step', () => {
    expect(resolveJoystickValue(0.6, 0, { ...base, step: 0.5 })).toEqual({ x: 0.5, y: 0 });
    // A step that does not divide the range evenly lands on the nearest tick.
    expect(resolveJoystickValue(1, 0, { ...base, step: 0.3 })).toEqual({ x: 0.9, y: 0 });
  });

  it('re-clamps after snapping so rounding cannot overshoot the range', () => {
    // 1 / 0.4 rounds up to 3 ticks — 1.2 — which has to come back to 1.
    expect(resolveJoystickValue(1, 0, { ...base, step: 0.4 })).toEqual({ x: 1, y: 0 });
  });
});

describe('valueToOffset', () => {
  it('flips the reported value back into screen space', () => {
    expect(valueToOffset({ x: 0.5, y: 1 }, true)).toEqual({ x: 0.5, y: -1 });
  });
});

const findSurface = (api: ReturnType<typeof render>) => {
  const view = api.UNSAFE_getAllByType(View).find(
    (instance) => typeof instance.props.onPanResponderGrant === 'function'
  );
  if (!view) throw new Error('Unable to locate joystick surface');
  return view;
};

const layout = (view: any, size: number) => {
  act(() => {
    view.props.onLayout?.({ nativeEvent: { layout: { x: 0, y: 0, width: size, height: size } } });
  });
};

/** Grant lands on the surface, so `page − location` is the surface origin. */
const press = (view: any, x: number, y: number) => {
  act(() => {
    view.props.onPanResponderGrant?.({ nativeEvent: { pageX: x, pageY: y, locationX: x, locationY: y } });
  });
};

const move = (view: any, x: number, y: number) => {
  act(() => {
    view.props.onPanResponderMove?.({ nativeEvent: { pageX: x, pageY: y, locationX: 0, locationY: 0 } }, {} as any);
  });
};

const release = (view: any, x: number, y: number) => {
  act(() => {
    view.props.onPanResponderRelease?.({ nativeEvent: { pageX: x, pageY: y, locationX: 0, locationY: 0 } }, {} as any);
  });
};

describe('Joystick', () => {
  // md is 144px with a 46px handle, leaving 49px of travel from centre.
  const SIZE = 144;

  it('reports the centre when pressed dead centre', () => {
    const handleChange = jest.fn();
    const api = render(<Joystick onChange={handleChange} shape="square" />);
    const surface = findSurface(api);
    layout(surface, SIZE);

    press(surface, SIZE / 2, SIZE / 2);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('reports full right deflection at the edge', () => {
    const handleChange = jest.fn();
    const api = render(<Joystick onChange={handleChange} shape="square" />);
    const surface = findSurface(api);
    layout(surface, SIZE);

    press(surface, SIZE, SIZE / 2);

    expect(handleChange).toHaveBeenCalledWith({ x: 1, y: 0 });
  });

  it('reports a positive Y when pushed to the top', () => {
    const handleChange = jest.fn();
    const api = render(<Joystick onChange={handleChange} shape="square" />);
    const surface = findSurface(api);
    layout(surface, SIZE);

    press(surface, SIZE / 2, 0);

    expect(handleChange).toHaveBeenCalledWith({ x: 0, y: 1 });
  });

  it('keeps tracking after the pointer leaves the pad', () => {
    const handleChange = jest.fn();
    const api = render(<Joystick onChange={handleChange} shape="square" />);
    const surface = findSurface(api);
    layout(surface, SIZE);

    press(surface, SIZE / 2, SIZE / 2);
    // Far below the pad: the value pins to the bottom instead of the gesture
    // being handed back to the page.
    move(surface, SIZE / 2, SIZE * 4);

    expect(handleChange).toHaveBeenLastCalledWith({ x: 0, y: -1 });
  });

  it('springs back to centre on release by default', () => {
    const handleChange = jest.fn();
    const handleChangeEnd = jest.fn();
    const api = render(<Joystick onChange={handleChange} onChangeEnd={handleChangeEnd} />);
    const surface = findSurface(api);
    layout(surface, SIZE);

    press(surface, SIZE, SIZE / 2);
    release(surface, SIZE, SIZE / 2);

    expect(handleChange).toHaveBeenLastCalledWith({ x: 0, y: 0 });
    expect(handleChangeEnd).toHaveBeenCalledWith({ x: 0, y: 0 });
  });

  it('holds its position on release when acting as an XY pad', () => {
    const handleChangeEnd = jest.fn();
    const api = render(<Joystick shape="square" onChangeEnd={handleChangeEnd} />);
    const surface = findSurface(api);
    layout(surface, SIZE);

    press(surface, SIZE, SIZE / 2);
    release(surface, SIZE, SIZE / 2);

    expect(handleChangeEnd).toHaveBeenCalledWith({ x: 1, y: 0 });
  });

  it('returns to centre if the gesture is terminated mid-drag', () => {
    const handleChange = jest.fn();
    const api = render(<Joystick onChange={handleChange} />);
    const surface = findSurface(api);
    layout(surface, SIZE);

    press(surface, SIZE, SIZE / 2);
    act(() => { surface.props.onPanResponderTerminate?.({} as any, {} as any); });

    expect(handleChange).toHaveBeenLastCalledWith({ x: 0, y: 0 });
  });

  it('ignores input while disabled', () => {
    const handleChange = jest.fn();
    const api = render(<Joystick disabled onChange={handleChange} />);
    const surface = findSurface(api);
    layout(surface, SIZE);

    expect(surface.props.onStartShouldSetPanResponder()).toBe(false);
    press(surface, SIZE, SIZE / 2);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('constrains travel to the locked axis', () => {
    const handleChange = jest.fn();
    const api = render(<Joystick shape="square" lockAxis="x" onChange={handleChange} />);
    const surface = findSurface(api);
    layout(surface, SIZE);

    press(surface, SIZE, 0);

    expect(handleChange).toHaveBeenCalledWith({ x: 1, y: 0 });
  });

  it('nudges by the keyboard step on an arrow key', () => {
    const handleChange = jest.fn();
    const api = render(<Joystick shape="square" keyboardStep={0.25} onChange={handleChange} />);
    const surface = findSurface(api);

    act(() => {
      surface.props.onAccessibilityAction?.({ nativeEvent: { actionName: 'increment' } } as any);
    });

    expect(handleChange).toHaveBeenCalledWith({ x: 0.25, y: 0 });
  });

  it('honours a controlled value', () => {
    const api = render(<Joystick shape="square" value={{ x: 0.5, y: -0.5 }} />);
    expect(api.getByLabelText('Joystick')).toBeTruthy();
  });
});
