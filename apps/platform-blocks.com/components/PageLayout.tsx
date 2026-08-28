import React from 'react';
import { View, StyleSheet, Platform, NativeSyntheticEvent, NativeScrollEvent, useWindowDimensions } from 'react-native';
import { usePathname } from 'expo-router';
import { usePersistentScroll, getSavedScroll } from '../utils/usePersistentScroll';
import { KeyboardAwareLayout, useTheme } from '@platform-blocks/ui';
import { BREAKPOINTS } from '@platform-blocks/ui/core/responsive';
import { FooterContent } from './layout/FooterPage';

/**
 * Horizontal gutter PageLayout applies on narrow viewports. Exported so screens
 * that want to run an element to the screen edge know how much to cancel out.
 */
export const NARROW_PAGE_GUTTER = 16;

interface PageLayoutProps {
  children: React.ReactNode;
  style?: any;
  contentContainerStyle?: any;
}

export function PageLayout({ children, style, contentContainerStyle }: PageLayoutProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isNarrow = width < BREAKPOINTS.md;
  // Use broader ref type to satisfy usePersistentScroll expectations across platforms
  const scrollRef = React.useRef<any>(null);
  const { onScroll: onPersistScroll } = usePersistentScroll(scrollRef, { delayFrames: 2 });
  const pathname = usePathname();
  const dynamicStyles = React.useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgrounds.base,
    },
    contentContainer: {
      flexGrow: 1,
      paddingBottom: Platform.OS === 'web' ? 0 : 20, // Add padding for mobile
    },
   
    footerWrapper: {
      marginTop: 'auto', // This pushes footer to bottom when content is short
    },
  }), [theme.colorScheme]);

  // Track scroll position persistently
  const handleScroll = React.useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    onPersistScroll(e.nativeEvent.contentOffset.y);
  }, [onPersistScroll]);

  // Multi-frame restore on theme change to combat layout thrash
  React.useEffect(() => {
    if (!pathname) return;
    let frames = 5;
    const saved = getSavedScroll(pathname) ?? 0;
    const restore = () => {
      if (!scrollRef.current) return;
      try {
        scrollRef.current.scrollTo({ y: saved, animated: false });
      } catch {
        console.warn('PageLayout: scrollTo failed, ref may be invalid');
      }
      if (frames-- > 0) requestAnimationFrame(restore);
    };
    requestAnimationFrame(restore);
  }, [theme.colorScheme, pathname]);

  return (
    <KeyboardAwareLayout
      style={dynamicStyles.container}
      contentContainerStyle={[dynamicStyles.contentContainer, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      scrollRef={scrollRef}
      scrollViewProps={{
        showsVerticalScrollIndicator: false,
        onScroll: handleScroll,
        scrollEventThrottle: 16,
      }}
    >
      {/* Wide viewports get no gutter here — the content column carries its own
          inset, and stacking a second one on top of it pushed the page body in
          twice as far as it needed. Narrow viewports keep a gutter because the
          content column drops its inset there, and content would otherwise
          touch the screen edge. */}
      <View style={[{ overflow: 'visible' as any, paddingHorizontal: isNarrow ? NARROW_PAGE_GUTTER : 0 }, style]}>
        {children}
      </View>
      <View style={dynamicStyles.footerWrapper}>
        <FooterContent />
      </View>
    </KeyboardAwareLayout>
  );
}
