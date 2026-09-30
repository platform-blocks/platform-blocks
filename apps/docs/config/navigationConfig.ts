import type { NavTreeItem } from '@plocks/ui';
import { CATEGORY_ICONS, CORE_COMPONENTS, getCoreCategories } from './coreComponents';
import { getAllHooks } from '../utils/hooksLoader';
import { getComponentMeta } from '../utils/demosLoader';
import { componentRoute } from '../utils/componentRoute';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  bottom?: boolean; // show in bottom bar
  searchable?: boolean; // include in spotlight
  section?: string; // optional override section grouping
  description?: string; // for spotlight
  /**
   * Rank inside its section. Entries with the same rank sort alphabetically;
   * Overview uses 0 for Getting Started, 1 for its regular pages, and 2 for
   * Contributing so it stays at the bottom.
   */
  order?: number;
  /**
   * Sub-group inside the section, rendered as a collapsible branch in the
   * sidebar. Components carry their `coreComponents` category here — the
   * grouping already existed for the /components filter chips and was the
   * only thing keeping a 97-row alphabetical wall from being navigable.
   */
  group?: string;
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

const CATEGORY_LABELS: Record<string, string> = {
  charts: 'Charts',
  data: 'Data',
  input: 'Input',
  display: 'Display',
  feedback: 'Feedback',
  layout: 'Layout',
  navigation: 'Navigation',
  overlay: 'Overlay',
  typography: 'Typography',
  form: 'Form',
  media: 'Media',
  dates: 'Dates',
  others: 'Others',
};

const categoryLabel = (category: string): string =>
  CATEGORY_LABELS[category] ?? category.charAt(0).toUpperCase() + category.slice(1);

const toNavItems = (
  components: typeof CORE_COMPONENTS,
  { grouped = true }: { grouped?: boolean } = {},
): NavItem[] => components
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name))
  .map(component => ({
    label: component.name,
    route: componentRoute(component.name),
    icon: component.icon ?? 'grid',
    searchable: true,
    description: component.description,
    group: grouped ? categoryLabel(component.category) : undefined,
  }));

// Uniqueness is enforced by scripts/validate-demos.ts, which fails the build on
// a duplicate entry — Badge was listed twice and shipped a duplicate nav row.
const componentPackage = (name: string): string => getComponentMeta(name)?.packageName ?? '@plocks/ui';

const UI_COMPONENT_NAV_ITEMS: NavItem[] = toNavItems(
  CORE_COMPONENTS.filter(component => component.category !== 'charts' && componentPackage(component.name) === '@plocks/ui'),
);

const ADDON_COMPONENT_NAV_ITEMS: NavItem[] = toNavItems(
  CORE_COMPONENTS.filter(component => component.category !== 'charts' && componentPackage(component.name) !== '@plocks/ui'),
  { grouped: false },
).map(item => ({ ...item, group: componentPackage(item.label) }));

const CHART_COMPONENT_NAV_ITEMS: NavItem[] = toNavItems(
  CORE_COMPONENTS.filter(component => component.category === 'charts'),
  // Every chart shares the one category, so grouping them would nest the whole
  // section inside a single branch named after the section.
  { grouped: false },
);

/**
 * A category has to earn its branch. Hook categories are fine-grained — five of
 * the nine hold a single hook — and a branch you open to find one row costs a
 * click for nothing, so the small ones pool into `Other`.
 */
const MIN_GROUP_SIZE = 2;

const ALL_HOOKS = getAllHooks();

const HOOK_CATEGORY_SIZES = ALL_HOOKS.reduce<Record<string, number>>((sizes, hook) => {
  if (hook.category) sizes[hook.category] = (sizes[hook.category] ?? 0) + 1;
  return sizes;
}, {});

const hookGroup = (category: string | undefined): string => {
  if (!category || (HOOK_CATEGORY_SIZES[category] ?? 0) < MIN_GROUP_SIZE) return 'Other';
  return categoryLabel(category);
};

/**
 * Branch order for the hook categories, biggest first, with `Other` pinned
 * last. Unlike the component categories there is no curated order to inherit —
 * the meta files were never written with a rail in mind.
 *
 * Path-qualified, because `Navigation` and `Layout` name a component category
 * too: a bare entry would hand both the same rank and sort one of them wrong.
 */
const HOOK_GROUP_ORDER = [
  ...Object.entries(HOOK_CATEGORY_SIZES)
    .filter(([, size]) => size >= MIN_GROUP_SIZE)
    .sort(([a, sizeA], [b, sizeB]) => sizeB - sizeA || a.localeCompare(b))
    .map(([category]) => `Hooks/${categoryLabel(category)}`),
  'Hooks/Other',
];

