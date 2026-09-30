import React from 'react';
import { act, render, screen } from '@testing-library/react';

import { DEFAULT_THEME } from '../../../core/theme/defaultTheme';
import { ReducedMotionProvider } from '../../../core/motion/ReducedMotionProvider';
import { ShimmerText } from '../ShimmerText';

type LayoutHost = HTMLElement & {
  __reactLayoutHandler?: (event: { nativeEvent: { layout: { width: number; height: number } } }) => void;
};

/** react-native-web stores a View's onLayout on its DOM node; call it with a measured size. */
const measure = (testID: string, width: number, height: number) => {
  const node = screen.getByTestId(testID) as LayoutHost;
  act(() => {
    node.__reactLayoutHandler?.({ nativeEvent: { layout: { width, height } } });
  });
};

const textStyle = (text: string) => screen.getByText(text).style;

describe('ShimmerText (web)', () => {
  /**
   * The band must never tile: `background-repeat: repeat` is what made the old
   * implementation snap sideways by a full text width on every wrap.
   */
  it('never tiles the highlight band', () => {
    render(<ShimmerText testID="shimmer" text="Live preview" />);
    measure('shimmer', 200, 24);

    expect(textStyle('Live preview').backgroundRepeat).toBe('no-repeat');
  });

  /**
   * `background-size` and `--plocks-shimmer-band` have to agree, because the
   * keyframes derive both sweep endpoints from the custom property.
   */
  it('keeps background-size and the sweep variable in agreement', () => {
    render(<ShimmerText testID="shimmer" text="Live preview" spread={2.5} />);
    measure('shimmer', 200, 24);

    const style = textStyle('Live preview');
    expect(style.backgroundSize).toBe('500px 100%');
    expect(style.getPropertyValue('--plocks-shimmer-band')).toBe('500px');
  });

  it('runs one uninterrupted CSS animation per cycle', () => {
    render(<ShimmerText testID="shimmer" text="Live preview" duration={2} repeatDelay={0.5} />);
    measure('shimmer', 200, 24);

    const style = textStyle('Live preview');
    // repeatDelay is folded into the cycle as a hold, not a separate timer.
    expect(style.animationName).toBe('plocks-shimmer-sweep-hold-20');
    expect(style.animationDuration).toBe('2500ms');
    expect(style.animationIterationCount).toBe('infinite');
    expect(style.animationDirection).toBe('normal');
    // The keyframes the inline animation names exist in the document.
    const css = Array.from(document.querySelectorAll('style[data-plocks="shimmer-text"]'))
      .map((el) => Array.from((el as HTMLStyleElement).sheet?.cssRules ?? []).map((r) => r.cssText).join('\n'))
      .join('\n');
    expect(css).toContain('plocks-shimmer-sweep-hold-20');
  });

  it('keeps a fractional hold rather than rounding the sweep short', () => {
    render(<ShimmerText testID="shimmer" text="Live preview" duration={1.8} repeatDelay={0.5} />);
    measure('shimmer', 200, 24);

    // 0.5s of a 2.3s cycle is 21.739...%: whole-percent rounding would cost
    // the sweep several milliseconds every cycle.
    const style = textStyle('Live preview');
    expect(style.animationName).toBe('plocks-shimmer-sweep-hold-21-7');
    expect(style.animationDuration).toBe('2300ms');
  });

  it('plays the same keyframes in reverse for rtl', () => {
    render(<ShimmerText testID="shimmer" text="Live preview" direction="rtl" />);
    measure('shimmer', 200, 24);

    const style = textStyle('Live preview');
    expect(style.animationName).toBe('plocks-shimmer-sweep');
    expect(style.animationDirection).toBe('reverse');
  });

  it('stops after a single pass when once is set', () => {
    render(<ShimmerText testID="shimmer" text="Live preview" once />);
    measure('shimmer', 200, 24);

    const style = textStyle('Live preview');
    expect(style.animationIterationCount).toBe('1');
    expect(style.animationFillMode).toBe('both');
  });

  it('leaves the text unanimated when animation is disabled', () => {
    render(<ShimmerText testID="shimmer" text="Live preview" repeat={false} />);
    measure('shimmer', 200, 24);

    const style = textStyle('Live preview');
    expect(style.animationName).toBe('');
    expect(style.backgroundImage).toContain('linear-gradient');
  });

  it('parks the band (no animation) when reduced motion is preferred', () => {
    render(
      <ReducedMotionProvider reducedMotion>
        <ShimmerText testID="shimmer" text="Live preview" />
      </ReducedMotionProvider>
    );
    measure('shimmer', 200, 24);

    expect(textStyle('Live preview').animationName).toBe('');
  });

  it('defaults the base colour to the muted text role', () => {
    render(<ShimmerText testID="shimmer" text="Muted" />);
    measure('shimmer', 200, 24);

    // jsdom normalises colours to rgb(); compare through a probe element.
    const probe = document.createElement('span');
    probe.style.backgroundColor = DEFAULT_THEME.text.muted;
    expect(textStyle('Muted').backgroundColor).toBe(probe.style.backgroundColor);
  });

  it('renders the text once, as a single accessible text node', () => {
    render(<ShimmerText testID="shimmer" text="Loading data" />);
    measure('shimmer', 200, 24);

    expect(screen.getAllByText('Loading data')).toHaveLength(1);
  });

  it('matches snapshots before and after layout', () => {
    const { asFragment } = render(
      <ShimmerText testID="shimmer" text="Live preview" direction="rtl" spread={2.5} />
    );
    expect(asFragment()).toMatchSnapshot('before layout');
    measure('shimmer', 200, 24);
    expect(asFragment()).toMatchSnapshot('sweep running');
  });
});
