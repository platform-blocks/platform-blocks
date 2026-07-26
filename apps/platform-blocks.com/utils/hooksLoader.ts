// Loader for generated hook demos and metadata. Mirrors docs/utils/demosLoader but for hooks.

let hooksIndex: any = null;
let hooksMeta: any = null;

try { hooksIndex = require('../data/generated/hooks.json'); } catch { /* ignore */ }
try { hooksMeta = require('../data/generated/hooks-meta.json'); } catch { /* ignore */ }

let HOOK_DEMO_MODULES: Record<string, () => Promise<any>> | null = null;
let HOOK_DEMO_STATIC: Record<string, () => any> | null = null;
try { ({ HOOK_DEMO_MODULES, HOOK_DEMO_STATIC } = require('../data/generated/hook-manifest')); } catch { /* ignore */ }

let loadHookCodeMapFn: ((hook: string) => Record<string, any> | null) | null = null;
try { ({ loadHookCodeMap: loadHookCodeMapFn } = require('../data/generated/hookCodeLoader')); } catch { /* ignore */ }
interface HookCodeEntry { code?: string; importPath?: string }

export interface HookDemo {
  id: string;
  fullId: string;
  component: string;
  hook: string;
  title: string;
  description?: string;
  localizedDescriptions?: Record<string, string>;
  category?: string;
  tags?: string[];
  order?: number;
  status?: string;
  since?: string;
  hidden?: boolean;
  highlightLines?: (number | string)[];
  renderStyle?: 'auto' | 'center';
  codeCopy?: boolean;
  codeLineNumbers?: boolean;
  codeSpoiler?: boolean;
  codeSpoilerMaxHeight?: number;
  previewCenter?: boolean;
  code?: string;
  importPath?: string;
}

export interface HookIndexEntry {
  name: string;
  title: string;
  description?: string;
  category?: string;
  order?: number;
  demoCount: number;
  hasDemos: boolean;
}

export function hasHookDemosArtifacts(): boolean {
  return Boolean(hooksIndex && hooksMeta);
}

export function getHookMeta(name: string): any | null {
  if (!hooksMeta) return null;
  return hooksMeta[name] || null;
}

export function getAllHooks(): HookIndexEntry[] {
  if (!hooksMeta) return [];
  const entries = Object.keys(hooksMeta).map(name => {
    const meta = hooksMeta[name] || {};
    const demoCount = (hooksIndex?.hooks || []).filter((d: any) => d.component === name && !d.hidden).length;
    return {
      name,
      title: meta.title || name,
      description: meta.description,
      category: meta.category,
      order: typeof meta.order === 'number' ? meta.order : 100,
      demoCount,
      hasDemos: demoCount > 0
    } as HookIndexEntry;
  });
  return entries.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
}

export function getHookDemos(hook: string): HookDemo[] {
  if (!hooksIndex) return [];
  const list = (hooksIndex.hooks || []).filter((d: any) => d.component === hook && !d.hidden);
  return list.map((d: any) => ({
    id: d.demo,
    fullId: d.id,
    component: d.component,
    hook: d.component,
    title: d.title || d.demo,
    description: d.description,
    localizedDescriptions: d.localizedDescriptions,
    category: d.category,
    tags: d.tags,
    order: d.order,
    status: d.status,
    since: d.since,
    hidden: d.hidden,
    highlightLines: d.highlightLines,
    renderStyle: d.renderStyle,
    codeCopy: d.codeCopy,
    codeLineNumbers: d.codeLineNumbers,
    codeSpoiler: d.codeSpoiler,
    codeSpoilerMaxHeight: d.codeSpoilerMaxHeight,
    previewCenter: d.previewCenter,
    code: d.code,
    importPath: d.importPath
  }));
}

export function attachHookDemoCode(hook: string, demos: HookDemo[]): HookDemo[] {
  if (!loadHookCodeMapFn) return demos;
  const map = loadHookCodeMapFn(hook);
  if (!map) return demos;
  return demos.map(demo => {
    const entry = map[`${hook}.${demo.id}`];
    if (!entry) return demo;
    return {
      ...demo,
      code: entry.code,
      importPath: entry.importPath
    };
  });
}

export function getHookDemoCodeEntry(hook: string, demoId: string): HookCodeEntry | null {
  if (!loadHookCodeMapFn) return null;
  const map = loadHookCodeMapFn(hook);
  if (!map) return null;
  return map[`${hook}.${demoId}`] || null;
}

export async function loadHookDemoComponent(hook: string, demoId: string): Promise<any | null> {
  if (!HOOK_DEMO_MODULES) return null;
  const key = `${hook}.${demoId}`;
  if (typeof __DEV__ !== 'undefined' && __DEV__ && HOOK_DEMO_STATIC && HOOK_DEMO_STATIC[key]) {
    try {
      const mod = HOOK_DEMO_STATIC[key]();
      const raw = mod?.default || mod?.Demo || null;
      const isValidFn = typeof raw === 'function';
      const isObjectComponent = raw && typeof raw === 'object' && ('$$typeof' in raw);
      if (!isValidFn && !isObjectComponent) return null;
      return raw;
    } catch (error) {
      console.warn('[hooks] static require failed, falling back to dynamic', key, error);
    }
  }

  const loader = HOOK_DEMO_MODULES[key];
  if (!loader) return null;
  try {
    const mod = await loader();
    const raw = mod?.default || mod?.Demo || null;
    const isValidFn = typeof raw === 'function';
    const isObjectComponent = raw && typeof raw === 'object' && ('$$typeof' in raw);
    if (!isValidFn && !isObjectComponent) return null;
    return raw;
  } catch (error) {
    console.warn('Failed to load hook demo module', key, error);
    return null;
  }
}

export async function preloadAllHookDemos(hook: string): Promise<void> {
  if (!HOOK_DEMO_MODULES) return;
  const entries = Object.keys(HOOK_DEMO_MODULES).filter(key => key.startsWith(`${hook}.`));
  await Promise.all(entries.map(async key => {
    try { await HOOK_DEMO_MODULES![key](); } catch { /* ignore */ }
  }));
}
