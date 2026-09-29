import type React from 'react';
import type { KeyboardAvoidingViewProps, ScrollView, ScrollViewProps, StyleProp, ViewStyle } from 'react-native';

import type { BaseProps } from '../../core/types/base';

export interface KeyboardAwareLayoutProps
  extends BaseProps<ViewStyle>,
    Omit<KeyboardAvoidingViewProps, 'behavior' | 'children' | 'keyboardVerticalOffset' | 'style' | 'testID'> {
  children: React.ReactNode;
  /** Optional behavior override for KeyboardAvoidingView */
  behavior?: KeyboardAvoidingViewProps['behavior'];
  /** Additional offset passed to KeyboardAvoidingView (defaults to 0) */
  keyboardVerticalOffset?: number;
  /** Enables or disables KeyboardAvoidingView adjustments */
  enabled?: boolean;
  /** When true (default) content is wrapped in a ScrollView */
  scrollable?: boolean;
  /** Extra padding added in addition to keyboard height */
  extraScrollHeight?: number;
  /** Style applied to the ScrollView/inner content container */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Controls ScrollView keyboard tap handling */
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  /** Forward ref to the internal ScrollView when scrollable is true */
  scrollRef?: React.Ref<ScrollView>;
  /** Additional props that will be spread onto the internal ScrollView */
  scrollViewProps?: ScrollViewProps;

  // --- Native ScrollView passthrough props ---

  /** Whether scrolling is enabled */
  scrollEnabled?: boolean;

  /** Whether the scroll view bounces past the edge of content (iOS) */
  bounces?: boolean;

  /** Scroll event callback */
  onScroll?: ScrollViewProps['onScroll'];

  /** Throttle interval for scroll events in ms */
  scrollEventThrottle?: number;

  /** Callback when momentum scroll begins */
  onMomentumScrollBegin?: ScrollViewProps['onMomentumScrollBegin'];

  /** Callback when momentum scroll ends */
  onMomentumScrollEnd?: ScrollViewProps['onMomentumScrollEnd'];

  /** Whether to show the vertical scroll indicator */
  showsVerticalScrollIndicator?: boolean;

  /** Whether to show the horizontal scroll indicator */
  showsHorizontalScrollIndicator?: boolean;

  /** Deceleration rate ('normal' | 'fast' | number) */
  decelerationRate?: ScrollViewProps['decelerationRate'];

  /** Over-scroll mode for Android */
  overScrollMode?: ScrollViewProps['overScrollMode'];

  /** Pull-to-refresh control */
  refreshControl?: ScrollViewProps['refreshControl'];
}
