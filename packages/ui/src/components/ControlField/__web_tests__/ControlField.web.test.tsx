import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { ControlField } from '../ControlField';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

describe('ControlField (react-native-web DOM)', () => {
  it('is one switch named by its label and described by its description', () => {
    const { container } = render(<ControlField id="wifi" label="Wi-Fi" description="Join known networks" />);

    const row = screen.getByRole('switch', { name: 'Wi-Fi' });
    expect(row.getAttribute('aria-checked')).toBe('false');
    expect(row.getAttribute('aria-describedby')).toBe('wifi-description');

    // The indicator is only a picture of the state: no second control, no second tab stop.
    expect(screen.getAllByRole('switch')).toHaveLength(1);
    expect(container.querySelectorAll('[tabindex="0"]')).toHaveLength(1);

    fireEvent.click(row);
    expect(row.getAttribute('aria-checked')).toBe('true');
  });

  it('uses the variant role and toggles with Space', () => {
    const onChange = jest.fn();
    render(<ControlField variant="checkbox" label="Agree" onChange={onChange} />);

    fireEvent.keyDown(screen.getByRole('checkbox', { name: 'Agree' }), { key: ' ' });
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('links an error and marks the row invalid', () => {
    render(<ControlField id="tos" variant="checkbox" label="Terms" error="Required" required />);
    const row = screen.getByRole('checkbox', { name: 'Terms' });
    expect(row.getAttribute('aria-invalid')).toBe('true');
    expect(row.getAttribute('aria-required')).toBe('true');
    expect(row.getAttribute('aria-describedby')).toBe('tos-error');
    expect(screen.getByRole('alert').textContent).toBe('Required');
  });

  it('wires compound parts to the row', () => {
    render(
      <ControlField id="news" error>
        <ControlField.Label>Newsletter</ControlField.Label>
        <ControlField.Description>Weekly</ControlField.Description>
        <ControlField.Indicator />
        <ControlField.Error>Choose one</ControlField.Error>
      </ControlField>
    );

    const row = screen.getByRole('switch', { name: 'Newsletter' });
    expect(row.getAttribute('aria-labelledby')).toBe('news-label');
    expect(row.getAttribute('aria-describedby')).toBe('news-description news-error');
  });
});
