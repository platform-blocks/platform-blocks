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

/**
 * The gutter narrow viewports get and wide ones don't.
 *
 * Measuring the window to choose between them is what a prerender cannot do:
 * it has no window, guesses narrow, and the client then disagrees — which is a
 * hydration mismatch, and React answers one by throwing the prerendered tree
 * away and rebuilding it. The variable defers the choice to the cascade, which
 * knows the viewport before any of our code runs. Defined in app/+html.tsx.
 */
export const PAGE_GUTTER_VAR = '--pb-page-gutter';
/** The inset the content column adds back once the gutter drops away. */
export const PAGE_CONTENT_INSET_VAR = '--pb-page-content-inset';

/** The gutter, deferred to the cascade on web and measured on native. */
export const usePageGutter = (): number | string => {
  const { width } = useWindowDimensions();
  if (Platform.OS === 'web') return `var(${PAGE_GUTTER_VAR}, ${NARROW_PAGE_GUTTER}px)`;
  return width < BREAKPOINTS.md ? NARROW_PAGE_GUTTER : 0;
};

/** Its complement: 0 while the gutter is on, 16 once it is off. */
export const usePageContentInset = (): number | string => {
  const { width } = useWindowDimensions();
  if (Platform.OS === 'web') return `var(${PAGE_CONTENT_INSET_VAR}, 0px)`;
  return width < BREAKPOINTS.md ? 0 : NARROW_PAGE_GUTTER;
};

interface PageLayoutProps {
  children: React.ReactNode;
  style?: any;
  contentContainerStyle?: any;
}

export function PageLayout({ children, style, contentContainerStyle }: PageLayoutProps) {
  const theme = useTheme();
  const gutter = usePageGutter();

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
      <View style={[{ overflow: 'visible' as any, paddingHorizontal: gutter }, style]}>
        {children}
      </View>
      <View style={dynamicStyles.footerWrapper}>
        <FooterContent />
      </View>
    </KeyboardAwareLayout>
  );
}
