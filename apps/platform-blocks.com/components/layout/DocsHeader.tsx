import React from 'react';
import { View } from 'react-native';
import { AppHeader } from './Header';
import { DocsHeaderMobile } from './HeaderMobile';

/**
 * Both header bars, with CSS choosing between them.
 *
 * The shell used to pick one from the breakpoint, which a prerender cannot
 * know: every static page shipped the mobile bar, and desktop readers got it
 * swapped out during hydration — a hydration mismatch that threw the whole
 * prerendered tree away, and a layout shift as the page slid over to make room
 * for the sidebar that appeared with it.
 *
 * One document has to serve every viewport, so it carries both bars and lets
 * the stylesheet hide one. `data-pb-shell-mobile-only` / `-desktop-only` are
 * emitted by `createAppShellCss`, inlined in `app/+html.tsx`, and keyed to the
 * same breakpoint the shell reserves its navbar width at — so the bar that
 * shows and the space the layout leaves for it can never disagree.
 */
export const DocsHeader: React.FC = () => (
  <>
    <View
      // `display: none` on this wrapper is what the stylesheet toggles, so the
      // bar inside keeps its own layout untouched.
      {...({ dataSet: { pbShellMobileOnly: 'true' } } as any)}
      // The bar inside sizes itself with `height: '100%'`, which is only a
      // number if this wrapper has one — an auto-height wrapper collapses to
      // its content and the bar stops filling (and centering within) the
      // height the shell reserved for it.
      style={{ width: '100%', height: '100%' }}
    >
      <DocsHeaderMobile />
    </View>
    <View
      {...({ dataSet: { pbShellDesktopOnly: 'true' } } as any)}
      style={{ width: '100%', height: '100%' }}
    >
      <AppHeader />
    </View>
  </>
);
