// Loader for new generated demos system (demos.json, components-meta.json, demo-manifest.ts, demo-code-*.json)
// Falls back gracefully if artifacts are missing.

/* NOTE: This is intentionally light and runtime-only. We avoid static type imports
 * to keep the docs app resilient when generation hasn't been run yet.
 */

let demosIndex: any = null;
export interface PlaygroundMeta {
  id: string;
  label?: string;
  description?: string;
}

export interface ComponentMeta {
  name?: string;
  title?: string;
  description?: string;
  status?: string;
  since?: string;
  category?: string;
  tags?: string[];
  playground?: PlaygroundMeta;
  resources?: Array<{ label?: string; href: string }>;
  /** Repo-relative source directory, e.g. `packages/ui/src/components/Button` */
  sourcePath?: string;
  /** Repo-relative path of the page's authored markdown */
  docsPath?: string;
  /** npm package the component ships in */
  packageName?: string;
  [key: string]: any;
}

let componentsMeta: Record<string, ComponentMeta> | null = null;
let componentsProps: any = null;
let componentMarkdown: Record<string, string> | null = null;
let searchIndexNew: any = null;

try { demosIndex = require('../data/generated/demos.json'); } catch { /* ignore */ }
try { componentsMeta = require('../data/generated/components-meta.json'); } catch { /* ignore */ }
try { componentsProps = require('../data/generated/components-props.json'); } catch { /* ignore */ }
try { componentMarkdown = require('../data/generated/component-markdown.json'); } catch { /* ignore */ }
try { searchIndexNew = require('../data/generated/search-new.json'); } catch { /* ignore */ }

// Dynamic import map for demo React components
let DEMO_MODULES: Record<string, () => Promise<any>> | null = null;
let DEMO_STATIC: Record<string, () => any> | null = null;
try { ({ DEMO_MODULES, DEMO_STATIC } = require('../data/generated/demo-manifest')); } catch { /* ignore */ }

// Cache of loaded code maps per component
const codeCache: Record<string, Record<string, any>> = {};

/** One source file of a demo, as emitted by scripts/generate-demos.ts. */
export interface DemoFile {
  name: string;
  code: string;
  /** Source of this file on GitHub — the CodeBlock edit button follows the active tab. */
  githubUrl?: string;
}

export interface NewDemo {
  id: string;              // short id e.g. "basic"
  fullId: string;          // full id e.g. "Accordion.basic"
  component: string;       // component name
  title: string;
  description?: string;
  localizedDescriptions?: Record<string, string>;
  category?: string;
  tags?: string[];
  order?: number;
  status?: string;
  since?: string;
  hidden?: boolean;
  highlightLines?: string[];
  code?: string;
  /** Every source file of a multi-file demo (index.tsx first). Absent for single-file demos. */
  files?: DemoFile[];
  importPath?: string;
  /** Source of the demo's `index.tsx` on GitHub. Fallback for single-file demos. */
  githubUrl?: string;
  renderStyle?: 'auto' | 'center';
  codeCopy?: boolean;
  codeLineNumbers?: boolean;
  codeSpoiler?: boolean;
  codeSpoilerMaxHeight?: number;
  previewCenter?: boolean; // center preview area even if layout not 'center'
}

export function hasNewDemosArtifacts(): boolean {
  return Boolean(demosIndex && componentsMeta);
}

export function getComponentMeta(name: string): ComponentMeta | null {
  if (!componentsMeta) return null;
  return componentsMeta[name] || null;
}

export function getComponentPlaygroundMeta(name: string): PlaygroundMeta | null {
  const meta = getComponentMeta(name);
  return meta?.playground || null;
}

export function getComponentProps(name: string): any[] {
  if (!componentsProps) return [];
  return componentsProps[name] || [];
}

export function getComponentMarkdown(name: string): string | null {
  if (!componentMarkdown) return null;
  return componentMarkdown[name] || null;
}

/**
 * Internal/dev demos (migration scratchpads, sizing tests, debug harnesses) must
 * never surface in the public docs even if their frontmatter forgets `hidden`.
 * Matches slugs like `unified-styling-migration`, `clearable-size-test`, `debug`
 * while leaving legitimate names such as `testimonial` untouched.
 */
const INTERNAL_DEMO_SLUG = /(^|[-_])(test|migration|debug|scratch|wip|sandbox|internal)([-_]|$)/i;

function isPublicDemo(d: any): boolean {
  return !d.hidden && !INTERNAL_DEMO_SLUG.test(String(d.demo || d.id || ''));
}

export function getNewDemos(component: string): NewDemo[] {
  if (!demosIndex) return [];
  const list = (demosIndex.demos || []).filter((d: any) => d.component === component && isPublicDemo(d));
  return list.map((d: any) => ({
    id: d.demo,
    fullId: d.id,
    component: d.component,
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
    code: d.code, // may be undefined, will be lazy-loaded later
    codeCopy: d.codeCopy,
    codeLineNumbers: d.codeLineNumbers,
    codeSpoiler: d.codeSpoiler,
    codeSpoilerMaxHeight: d.codeSpoilerMaxHeight,
    previewCenter: d.previewCenter,
    // code & importPath lazy injected later
  }));
}

