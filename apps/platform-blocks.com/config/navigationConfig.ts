import { CORE_COMPONENTS } from './coreComponents';
import { getAllHooks } from '../utils/hooksLoader';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  bottom?: boolean; // show in bottom bar
  searchable?: boolean; // include in spotlight
  section?: string; // optional override section grouping
  description?: string; // for spotlight
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

const toNavItems = (
  components: typeof CORE_COMPONENTS,
  baseRoute: string,
): NavItem[] => components
  .sort((a, b) => a.name.localeCompare(b.name))
  .map(component => ({
    label: component.name,
    route: `/${baseRoute}/${component.name}`,
    icon: component.icon ?? 'grid',
    searchable: true,
    description: component.description,
  }));

// Uniqueness is enforced by scripts/validate-demos.ts, which fails the build on
// a duplicate entry — Badge was listed twice and shipped a duplicate nav row.
const UI_COMPONENT_NAV_ITEMS: NavItem[] = toNavItems(
  CORE_COMPONENTS.filter(component => component.category !== 'charts'),
  'components',
);

const CHART_COMPONENT_NAV_ITEMS: NavItem[] = toNavItems(
  CORE_COMPONENTS.filter(component => component.category === 'charts'),
  // Chart docs are served by ComponentDetailScreen under /components/<Name>
  // (it handles the `charts` category), so keep the sidebar links consistent.
  'components',
);

// Sourced from the generated hook metadata (npm run demos:generate) so the
// sidebar never drifts from the hooks that actually have docs pages. Sorted by
// name here rather than by meta `order` — an alphabetical rail is easier to scan
// than a curated one once the list is long.
const HOOK_NAV_ITEMS: NavItem[] = getAllHooks()
  .map(hook => ({
    label: hook.name,
    route: `/hooks/${hook.name}`,
    icon: 'hook',
    searchable: true,
    description: hook.description,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export const NAV_SECTIONS: NavSection[] = [

  {
    section: 'Explore',
    items: [
      { label: 'Components', route: '/components', icon: 'grid', bottom: true, searchable: true },
      // { label: 'Charts', route: '/charts', icon: 'linechart', bottom: true, searchable: true },
      { label: 'Hooks', route: '/hooks', icon: 'hook', searchable: true, description: 'Reference for reusable React hooks in Platform Blocks' },
    ]
  },

  {
    section: 'Docs',
    items: [
      { label: 'Getting Started', route: '/getting-started', icon: 'home', bottom: true, searchable: true, description: 'Install, set up the provider, and render your first component' },
      { label: 'Examples', route: '/examples', icon: 'layers', searchable: true, description: 'Complete screens built from Platform Blocks components — open fullscreen, then copy the source' },
      { label: 'Localization', route: '/localization', icon: 'globe', searchable: true },
      { label: 'FAQ', route: '/faq', icon: 'question', bottom: true, searchable: true },
      { label: 'LLM docs', route: '/llms', icon: 'markdown', searchable: true, description: 'Documentation as Markdown for language models — llms.txt, llms-full.txt, and per-page files' },
    ]
  },
  {
    section: 'UI Components',
    items: UI_COMPONENT_NAV_ITEMS,
  },
  {
    section: 'Chart Components',
    items: CHART_COMPONENT_NAV_ITEMS,
  },
  // Omitted entirely when the generated artifacts are missing, so a fresh clone
  // shows an empty gap instead of a headed section with nothing under it.
  ...(HOOK_NAV_ITEMS.length > 0
    ? [{ section: 'Hooks', items: HOOK_NAV_ITEMS }]
    : []),
  // {
  //   section: 'Charts',
  //   items: [
  //     { label: 'BarChart', route: '/charts/BarChart', icon: 'bar-chart', searchable: true },
  //   ]
  // },
];

export const BOTTOM_NAV_ITEMS = NAV_SECTIONS.flatMap(s => s.items.filter(i => i.bottom));

export function findNavItem(route: string) {
  for (const sec of NAV_SECTIONS) {
    const item = sec.items.find(i => i.route === route);
    if (item) return { item, section: sec.section };
  }
  return null;
}

/**
 * Shared helper function to determine if a route is active
 * Centralizes the active route logic used across navigation components
 */
export function isRouteActive(pathname: string, route: string): boolean {
  return pathname === route || (route === '/' && pathname === '/');
}

