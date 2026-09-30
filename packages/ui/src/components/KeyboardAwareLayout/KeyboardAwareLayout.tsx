import React, { useMemo } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import type { KeyboardAvoidingViewProps, StyleProp, ViewStyle } from 'react-native';

import { factory } from '../../core/factory/factory';
import { isIOS } from '../../core/platform/flags';
import { useKeyboardMetricsOptional } from '../../core/providers/KeyboardManagerProvider';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import type { KeyboardAwareLayoutProps } from './types';

const DEFAULT_EXTRA_SCROLL_HEIGHT = 24;

/**
 * A KeyboardAvoidingView (+ ScrollView by default) that pads its content by the
 * keyboard height reported by `KeyboardManagerProvider` (metrics only — it
 * doesn't re-render on focus hand-offs).
 */
export const KeyboardAwareLayout = factory<{ props: KeyboardAwareLayoutProps; ref: KeyboardAvoidingView }>(
  (props, ref) => {
    const { styleProps, otherProps } = extractStyleProps(props);
    const {
      children,
      behavior,
      keyboardVerticalOffset = 0,
      enabled = true,
      scrollable = true,
      extraScrollHeight = DEFAULT_EXTRA_SCROLL_HEIGHT,
      style,
      contentContainerStyle,
      keyboardShouldPersistTaps = 'handled',
      scrollRef,
      scrollViewProps,
      // Native ScrollView passthrough props
      scrollEnabled,
      bounces,
      onScroll,
      scrollEventThrottle,
      onMomentumScrollBegin,
      onMomentumScrollEnd,
      showsVerticalScrollIndicator,
      showsHorizontalScrollIndicator,
      decelerationRate,
      overScrollMode: overScrollModeProp,
      refreshControl,
      ...rest
    } = otherProps;

    const spacingStyles = useStyleProps(styleProps);
    const keyboard = useKeyboardMetricsOptional();

    const isKeyboardVisible = keyboard?.isKeyboardVisible ?? false;
    const keyboardHeight = keyboard?.keyboardHeight ?? 0;

    const { contentContainerStyle: scrollContentStyle, ...restScrollViewProps } = scrollViewProps ?? {};

    const resolvedBehavior: KeyboardAvoidingViewProps['behavior'] = behavior ?? (isIOS ? 'padding' : 'height');

    const bottomPadding = enabled && isKeyboardVisible ? keyboardHeight + extraScrollHeight : extraScrollHeight;

    const contentStyles = useMemo<StyleProp<ViewStyle>>(
      () => [
        styles.content,
        contentContainerStyle,
        scrollContentStyle,
        bottomPadding > 0 ? { paddingBottom: bottomPadding } : null,
      ],
      [contentContainerStyle, scrollContentStyle, bottomPadding]
    );

    return (
      <KeyboardAvoidingView
        ref={ref}
        behavior={resolvedBehavior}
        keyboardVerticalOffset={keyboardVerticalOffset}
        enabled={enabled}
        style={[styles.container, spacingStyles, style]}
        {...rest}
      >
        {scrollable ? (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={contentStyles}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator ?? false}
            showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
            overScrollMode={overScrollModeProp ?? 'never'}
            scrollEnabled={scrollEnabled}
            bounces={bounces}
            onScroll={onScroll}
            scrollEventThrottle={scrollEventThrottle}
            onMomentumScrollBegin={onMomentumScrollBegin}
            onMomentumScrollEnd={onMomentumScrollEnd}
            decelerationRate={decelerationRate}
            refreshControl={refreshControl}
            {...restScrollViewProps}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={contentStyles}>{children}</View>
        )}
      </KeyboardAvoidingView>
    );
  },
  { displayName: 'KeyboardAwareLayout' }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'visible',
  },
  content: {
    flexGrow: 1,
  },
});
