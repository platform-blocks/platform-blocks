import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import { Skeleton } from '../Skeleton';
import { getControlSize, resolveRadius, resolveSpacing } from '../../../core/theme/tokens';

const mockTheme = {
  colors: {
    gray: ['#f5f5f5', '#e0e0e0', '#cccccc'],
  },
  backgrounds: {
    border: '#e0e0e0',
    borderStrong: '#cccccc',
  },
};

jest.mock('../../../core/theme/ThemeProvider', () => ({
  useTheme: () => mockTheme,
}));

const getFlattenedStyle = (node: any) => StyleSheet.flatten(node.props.style);
/** How many entries of a (nested) style array set `key`. */
const timesSet = (style: unknown, key: string): number =>
  Array.isArray(style)
    ? style.reduce((n: number, entry) => n + timesSet(entry, key), 0)
    : style != null && typeof style === 'object' && (style as Record<string, unknown>)[key] !== undefined
      ? 1
      : 0;
// Unnamed skeletons are aria-hidden, which queries skip by default.
const HIDDEN = { includeHiddenElements: true };
// The mock theme defines no scales, so the resolvers fall back to the defaults.
const SCALES = undefined;

describe('Skeleton - behavior', () => {
  it('renders a static rectangle when animation is disabled', () => {
    const { getByTestId } = render(
      <Skeleton
        animate={false}
        radius="sm"
        testID="skeleton-static"
        colors={['#111111', '#222222']}
      />
    );

    const skeleton = getByTestId('skeleton-static', HIDDEN);
    const style = getFlattenedStyle(skeleton);

    expect(style.backgroundColor).toBe('#111111');
    expect(skeleton.children).toHaveLength(0);
  });

  it('applies circle defaults from the "size" token', () => {
    const { getByTestId } = render(
      <Skeleton shape="circle" size="lg" testID="skeleton-circle" />
    );

    const style = getFlattenedStyle(getByTestId('skeleton-circle', HIDDEN));
    const expectedSize = getControlSize(SCALES, 'lg').height;

    expect(style.width).toBe(expectedSize);
    expect(style.height).toBe(expectedSize);
    expect(style.borderRadius).toBe(expectedSize / 2);
  });

  it('replaces the shape box with w / h, set once', () => {
    const { getByTestId } = render(
      <Skeleton shape="card" w="full" h={20} opacity={0.5} animate={false} testID="skeleton-box" />
    );

    const style = getByTestId('skeleton-box', HIDDEN).props.style;
    expect(StyleSheet.flatten(style)).toMatchObject({ width: '100%', height: 20, opacity: 0.5 });
    expect(timesSet(style, 'width')).toBe(1);
    expect(timesSet(style, 'height')).toBe(1);
  });

  it('overrides the border radius when the radius prop is provided', () => {
    const { getByTestId } = render(
      <Skeleton shape="rectangle" radius="xl" testID="skeleton-radius" />
    );

    const style = getFlattenedStyle(getByTestId('skeleton-radius', HIDDEN));

    // Radius tokens resolve on the radius scale (they used to be read off the spacing scale).
    expect(style.borderRadius).toBe(resolveRadius(SCALES, 'xl'));
  });

  it('uses the text presets to determine height and width', () => {
    const { getByTestId } = render(
      <Skeleton
        shape="text"
        size="sm"
        testID="skeleton-text"
        mt="lg"
      />
    );

    const style = getFlattenedStyle(getByTestId('skeleton-text', HIDDEN));

    expect(style.width).toBe('100%');
    expect(style.height).toBe(resolveSpacing(SCALES, 'md'));
    expect(style.marginTop).toBe(resolveSpacing(SCALES, 'lg'));
  });

  it('is hidden from assistive technology unless it is given a name', () => {
    const { getByTestId, rerender } = render(<Skeleton testID="skeleton-a11y" />);
    expect(getByTestId('skeleton-a11y', HIDDEN).props['aria-hidden']).toBe(true);
    expect(getByTestId('skeleton-a11y', HIDDEN).props.role).toBeUndefined();

    rerender(<Skeleton testID="skeleton-a11y" accessibilityLabel="Loading profile" />);
    const named = getByTestId('skeleton-a11y', HIDDEN);
    expect(named.props['aria-hidden']).toBeUndefined();
    expect(named.props.role).toBe('status');
    expect(named.props['aria-busy']).toBe(true);
    expect(named.props['aria-label']).toBe('Loading profile');
  });

  it('uses the theme border roles for its colors', () => {
    const { getByTestId } = render(<Skeleton animate={false} testID="skeleton-colors" />);
    expect(getFlattenedStyle(getByTestId('skeleton-colors', HIDDEN)).backgroundColor).toBe('#e0e0e0');
  });
});
