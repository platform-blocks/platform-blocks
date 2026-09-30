/**
 * Spoiler component behavioral tests.
 *
 * These cover the clamp/expand contract, which regressed twice: the
 * `isCollapsed` prop passed to `Collapse` was inverted, and `Collapse` trusted
 * a stale layout-time snapshot of `isCollapsed` on its first measurement pass.
 */

import React from 'react';
import { Text as RNText, View } from 'react-native';
import { act, render, fireEvent } from '@testing-library/react-native';

import { Spoiler } from '../Spoiler';

/**
 * Fire `onLayout` on every View that has one, mirroring a real layout pass
 * where both Spoiler and its inner Collapse measure in the same commit.
 */
const layoutAll = (utils: ReturnType<typeof render>, height: number) => {
  act(() => {
    utils.UNSAFE_getAllByType(View)
      .filter((v: any) => typeof v.props.onLayout === 'function')
      .forEach((v: any) => v.props.onLayout({ nativeEvent: { layout: { height, width: 300 } } }));
  });
};

/** Resolved height of the Collapse clipping wrapper. */
const clipHeight = (utils: ReturnType<typeof render>): number | undefined => {
  for (const v of utils.UNSAFE_getAllByType(View)) {
    const raw = (v as any).props.style;
    const s = Array.isArray(raw) ? Object.assign({}, ...raw.flat(9).filter(Boolean)) : raw;
    if (s?.overflow === 'hidden' && s?.height != null) {
      return typeof s.height === 'object' ? s.height.__getValue() : s.height;
    }
  }
  return undefined;
};

const renderSpoiler = (props: Record<string, unknown> = {}) =>
  render(
    <Spoiler mah={100} transitionDuration={0} {...props}>
      <RNText>content</RNText>
    </Spoiler>,
  );

describe('Spoiler', () => {
  it('clamps overflowing content to mah while closed', () => {
    const utils = renderSpoiler();
    layoutAll(utils, 400);

    expect(clipHeight(utils)).toBe(100);
    expect(utils.getByText('Show more')).toBeTruthy();
  });

  it('expands to the full content height when toggled open', () => {
    const utils = renderSpoiler();
    layoutAll(utils, 400);

    fireEvent.press(utils.getByText('Show more'));
    layoutAll(utils, 400);

    expect(clipHeight(utils)).toBe(400);
    expect(utils.getByText('Hide')).toBeTruthy();
  });

  it('collapses again when toggled closed', () => {
    const utils = renderSpoiler();
    layoutAll(utils, 400);

    fireEvent.press(utils.getByText('Show more'));
    layoutAll(utils, 400);
    fireEvent.press(utils.getByText('Hide'));
    layoutAll(utils, 400);

    expect(clipHeight(utils)).toBe(100);
  });

  it('starts expanded when defaultExpanded is set', () => {
    const utils = renderSpoiler({ defaultExpanded: true });
    layoutAll(utils, 400);

    expect(clipHeight(utils)).toBe(400);
    expect(utils.getByText('Hide')).toBeTruthy();
  });

  it('renders no control and does not clamp when content fits', () => {
    const utils = renderSpoiler();
    layoutAll(utils, 60);

    expect(utils.queryByText('Show more')).toBeNull();
    expect(clipHeight(utils)).toBe(60);
  });

  it('honours the controlled expanded prop and reports changes', () => {
    const onExpandedChange = jest.fn();
    const utils = render(
      <Spoiler mah={100} transitionDuration={0} expanded={false} onExpandedChange={onExpandedChange}>
        <RNText>content</RNText>
      </Spoiler>,
    );
    layoutAll(utils, 400);
    expect(clipHeight(utils)).toBe(100);

    fireEvent.press(utils.getByText('Show more'));
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    // Controlled: the parent owns the value, so nothing moves on its own.
    expect(clipHeight(utils)).toBe(100);

    utils.rerender(
      <Spoiler mah={100} transitionDuration={0} expanded onExpandedChange={onExpandedChange}>
        <RNText>content</RNText>
      </Spoiler>,
    );
    layoutAll(utils, 400);
    expect(clipHeight(utils)).toBe(400);
  });

  it('does not toggle while disabled', () => {
    const onExpandedChange = jest.fn();
    const utils = renderSpoiler({ disabled: true, onExpandedChange });
    layoutAll(utils, 400);

    fireEvent.press(utils.getByText('Show more'));
    layoutAll(utils, 400);

    expect(onExpandedChange).not.toHaveBeenCalled();
    expect(clipHeight(utils)).toBe(100);
  });
});
