import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { Radio, RadioGroup } from '../Radio';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

const OPTIONS = [
  { label: 'Basic', value: 'basic' },
  { label: 'Pro', value: 'pro' },
  { label: 'Team', value: 'team', disabled: true },
  { label: 'Enterprise', value: 'enterprise' },
];

describe('Radio (react-native-web DOM)', () => {
  it('exposes role="radio" with aria-checked and its label as the name', () => {
    render(<Radio value="a" label="Alpha" checked />);
    const radio = screen.getByRole('radio', { name: 'Alpha' });
    expect(radio.getAttribute('aria-checked')).toBe('true');
  });

  it('picks itself with Space and from its label', () => {
    const onChange = jest.fn();
    render(<Radio value="b" label="Beta" onChange={onChange} />);

    fireEvent.keyDown(screen.getByRole('radio'), { key: ' ' });
    fireEvent.click(screen.getByText('Beta'));
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenCalledWith('b');
  });
});

describe('RadioGroup (react-native-web DOM)', () => {
  it('is a labelled radiogroup with one tab stop on the selected radio', () => {
    render(<RadioGroup id="plan" label="Plan" defaultValue="pro" options={OPTIONS} />);

    const group = screen.getByRole('radiogroup', { name: 'Plan' });
    expect(group.getAttribute('aria-labelledby')).toBe('plan-label');

    const radios = screen.getAllByRole('radio');
    expect(radios.map((radio) => radio.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false', 'false']);
    expect(radios.map((radio) => radio.getAttribute('tabindex'))).toEqual(['-1', '0', '-1', '-1']);
  });

  it('moves focus and selection together with the arrow keys, skipping disabled options', () => {
    const onChange = jest.fn();
    render(<RadioGroup label="Plan" defaultValue="pro" options={OPTIONS} onChange={onChange} />);

    const radios = screen.getAllByRole('radio');
    radios[1].focus();

    fireEvent.keyDown(radios[1], { key: 'ArrowDown' });
    expect(onChange).toHaveBeenLastCalledWith('enterprise');
    expect(document.activeElement).toBe(radios[3]);
    expect(radios[3].getAttribute('aria-checked')).toBe('true');
    expect(radios[3].getAttribute('tabindex')).toBe('0');

    // Keeps going from the newly focused radio, wrapping to the start.
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('basic');
    expect(document.activeElement).toBe(radios[0]);

    fireEvent.keyDown(document.activeElement as Element, { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith('enterprise');
  });

  it('makes the first radio the tab stop while nothing is selected', () => {
    render(<RadioGroup label="Plan" options={OPTIONS} />);
    const radios = screen.getAllByRole('radio');
    expect(radios[0].getAttribute('tabindex')).toBe('0');
    expect(radios.filter((radio) => radio.getAttribute('aria-checked') === 'true')).toHaveLength(0);
  });

  it('links the group error and marks the group invalid', () => {
    render(<RadioGroup id="tier" label="Tier" error="Pick a tier" required options={OPTIONS} />);
    const group = screen.getByRole('radiogroup', { name: 'Tier' });
    expect(group.getAttribute('aria-invalid')).toBe('true');
    expect(group.getAttribute('aria-required')).toBe('true');
    expect(group.getAttribute('aria-describedby')).toBe('tier-error');
    expect(screen.getByRole('alert').textContent).toBe('Pick a tier');
  });

  it('gives the button-like variants the same radio semantics', () => {
    render(<RadioGroup label="View" variant="segmented" defaultValue="basic" options={OPTIONS.slice(0, 2)} />);
    const radios = screen.getAllByRole('radio');
    expect(radios.map((radio) => radio.getAttribute('aria-checked'))).toEqual(['true', 'false']);

    radios[0].focus();
    fireEvent.keyDown(radios[0], { key: 'ArrowRight' });
    expect(radios[1].getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement).toBe(radios[1]);
  });
});
