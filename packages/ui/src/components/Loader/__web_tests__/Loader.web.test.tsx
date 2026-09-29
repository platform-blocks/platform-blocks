import React from 'react';
import { render, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import type { ReducedMotionSetting } from '../../../core/motion/ReducedMotionProvider';
import { Loader } from '../Loader';
import type { LoaderProps } from '../types';

// The OS asks for reduced motion. The reduced-motion store reads (and caches)
// the media query on first use, so this has to be in place before any render.
const originalMatchMedia = window.matchMedia;
beforeAll(() => {
  window.matchMedia = jest.fn((query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});
afterAll(() => {
  window.matchMedia = originalMatchMedia;
});

function renderLoader(props: LoaderProps = {}, reducedMotion?: ReducedMotionSetting) {
  return render(
    <PlatformBlocksProvider reducedMotion={reducedMotion}>
      <Loader testID="loader" {...props} />
    </PlatformBlocksProvider>
  );
}

/** react-native-web compiles the keyframes to an atomic `r-animationKeyframes-*` class. */
const animatedNodes = (root: HTMLElement) => root.querySelectorAll('[class*="animationKeyframes"]');

describe('Loader (react-native-web DOM)', () => {
  it('is a busy, indeterminate progressbar named "Loading"', () => {
    renderLoader();
    const loader = screen.getByRole('progressbar', { name: 'Loading' });
    expect(loader.getAttribute('aria-busy')).toBe('true');
    expect(loader.hasAttribute('aria-valuenow')).toBe(false);
  });

  it('takes a custom accessible name', () => {
    renderLoader({ accessibilityLabel: 'Fetching orders' });
    expect(screen.getByRole('progressbar', { name: 'Fetching orders' })).toBeTruthy();
  });

  it.each(['oval', 'bars', 'dots'] as const)('runs no keyframes while the OS prefers reduced motion (%s)', (variant) => {
    renderLoader({ variant });
    const loader = screen.getByTestId('loader');
    expect(animatedNodes(loader)).toHaveLength(0);
    expect(loader.innerHTML).not.toContain('animation-duration');
  });

  it.each(['oval', 'bars', 'dots'] as const)('animates with CSS keyframes when motion is allowed (%s)', (variant) => {
    renderLoader({ variant, speed: 800 }, false);
    const loader = screen.getByTestId('loader');
    expect(animatedNodes(loader).length).toBeGreaterThan(0);
    expect(loader.innerHTML).toContain('animation-duration: 800ms');
  });
});
