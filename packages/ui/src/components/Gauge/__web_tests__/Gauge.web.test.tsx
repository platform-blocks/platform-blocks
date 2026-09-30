import React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { Gauge } from '../Gauge';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

describe('Gauge (react-native-web DOM)', () => {
  it('is a meter with its range, value and value text in the DOM', () => {
    render(<Gauge value={42} min={0} max={200} aria-label="Engine speed" />);
    const gauge = screen.getByRole('meter', { name: 'Engine speed' });
    expect(gauge.getAttribute('aria-valuemin')).toBe('0');
    expect(gauge.getAttribute('aria-valuemax')).toBe('200');
    expect(gauge.getAttribute('aria-valuenow')).toBe('42');
    expect(gauge.getAttribute('aria-valuetext')).toBe('42');
  });

  it('clamps the value and names the band it falls in', () => {
    render(
      <Gauge
        value={250}
        min={0}
        max={200}
        aria-label="Engine speed"
        labels={{ formatter: (v) => `${v} rpm` }}
        ranges={[
          { from: 0, to: 150, color: '#22c55e', label: 'Normal' },
          { from: 150, to: 200, color: '#ef4444', label: 'Redline' },
        ]}
      />
    );
    const gauge = screen.getByRole('meter', { name: 'Engine speed' });
    expect(gauge.getAttribute('aria-valuenow')).toBe('200');
    expect(gauge.getAttribute('aria-valuetext')).toBe('200 rpm, Redline');
  });

  it('renders compound parts through the statics', () => {
    render(
      <Gauge value={10} aria-label="Level">
        <Gauge.Track testID="track" />
        <Gauge.Needle testID="needle" shape="arrow" />
        <Gauge.Center />
      </Gauge>
    );
    expect(screen.getByRole('meter', { name: 'Level' })).toBeTruthy();
    expect(screen.getByTestId('needle')).toBeTruthy();
  });
});
