import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

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
        <meta name="author" content="Platform Blocks" />

        {/* Favicon & PWA */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

        {/* Theme color */}
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />

        {/* Ensures proper encoding */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles to improve the initial loading page */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        
        {/*
          Paints the correct page backdrop before first paint. The prerendered
          markup itself carries light-theme colors in inline styles, so for
          dark-theme readers the script below also holds the content invisible
          (dark backdrop only) until hydration has restyled it — see
          `platform-blocks-content-pending` and the reveal in
          components/layout/Providers.tsx.
        */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Covers "auto" mode, where the provider deliberately leaves both theme classes
   off the <html> element. */
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}

/* An explicit light/dark choice has to beat the OS preference above, so these
   are qualified with html.CLASS to outrank the bare body rule. The classes are
   stamped by the pre-hydration script below and re-applied by
   ThemeModeProvider afterwards. */
html.platform-blocks-light,
html.platform-blocks-light body {
  background-color: #fff;
}

html.platform-blocks-dark,
html.platform-blocks-dark body {
  background-color: #000;
}

#root {
  display: flex;
  flex: 1;
  height: 100vh;
  width: 100vw;
}

/* The prerendered markup carries light-theme colors in inline styles, so for
   dark-theme readers the pre-hydration script below stamps this class to hold
   the content invisible (dark backdrop only) until React has restyled it.
   Removed by ContentReveal in components/layout/Providers.tsx, or by the
   script's own fallback timer if hydration never completes. Readers without
   JS never get the class, so prerendered content stays visible to them. */
html.platform-blocks-content-pending #root {
  visibility: hidden;
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
 * Resolves the reader's colour scheme and stamps it on <html> before first paint.
 *
 * Runs inside <head>, so `document.body` does not exist yet — an earlier version
 * wrote to it, threw, and landed in a catch that reset `colorScheme` to light,
 * defeating the whole script for dark-theme readers. Everything here touches
 * `documentElement` only; the body background is handled by the class-qualified
 * CSS rules above.
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
    try { saved = localStorage.getItem('platform-blocks-theme-mode'); } catch (storageError) {}

    if (saved === 'dark' || saved === 'light') {
      scheme = saved;
    } else {
      scheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    root.classList.remove('platform-blocks-light', 'platform-blocks-dark');
    root.classList.add('platform-blocks-' + scheme);
    root.style.colorScheme = scheme;
    root.style.backgroundColor = scheme === 'dark' ? '#000000' : '#ffffff';

    if (scheme === 'dark') {
      // The prerendered content is styled for light mode; hold it invisible
      // until hydration restyles it (ContentReveal lifts this), with a timer
      // fallback so the page is never lost if hydration fails.
      root.classList.add('platform-blocks-content-pending');
      setTimeout(function () {
        root.classList.remove('platform-blocks-content-pending');
      }, 4000);
    }
  } catch (e) {
    // Leave whatever resolved above in place; never downgrade to light here.
  }
})();
`;
