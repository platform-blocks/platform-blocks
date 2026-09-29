import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { KeyCap } from '../KeyCap';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

describe('KeyCap (react-native-web DOM)', () => {
  it('renders the key text and forwards a ref', () => {
    const ref = React.createRef<unknown>();
    render(
      <KeyCap ref={ref as never} testID="key">
        ⌘
      </KeyCap>
    );
    expect(screen.getByTestId('key').textContent).toBe('⌘');
    expect(ref.current).toBeTruthy();
  });

  it('accepts a raw color', () => {
    render(
      <KeyCap variant="filled" color="#7C3AED" testID="key">
        K
      </KeyCap>
    );
    expect(screen.getByTestId('key').style.backgroundColor).toBe('rgb(124, 58, 237)');
  });

  it('calls onKeyPress when its key combination is pressed', () => {
    const onKeyPress = jest.fn();
    render(
      <KeyCap keyCode="K" modifiers={['cmd']} onKeyPress={onKeyPress}>
        K
      </KeyCap>
    );
    fireEvent.keyDown(document, { key: 'k' });
    expect(onKeyPress).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(onKeyPress).toHaveBeenCalledTimes(1);
  });
});
