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

export const EXTENSIONS_TITLE = 'Extensions';

export const EXTENSIONS_SUBTITLE =
  'Packages that build on Platform Blocks — maintained by the core team and by the community.';

export const EXTENSIONS_INVITE =
  'Built an extension? Publish it to npm, then open a pull request adding it to this registry.';

export const EXTENSION_TEMPLATE_URL = 'https://github.com/platform-blocks/extension-template';

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
