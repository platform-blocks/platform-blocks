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
  /** Maintained by the plocks team. */
  official: boolean;
  npmUrl: string;
  repoUrl: string;
}

export interface ExtensionContractPoint {
  title: string;
  detail: string;
}

export const EXTENSIONS_TITLE = 'Add-ons & extensions';

export const EXTENSIONS_SUBTITLE =
  'Official add-on packages and community extensions for plocks.';

export const EXTENSIONS_INVITE =
  'Build a community extension from the template, publish it to npm, then open a pull request to list it here.';

export const EXTENSION_TEMPLATE_URL = 'https://github.com/platform-blocks/extension-template';

export const EXTENSIONS_DEFINITION =
  'Official add-ons are @plocks packages installed separately from @plocks/ui. Community extensions are packages maintained by others that follow the same theme and component conventions.';

export const OFFICIAL_ADDONS_DESCRIPTION =
  'Install the packages you need alongside @plocks/ui. Their components appear in the Add-ons section of the docs sidebar.';

/**
 * What makes a package an extension rather than just a dependency.
 *
 * `@plocks/charts` is the reference implementation of every point
 * below; each one is something an app can rely on without reading the source.
 */
export const EXTENSION_CONTRACT: ExtensionContractPoint[] = [
  {
    title: 'Takes the host theme',
    detail:
      'Colors, spacing, radii, and typography come from the app\'s plocks theme, so an extension changes with the theme instead of shipping a palette of its own — including light and dark.',
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
    title: 'Keep @plocks/ui a peer dependency',
    detail:
      'A bundled second copy of the UI package means two theme contexts, and components that silently stop sharing the theme.',
  },
  {
    title: 'Publish, then open a pull request',
    detail:
      'Add one entry to the registry in apps/docs/config/extensions.ts with a link and a one-line description.',
  },
];

export const EXTENSIONS: ExtensionEntry[] = [
  {
    name: '@plocks/charts',
    description:
      '24 chart types — line, bar, area, pie, heatmap, sankey, candlestick, and more — themed by the same tokens as the UI components.',
    official: true,
    npmUrl: 'https://www.npmjs.com/package/@plocks/charts',
    repoUrl: 'https://github.com/platform-blocks/plocks/tree/main/packages/charts',
  },
  {
    name: '@plocks/dates',
    description: 'Calendars and date, month, year and time pickers, as inputs or inline.',
    official: true,
    npmUrl: 'https://www.npmjs.com/package/@plocks/dates',
    repoUrl: 'https://github.com/platform-blocks/plocks/tree/main/packages/dates',
  },
  {
    name: '@plocks/code',
    description: '`CodeBlock` with syntax highlighting, and a `Markdown` renderer.',
    official: true,
    npmUrl: 'https://www.npmjs.com/package/@plocks/code',
    repoUrl: 'https://github.com/platform-blocks/plocks/tree/main/packages/code',
  },
  {
    name: '@plocks/media',
    description: '`AudioPlayer`, `Video`, and sound feedback for buttons and UI events.',
    official: true,
    npmUrl: 'https://www.npmjs.com/package/@plocks/media',
    repoUrl: 'https://github.com/platform-blocks/plocks/tree/main/packages/media',
  },
  {
    name: '@plocks/carousel',
    description: 'A swipeable `Carousel` built on react-native-reanimated-carousel.',
    official: true,
    npmUrl: 'https://www.npmjs.com/package/@plocks/carousel',
    repoUrl: 'https://github.com/platform-blocks/plocks/tree/main/packages/carousel',
  },
  {
    name: '@plocks/spotlight',
    description: 'A ⌘K command palette you can open from anywhere.',
    official: true,
    npmUrl: 'https://www.npmjs.com/package/@plocks/spotlight',
    repoUrl: 'https://github.com/platform-blocks/plocks/tree/main/packages/spotlight',
  },
  {
    name: '@plocks/brands',
    description: '`BrandIcon` and `BrandButton` (social sign-in and store badges), plus each brand\'s name, colors and palette.',
    official: true,
    npmUrl: 'https://www.npmjs.com/package/@plocks/brands',
    repoUrl: 'https://github.com/platform-blocks/plocks/tree/main/packages/brands',
  },
  {
    name: '@plocks/qrcode',
    description: 'A themeable `QRCode` with logos, gradients and module shapes, and no QR library dependency.',
    official: true,
    npmUrl: 'https://www.npmjs.com/package/@plocks/qrcode',
    repoUrl: 'https://github.com/platform-blocks/plocks/tree/main/packages/qrcode',
  },
  {
    name: '@plocks/emoji-picker',
    description: 'A searchable emoji picker with categories, skin tones, recent selections, and custom sets.',
    official: true,
    npmUrl: 'https://www.npmjs.com/package/@plocks/emoji-picker',
    repoUrl: 'https://github.com/platform-blocks/plocks/tree/main/packages/emoji-picker',
  },
];
