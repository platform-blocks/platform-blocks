// JSON schema-style description for potential codegen / docs tooling.
// This is intentionally lightweight and not a full JSON Schema draft implementation.
import { DEFAULT_Z_INDICES } from '../../core/theme/zIndices';

export interface AppShellMetaField {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  default?: string | number | boolean;
  enum?: string[];
}

export interface AppShellMetaSection {
  name: string;
  description?: string;
  fields: AppShellMetaField[];
}

export const APP_SHELL_META: AppShellMetaSection[] = [
  {
    name: 'layout',
    description: 'Root layout configuration for AppShell',
    fields: [
      {
        name: 'layout',
        type: "'default' | 'alt'",
        description: "'alt' lets the navbar and aside span the full height, with the header between them",
        default: 'default',
        enum: ['default', 'alt'],
      },
      { name: 'withBorder', type: 'boolean', description: 'Default border for every section', default: true },
      { name: 'padding', type: 'ResponsiveSize', description: 'Main content padding: spacing token, px, or per-breakpoint object' },
      { name: 'zIndex', type: 'number', description: "Stacking order for every section without its own (default: each section's theme.zIndices layer)" },
      { name: 'transitionDuration', type: 'number', description: 'ms; reduced motion forces 0', default: 200 },
      { name: 'transitionTimingFunction', type: 'string', description: 'CSS timing function for navbar/content transitions' },
    ]
  },
  {
    name: 'header',
    fields: [
      { name: 'height', type: 'ResponsiveSize', required: true },
      { name: 'collapsed', type: 'boolean', description: 'Hide the header', default: false },
      { name: 'offset', type: 'boolean', description: 'Start the main content below the header', default: true },
      { name: 'zIndex', type: 'number', description: 'theme.zIndices.header', default: DEFAULT_Z_INDICES.header }
    ]
  },
  {
    name: 'navbar',
    fields: [
      { name: 'width', type: 'ResponsiveSize', required: true },
      { name: 'breakpoint', type: 'Breakpoint', description: 'Inline rail from this breakpoint up; drawer below it (web)', default: 'md' },
      { name: 'collapsed.mobile', type: 'boolean', description: 'Initial drawer state (false = open)', default: true },
      { name: 'collapsed.desktop', type: 'boolean', description: 'Initial desktop state (true = rail)', default: false },
      { name: 'collapsedWidth', type: 'number', description: 'Rail width when collapsed', default: 72 },
      { name: 'expandOnHover', type: 'boolean', default: true },
      { name: 'expandOnHoverPush', type: 'boolean', default: false },
      { name: 'autoExpandBreakpoint', type: 'Breakpoint' },
      { name: 'startCollapsedDesktop', type: 'boolean', default: false },
      { name: 'zIndex', type: 'number', description: 'Rail: theme.zIndices.sticky (drawer: theme.zIndices.overlay)', default: DEFAULT_Z_INDICES.sticky }
    ]
  },
  {
    name: 'aside',
    fields: [
      { name: 'width', type: 'ResponsiveSize', required: true },
      { name: 'breakpoint', type: 'Breakpoint', description: 'collapsed.desktop applies from this breakpoint up', default: 'md' },
      { name: 'collapsed.mobile', type: 'boolean', default: true },
      { name: 'collapsed.desktop', type: 'boolean', default: false },
      { name: 'zIndex', type: 'number', description: 'theme.zIndices.sticky', default: DEFAULT_Z_INDICES.sticky }
    ]
  },
  {
    name: 'footer',
    fields: [
      { name: 'height', type: 'ResponsiveSize', required: true },
      { name: 'collapsed', type: 'boolean', description: 'Hide the footer', default: false },
      { name: 'offset', type: 'boolean', description: 'End the main content above the footer', default: true },
      { name: 'zIndex', type: 'number', description: 'theme.zIndices.sticky', default: DEFAULT_Z_INDICES.sticky }
    ]
  },
  {
    name: 'bottomNav',
    fields: [
      { name: 'height', type: 'ResponsiveSize', required: true },
      { name: 'showOnlyMobile', type: 'boolean', default: true },
      { name: 'collapsed', type: 'boolean', description: 'Hide the bottom navigation', default: false },
      { name: 'zIndex', type: 'number', description: 'theme.zIndices.sticky', default: DEFAULT_Z_INDICES.sticky }
    ]
  }
];