// Sourced from the generated hook metadata (npm run demos:generate) so the
// sidebar never drifts from the hooks that actually have docs pages. Sorted by
// name here rather than by meta `order` — an alphabetical rail is easier to scan
// than a curated one once the list is long.
const HOOK_NAV_ITEMS: NavItem[] = ALL_HOOKS
  .map(hook => ({
    label: hook.name,
    route: `/hooks/${hook.name}`,
    icon: 'hook',
    searchable: true,
    description: hook.description,
    group: hookGroup(hook.category),
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

/**
 * Branch order for the sidebar tree, checked at every level: the sections
 * first, then the component categories inside them. Category order mirrors
 * `getCoreCategories()`, curated once for the /components filter chips.
 *
 * `buildNavTree` treats this as a preference rather than a whitelist, so a new
 * section or category still lands somewhere sensible without editing it.
 */
export const NAV_GROUP_ORDER = [
  'Overview',
  'Components',
  'Add-ons',
  'Charts',
  'Hooks',
  ...getCoreCategories().map(categoryLabel),
  ...HOOK_GROUP_ORDER,
];

/**
 * Icon per sidebar branch — sections, component categories and hook categories
 * alike. Hook categories that also name a component category (`Navigation`,
 * `Layout`) reuse its icon; the rest are named here.
 */
export const NAV_GROUP_ICONS: Record<string, string> = {
  Overview: 'home',
  Components: 'grid',
  'Add-ons': 'package',
  Charts: 'chart-bar',
  Hooks: 'hook',
  ...Object.fromEntries(ADDON_COMPONENT_NAV_ITEMS.map(item => [item.group, 'package'])),
  ...Object.fromEntries(
    getCoreCategories().map(category => [
      categoryLabel(category),
      CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS],
    ])
  ),
  Keyboard: 'keyboard',
  State: 'refresh',
  Platform: 'phone',
  Other: 'ellipsis-h',
};

export const NAV_SECTIONS: NavSection[] = [

  {
    section: 'Explore',
    items: [
      { label: 'Components', route: '/components', icon: 'grid', bottom: true, searchable: true },
      // { label: 'Charts', route: '/charts', icon: 'linechart', bottom: true, searchable: true },
      { label: 'Hooks', route: '/hooks', icon: 'hook', searchable: true, description: 'Reference for reusable React hooks in plocks' },
    ]
  },

  {
    section: 'Overview',
    items: [
      { label: 'Getting Started', route: '/getting-started', icon: 'home', order: 0, bottom: true, searchable: true, description: 'Install, set up the provider, and render your first component' },
      { label: 'Examples', route: '/examples', icon: 'layers', order: 1, searchable: true, description: 'Complete screens built from plocks components — open fullscreen, then copy the source' },
      { label: 'Add-ons & extensions', route: '/extensions', icon: 'package', order: 1, searchable: true, description: 'Official add-on packages and community extensions' },
      { label: 'Localization', route: '/localization', icon: 'globe', order: 1, searchable: true },
      { label: 'FAQ', route: '/faq', icon: 'question', order: 1, bottom: true, searchable: true },
      { label: 'LLM docs', route: '/llms', icon: 'markdown', order: 1, searchable: true, description: 'Documentation as Markdown for language models — llms.txt, llms-full.txt, and per-page files' },
      { label: 'Contributing', route: '/contribute', icon: 'code', order: 2, searchable: true, description: 'Repo layout, local setup, and what it takes to land a component, a demo, or a docs page' },
    ]
  },
  {
    section: 'Components',
    items: UI_COMPONENT_NAV_ITEMS,
  },
  {
    section: 'Add-ons',
    items: ADDON_COMPONENT_NAV_ITEMS,
  },
  {
    section: 'Charts',
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

/**
 * Index page for a section, hung off the section's own branch in the sidebar
 * tree. Pressing `Components` there both opens the branch and lands on the
 * listing — which is what the duplicate `Explore` rows used to be for.
 */
export const SECTION_ROUTES: Record<string, string> = {
  Components: '/components',
  Hooks: '/hooks',
};

/**
 * `NAV_SECTIONS`, flattened for `NavTree`: section and category become the
 * grouping path, and the rest of the record travels along in `data` so the
 * press handler gets the original item back.
 *
 * Rows that only duplicate a section's index page are dropped — the branch
 * itself links there — which empties `Explore` and removes it from the tree.
 * The section stays in `NAV_SECTIONS`, where the bottom bar and Spotlight
 * still read it.
 */
export const NAV_TREE_ITEMS: NavTreeItem<NavItem>[] = NAV_SECTIONS.flatMap(section =>
  section.items
    .filter(item => !Object.values(SECTION_ROUTES).includes(item.route))
    .map(item => ({
      label: item.label,
      href: item.route,
      group: item.group ? [section.section, item.group] : [section.section],
      order: item.order,
      data: item,
    }))
);

export function findNavItem(route: string) {
  for (const sec of NAV_SECTIONS) {
    const item = sec.items.find(i => i.route === route);
    if (item) return { item, section: sec.section };
  }
  return null;
}
