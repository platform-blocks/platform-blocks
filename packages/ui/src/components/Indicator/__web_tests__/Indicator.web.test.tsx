import React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { Indicator } from '../Indicator';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

describe('Indicator (react-native-web DOM)', () => {
  it('a plain dot is decorative', () => {
    render(<Indicator testID="dot" />);
    expect(screen.getByTestId('dot').getAttribute('aria-hidden')).toBe('true');
  });

  it('is an image named by accessibilityLabel', () => {
    render(<Indicator accessibilityLabel="Online" />);
    expect(screen.getByRole('img', { name: 'Online' })).toBeTruthy();
  });

  it('shows a count label and forwards a ref', () => {
    const ref = React.createRef<unknown>();
    render(<Indicator ref={ref as never} label={12} testID="count" />);
    expect(screen.getByTestId('count').textContent).toBe('12');
    expect(ref.current).toBeTruthy();
  });
});
