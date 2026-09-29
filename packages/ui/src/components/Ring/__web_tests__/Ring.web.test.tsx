import React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { Ring } from '../Ring';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

describe('Ring (react-native-web DOM)', () => {
  it('is a progressbar named by its caption, with the value attributes in the DOM', () => {
    render(<Ring value={30} min={0} max={60} caption="Storage" />);
    const ring = screen.getByRole('progressbar', { name: 'Storage' });
    expect(ring.getAttribute('aria-valuemin')).toBe('0');
    expect(ring.getAttribute('aria-valuemax')).toBe('60');
    expect(ring.getAttribute('aria-valuenow')).toBe('30');
    // The displayed text (the percentage) is the spoken value.
    expect(ring.getAttribute('aria-valuetext')).toBe('50%');
  });

  it('prefers an explicit accessibilityLabel', () => {
    render(<Ring value={72} caption="Weekly KPI" accessibilityLabel="New customers" />);
    expect(screen.getByRole('progressbar', { name: 'New customers' })).toBeTruthy();
  });
});
