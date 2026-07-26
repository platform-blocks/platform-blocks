import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { BREAKPOINTS } from '@platform-blocks/ui/core/responsive';
import { PageLayout } from './PageLayout';

/**
 * The content column every docs page shares. Component detail pages set the
 * house style — a 16px inset that grows into a 1400px centred column on
 * desktop — and this is that geometry in one place so prose pages, list pages,
 * and the home page all line up with it instead of each inventing a width.
 *
 * Phones drop the horizontal inset: PageLayout's own gutter is the only
 * horizontal breathing room narrow viewports can spare.
 */
export function DocsPageContent({
  children,
  id,
  style,
}: {
  children: React.ReactNode;
  id?: string;
  style?: any;
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINTS.lg;
  const isNarrow = width < BREAKPOINTS.md;

  return (
    <View
      id={id}
      style={[
        isDesktop ? styles.desktopContainer : styles.container,
        isNarrow && styles.narrowContainer,
        style,
      ]}
    >
      {children}
    </View>
  );
}

/**
 * PageLayout + the shared content column. Prefer this over reaching for
 * PageLayout directly so a page can't drift into its own margins.
 */
export function DocsPage({
  children,
  id,
  style,
  contentContainerStyle,
}: {
  children: React.ReactNode;
  id?: string;
  /** Extra style for the content column (e.g. `gap`). */
  style?: any;
  /** Passed through to PageLayout's scroll content container. */
  contentContainerStyle?: any;
}) {
  return (
    <PageLayout contentContainerStyle={contentContainerStyle}>
      <DocsPageContent id={id} style={style}>
        {children}
      </DocsPageContent>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  desktopContainer: {
    flex: 1,
    padding: 16,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
    minWidth: 0, // Prevents flex item from overflowing
  },
  narrowContainer: {
    paddingHorizontal: 0,
  },
});
