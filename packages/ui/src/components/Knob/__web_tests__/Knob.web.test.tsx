import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { Knob } from '../Knob';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

describe('Knob (react-native-web DOM)', () => {
  it('is a focusable slider named by its label, with aria-value*', () => {
    render(<Knob label="Gain" description="Input level" min={0} max={100} defaultValue={40} />);

    const knob = screen.getByRole('slider', { name: 'Gain' });
    expect(knob.getAttribute('aria-valuemin')).toBe('0');
    expect(knob.getAttribute('aria-valuemax')).toBe('100');
    expect(knob.getAttribute('aria-valuenow')).toBe('40');
    expect(knob.getAttribute('tabindex')).toBe('0');
    const describedBy = knob.getAttribute('aria-describedby');
    expect(describedBy && document.getElementById(describedBy)?.textContent).toBe('Input level');
  });

  it('turns with the keyboard and commits each step', () => {
    const onChange = jest.fn();
    const onChangeEnd = jest.fn();
    render(<Knob accessibilityLabel="Pan" min={0} max={100} defaultValue={50} onChange={onChange} onChangeEnd={onChangeEnd} />);
    const knob = screen.getByRole('slider', { name: 'Pan' });

    fireEvent.keyDown(knob, { key: 'ArrowUp' });
    expect(knob.getAttribute('aria-valuenow')).toBe('51');
    fireEvent.keyDown(knob, { key: 'PageDown' });
    expect(knob.getAttribute('aria-valuenow')).toBe('41');
    fireEvent.keyDown(knob, { key: 'Home' });
    expect(knob.getAttribute('aria-valuenow')).toBe('0');

    expect(onChange.mock.calls.map(([v]) => v)).toEqual([51, 41, 0]);
    expect(onChangeEnd.mock.calls.map(([v]) => v)).toEqual([51, 41, 0]);
  });

  it('steps between detents when restricted to marks', () => {
    render(
      <Knob accessibilityLabel="Mode" marks={[{ value: 0 }, { value: 40 }, { value: 90 }]} restrictToMarks defaultValue={0} max={100} />
    );
    const knob = screen.getByRole('slider');
    fireEvent.keyDown(knob, { key: 'ArrowRight' });
    expect(knob.getAttribute('aria-valuenow')).toBe('40');
    fireEvent.keyDown(knob, { key: 'End' });
    expect(knob.getAttribute('aria-valuenow')).toBe('90');
  });

  it('omits the bounds of an endless knob and leaves the tab order when disabled', () => {
    const { rerender } = render(<Knob accessibilityLabel="Jog" behavior="endless" defaultValue={10} />);
    const knob = screen.getByRole('slider');
    expect(knob.getAttribute('aria-valuemin')).toBeNull();
    expect(knob.getAttribute('aria-valuemax')).toBeNull();

    rerender(
      <PlocksProvider>
        <Knob accessibilityLabel="Jog" behavior="endless" defaultValue={10} disabled />
      </PlocksProvider>
    );
    expect(screen.getByRole('slider').getAttribute('tabindex')).toBe('-1');
    expect(screen.getByRole('slider').getAttribute('aria-disabled')).toBe('true');
  });
});
