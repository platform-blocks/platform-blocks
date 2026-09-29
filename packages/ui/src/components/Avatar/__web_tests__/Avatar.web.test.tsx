import React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { Avatar } from '../Avatar';
import { AvatarGroup } from '../AvatarGroup';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

describe('Avatar (react-native-web DOM)', () => {
  it('is an image named by accessibilityLabel and forwards a ref', () => {
    const ref = React.createRef<unknown>();
    render(<Avatar ref={ref as never} fallback="JD" accessibilityLabel="Jane Doe" />);
    expect(screen.getByRole('img', { name: 'Jane Doe' })).toBeTruthy();
    expect(ref.current).toBeTruthy();
  });

  it('shows the label beside it', () => {
    render(<Avatar fallback="JD" label="Jane Doe" description="Engineer" />);
    expect(screen.getByText('Jane Doe')).toBeTruthy();
    expect(screen.getByText('Engineer')).toBeTruthy();
  });

  it('names the surplus avatar of a group', () => {
    render(
      <AvatarGroup limit={2}>
        <Avatar fallback="A" />
        <Avatar fallback="B" />
        <Avatar fallback="C" />
        <Avatar fallback="D" />
      </AvatarGroup>
    );
    expect(screen.getByRole('img', { name: '2 more' })).toBeTruthy();
  });
});
