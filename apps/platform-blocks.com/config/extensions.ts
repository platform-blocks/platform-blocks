/**
 * Plain-data registry for the Extensions page.
 *
 * Kept free of JSX (like config/templates.ts) so it can be consumed by the
 * screen and by Node-side generators. Community extensions are added here by
 * pull request — one entry with a link and a one-line description.
 */

export interface ExtensionEntry {
  /** npm package name. */
  name: string;
  description: string;
  /** Maintained by the Platform Blocks team. */
  official: boolean;
  npmUrl: string;
  repoUrl: string;
}

export interface ExtensionContractPoint {
  title: string;
  detail: string;
}

export const EXTENSIONS_TITLE = 'Extensions';

export const EXTENSIONS_SUBTITLE =
  'Packages that build on Platform Blocks — maintained by the core team and by the community.';

export const EXTENSIONS_INVITE =
  'Built an extension? Publish it to npm, then open a pull request adding it to this registry.';

export const EXTENSION_TEMPLATE_URL = 'https://github.com/platform-blocks/extension-template';

export const EXTENSIONS_DEFINITION =
  'An extension is a package that adds components, hooks, or utilities to a Platform Blocks app and behaves like the rest of it. Nothing registers itself at runtime — an extension is an ordinary npm package that follows four conventions, so anything built on it composes with the components already in the app.';

/**
 * What makes a package an extension rather than just a dependency.
 *
 * `@platform-blocks/charts` is the reference implementation of every point
 * below; each one is something an app can rely on without reading the source.
 */
export const EXTENSION_CONTRACT: ExtensionContractPoint[] = [
  {
    title: 'Takes the host theme',
    detail:
      'Colors, spacing, radii, and typography come from the app\'s Platform Blocks theme, so an extension changes with the theme instead of shipping a palette of its own — including light and dark.',
  },
  {
    title: 'Speaks the same props',
    detail:
      'color, size, variant, and the spacing shorthands mean the same thing they mean on a Button. A developer who knows the UI package can already use the extension.',
  },
  {
    title: 'Fits the space it is given',
    detail:
      'Components size themselves from their container rather than from fixed pixel values, so an extension works in a sidebar, a modal, and a phone screen without per-breakpoint code.',
  },
  {
    title: 'Ships its own docs',
    detail:
      'Typed props with JSDoc, a demos folder per component, and a meta entry — the same layout the docs site generates these pages from, so an extension can be documented the same way.',
  },
];

export const EXTENSIONS_PUBLISH_STEPS: ExtensionContractPoint[] = [
  {
    title: 'Start from the template',
    detail:
      'It ships a themed sample component, an Expo example app that hot-reloads the package on iOS, Android, and web, tests, linting, CI, and a one-command npm release.',
  },
  {
    title: 'Keep @platform-blocks/ui a peer dependency',
    detail:
      'A bundled second copy of the UI package means two theme contexts, and components that silently stop sharing the theme.',
  },
  {
    title: 'Publish, then open a pull request',
    detail:
      'Add one entry to the registry in apps/platform-blocks.com/config/extensions.ts with a link and a one-line description.',
  },
];

export const EXTENSIONS: ExtensionEntry[] = [
  {
    name: '@platform-blocks/charts',
    description:
      '25 chart types — line, bar, area, pie, heatmap, sankey, candlestick, and more — themed by the same tokens as the UI components.',
    official: true,
    npmUrl: 'https://www.npmjs.com/package/@platform-blocks/charts',
    repoUrl: 'https://github.com/platform-blocks/platform-blocks/tree/main/packages/charts',
  },
];
