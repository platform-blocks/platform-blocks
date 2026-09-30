import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PageLayout, usePageContentInset } from './PageLayout';

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
  // The horizontal inset is the complement of PageLayout's gutter — one is on
  // exactly when the other is off, and their sum is the same 16px at every
  // width. Measuring the window to pick between them is what made the static
  // page and the hydrated one disagree; the cascade picks now.
  const horizontalInset = usePageContentInset();

  return (
    <View
      id={id}
      style={[
        styles.container,
        { paddingHorizontal: horizontalInset as any },
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
  // `maxWidth` only bites past 1400 and `alignSelf` is a no-op at full width, so
  // the desktop column is now the only column — one style for every viewport,
  // which is what a single prerendered document can serve.
  container: {
    flex: 1,
    paddingVertical: 16,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
    minWidth: 0, // Prevents flex item from overflowing
  },
});
