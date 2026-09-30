import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';

import { Overlay } from '../Overlay';
import { resolveRadius } from '../../../core/theme/tokens';

const mockTheme = {
  colors: {
    primary: ['#000000', '#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777'],
    secondary: ['#101010'],
  },
  backgrounds: {
    dim: '#123456',
  },
  text: {
    primary: '#000000',
  },
};

jest.mock('../../../core/theme/ThemeProvider', () => ({
  useTheme: () => mockTheme,
}));

describe('Overlay - behavior', () => {
  it('resolves theme palette tokens and prioritizes backgroundOpacity', () => {
    const { getByTestId } = render(
      <Overlay
        testID="overlay"
        color="primary.6"
        opacity={0.2}
        backgroundOpacity={0.8}
      />
    );

    const style = StyleSheet.flatten(getByTestId('overlay').props.style);
    expect(style.backgroundColor).toBe('rgba(102, 102, 102, 0.8)');
  });

  it('clamps opacity extremes when values are invalid', () => {
    const { getByTestId, rerender } = render(
      <Overlay testID="overlay" opacity={-2} />
    );

    let style = StyleSheet.flatten(getByTestId('overlay').props.style);
    // No color: the (default light) theme scrim at the clamped opacity.
    expect(style.backgroundColor).toBe('rgba(15, 23, 42, 0)');

    rerender(<Overlay testID="overlay" color="#ff0000" opacity={2} />);
    style = StyleSheet.flatten(getByTestId('overlay').props.style);
    expect(style.backgroundColor).toBe('rgba(255, 0, 0, 1)');
  });

  it('ignores web-only gradient / blur / fixed on native (falls back to the color)', () => {
    const { getByTestId } = render(
      <Overlay testID="overlay" gradient="linear-gradient(90deg, #000, transparent)" blur={12} fixed />
    );
    const style = StyleSheet.flatten(getByTestId('overlay').props.style);
    expect(style.backgroundImage).toBeUndefined();
    expect(style.backdropFilter).toBeUndefined();
    expect(style.position).toBe('absolute');
    // No color / opacity: the scrim token as-is (the mock theme has none → built-in light scrim).
    expect(style.backgroundColor).toBe('rgba(15, 23, 42, 0.45)');
  });

  it('uses the theme scrim by default, re-alphaed by an explicit opacity', () => {
    const backgrounds = mockTheme.backgrounds as Record<string, string>;
    backgrounds.scrim = 'rgba(1, 2, 3, 0.5)';
    try {
      const { getByTestId, rerender } = render(<Overlay testID="overlay" />);
      expect(StyleSheet.flatten(getByTestId('overlay').props.style).backgroundColor).toBe('rgba(1, 2, 3, 0.5)');
      rerender(<Overlay testID="overlay" opacity={0.25} />);
      expect(StyleSheet.flatten(getByTestId('overlay').props.style).backgroundColor).toBe('rgba(1, 2, 3, 0.25)');
      // An explicit color keeps the old default opacity.
      rerender(<Overlay testID="overlay" color="#ff0000" />);
      expect(StyleSheet.flatten(getByTestId('overlay').props.style).backgroundColor).toBe('rgba(255, 0, 0, 0.6)');
    } finally {
      delete backgrounds.scrim;
    }
  });

  it('keeps opacity off the root and applies the box props to it', () => {
    const { getByTestId } = render(<Overlay testID="overlay" opacity={0.3} w={200} mah={100} m={4} />);
    const style = StyleSheet.flatten(getByTestId('overlay').props.style);
    expect(style.opacity).toBeUndefined();
    expect(style).toMatchObject({ width: 200, maxHeight: 100, marginTop: 4 });
    expect(getByTestId('overlay').props.w).toBeUndefined();
  });

  it('translates radius tokens and centers children when center=true', () => {
    const { getByTestId } = render(
      <Overlay testID="overlay" radius="lg" center />
    );

    const style = StyleSheet.flatten(getByTestId('overlay').props.style);
    // The mock theme has no radii, so the default scale applies.
    expect(style.borderRadius).toBe(resolveRadius({}, 'lg'));
    expect(style.justifyContent).toBe('center');
    expect(style.alignItems).toBe('center');
  });
});
