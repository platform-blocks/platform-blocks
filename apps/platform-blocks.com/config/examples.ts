/**
 * Plain-data source of truth for the Examples gallery.
 *
 * Kept free of JSX (like config/templates.ts) so it can be consumed by the
 * screens and by Node-side generators. The live components live in
 * components/examples/ and are mapped to these slugs in
 * components/examples/exampleRegistry.ts; app/examples/<slug>.tsx renders each
 * one chrome-less via the fullscreen-example handling in config/docsLayout.tsx.
 */

export interface ExampleEntry {
  slug: string;
  title: string;
  description: string;
  /** Component names the example leans on, rendered as chips. */
  components: string[];
  /** Repo path of the example source, for the "View source" link. */
  sourcePath: string;
}

export const EXAMPLES_TITLE = 'Examples';

export const EXAMPLES_SUBTITLE =
  'Complete screens built from Platform Blocks components — open one fullscreen, then copy its source into your app.';

export const EXAMPLES: ExampleEntry[] = [
  {
    slug: 'login',
    title: 'Login screen',
    description:
      'Email-and-password sign-in with social sign-in buttons, inline validation, and a "remember me" control.',
    components: ['Card', 'Input', 'PasswordInput', 'Checkbox', 'Button', 'BrandButton'],
    sourcePath: 'apps/platform-blocks.com/components/examples/LoginExample.tsx',
  },
  {
    slug: 'settings',
    title: 'Settings screen',
    description:
      'A grouped preferences screen — switch rows with descriptions, a theme-mode selector wired to the live theme, and a profile header.',
    components: ['ControlField', 'SegmentedControl', 'Avatar', 'Card', 'Column'],
    sourcePath: 'apps/platform-blocks.com/components/examples/SettingsExample.tsx',
  },
  {
    slug: 'dashboard',
    title: 'Stats dashboard',
    description:
      'KPI tiles with trend sparklines from @platform-blocks/charts, laid out responsively over the theme surfaces.',
    components: ['Card', 'Flex', 'Text', 'SparklineChart', 'Chip'],
    sourcePath: 'apps/platform-blocks.com/components/examples/DashboardExample.tsx',
  },
];
