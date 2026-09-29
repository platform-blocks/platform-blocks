import React from 'react';
import { render, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import type { ReducedMotionSetting } from '../../../core/motion/ReducedMotionProvider';
import { Skeleton } from '../Skeleton';
import type { SkeletonProps } from '../types';

function renderSkeleton(props: SkeletonProps = {}, reducedMotion?: ReducedMotionSetting) {
  return render(
    <PlatformBlocksProvider reducedMotion={reducedMotion}>
      <Skeleton testID="skeleton" {...props} />
    </PlatformBlocksProvider>
  );
}

describe('Skeleton (react-native-web DOM)', () => {
  it('is decorative: hidden from assistive technology with no role', () => {
    renderSkeleton();
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton.getAttribute('aria-hidden')).toBe('true');
    expect(skeleton.hasAttribute('role')).toBe(false);
  });

  it('becomes a busy status when given a name', () => {
    renderSkeleton({ accessibilityLabel: 'Loading profile' });
    const status = screen.getByRole('status', { name: 'Loading profile' });
    expect(status.getAttribute('aria-busy')).toBe('true');
    expect(status.hasAttribute('aria-hidden')).toBe(false);
  });

  it('renders the pulse layer only when motion is allowed', () => {
    const { unmount } = renderSkeleton({}, false);
    expect(screen.getByTestId('skeleton').childElementCount).toBe(1);
    unmount();

    renderSkeleton({}, true);
    // Reduced motion: a static placeholder, no animated layer at all.
    expect(screen.getByTestId('skeleton').childElementCount).toBe(0);
  });
});
