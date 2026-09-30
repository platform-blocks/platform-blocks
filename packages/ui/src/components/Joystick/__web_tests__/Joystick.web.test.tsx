import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { ReducedMotionProvider } from '../../../core/motion/ReducedMotionProvider';
import { Joystick } from '../Joystick';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

describe('Joystick (react-native-web DOM)', () => {
  it('exposes its value on the web (aria-value*), named by its label', () => {
    render(<Joystick label="Camera" shape="square" defaultValue={{ x: 0.25, y: -0.5 }} />);

    const pad = screen.getByRole('slider', { name: 'Camera' });
    expect(pad.getAttribute('aria-valuenow')).toBe('0.25');
    expect(pad.getAttribute('aria-valuemin')).toBe('-1');
    expect(pad.getAttribute('aria-valuemax')).toBe('1');
    expect(pad.getAttribute('aria-valuetext')).toBe('x 0.25  y -0.50');
    expect(pad.getAttribute('tabindex')).toBe('0');
  });

  it('moves on both axes with the arrow keys and recentres with Escape', () => {
    const onChange = jest.fn();
    const onChangeEnd = jest.fn();
    render(
      <ReducedMotionProvider reducedMotion>
        <Joystick accessibilityLabel="Stick" shape="square" keyboardStep={0.5} onChange={onChange} onChangeEnd={onChangeEnd} />
      </ReducedMotionProvider>
    );
    const pad = screen.getByRole('slider', { name: 'Stick' });

    fireEvent.keyDown(pad, { key: 'ArrowRight' });
    fireEvent.keyDown(pad, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenLastCalledWith({ x: 0.5, y: 0.5 });
    expect(pad.getAttribute('aria-valuetext')).toBe('x 0.50  y 0.50');

    fireEvent.keyDown(pad, { key: 'Escape' });
    expect(onChange).toHaveBeenLastCalledWith({ x: 0, y: 0 });
    expect(onChangeEnd).toHaveBeenLastCalledWith({ x: 0, y: 0 });
  });

  it('is disabled and out of the tab order when disabled', () => {
    render(<Joystick accessibilityLabel="Off" disabled />);
    const pad = screen.getByRole('slider');
    expect(pad.getAttribute('aria-disabled')).toBe('true');
    expect(pad.getAttribute('tabindex')).toBe('-1');
  });
});
