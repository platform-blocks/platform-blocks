import React from 'react';
import { StyleSheet, View } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import { Image } from '../Image';

const SRC = 'https://example.com/photo.png';
// Decorative images are hidden from assistive technology, so queries must opt in.
const HIDDEN = { includeHiddenElements: true };

/** How many entries of a (nested) style array set `key`. */
const timesSet = (style: unknown, key: string): number =>
  Array.isArray(style)
    ? style.reduce((n: number, entry) => n + timesSet(entry, key), 0)
    : style != null && typeof style === 'object' && (style as Record<string, unknown>)[key] !== undefined
      ? 1
      : 0;

describe('Image', () => {
  it('names the image from alt', () => {
    const { getByTestId } = render(<Image src={SRC} alt="Mountain landscape" testID="img" />);
    const image = getByTestId('img-image');
    expect(image.props['aria-label']).toBe('Mountain landscape');
    expect(image.props.role).toBe('img');
    expect(image.props['aria-hidden']).toBeUndefined();
  });

  it('prefers accessibilityLabel over alt', () => {
    const { getByTestId } = render(<Image src={SRC} alt="alt text" accessibilityLabel="Label" testID="img" />);
    expect(getByTestId('img-image').props['aria-label']).toBe('Label');
  });

  it('hides decorative images (alt="" or no text alternative)', () => {
    const { getByTestId, rerender } = render(<Image src={SRC} alt="" testID="img" />);
    expect(getByTestId('img-image', HIDDEN).props['aria-hidden']).toBe(true);
    expect(getByTestId('img-image', HIDDEN).props.role).toBeUndefined();

    rerender(<Image src={SRC} testID="img" />);
    expect(getByTestId('img-image', HIDDEN).props['aria-hidden']).toBe(true);
  });

  it('merges array styles instead of dropping them', () => {
    const { getByTestId } = render(
      <Image src={SRC} testID="img" style={[{ width: 120 }, { height: 80, opacity: 0.5 }]} />
    );
    const root = StyleSheet.flatten(getByTestId('img').props.style);
    expect(root.width).toBe(120);
    expect(root.height).toBe(80);
    expect(root.opacity).toBe(0.5);
    // The caller sized the box, so the image fills it.
    const image = StyleSheet.flatten(getByTestId('img-image', HIDDEN).props.style);
    expect(image.width).toBe('100%');
    expect(image.height).toBe('100%');
  });

  it('forwards the ref to the root view', () => {
    const ref = React.createRef<View>();
    render(<Image ref={ref} src={SRC} />);
    expect(ref.current).not.toBeNull();
  });

  it('resolves size presets and radius', () => {
    const { getByTestId } = render(<Image src={SRC} size="lg" radius="full" testID="img" />);
    const root = StyleSheet.flatten(getByTestId('img').props.style);
    expect(root.width).toBe(48);
    expect(root.height).toBe(48);
    expect(root.borderRadius).toBe(9999);
    expect(root.overflow).toBe('hidden');
  });

  it('renders a circle from the width', () => {
    const { getByTestId } = render(<Image src={SRC} w={64} circle testID="img" />);
    const root = StyleSheet.flatten(getByTestId('img').props.style);
    expect(root.height).toBe(64);
    expect(root.borderRadius).toBe(32);
  });

  it('sizes the root and the image from w / h; other box props stay on the root', () => {
    const { getByTestId } = render(<Image src={SRC} w="full" h={60} maw={200} opacity={0.5} testID="img" />);
    const rootStyle = getByTestId('img').props.style;
    expect(StyleSheet.flatten(rootStyle)).toMatchObject({ width: '100%', height: 60, maxWidth: 200, opacity: 0.5 });
    expect(timesSet(rootStyle, 'width')).toBe(1);
    expect(timesSet(rootStyle, 'height')).toBe(1);

    const image = StyleSheet.flatten(getByTestId('img-image', HIDDEN).props.style);
    expect(image).toMatchObject({ width: '100%', height: 60 });
    expect(image.maxWidth).toBeUndefined();
    expect(image.opacity).toBeUndefined();
  });

  it('applies spacing props to the root', () => {
    const { getByTestId } = render(<Image src={SRC} mt="md" testID="img" />);
    const root = StyleSheet.flatten(getByTestId('img').props.style);
    expect(typeof root.marginTop).toBe('number');
  });

  it('shows the fallback when loading fails and reports the error', () => {
    const onError = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <Image src={SRC} testID="img" onError={onError} fallback={<View testID="fallback" />} />
    );
    fireEvent(getByTestId('img-image', HIDDEN), 'error', { nativeEvent: { error: 'boom' } });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(queryByTestId('img-image', HIDDEN)).toBeNull();
    expect(getByTestId('fallback')).toBeTruthy();
  });

  it('renders nothing without a source or fallback', () => {
    const { toJSON } = render(<Image />);
    expect(toJSON()).toBeNull();
  });
});
