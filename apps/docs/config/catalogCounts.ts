import componentsMeta from '../data/generated/components-meta.json';
import hooksMeta from '../data/generated/hooks-meta.json';

/** Counts of documented, user-facing entries in the generated catalog. */
const entries = Object.values(componentsMeta);

export const CATALOG_COUNTS = {
  uiComponents: entries.filter(entry => entry.packageName === '@plocks/ui').length,
  components: entries.filter(entry => entry.packageName !== '@plocks/charts').length,
  charts: entries.filter(entry => entry.packageName === '@plocks/charts').length,
  hooks: Object.keys(hooksMeta).length,
} as const;
