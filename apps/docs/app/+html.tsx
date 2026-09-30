import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';
import {
  BUILT_IN_DARK_THEME,
  DEFAULT_THEME,
  createAppShellCss,
  createThemeColorVariablesCss,
} from '@plocks/ui';

/**
 * This file is web-only and used to configure the root HTML for every web page during static rendering.
 * The contents of this function only run in Node.js environments and do not have access to the DOM or browser APIs.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/*
          Per-route SEO tags (title, description, canonical, Open Graph, Twitter)
          are emitted by <RouteSeo> via expo-router/head so each prerendered page
          gets unique metadata. Only site-level, route-invariant tags live here.
        */}
        <meta name="keywords" content="React Native, UI Library, Components, Design System, TypeScript, Mobile, Web, Cross-platform" />
        <meta name="author" content="plocks" />

        {/* Favicon & PWA */}
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* The wordmark's font (see the @font-face below). It is about 1 KB and in
            the header on every page, so it is fetched alongside the markup. */}
        <link rel="preload" href="/fonts/plocks-wordmark.woff2" as="font" type="font/woff2" crossOrigin="" />

        {/* Theme color */}
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />

        {/* Ensures proper encoding */}
        <ScrollViewStyleReset />

        {/*
          Defines every scheme-dependent color as a CSS variable, for both
          schemes, before the first byte of markup. The prerendered page reads
          its colors through these (see `colorsAsCssVariables` in
          components/layout/Providers.tsx), so a dark-theme reader gets a dark
          page at first paint rather than after hydration.
        */}
        <style dangerouslySetInnerHTML={{ __html: themeColorVariables }} />

        {/* Using raw CSS styles to improve the initial loading page */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />

        {/*
          The layout half of the same problem the variables above solve for
          color. Static rendering happens once, in Node, with no viewport — so
          the shell cannot know whether it is drawing a phone or a desktop and
          every guess it makes is wrong for most readers. These variables let
          the cascade answer instead, before the first byte of markup is
          painted: the sidebar's width, the header's height and the bottom of
          the content area all resolve per viewport with no JavaScript, so the
          static page lands in the right shape and the hydrating client agrees
          with it. Keyed to `docsLayout` so the stylesheet and the running shell
          are the same numbers.
        */}
        <style dangerouslySetInnerHTML={{ __html: appShellVariables }} />
        <style dangerouslySetInnerHTML={{ __html: pageColumnVariables }} />
        
        {/*
          Only needed for a reader whose stored choice disagrees with the OS: the
          class it stamps outranks the `prefers-color-scheme` block above, so the
          saved theme wins on the very first paint instead of flashing the OS one.
          Readers on `auto` are already served by the media query, with or
          without JavaScript.
        */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const themeColorVariables = createThemeColorVariablesCss(DEFAULT_THEME, BUILT_IN_DARK_THEME);

/**
 * Mirrors `config/docsLayout.tsx`. Kept beside it rather than derived from it
 * because the blueprint's `show` predicates are functions of a runtime context
 * that does not exist at build time — but every number here has to match, so
 * the two are edited together.
 */
const appShellVariables = createAppShellCss({
  headerHeight: { base: 56, md: 60 },
  navbarWidth: { base: 220, lg: 260 },
  navbarCollapsedWidth: 60,
  navbarStartCollapsed: true,
  navbarAutoExpandBreakpoint: 'xl',
});

/**
 * The page column's own pair, on the same principle and the same breakpoint as
 * the shell's. `--plocks-page-gutter` is the inset narrow viewports get from
 * PageLayout; `--plocks-page-content-inset` is what DocsPageContent adds back once
 * the gutter drops away. They are complements, so the text keeps the same 16px
 * from the edge at every width — see components/PageLayout.tsx.
 */
const pageColumnVariables = `
:root {
  --plocks-page-gutter: 16px;
  --plocks-page-content-inset: 0px;
  --plocks-section-gap: 32px;
  --plocks-section-gap-tight: 24px;
}

@media (min-width: 768px) {
  :root {
    --plocks-page-gutter: 0px;
    --plocks-page-content-inset: 16px;
    --plocks-section-gap: 56px;
    --plocks-section-gap-tight: 32px;
  }
}
`;

const responsiveBackground = `
html, body {
  background-color: var(--plocks-bg-base, #F7F8FA);
}

body {
  margin: 0;
  padding: 0;
  /* Matches theme.fontFamily in @plocks/ui, which every <Text> writes
     as an inline style anyway. Naming a webfont here bought nothing but a
     render-blocking stylesheet request. */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}


/* The logo's word, set as live text (components/layout/PlocksLogo.tsx):
   Unbounded SemiBold cut down to "plocks", built by brand/wordmark-font.py.
   \`block\` rather than \`swap\` — a fallback face would draw a different-width
   word for a frame, and the file is preloaded. */
@font-face {
  font-family: 'PlocksWordmark';
  src: url('/fonts/plocks-wordmark.woff2') format('woff2');
  font-weight: 600;
  font-display: block;
}

#root {
  display: flex;
  flex: 1;
  height: 100vh;
  width: 100vw;
}

/* Demo headings on component pages are permalinks (see components/DemoHeading).
   The link is the heading itself, so it carries no decoration of its own — the
   "#" marker fades in on hover/keyboard focus to advertise that it is one. */
.demo-anchor {
  display: inline-block;
  max-width: 100%;
  text-decoration: none;
  color: inherit;
}

.demo-anchor .demo-anchor-hash {
  font-size: 20px;
  font-weight: 700;
  opacity: 0;
  transition: opacity 120ms ease-in-out;
}

.demo-anchor:hover .demo-anchor-hash,
.demo-anchor:focus-visible .demo-anchor-hash {
  opacity: 0.6;
}

/* Breathing room above a heading scrolled to from a #fragment. */
.demo-anchor h1, .demo-anchor h2, .demo-anchor h3,
.demo-anchor h4, .demo-anchor h5, .demo-anchor h6 {
  scroll-margin-top: 24px;
}
`;

/**
 * Stamps a stored light/dark choice on <html> before first paint.
 *
 * The colors themselves no longer need this script: the CSS variables above
 * already answer `prefers-color-scheme`, so a reader on `auto` gets the right
 * scheme with JavaScript disabled entirely. What it still buys is precedence —
 * a reader who picked a theme that disagrees with their OS would otherwise see
 * the OS scheme until hydration, and the class stamped here outranks the media
 * query from the first paint.
 *
 * Runs inside <head>, so `document.body` does not exist yet — an earlier version
 * wrote to it, threw, and landed in a catch that reset `colorScheme` to light,
 * defeating the whole script for dark-theme readers. Everything here touches
 * `documentElement` only.
 *
 * The class names are the contract with `ThemeModeConfig.domConfig` in
 * components/layout/Providers.tsx, so the provider picks up where this leaves
 * off instead of fighting it. In `auto` mode the provider removes both classes
 * and the prefers-color-scheme media query takes over.
 */
const themeScript = `
(function() {
  var root = document.documentElement;
  var scheme = 'light';
  try {
    var saved = null;
    try { saved = localStorage.getItem('plocks-theme-mode'); } catch (storageError) {}

    if (saved === 'dark' || saved === 'light') {
      scheme = saved;
      // Only an explicit choice needs a class. Leaving 'auto' unstamped is what
      // lets the prefers-color-scheme block keep control, so the page still
      // follows the OS if this script never runs.
      root.classList.remove('plocks-light', 'plocks-dark');
      root.classList.add('plocks-' + scheme);
    } else {
      scheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    root.style.colorScheme = scheme;
  } catch (e) {
    // Leave whatever resolved above in place; never downgrade to light here.
  }
})();
`;
