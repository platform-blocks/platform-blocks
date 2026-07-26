/**
 * Knob - keyboard and assistive-technology adjustment
 *
 * The surface takes focus and claims `accessibilityRole="adjustable"`, so these cover the
 * moves that role promises. Keys are dispatched straight at the host view's `onKeyDown`,
 * which is where react-native-web delivers them.
 */

import React from 'react';
import { Platform } from 'react-native';
import { render } from '@testing-library/react-native';

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: View, Svg: View, Circle: View, Line: View, Path: View };
});

// The shared jest setup pins direction to LTR for every suite, so RTL needs a local,
// flippable override to be testable at all.
let mockIsRTL = false;
jest.mock('../../../core/providers/DirectionProvider', () => ({
  useDirection: () => ({ dir: mockIsRTL ? 'rtl' : 'ltr', isRTL: mockIsRTL, setDirection: jest.fn() }),
  DirectionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import { Knob } from '../Knob';

const originalOS = Platform.OS;
const setPlatform = (os: string) => {
  (Platform as unknown as { OS: string }).OS = os;
};
afterAll(() => setPlatform(originalOS));

const renderKnob = (props: Record<string, unknown> = {}) => {
  const onChange = jest.fn();
  const onChangeEnd = jest.fn();
  const utils = render(
    <Knob
      testID="knob"
      min={0}
      max={100}
      step={1}
      defaultValue={50}
      onChange={onChange}
      onChangeEnd={onChangeEnd}
      {...props}
    />,
  );
  return { onChange, onChangeEnd, knob: utils.getByTestId('knob') };
};

const press = (knob: any, key: string, modifiers: Record<string, boolean> = {}) => {
  const event = { key, preventDefault: jest.fn(), stopPropagation: jest.fn(), ...modifiers };
  knob.props.onKeyDown?.(event);
  return event;
};

describe('Knob keyboard (web)', () => {
  beforeEach(() => setPlatform('web'));

  it('is reachable by tab', () => {
    expect(renderKnob().knob.props.tabIndex).toBe(0);
  });

  it('publishes the value to assistive tech, which react-native-web only reads off aria-*', () => {
    const { knob } = renderKnob();

    expect(knob.props['aria-valuemin']).toBe(0);
    expect(knob.props['aria-valuemax']).toBe(100);
    expect(knob.props['aria-valuenow']).toBe(50);
  });

  it.each([
    ['ArrowRight', 51],
    ['ArrowUp', 51],
    ['ArrowLeft', 49],
    ['ArrowDown', 49],
  ])('nudges by one step on %s', (key, expected) => {
    const { onChange, knob } = renderKnob();

    press(knob, key);

    expect(onChange).toHaveBeenCalledWith(expected);
  });

  it('takes a coarse step with shift held', () => {
    const { onChange, knob } = renderKnob();

    press(knob, 'ArrowRight', { shiftKey: true });

    expect(onChange).toHaveBeenCalledWith(60);
  });

  it('crosses a tenth of the range on the page keys', () => {
    const { onChange, knob } = renderKnob();

    press(knob, 'PageUp');
    expect(onChange).toHaveBeenCalledWith(60);

    press(knob, 'PageDown');
    expect(onChange).toHaveBeenLastCalledWith(50);
  });

  it('pins to the bounds on Home and End', () => {
    const { onChange, knob } = renderKnob();

    press(knob, 'End');
    expect(onChange).toHaveBeenCalledWith(100);

    press(knob, 'Home');
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it('commits each press, so onChangeEnd fires without a gesture to release', () => {
    const { onChangeEnd, knob } = renderKnob();

    press(knob, 'ArrowRight');

    expect(onChangeEnd).toHaveBeenCalledWith(51);
  });

  it('stops the page from scrolling on keys it handles', () => {
    const { knob } = renderKnob();

    const handled = press(knob, 'ArrowRight');
    expect(handled.preventDefault).toHaveBeenCalled();

    // Anything it does not act on must pass through untouched.
    const ignored = press(knob, 'a');
    expect(ignored.preventDefault).not.toHaveBeenCalled();
  });

  it('clamps at the ends instead of wrapping', () => {
    const { onChange, knob } = renderKnob({ defaultValue: 100 });

    press(knob, 'ArrowRight');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('swaps the horizontal arrows under RTL, leaving the vertical ones alone', () => {
    mockIsRTL = true;
    try {
      const { onChange, knob } = renderKnob();

      // Reading order flips, so ArrowLeft is now the forward key...
      press(knob, 'ArrowLeft');
      expect(onChange).toHaveBeenCalledWith(51);

      // ...while up/down keep pointing the same way.
      press(knob, 'ArrowDown');
      expect(onChange).toHaveBeenLastCalledWith(50);
    } finally {
      mockIsRTL = false;
    }
  });

  it.each([['disabled'], ['readOnly']])('ignores keys when %s', (prop) => {
    const { onChange, knob } = renderKnob({ [prop]: true });

    press(knob, 'ArrowRight');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('takes the knob out of the tab order when disabled', () => {
    expect(renderKnob({ disabled: true }).knob.props.tabIndex).toBe(-1);
  });

  it('steps between detents on a knob restricted to marks', () => {
    const { onChange, knob } = renderKnob({
      marks: [{ value: 0 }, { value: 25 }, { value: 75 }],
      restrictToMarks: true,
      defaultValue: 25,
    });

    // A one-step nudge would round straight back to 25 without the adjacent-mark path.
    press(knob, 'ArrowRight');
    expect(onChange).toHaveBeenCalledWith(75);

    press(knob, 'ArrowLeft');
    expect(onChange).toHaveBeenLastCalledWith(25);
  });

  it('holds at the outermost detent', () => {
    const { onChange, knob } = renderKnob({
      marks: [{ value: 0 }, { value: 50 }],
      restrictToMarks: true,
      defaultValue: 50,
    });

    press(knob, 'ArrowRight');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('leaves Home and End alone in endless mode, which has no ends', () => {
    const { onChange, knob } = renderKnob({ behavior: 'endless' });

    const event = press(knob, 'End');

    expect(onChange).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('still turns an endless knob with the arrows', () => {
    const { onChange, knob } = renderKnob({ behavior: 'endless' });

    press(knob, 'ArrowRight');

    expect(onChange).toHaveBeenCalledWith(51);
  });
});

describe('Knob accessibility actions', () => {
  beforeEach(() => setPlatform('ios'));

  it('exposes increment and decrement for screen readers', () => {
    const { knob } = renderKnob();

    expect(knob.props.accessibilityActions).toEqual([
      { name: 'increment', label: 'Increase value' },
      { name: 'decrement', label: 'Decrease value' },
    ]);
  });

  it('adjusts the value when one fires', () => {
    const { onChange, knob } = renderKnob();

    knob.props.onAccessibilityAction({ nativeEvent: { actionName: 'increment' } });
    expect(onChange).toHaveBeenCalledWith(51);

    knob.props.onAccessibilityAction({ nativeEvent: { actionName: 'decrement' } });
    expect(onChange).toHaveBeenLastCalledWith(50);
  });

  it('drops the actions when the knob cannot be adjusted', () => {
    const { knob } = renderKnob({ disabled: true });

    expect(knob.props.accessibilityActions).toBeUndefined();
    expect(knob.props.onAccessibilityAction).toBeUndefined();
  });
});