// Demo code shards are registered by the auto-generated loader
// (data/generated/demoCodeLoader.ts, written by scripts/generate-demos.ts).
// Delegating to it keeps every component with a generated shard wired up —
// a hand-maintained require list here silently drops newly added components,
// which is what left Knob (and ~40 others) with no "View code" toggle.
let loadGeneratedCodeMap: ((component: string) => Record<string, any> | null) | null = null;
try { ({ loadCodeMap: loadGeneratedCodeMap } = require('../data/generated/demoCodeLoader')); } catch { /* ignore */ }

function loadCodeMap(component: string): Record<string, any> | null {
  if (codeCache[component]) return codeCache[component];
  if (!loadGeneratedCodeMap) return null;

  const codeMap = loadGeneratedCodeMap(component);
  if (codeMap) {
    codeCache[component] = codeMap;
    return codeMap;
  }

  return null;
}

export function attachDemoCode(component: string, demos: NewDemo[]): NewDemo[] {
  const codeMap = loadCodeMap(component);
  if (!codeMap) return demos;
  return demos.map(d => {
    const entry = codeMap[`${component}.${d.id}`];
    if (entry) {
      return { ...d, code: entry.code, files: entry.files, importPath: entry.importPath, githubUrl: entry.githubUrl };
    }
    return d;
  });
}

// ---- New helpers for replacing legacy unified docs listing ----

export interface NewComponentIndexEntry {
  name: string;
  title: string;
  description?: string;
  category?: string;
  demoCount: number;
  hasDemos: boolean;
  playground?: PlaygroundMeta;
}

export function getAllNewComponents(): NewComponentIndexEntry[] {
  if (!componentsMeta) return [];
  return Object.keys(componentsMeta).map(name => {
    const meta = componentsMeta[name] || {};
    const demoCount = (demosIndex?.demos || []).filter((d: any) => d.component === name && isPublicDemo(d)).length;
    return {
      name,
      title: meta.title || name,
      description: meta.description,
      category: meta.category,
      demoCount,
      hasDemos: demoCount > 0,
      playground: meta.playground
    } as NewComponentIndexEntry;
  }).sort((a, b) => a.name.localeCompare(b.name));
}

export function getNewComponentIndex(name: string): NewComponentIndexEntry | null {
  return getAllNewComponents().find(c => c.name === name) || null;
}

export function getNewComponentDemos(name: string): NewDemo[] {
  return attachDemoCode(name, getNewDemos(name));
}

export interface NewSearchEntry { id: string; type: string; title: string; description?: string; category?: string; keywords?: string[] }

export function searchNewDocs(query: string): NewSearchEntry[] {
  if (!searchIndexNew || !query.trim()) return [];
  const lower = query.toLowerCase();
  return (searchIndexNew.entries as NewSearchEntry[]).filter(e => {
    const hay = [e.title, e.description || '', e.category || '', ...(e.keywords || [])].join(' ').toLowerCase();
    return hay.includes(lower);
  }).slice(0, 30);
}

export async function loadDemoComponentNew(component: string, demoId: string): Promise<any | null> {
  if (!DEMO_MODULES) return null;
  const key = `${component}.${demoId}`;
  // Dev eager path: use static require if present to avoid loader & network split
  if (typeof __DEV__ !== 'undefined' && __DEV__ && DEMO_STATIC && DEMO_STATIC[key]) {
    try {
      const mod = DEMO_STATIC[key]();
      const raw = mod?.default || mod?.Demo || null;
      const isValidFn = typeof raw === 'function';
      const isObjectComponent = raw && typeof raw === 'object' && ('$$typeof' in raw);
      if (!isValidFn && !isObjectComponent) return null;
      return raw;
    } catch (e) {
      console.warn('[demos] static require failed, falling back to dynamic', key, e);
    }
  }
  const loader = DEMO_MODULES[key];
  if (!loader) return null;
  try {
    const mod = await loader();
    const raw = mod?.default || mod?.Demo || null;
    // Validate that raw looks like a React component (function or forwardRef / memo result)
    const isValidFn = typeof raw === 'function';
    const isObjectComponent = raw && typeof raw === 'object' && ('$$typeof' in raw); // memo/forwardRef already invoked (should not usually happen)
    if (!isValidFn && !isObjectComponent) {
      console.warn('[demos] Invalid demo export shape', key, {
        typeofRaw: typeof raw,
        keys: raw && typeof raw === 'object' ? Object.keys(raw) : undefined,
      });
      return null;
    }
    return raw;
  } catch (e) {
    console.warn('Failed to load demo module', key, e);
    return null;
  }
}

export async function preloadAllComponentDemos(component: string): Promise<void> {
  if (!DEMO_MODULES) return;
  const demos = Object.keys(DEMO_MODULES).filter(k => k.startsWith(component + '.'));
  await Promise.all(demos.map(async k => { try { await DEMO_MODULES![k](); } catch { /* ignore */ } }));
}

