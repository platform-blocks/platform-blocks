import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import { factory } from '../../core/factory/factory';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { useThemedStyles } from '../../core/hooks/useThemedStyles';
import { resolveRadius } from '../../core/theme/tokens';
import type { BaseProps } from '../../core/types/base';
import { useStyleProps } from '../../core/utils/spacing';

export interface WaveformSkeletonProps extends BaseProps<ViewStyle> {
  /** Width in px; the bars are laid out from it. @default 300 */
  w?: number;
  /** Height in px; the bars are sized from it. @default 60 */
  h?: number;
  fullWidth?: boolean;
  barsCount?: number;
  /** Loading progress (0-1): that share of the bars is drawn filled. */
  progress?: number;
  /** Accessible name of the loading placeholder. @default 'Loading waveform' */
  accessibilityLabel?: string;
}

/**
 * Deterministic pseudo-random bar heights (20%–80%), so the placeholder keeps
 * its shape across re-renders instead of flickering.
 */
function skeletonHeights(count: number): number[] {
  return Array.from({ length: count }, (_, i) => {
    const noise = Math.sin((i + 1) * 12.9898) * 43758.5453;
    return (noise - Math.floor(noise)) * 0.6 + 0.2;
  });
}

export const WaveformSkeleton = factory<{ props: WaveformSkeletonProps; ref: View }>((props, ref) => {
  const {
    w = 300,
    h = 60,
    fullWidth = false,
    barsCount = 20,
    progress,
    accessibilityLabel = 'Loading waveform',
    style,
    testID,
    ...rest
  } = props;

  // `w` / `h` lay out the bars, so they are applied below rather than with
  // the other style props.
  const propStyles = useStyleProps(rest);

  const styles = useThemedStyles(
    (theme) =>
      StyleSheet.create({
        bar: {
          backgroundColor: theme.backgrounds.borderStrong,
          borderRadius: 1,
          marginHorizontal: 1,
          opacity: 0.6,
        },
        container: {
          alignItems: 'center',
          backgroundColor: theme.backgrounds.subtle,
          borderRadius: resolveRadius(theme, 'sm'),
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 4,
        },
        filledBar: {
          backgroundColor: theme.text.muted,
          opacity: 1,
        },
      }),
    []
  );

  const barHeights = useMemo(() => skeletonHeights(barsCount), [barsCount]);
  const barWidth = Math.max(1, (w - 40) / barsCount - 2);
  const filledBars =
    typeof progress === 'number' && !isNaN(progress) ? Math.round(Math.max(0, Math.min(1, progress)) * barsCount) : 0;
  const percent = typeof progress === 'number' ? Math.round(Math.max(0, Math.min(1, progress)) * 100) : undefined;

  return (
    <View
      ref={ref}
      style={[styles.container, propStyles, { height: h, width: fullWidth ? '100%' : w }, style]}
      testID={testID}
      {...a11yProps({
        role: 'progressbar',
        accessible: true,
        label: accessibilityLabel,
        busy: true,
        value: percent !== undefined ? { min: 0, max: 100, now: percent } : undefined,
      })}
    >
      {barHeights.map((heightRatio, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            fullWidth ? { flex: 1 } : { width: barWidth },
            { height: h * heightRatio },
            index < filledBars && styles.filledBar,
          ]}
        />
      ))}
    </View>
  );
}, { displayName: 'WaveformSkeleton' });
