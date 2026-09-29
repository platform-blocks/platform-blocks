import React from 'react';
import { render, screen } from '@testing-library/react';
import { View } from 'react-native';

import { Overlay } from '../Overlay';

describe('Overlay (react-native-web DOM)', () => {
  it('applies the gradient and viewport-fixed positioning on web', () => {
    render(
      <Overlay
        testID="overlay"
        gradient="linear-gradient(90deg, rgba(0,0,0,0.8), transparent)"
        blur={12}
        fixed
      />
    );
    const overlay = screen.getByTestId('overlay');
    const style = window.getComputedStyle(overlay);
    expect(overlay.style.backgroundImage || style.backgroundImage).toContain('linear-gradient');
    // (jsdom drops `backdrop-filter`, so the blur itself can't be asserted here.)
    expect(style.position).toBe('fixed');
  });

  it('stacks above siblings rendered after it', () => {
    render(
      <View>
        <Overlay testID="overlay" />
        <View testID="content" />
      </View>
    );
    const zIndexOf = (id: string) => Number(window.getComputedStyle(screen.getByTestId(id)).zIndex) || 0;
    expect(zIndexOf('overlay')).toBeGreaterThan(zIndexOf('content'));
  });

  it('uses the theme overlay layer when fixed', () => {
    render(<Overlay testID="overlay" fixed />);
    expect(window.getComputedStyle(screen.getByTestId('overlay')).zIndex).toBe('1300');
  });
});
