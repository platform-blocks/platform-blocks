#!/usr/bin/env ts-node
/**
 * Demo index generator (Phase 0)
 * Responsibilities:
 *   - Scan component demo directories: ui/src/components/<Component>/demo/*.tsx
 *   - Read optional paired markdown (.md) with YAML frontmatter for metadata
 *   - Emit generated artifacts to docs/data/generated/
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

import { GITHUB_REPO, SITE_URL } from '../apps/react-ui-library.com/config/urls';

const ROOT = path.resolve(__dirname, '..');
const UI_COMPONENTS_DIR = path.join(ROOT, 'packages', 'ui', 'src', 'components');
const UI_HOOKS_DIR = path.join(ROOT, 'packages', 'ui', 'src', 'hooks');
const CHARTS_COMPONENTS_DIR = path.join(ROOT, 'packages', 'charts', 'src', 'components'); // charts components directory
const OUTPUT_DIR = path.join(ROOT, 'apps', 'react-ui-library.com', 'data', 'generated');
// Per-component markdown consumed by the docs app (CopyPageMenu) and by
// scripts/generate-llms.ts, which publishes it under public/llms/.
const COMPONENT_MARKDOWN_DIR = path.join(OUTPUT_DIR, 'component-markdown');

interface DemoMeta {
  id: string; // Component.demoId
  component: string;
  demo: string; // short demo key (no component prefix)
  title: string;
  kind?: 'component' | 'chart' | 'hook';
  description?: string;
  localizedDescriptions?: Record<string, string>;
  tags: string[];
  category: string;
  order: number;
  status?: string;
  since?: string;
  hidden?: boolean;
  highlightLines?: (number | string)[];
  renderStyle?: 'auto' | 'center';
  codeCopy?: boolean; // show copy button
  codeLineNumbers?: boolean; // show line numbers
  codeSpoiler?: boolean; // wrap code in spoiler
  codeSpoilerMaxHeight?: number;
  previewCenter?: boolean; // center preview region regardless of layout
  code?: string; // raw source when inlined (hooks, playgrounds)
  importPath?: string; // source module path reference
  githubUrl?: string; // source file on GitHub, linked from the demo's code panel
}

interface DemoFile { name: string; code: string; githubUrl?: string; }
interface CodeEntry { code: string; hash: string; importPath: string; files?: DemoFile[]; githubUrl?: string; }

/**
 * Branch the docs site links source at. `main` rather than a tag or commit SHA:
 * the site is rebuilt from main, so a permalink would start pointing at stale
 * source the moment a demo is edited.
 */
const GITHUB_BRANCH = 'main';

/**
 * Repo URL for a file on disk, powering the CodeBlock edit button on every demo.
 * Paths are relative to the repo root, so the link survives the demo folder
 * moving as long as the file still exists at its new path.
 */
function githubUrlFor(absPath: string): string {
  const relative = path.relative(ROOT, absPath).split(path.sep).join('/');
  return `${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${relative}`;
}

/** Attaches `githubUrl` to `index.tsx` and keeps the sibling files' own links. */
function withEntryFiles(indexPath: string, code: string, extraFiles: DemoFile[]): DemoFile[] {
  return [{ name: 'index.tsx', code, githubUrl: githubUrlFor(indexPath) }, ...extraFiles];
}

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function sha256(content: string) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function parseStructuredValue(rawValue: string): any {
  const value = rawValue.trim();
  const looksJson = (value.startsWith('[') && value.endsWith(']')) || (value.startsWith('{') && value.endsWith('}'));
  if (!looksJson) return rawValue;
  try {
    return JSON.parse(value);
  } catch {
    if (value.startsWith('[') && value.endsWith(']')) {
      return value
        .slice(1, -1)
        .split(',')
        .map((token) => token.trim())
        .filter(Boolean);
    }
    return rawValue;
  }
}

function parseFrontmatter(raw: string): { frontmatter: any; body: string } {
  if (!raw.startsWith('---')) return { frontmatter: {}, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { frontmatter: {}, body: raw };
  const fmBlock = raw.substring(3, end).trim();
  const body = raw.substring(end + 4).replace(/^\n/, '');
  const frontmatter: any = {};
  for (const line of fmBlock.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let value: any = m[2];
    if (typeof value === 'string') {
      value = value.replace(/\s+\/\/.*$/, '').replace(/\s+#.*$/, '').trim();
    }
    if (typeof value === 'string' && ((value.startsWith('[') && value.endsWith(']')) || (value.startsWith('{') && value.endsWith('}')))) {
      const structured = parseStructuredValue(value);
      if (structured !== value) {
        value = structured;
      }
    }
    // Quoted scalars are YAML strings, not part of the value — several meta
    // files quote category/status and were publishing `Category: "Input"`.
    if (typeof value === 'string' && /^(".*"|'.*')$/.test(value)) {
      value = value.slice(1, -1);
    }
    if (typeof value === 'string' && /^\d+$/.test(value)) value = parseInt(value, 10);
    if (value === 'true') value = true; else if (value === 'false') value = false;
    frontmatter[key] = value;
  }
  return { frontmatter, body };
}

interface ComponentMetaRecord {
  [component: string]: any;
}

interface HookMetaRecord {
  [hook: string]: any;
}

type PlaygroundMetaConfig = {
  id: string;
  label?: string;
  description?: string;
};

function parseHighlight(val: any): (number | string)[] | undefined {
  if (!val) return undefined;
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }
  return undefined;
}

/**
 * Extensions a demo folder can contribute as an extra source tab (`data.ts`,
 * `theme.ts`, `fixtures.json`, …). `index.tsx` is the demo entry and is added
 * first by the caller; `metadata.ts` and the description markdown are docs
 * plumbing rather than example source, so they stay out of the tab strip.
 */
const DEMO_FILE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.css']);
const DEMO_FILE_EXCLUDE = new Set(['index.tsx', 'index.ts', 'metadata.ts']);

function collectDemoFiles(folderPath: string): DemoFile[] {
  let entries: string[] = [];
  try { entries = fs.readdirSync(folderPath); } catch { return []; }
  return entries
    .filter(name => !name.startsWith('.'))
    .filter(name => !DEMO_FILE_EXCLUDE.has(name))
    .filter(name => DEMO_FILE_EXTENSIONS.has(path.extname(name)))
    .filter(name => { try { return fs.statSync(path.join(folderPath, name)).isFile(); } catch { return false; } })
    .sort()
    .map(name => ({
      name,
      code: fs.readFileSync(path.join(folderPath, name), 'utf8').trim(),
      githubUrl: githubUrlFor(path.join(folderPath, name)),
    }));
}

/**
 * Fixtures a demo imports from outside its own folder — `../data`, shared by
 * every demo of a component, and the occasional `../../<Other>/demos/data`.
 * They are emitted as `data.ts` alongside the demo so the source tab strip and
 * the Snack bundle both see a self-contained example; snackUrl.ts rewrites the
 * import to match. Only `data` modules travel: a demo reaching further into the
 * package is a component import, which the Snack resolves from npm instead.
 */
function collectSharedDataFiles(code: string, folderPath: string): DemoFile[] {
  const files: DemoFile[] = [];
  const seen = new Set<string>();
  for (const match of code.matchAll(/from\s*['"]((?:\.\.\/)+(?:[^'"]*\/)?data)(?:\.ts)?['"]/g)) {
    const resolved = path.resolve(folderPath, match[1]);
    if (seen.has(resolved)) continue;
    seen.add(resolved);
    for (const ext of ['.ts', '.tsx']) {
      if (!fs.existsSync(resolved + ext)) continue;
      // The link points at the shared fixture's real location, not the demo
      // folder it is surfaced under.
      files.push({
        name: 'data.ts',
        code: fs.readFileSync(resolved + ext, 'utf8').trim(),
        githubUrl: githubUrlFor(resolved + ext),
      });
      break;
    }
  }
  // Two different shared fixtures would collide on the single `data.ts` name;
  // no demo does that today, and shipping one silently would be worse.
  return files.length > 1 ? [] : files;
}

function normalizePlaygroundMeta(value: any, componentName: string): PlaygroundMetaConfig | undefined {
  if (!value) return undefined;
  if (value === true) {
    return { id: componentName };
  }
  if (typeof value === 'string') {
    return { id: value };
  }
  if (typeof value === 'object') {
    const id = typeof value.id === 'string' && value.id.trim() ? value.id.trim() : componentName;
    const label = typeof value.label === 'string' ? value.label : undefined;
    const description = typeof value.description === 'string' ? value.description : undefined;
    return { id, label, description };
  }
  return undefined;
}

function collectDemos() {
  const demos: DemoMeta[] = [];
  const codeByComponent: Record<string, Record<string, CodeEntry>> = {};
  const componentMeta: ComponentMetaRecord = {};
  // Track source directory per component so props extraction works across multiple roots
  const componentSourceDir: Record<string, string> = {};

  const components = fs.readdirSync(UI_COMPONENTS_DIR).filter(f => fs.statSync(path.join(UI_COMPONENTS_DIR, f)).isDirectory());

  for (const comp of components) {
    componentSourceDir[comp] = path.join(UI_COMPONENTS_DIR, comp);
    const demoDir = path.join(UI_COMPONENTS_DIR, comp, 'demos');
    const metaDir = path.join(UI_COMPONENTS_DIR, comp, 'meta');
    if (!fs.existsSync(demoDir)) continue;

    const entries = fs.readdirSync(demoDir);

    // New canonical metadata location: meta/component.md
    const canonicalMetaMd = path.join(metaDir, 'component.md');
    if (fs.existsSync(canonicalMetaMd)) {
      try {
        const raw = fs.readFileSync(canonicalMetaMd, 'utf8');
        const { frontmatter, body } = parseFrontmatter(raw);
        const fm = { ...(frontmatter || {}) } as any;
        const { playground: playgroundRaw, ...restFm } = fm;
        const desc = (body || '').trim() || (typeof fm.description === 'string' ? fm.description : '');
        const name = typeof fm.name === 'string' && fm.name.trim() ? fm.name : comp;
        const title = typeof fm.title === 'string' && fm.title.trim() ? fm.title : comp;
        const playgroundMeta = normalizePlaygroundMeta(playgroundRaw, comp);
        const metaEntry: Record<string, any> = { ...restFm, name, title, description: desc || `${comp} component` };
        if (playgroundMeta) metaEntry.playground = playgroundMeta;
        componentMeta[comp] = metaEntry;
      } catch {
        console.warn(`[generate-demos] Failed to parse metadata for ${comp}`);
      }
    } else {
      console.warn(`[generate-demos] Missing canonical meta/component.md for ${comp}`);
    }
    const tsxFiles = entries.filter(f => f.endsWith('.tsx'));
    const subfolders = entries.filter(f => fs.existsSync(path.join(demoDir, f)) && fs.statSync(path.join(demoDir, f)).isDirectory());

    codeByComponent[comp] = codeByComponent[comp] || {};

    // 1. New structure: each subfolder is a demo (expects index.tsx, optional description.md, metadata.ts)
    for (const folder of subfolders) {
      const indexPath = path.join(demoDir, folder, 'index.tsx');
      if (!fs.existsSync(indexPath)) continue; // skip non-demo folders
      const raw = fs.readFileSync(indexPath, 'utf8');

      // Attempt to extract exported code snippet if defined as export const code = `...`;
      let codeSnippet = raw;
      const codeMatch = raw.match(/export const code\s*=\s*`([\s\S]*?)`;/);
      if (codeMatch) {
        codeSnippet = codeMatch[1];
      }
      const codeHash = sha256(codeSnippet);
      const id = `${comp}.${folder}`;
      const relImport = `../../../../packages/ui/src/components/${comp}/demos/${folder}`;
      // Sibling sources (data.ts, fixtures.json, …) become extra file tabs in
      // the docs code panel. Emitted only when the demo actually has them.
      const localFiles = collectDemoFiles(path.join(demoDir, folder));
      const extraFiles = [
        ...localFiles,
        // A demo-local data.ts wins: the demo's own `./data` import points at it.
        ...collectSharedDataFiles(codeSnippet, path.join(demoDir, folder))
          .filter(file => !localFiles.some(local => local.name === file.name)),
      ];
      codeByComponent[comp][id] = {
        code: codeSnippet,
        hash: codeHash,
        importPath: relImport,
        githubUrl: githubUrlFor(indexPath),
        ...(extraFiles.length ? { files: withEntryFiles(indexPath, codeSnippet, extraFiles) } : {}),
      };

      // Metadata precedence: metadata.ts -> frontmatter in description.md -> defaults
      let meta: any = {};
      const metadataTs = path.join(demoDir, folder, 'metadata.ts');
      if (fs.existsSync(metadataTs)) {
        // Naive parse: look for export const <folder> = { ... } capturing JSON-ish body
        const metaRaw = fs.readFileSync(metadataTs, 'utf8');
        const m = metaRaw.match(new RegExp(`export const ${folder}[^=]*=\\s*({[\\s\\S]*?});`));
        if (m) {
          try {
            // Transform to valid JSON: remove trailing commas and unquoted keys (simple heuristic)
            const jsonish = m[1]
              .replace(/:(\s*)(true|false)/g, ':$1$2')
              .replace(/:(\s*)([A-Za-z0-9_]+)([,\n])/g, ':$1"$2"$3');
            meta = {}; // fallback keep empty; proper evaluation intentionally avoided (no eval)
          } catch { }
        }
      }
      const descPath = path.join(demoDir, folder, 'description.md');
      let mdDesc = '';
      // Collect localized descriptions pattern: description.<locale>.md
      const localizedDescriptions: Record<string, string> = {};
      try {
        const localeFiles = fs.readdirSync(path.join(demoDir, folder)).filter(f => /^description\.[a-zA-Z-]+\.md$/.test(f));
        for (const lf of localeFiles) {
          const rawLocale = fs.readFileSync(path.join(demoDir, folder, lf), 'utf8');
          const { body } = parseFrontmatter(rawLocale);
          const locale = lf.split('.')[1];
          localizedDescriptions[locale] = body.trim();
        }
      } catch { }
      if (fs.existsSync(descPath)) {
        const mdRaw = fs.readFileSync(descPath, 'utf8');
        const { frontmatter, body } = parseFrontmatter(mdRaw);
        meta = { ...frontmatter, ...meta }; // frontmatter overrides parsed metadata
        mdDesc = body.trim();
      }
      const short = folder;
      const title = meta.title || short.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      demos.push({
        id,
        component: comp,
        demo: short,
        title,
        // The whole body, not just its first line: the docs page renders demo
        // descriptions through <Markdown>, so lists and paragraphs must survive.
        description: meta.description || mdDesc || '',
        localizedDescriptions: Object.keys(localizedDescriptions).length ? localizedDescriptions : undefined,
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        category: meta.category || 'general',
        order: typeof meta.order === 'number' ? meta.order : 100,
        status: meta.status,
        since: meta.since,
        hidden: meta.hidden === true,
        highlightLines: parseHighlight(meta.highlightLines),
        renderStyle: ['center', 'auto'].includes(meta.renderStyle) ? meta.renderStyle : undefined,
        codeCopy: meta.codeCopy === true || meta.codeCopy === false ? meta.codeCopy : undefined,
        codeLineNumbers: meta.codeLineNumbers === true || meta.codeLineNumbers === false ? meta.codeLineNumbers : undefined,
        codeSpoiler: meta.codeSpoiler === true,
        codeSpoilerMaxHeight: typeof meta.codeSpoilerMaxHeight === 'number' ? meta.codeSpoilerMaxHeight : undefined,
        previewCenter: meta.previewCenter === true ? true : undefined,
      });
    }

    // 2. Legacy flat .tsx files (kept for incremental migration)
    for (const file of tsxFiles) {
      if (file === 'index.ts' || file === 'index.tsx') continue; // ignore aggregator
      const baseName = file.replace(/\.tsx$/, '');
      const prefix = `${comp}.demo.`;
      let short = baseName.startsWith(prefix) ? baseName.slice(prefix.length) : baseName;
      short = short.replace(/\.+/g, '-');
      const id = `${comp}.${short}`;
      if (codeByComponent[comp][id]) continue; // skip if new structure already registered same id
      const tsxPath = path.join(demoDir, file);
      const raw = fs.readFileSync(tsxPath, 'utf8');
      const codeHash = sha256(raw);
      const relImport = `../../../../packages/ui/src/components/${comp}/demos/${baseName}`;
      codeByComponent[comp][id] = { code: raw, hash: codeHash, importPath: relImport, githubUrl: githubUrlFor(tsxPath) };
      const mdPath = path.join(demoDir, `${baseName}.md`);
      let meta: any = {};
      let mdBody = '';
      const localizedDescriptions2: Record<string, string> = {};
      try {
        const localeFiles = fs.readdirSync(demoDir).filter(f => f.startsWith(baseName + '.description.') && f.endsWith('.md'));
        for (const lf of localeFiles) {
          const rawLoc = fs.readFileSync(path.join(demoDir, lf), 'utf8');
          const { body } = parseFrontmatter(rawLoc);
          const parts = lf.split('.');
          const locale = parts[parts.length - 2];
          localizedDescriptions2[locale] = body.trim();
        }
      } catch { }
      if (fs.existsSync(mdPath)) {
        const mdRaw = fs.readFileSync(mdPath, 'utf8');
        const { frontmatter, body } = parseFrontmatter(mdRaw);
        meta = frontmatter;
        mdBody = body.trim();
      }
      const title = meta.title || short.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      demos.push({
        id,
        component: comp,
        demo: short,
        title,
        description: meta.description || mdBody || '',
        localizedDescriptions: Object.keys(localizedDescriptions2).length ? localizedDescriptions2 : undefined,
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        category: meta.category || 'general',
        order: typeof meta.order === 'number' ? meta.order : 100,
        status: meta.status,
        since: meta.since,
        hidden: meta.hidden === true,
        highlightLines: parseHighlight(meta.highlightLines),
        renderStyle: ['center', 'auto'].includes(meta.renderStyle) ? meta.renderStyle : undefined,
        codeCopy: meta.codeCopy === true || meta.codeCopy === false ? meta.codeCopy : undefined,
        codeLineNumbers: meta.codeLineNumbers === true || meta.codeLineNumbers === false ? meta.codeLineNumbers : undefined,
        codeSpoiler: meta.codeSpoiler === true,
        codeSpoilerMaxHeight: typeof meta.codeSpoilerMaxHeight === 'number' ? meta.codeSpoilerMaxHeight : undefined,
        previewCenter: meta.previewCenter === true ? true : undefined,
      });
    }
  }

  // Also collect from charts package if present
  if (fs.existsSync(CHARTS_COMPONENTS_DIR)) {
    const chartComponents = fs.readdirSync(CHARTS_COMPONENTS_DIR).filter(f => fs.statSync(path.join(CHARTS_COMPONENTS_DIR, f)).isDirectory());
    if (process.env.DEMOS_DEBUG) {
      console.log('[generate-demos][charts] Candidate component dirs:', chartComponents);
    }
    for (const comp of chartComponents) {
      componentSourceDir[comp] = path.join(CHARTS_COMPONENTS_DIR, comp);
      const demoDir = path.join(CHARTS_COMPONENTS_DIR, comp, 'demos');
      const metaDir = path.join(CHARTS_COMPONENTS_DIR, comp, 'meta');
      if (!fs.existsSync(demoDir)) continue; // skip if no demos

      const entries = fs.readdirSync(demoDir);
      const canonicalMetaMd = path.join(metaDir, 'component.md');
      if (fs.existsSync(canonicalMetaMd)) {
        try {
          const raw = fs.readFileSync(canonicalMetaMd, 'utf8');
          const { frontmatter, body } = parseFrontmatter(raw);
          const fm = { ...(frontmatter || {}) } as any;
          const { playground: playgroundRaw, ...restFm } = fm;
          const desc = (body || '').trim() || (typeof fm.description === 'string' ? fm.description : '');
          const name = typeof fm.name === 'string' && fm.name.trim() ? fm.name : comp;
          const title = typeof fm.title === 'string' && fm.title.trim() ? fm.title : comp;
          const category = fm.category || 'charts';
          const playgroundMeta = normalizePlaygroundMeta(playgroundRaw, comp);
          const metaEntry: Record<string, any> = { ...restFm, name, title, description: desc || `${comp} component`, category };
          if (playgroundMeta) metaEntry.playground = playgroundMeta;
          componentMeta[comp] = metaEntry;
        } catch {
          console.warn(`[generate-demos] Failed to parse metadata for chart ${comp}`);
        }
      } else {
        console.warn(`[generate-demos] Missing canonical meta/component.md for chart ${comp}`);
      }

      const tsxFiles = entries.filter(f => f.endsWith('.tsx'));
      const subfolders = entries.filter(f => fs.existsSync(path.join(demoDir, f)) && fs.statSync(path.join(demoDir, f)).isDirectory());
      codeByComponent[comp] = codeByComponent[comp] || {};

      // New structured demos
      for (const folder of subfolders) {
        const indexPath = path.join(demoDir, folder, 'index.tsx');
        if (!fs.existsSync(indexPath)) continue;
        const raw = fs.readFileSync(indexPath, 'utf8');
        if (process.env.DEMOS_DEBUG) {
          console.log(`[generate-demos][charts] Processing structured demo: ${comp}/${folder}`);
        }
        let codeSnippet = raw;
        const codeMatch = raw.match(/export const code\s*=\s*`([\s\S]*?)`;/);
        if (codeMatch) codeSnippet = codeMatch[1];
        const codeHash = sha256(codeSnippet);
        const id = `${comp}.${folder}`;
        const relImport = `../../../../packages/charts/src/components/${comp}/demos/${folder}`;
        const chartExtraFiles = collectDemoFiles(path.join(demoDir, folder));
        codeByComponent[comp][id] = {
          code: codeSnippet,
          hash: codeHash,
          importPath: relImport,
          githubUrl: githubUrlFor(indexPath),
          ...(chartExtraFiles.length ? { files: withEntryFiles(indexPath, codeSnippet, chartExtraFiles) } : {}),
        };
        let meta: any = {};
        const descPath = path.join(demoDir, folder, 'description.md');
        let mdDesc = '';
        if (fs.existsSync(descPath)) {
          const mdRaw = fs.readFileSync(descPath, 'utf8');
          const { frontmatter, body } = parseFrontmatter(mdRaw);
          meta = { ...frontmatter };
          mdDesc = body.trim();
        }
        const short = folder;
        const title = meta.title || short.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        demos.push({
          id,
          component: comp,
          demo: short,
          title,
          description: meta.description || mdDesc || '',
          localizedDescriptions: undefined,
          tags: Array.isArray(meta.tags) ? meta.tags : [],
          category: meta.category || 'charts',
          order: typeof meta.order === 'number' ? meta.order : 100,
          status: meta.status,
          since: meta.since,
          hidden: meta.hidden === true,
          highlightLines: parseHighlight(meta.highlightLines),
          renderStyle: ['center', 'auto'].includes(meta.renderStyle) ? meta.renderStyle : undefined,
          codeCopy: meta.codeCopy === true || meta.codeCopy === false ? meta.codeCopy : undefined,
          codeLineNumbers: meta.codeLineNumbers === true || meta.codeLineNumbers === false ? meta.codeLineNumbers : undefined,
          codeSpoiler: meta.codeSpoiler === true,
          codeSpoilerMaxHeight: typeof meta.codeSpoilerMaxHeight === 'number' ? meta.codeSpoilerMaxHeight : undefined,
          previewCenter: meta.previewCenter === true ? true : undefined,
        });
      }

      // Legacy flat .tsx demo files
      for (const file of tsxFiles) {
        if (file === 'index.ts' || file === 'index.tsx') continue;
        const baseName = file.replace(/\.tsx$/, '');
        const prefix = `${comp}.demo.`;
        let short = baseName.startsWith(prefix) ? baseName.slice(prefix.length) : baseName;
        short = short.replace(/\.+/g, '-');
        const id = `${comp}.${short}`;
        if (codeByComponent[comp][id]) continue;
        const tsxPath = path.join(demoDir, file);
        const raw = fs.readFileSync(tsxPath, 'utf8');
        if (process.env.DEMOS_DEBUG) {
          console.log(`[generate-demos][charts] Processing legacy demo file: ${comp}/${file}`);
        }
        const codeHash = sha256(raw);
        const relImport = `../../../../packages/charts/src/components/${comp}/demos/${baseName}`;
        codeByComponent[comp][id] = { code: raw, hash: codeHash, importPath: relImport, githubUrl: githubUrlFor(tsxPath) };
        const mdPath = path.join(demoDir, `${baseName}.md`);
        let meta: any = {};
        let mdBody = '';
        if (fs.existsSync(mdPath)) {
          const mdRaw = fs.readFileSync(mdPath, 'utf8');
          const { frontmatter, body } = parseFrontmatter(mdRaw);
          meta = frontmatter;
          mdBody = body.trim();
        }
        const title = meta.title || short.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        demos.push({
          id,
          component: comp,
          demo: short,
          title,
          description: meta.description || mdBody || '',
          localizedDescriptions: undefined,
          tags: Array.isArray(meta.tags) ? meta.tags : [],
          category: meta.category || 'charts',
          order: typeof meta.order === 'number' ? meta.order : 100,
          status: meta.status,
          since: meta.since,
          hidden: meta.hidden === true,
          highlightLines: parseHighlight(meta.highlightLines),
          renderStyle: ['center', 'auto'].includes(meta.renderStyle) ? meta.renderStyle : undefined,
          codeCopy: meta.codeCopy === true || meta.codeCopy === false ? meta.codeCopy : undefined,
          codeLineNumbers: meta.codeLineNumbers === true || meta.codeLineNumbers === false ? meta.codeLineNumbers : undefined,
          codeSpoiler: meta.codeSpoiler || true,
          codeSpoilerMaxHeight: typeof meta.codeSpoilerMaxHeight === 'number' ? meta.codeSpoilerMaxHeight : undefined,
          previewCenter: meta.previewCenter === true ? true : undefined,
        });
      }
    }
  }

  if (process.env.DEMOS_DEBUG) {
    const chartDemos = demos.filter(d => d.component === 'LineChart' || d.component === 'AreaChart').map(d => d.id);
    console.log('[generate-demos][charts] Final collected chart demo IDs:', chartDemos);
  }

  // Extract simple props metadata per component (heuristic)
  const propsMeta: Record<string, any[]> = {};
  const warningCounts: Record<string, number> = {};
  const componentWarnings: Record<string, Record<string, number>> = {};
  const addWarning = (type: string, comp?: string) => {
    warningCounts[type] = (warningCounts[type] || 0) + 1;
    if (comp) {
      componentWarnings[comp] = componentWarnings[comp] || {};
      componentWarnings[comp][type] = (componentWarnings[comp][type] || 0) + 1;
    }
  };

  // ---- Interface parsing + `extends` resolution -------------------------------
  // Locate an interface/type-alias `${name}Props` in a source string, returning
  // its body and the raw `extends` clause (empty for type aliases).
  const NESTED_GENERIC = '<(?:[^<>]|<[^<>]*>)*>';
  function extractPropsShape(name: string, source: string): { body: string | null; ext: string } {
    const iface = new RegExp(`(?:export\\s+)?interface\\s+${name}Props(?:\\s*${NESTED_GENERIC})?((?:\\s+extends[^{]+)?)\\s*{`, 'm');
    const typeAlias = new RegExp(`(?:export\\s+)?type\\s+${name}Props(?:\\s*${NESTED_GENERIC})?\\s*=\\s*{`, 'm');
    let ext = '';
    let m = iface.exec(source);
    if (m) ext = (m[1] || '').replace(/^\s*extends\s+/, '').replace(/\s+/g, ' ').trim();
    else m = typeAlias.exec(source);
    if (!m) return { body: null, ext: '' };
    const startIdx = source.indexOf('{', m.index);
    if (startIdx === -1) return { body: null, ext: '' };
    let depth = 0;
    for (let i = startIdx; i < source.length; i++) {
      const ch = source[i];
      if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) return { body: source.substring(startIdx + 1, i), ext }; }
    }
    addWarning('unbalanced-interface');
    return { body: null, ext: '' };
  }

  // Parse an interface body into prop records. Self-contained (own dedupe) so it
  // can be reused for both a component's own interface and any base it extends.
  function parseBody(body: string): any[] {
    const collected: any[] = [];
    const dedupe = new Set<string>();
    const lines = body.split(/\n/);
    let inJsDoc = false;
    let jsDocLines: string[] = [];
    let pendingLineComment: string | undefined;
    const flushJsDoc = () => {
      if (!jsDocLines.length) return { description: undefined as string | undefined, tags: '' };
      const content = jsDocLines.join('\n');
      // The description is everything before the first `@tag`. Filtering only
      // the lines that *start* with `@` leaks the continuation lines of a
      // wrapped tag (a multi-line `@deprecated` note) into the description.
      const stripped = jsDocLines.map(l => l.replace(/^\s*\* ?/, ''));
      const firstTag = stripped.findIndex(l => l.trim().startsWith('@'));
      const cleaned = (firstTag === -1 ? stripped : stripped.slice(0, firstTag))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      jsDocLines = [];
      return { description: cleaned || undefined, tags: content };
    };
    const bracketDepth = (s: string) => {
      let d = 0;
      for (const ch of s.replace(/=>/g, '')) {
        if (ch === '{' || ch === '<' || ch === '(' || ch === '[') d++;
        else if (ch === '}' || ch === '>' || ch === ')' || ch === ']') d--;
      }
      return d;
    };
    const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/, '').trim();
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) continue;
      if (line.startsWith('/**')) {
        inJsDoc = true;
        jsDocLines.push(line.replace('/**', ''));
        if (line.includes('*/')) { inJsDoc = false; jsDocLines[jsDocLines.length - 1] = jsDocLines[jsDocLines.length - 1].replace('*/', ''); }
        continue;
      }
      if (inJsDoc) {
        jsDocLines.push(line);
        if (line.includes('*/')) { inJsDoc = false; jsDocLines[jsDocLines.length - 1] = jsDocLines[jsDocLines.length - 1].replace('*/', ''); }
        continue;
      }
      if (line.startsWith('//')) { pendingLineComment = line.replace(/^\/\//, '').trim() || pendingLineComment; continue; }
      // The type may start on the next line — a wide union is usually written as
      // `type?:` followed by one `| 'value'` per line. Requiring a non-empty
      // remainder here dropped those props from the table entirely.
      const sigMatch = line.match(/^(readonly\s+)?([A-Za-z0-9_]+)\??:\s*(.*)$/);
      if (!sigMatch) continue;
      const name = sigMatch[2];
      if (dedupe.has(name)) { pendingLineComment = undefined; jsDocLines = []; continue; }
      let typePortion = sigMatch[3];
      // Consume continuation lines while inside unbalanced brackets so inline
      // object/generic types like `ChartTooltip<{ record: T }>` stay whole.
      while (i + 1 < lines.length && (bracketDepth(typePortion) > 0 || (!typePortion.includes(';') && !lines[i + 1].trim().match(/^(readonly\s+)?[A-Za-z0-9_]+\??:/)))) { i++; const seg = stripComments(lines[i]); if (seg) typePortion += ' ' + seg; }
      let trailingComment: string | undefined;
      const commentSplit = typePortion.split(/\/\/+/);
      if (commentSplit.length > 1) { trailingComment = commentSplit.slice(1).join('//').trim(); typePortion = commentSplit[0].trim(); }
      if (typePortion.endsWith(';')) typePortion = typePortion.slice(0, -1).trim();
      // A union whose members each sit on their own line arrives as `| 'a' | 'b'`.
      if (typePortion.startsWith('|')) typePortion = typePortion.slice(1).trim();
      let defaultValue: string | undefined;
      const eqIdx = typePortion.indexOf('=');
      if (eqIdx !== -1) { const two = typePortion.substring(eqIdx, eqIdx + 2); if (two !== '=>') { defaultValue = typePortion.slice(eqIdx + 1).trim(); typePortion = typePortion.slice(0, eqIdx).trim(); } }
      const optional = sigMatch[0].includes(name + '?:');
      const { description: jsDesc, tags } = flushJsDoc();
      const description = jsDesc || pendingLineComment || trailingComment;
      let deprecated: boolean | undefined; let internal: boolean | undefined; let jsDefault: string | undefined;
      if (tags) {
        const tagLines = tags.split(/@/).slice(1).map(s => s.trim());
        for (const t of tagLines) {
          if (t.startsWith('deprecated')) deprecated = true;
          if (t.startsWith('internal')) internal = true;
          const defMatch = t.match(/^default\s+([^\n]*)/); if (defMatch) jsDefault = defMatch[1].trim();
        }
      }
      pendingLineComment = undefined;
      if (name) { collected.push({ name, type: typePortion, required: !optional, defaultValue: jsDefault || defaultValue, description, deprecated, internal }); dedupe.add(name); }
    }
    return collected;
  }

  // Global index of every named interface (name -> { body, extends clause }),
  // built lazily from shared type files so base interfaces such as
  // `BaseChartProps`, `SpacingProps`, `LineChartProps` can be resolved.
  const ifaceIndex = new Map<string, { body: string; ext: string }>();
  const scannedFiles = new Set<string>();
  const scanForInterfaces = (file: string) => {
    if (scannedFiles.has(file)) return;
    scannedFiles.add(file);
    let src: string;
    try { if (!fs.existsSync(file)) return; src = fs.readFileSync(file, 'utf8'); } catch { return; }
    const re = new RegExp(`(?:export\\s+)?interface\\s+([A-Za-z0-9_]+)(?:\\s*${NESTED_GENERIC})?((?:\\s+extends[^{]+)?)\\s*{`, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      const name = m[1];
      const ext = (m[2] || '').replace(/^\s*extends\s+/, '').replace(/\s+/g, ' ').trim();
      const startIdx = src.indexOf('{', m.index);
      if (startIdx === -1) continue;
      let depth = 0, end = -1;
      for (let i = startIdx; i < src.length; i++) { const ch = src[i]; if (ch === '{') depth++; else if (ch === '}') { depth--; if (depth === 0) { end = i; break; } } }
      if (end === -1) continue;
      if (!ifaceIndex.has(name)) ifaceIndex.set(name, { body: src.substring(startIdx + 1, end), ext });
    }
  };
  // Pre-scan shared type files: everything under packages/charts/src plus each UI
  // component's `types.ts`. This covers cross-component bases (LineChartProps,
  // ComboChartProps) and shared bases (BaseChartProps, SpacingProps).
  const walkTs = (dir: string, pick: (f: string) => boolean, acc: string[] = []): string[] => {
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { if (e.name !== 'node_modules' && e.name !== 'lib' && e.name !== 'demos') walkTs(full, pick, acc); }
      else if (e.isFile() && pick(full)) acc.push(full);
    }
    return acc;
  };
  const chartsSrc = path.join(ROOT, 'packages', 'charts', 'src');
  for (const f of walkTs(chartsSrc, f => f.endsWith('.ts') && !f.endsWith('.d.ts'))) scanForInterfaces(f);
  for (const f of walkTs(UI_COMPONENTS_DIR, f => /(?:^|\/)types\.ts$|\.types\.ts$/.test(f.replace(/\\/g, '/')))) scanForInterfaces(f);
  // Shared prop bags live in core, not in any component's `types.ts` —
  // `BorderRadiusProps` (core/theme/radius) and `ShadowProps` (core/theme/shadow)
  // are extended by Card, Surface, Badge and others, and were silently dropped
  // from every prop table until this was scanned.
  const uiCore = path.join(ROOT, 'packages', 'ui', 'src', 'core');
  for (const f of walkTs(uiCore, f => f.endsWith('.ts') && !f.endsWith('.d.ts'))) scanForInterfaces(f);

  // Split an `extends` clause into base specs, honouring `Omit<Base, 'k' | 'j'>`.
  const splitExtends = (ext: string): Array<{ name: string; omit?: string[] }> => {
    if (!ext) return [];
    const parts: string[] = []; let d = 0, cur = '';
    for (const ch of ext) { if (ch === '<') d++; else if (ch === '>') d--; if (ch === ',' && d === 0) { parts.push(cur); cur = ''; } else cur += ch; }
    if (cur.trim()) parts.push(cur);
    const out: Array<{ name: string; omit?: string[] }> = [];
    for (const raw of parts.map(s => s.trim()).filter(Boolean)) {
      const omitM = raw.match(/^Omit\s*<\s*([A-Za-z0-9_]+)\s*,\s*([\s\S]+)>$/);
      if (omitM) { const keys = (omitM[2].match(/'([^']+)'|"([^"]+)"/g) || []).map(k => k.replace(/['"]/g, '')); out.push({ name: omitM[1], omit: keys }); continue; }
      const bare = raw.replace(/\s*<[\s\S]*>\s*$/, '').trim();
      if (/^[A-Za-z0-9_]+$/.test(bare)) out.push({ name: bare });
    }
    return out;
  };
  // Recursively resolve all props inherited through an interface's `extends`
  // chain. Own props win over inherited; earlier bases win over later ones.
  const resolveBaseProps = (name: string, seen: Set<string>): any[] => {
    if (seen.has(name)) return [];
    seen.add(name);
    const entry = ifaceIndex.get(name);
    if (!entry) return [];
    const own = parseBody(entry.body);
    const names = new Set(own.map(p => p.name));
    const result = [...own];
    for (const base of splitExtends(entry.ext)) {
      let baseProps = resolveBaseProps(base.name, seen);
      if (base.omit) baseProps = baseProps.filter(p => !base.omit!.includes(p.name));
      for (const p of baseProps) { if (!names.has(p.name)) { names.add(p.name); result.push(p); } }
    }
    return result;
  };

  for (const comp of Object.keys(componentMeta)) {
    const compDir = componentSourceDir[comp] || path.join(UI_COMPONENTS_DIR, comp);
    const candidateFiles = [
      path.join(compDir, `${comp}.tsx`),
      path.join(compDir, 'index.tsx'),
      path.join(compDir, `${comp}.ts`),
      path.join(compDir, 'index.ts'),
      path.join(compDir, 'types.ts'), // component-local types
      path.join(compDir, `${comp}.types.ts`),
      path.join(compDir, `${comp}.types.tsx`),
      // For charts, also fallback to shared root types file so interfaces like HeatmapChartProps are discovered.
      /charts\/src\//.test(compDir.replace(/\\/g, '/')) ? path.join(ROOT, 'packages', 'charts', 'src', 'types.ts') : ''
    ].filter(f => f && fs.existsSync(f));
    if (!candidateFiles.length) continue;
    for (const f of candidateFiles) scanForInterfaces(f);

    let collected: any[] = [];
    let ownExt = '';
    for (const file of candidateFiles) {
      const raw = fs.readFileSync(file, 'utf8');
      const extracted = extractPropsShape(comp, raw);
      if (extracted.body == null) continue;
      const parsed = parseBody(extracted.body);
      // Accept the interface if it has own props OR is a thin alias that only
      // re-exports a base via `extends` (e.g. `interface FooProps extends BarProps {}`).
      if (parsed.length || extracted.ext) { collected = parsed; ownExt = extracted.ext; break; }
    }
    // Merge in props inherited through the `extends` chain (own props win).
    if (ownExt) {
      const dedupe = new Set(collected.map(p => p.name));
      for (const base of splitExtends(ownExt)) {
        let baseProps = resolveBaseProps(base.name, new Set<string>());
        if (base.omit) baseProps = baseProps.filter(p => !base.omit!.includes(p.name));
        for (const p of baseProps) { if (!dedupe.has(p.name)) { dedupe.add(p.name); collected.push(p); } }
      }
    }
    if (collected.length) {
      // Attempt to augment with default values from implementation destructuring
      try {
        const implFile = path.join(compDir, `${comp}.tsx`);
        if (fs.existsSync(implFile)) {
          const implRaw = fs.readFileSync(implFile, 'utf8');
          const destructureMatch = implRaw.match(/const\s+\{([\s\S]*?)\}\s*=\s*props\s*;/);
          if (destructureMatch) {
            // Collapse newlines inside destructure for simpler splitting while preserving spaces
            const blockRaw = destructureMatch[1];
            const block = blockRaw.replace(/\n+/g, ' ').replace(/\s+/g, ' ');
            // Split only on top-level commas so array/object/call defaults such
            // as `range = [36, 576]` stay intact. Track `[] {} ()` depth only —
            // `<>` is skipped to avoid miscounting `=>` arrows.
            const parts: string[] = [];
            let depth = 0, cur = '';
            for (const ch of block) {
              if (ch === '[' || ch === '{' || ch === '(') depth++;
              else if (ch === ']' || ch === '}' || ch === ')') depth--;
              if (ch === ',' && depth <= 0) { parts.push(cur); cur = ''; }
              else cur += ch;
            }
            parts.push(cur);
            const trimmedParts = parts.map(p => p.trim()).filter(Boolean);
            const defaultsMap: Record<string, string> = {};
            for (let part of trimmedParts) {
              if (!part || part.startsWith('...')) continue;
              // Ignore rest or spread or direct renames with colon (alias)
              if (/^[A-Za-z0-9_]+\s*:/.test(part)) continue;
              const mDef = part.match(/^([A-Za-z0-9_]+)\s*=\s*(.+)$/);
              if (mDef) {
                const name = mDef[1];
                let defVal = mDef[2].trim();
                // Remove trailing comma if any (post split safety)
                defVal = defVal.replace(/,$/, '').trim();
                // Basic cleanup for objects/arrays/functions: keep concise preview
                if (defVal.length > 80) defVal = defVal.slice(0, 77) + '...';
                defaultsMap[name] = defVal;
              }
            }
            if (Object.keys(defaultsMap).length) {
              collected = collected.map(p => {
                if (p.defaultValue == null && defaultsMap[p.name] !== undefined) {
                  return { ...p, defaultValue: defaultsMap[p.name] };
                }
                return p;
              });
            }
          }
        }
      } catch {/* non-fatal */ }

      // Attempt defaults.ts object parse (preferred source) if exists
      try {
        const defaultsFile = path.join(compDir, 'defaults.ts');
        if (fs.existsSync(defaultsFile)) {
          const raw = fs.readFileSync(defaultsFile, 'utf8');
          // Look for export const SOMETHING_DEFAULTS = { ... } as const;
          const m = raw.match(/export const [A-Z0-9_]+DEFAULTS\s*=\s*({[\s\S]*?})\s*as const/);
          if (m) {
            const obj = m[1];
            const kvPairs = obj
              .replace(/\n/g, ' ')
              .replace(/\s+/g, ' ')
              .replace(/\/\/.*?$/gm, '')
              .match(/([A-Za-z0-9_]+)\s*:\s*([^,}]+)/g) || [];
            const map: Record<string, string> = {};
            for (const pair of kvPairs) {
              const pm = pair.match(/([A-Za-z0-9_]+)\s*:\s*([^,}]+)/);
              if (pm) map[pm[1]] = pm[2].trim();
            }
            if (Object.keys(map).length) {
              collected = collected.map(p => map[p.name] ? { ...p, defaultValue: map[p.name] } : p);
            }
          }
        }
      } catch { }

      if (collected.some(p => p.internal)) addWarning('internal-props', comp);
      // Post-process warnings: missing docs / ambiguous types
      for (const p of collected) {
        if (!p.description) addWarning('missing-doc', comp);
        if (!p.type || /\bany\b/.test(p.type)) addWarning('ambiguous-type', comp);
      }
      propsMeta[comp] = collected;
    }
  }

  return { demos, codeByComponent, componentMeta, propsMeta, componentSourceDir, warningCounts, componentWarnings };
}

function collectHooks() {
  const hooks: DemoMeta[] = [];
  const codeByHook: Record<string, Record<string, CodeEntry>> = {};
  const hookMeta: HookMetaRecord = {};

  if (!fs.existsSync(UI_HOOKS_DIR)) {
    return { hooks, codeByHook, hookMeta };
  }

  const hookDirs = fs.readdirSync(UI_HOOKS_DIR).filter(dir => {
    const full = path.join(UI_HOOKS_DIR, dir);
    return fs.statSync(full).isDirectory();
  });

  for (const hook of hookDirs) {
    const hookDir = path.join(UI_HOOKS_DIR, hook);
    const demosDir = path.join(hookDir, 'demos');
    const metaDir = path.join(hookDir, 'meta');

    if (!fs.existsSync(demosDir)) continue;

    const canonicalMetaMd = path.join(metaDir, 'hook.md');
    if (fs.existsSync(canonicalMetaMd)) {
      try {
        const raw = fs.readFileSync(canonicalMetaMd, 'utf8');
        const { frontmatter, body } = parseFrontmatter(raw);
        const fm = { ...(frontmatter || {}) } as any;
        const desc = (body || '').trim() || (typeof fm.description === 'string' ? fm.description : '');
        const name = typeof fm.name === 'string' && fm.name.trim() ? fm.name : hook;
        const title = typeof fm.title === 'string' && fm.title.trim() ? fm.title : hook;
        hookMeta[hook] = {
          ...fm,
          name,
          title,
          description: desc || `${hook} hook`
        };
      } catch {
        console.warn(`[generate-demos] Failed to parse hook metadata for ${hook}`);
      }
    } else {
      console.warn(`[generate-demos] Missing meta/hook.md for ${hook}`);
    }

    const entries = fs.readdirSync(demosDir);
    const subfolders = entries.filter(entry => {
      const full = path.join(demosDir, entry);
      return fs.existsSync(full) && fs.statSync(full).isDirectory();
    });

    codeByHook[hook] = codeByHook[hook] || {};

    for (const folder of subfolders) {
      const indexPath = path.join(demosDir, folder, 'index.tsx');
      if (!fs.existsSync(indexPath)) continue;

      const raw = fs.readFileSync(indexPath, 'utf8');
      let codeSnippet = raw;
      const codeMatch = raw.match(/export const code\s*=\s*`([\s\S]*?)`;/);
      if (codeMatch) codeSnippet = codeMatch[1];

      const codeHash = sha256(codeSnippet);
      const id = `${hook}.${folder}`;
      const relImport = `../../../../packages/ui/src/hooks/${hook}/demos/${folder}`;
      const hookExtraFiles = collectDemoFiles(path.join(demosDir, folder));
      codeByHook[hook][id] = {
        code: codeSnippet,
        hash: codeHash,
        importPath: relImport,
        githubUrl: githubUrlFor(indexPath),
        ...(hookExtraFiles.length ? { files: withEntryFiles(indexPath, codeSnippet, hookExtraFiles) } : {}),
      };

      let meta: any = {};
      const descPath = path.join(demosDir, folder, 'description.md');
      let mdDesc = '';
      const localizedDescriptions: Record<string, string> = {};

      try {
        const localeFiles = fs
          .readdirSync(path.join(demosDir, folder))
          .filter(f => /^description\.[a-zA-Z-]+\.md$/.test(f));
        for (const lf of localeFiles) {
          const rawLocale = fs.readFileSync(path.join(demosDir, folder, lf), 'utf8');
          const { body } = parseFrontmatter(rawLocale);
          const locale = lf.split('.')[1];
          localizedDescriptions[locale] = body.trim();
        }
      } catch {/* ignore */}

      if (fs.existsSync(descPath)) {
        const mdRaw = fs.readFileSync(descPath, 'utf8');
        const { frontmatter, body } = parseFrontmatter(mdRaw);
        meta = { ...meta, ...frontmatter };
        mdDesc = body.trim();
      }

      const short = folder;
      const title = meta.title || short.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      hooks.push({
        id,
        component: hook,
        demo: short,
        title,
        kind: 'hook',
        description: meta.description || mdDesc || '',
        localizedDescriptions: Object.keys(localizedDescriptions).length ? localizedDescriptions : undefined,
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        category: meta.category || 'general',
        order: typeof meta.order === 'number' ? meta.order : 100,
        status: meta.status,
        since: meta.since,
        hidden: meta.hidden === true,
        highlightLines: parseHighlight(meta.highlightLines),
        renderStyle: ['center', 'auto'].includes(meta.renderStyle) ? meta.renderStyle : undefined,
        codeCopy: meta.codeCopy === true || meta.codeCopy === false ? meta.codeCopy : undefined,
        codeLineNumbers: meta.codeLineNumbers === true || meta.codeLineNumbers === false ? meta.codeLineNumbers : undefined,
        codeSpoiler: meta.codeSpoiler === true,
        codeSpoilerMaxHeight: typeof meta.codeSpoilerMaxHeight === 'number' ? meta.codeSpoilerMaxHeight : undefined,
        previewCenter: meta.previewCenter === true ? true : undefined,
        code: codeSnippet,
        importPath: relImport,
        // Hook demos render straight from this index — they never go through
        // `attachDemoCode`, so the link has to ride along with the metadata.
        githubUrl: githubUrlFor(indexPath)
      });
    }
  }

  return { hooks, codeByHook, hookMeta };
}

function writeJsonPretty(file: string, data: any) {
  const content = JSON.stringify(data, null, 2) + '\n';
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === content) return; // skip unchanged
  fs.writeFileSync(file, content, 'utf8');
}

function writeTextFile(file: string, data: string) {
  const content = data.endsWith('\n') ? data : `${data}\n`;
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === content) return;
  fs.writeFileSync(file, content, 'utf8');
}

function withCodeBlock(code: string, language = 'tsx'): string {
  const cleaned = code.replace(/\r\n/g, '\n').trimEnd();
  return `
\`\`\`${language}
${cleaned}
\`\`\`
`.trim();
}

function sanitizeDemoCode(code: string): string {
  const normalized = code.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const filtered = lines.filter(line => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    if (trimmed.startsWith('import ')) return false;
    if (trimmed.startsWith('export ')) return false;
    return true;
  });
  return filtered.join('\n').trim();
}

function escapeTableCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  return str.replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').trim();
}

function compactParagraph(text?: string): string {
  if (!text) return '';
  return text
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Component descriptions are authored as Markdown, and a handful carry real
 * structure — their own headings and bullet lists. Flattening those to one line
 * (as compactParagraph does for the short one-liners) turned AppShell's page
 * into a single unreadable paragraph, so the body is kept verbatim; only the
 * leading noise is trimmed: a frontmatter rule left behind by the meta parser,
 * and a heading that just repeats the title the page already prints.
 */
function normalizeComponentDescription(text: string | undefined, title: string): string {
  if (!text) return '';
  const withoutRule = text.trim().replace(/^-{3,}\s*/, '');
  const withoutTitle = withoutRule.replace(
    new RegExp(`^#{1,6}\\s+${title.replace(/[.*+?^$()|[\]\\]/g, '\\$&')}\\s*\n+`),
    '',
  );
  return withoutTitle.replace(/\n{3,}/g, '\n\n').trim();
}

function formatTagList(tags: unknown): string | null {
  if (!tags) return null;
  if (Array.isArray(tags)) {
    const normalized = tags
      .map(tag => (typeof tag === 'string' ? tag : String(tag ?? '')))
      .map(tag => tag.trim())
      .filter(Boolean);
    if (!normalized.length) return null;
    return normalized.join(', ');
  }
  if (tags instanceof Set) {
    return formatTagList(Array.from(tags));
  }
  if (typeof tags === 'string') {
    const trimmed = tags.trim();
    return trimmed || null;
  }
  return null;
}

function buildPropsTable(props: Array<Record<string, any>>): string {
  if (!props || props.length === 0) {
    return '_No documented props yet._';
  }
  const header = ['| Name | Type | Required | Default | Description |', '| --- | --- | --- | --- | --- |'];
  const rows = props.map(prop => {
    const name = `\`${prop.name}\``;
    const type = escapeTableCell(prop.type);
    const required = prop.required ? 'Yes' : 'No';
    const defaultValue = escapeTableCell(prop.defaultValue);
    const description = escapeTableCell(prop.description);
    return `| ${name} | ${type} | ${required} | ${defaultValue} | ${description} |`;
  });
  return [...header, ...rows].join('\n');
}

function formatDemoMarkdown(
  demo: DemoMeta,
  codeEntry: CodeEntry | undefined,
): string {
  const lines: string[] = [];
  lines.push(`### ${demo.title || demo.demo}`);
  const metaBits: string[] = [];
  metaBits.push(`ID: \`${demo.id}\``);
  const demoTags = formatTagList(demo.tags);
  if (demoTags) metaBits.push(`Tags: ${demoTags}`);
  if (demo.category) metaBits.push(`Category: ${demo.category}`);
  if (demo.status) metaBits.push(`Status: ${demo.status}`);
  if (demo.since) metaBits.push(`Since: ${demo.since}`);
  lines.push(metaBits.join(' • '));
  if (demo.description) {
    lines.push('');
    lines.push(compactParagraph(demo.description));
  }
  if (codeEntry?.code) {
    const sanitized = sanitizeDemoCode(codeEntry.code);
    if (sanitized) {
      lines.push('');
      lines.push(withCodeBlock(sanitized));
    }
  }
  return lines.join('\n');
}

function buildComponentMarkdown(
  name: string,
  meta: ComponentMetaRecord,
  propsMap: Record<string, any[]>,
  demosMap: Map<string, DemoMeta[]>,
  codeMap: Record<string, Record<string, CodeEntry>>,
): string {
  const componentMeta = meta[name] || {};
  const lines: string[] = [];
  const title = componentMeta.title || name;
  lines.push(`# ${title}`);
  if (componentMeta.description) {
    lines.push('');
    lines.push(normalizeComponentDescription(componentMeta.description, title));
  }

  const packageName = componentMeta.packageName
    || (componentMeta.category === 'charts' ? '@platform-blocks/charts' : '@platform-blocks/react-ui-library');
  const metaList: string[] = [];
  metaList.push(`- Canonical name: \`${name}\``);
  metaList.push(`- Package: \`${packageName}\``);
  metaList.push(`- Import: \`import { ${name} } from '${packageName}';\``);
  if (componentMeta.status) metaList.push(`- Status: ${componentMeta.status}`);
  if (componentMeta.since) metaList.push(`- Since: ${componentMeta.since}`);
  if (componentMeta.category) metaList.push(`- Category: ${componentMeta.category}`);
  const componentTags = formatTagList(componentMeta.tags);
  if (componentTags) metaList.push(`- Tags: ${componentTags}`);
  metaList.push(`- Docs: ${SITE_URL}/components/${name}`);
  if (componentMeta.sourcePath) {
    metaList.push(`- Source: ${GITHUB_REPO}/tree/${GITHUB_BRANCH}/${componentMeta.sourcePath}`);
  }
  if (metaList.length) {
    lines.push('');
    lines.push('## Metadata');
    lines.push('');
    lines.push(...metaList);
  }

  lines.push('');
  lines.push('## Props');
  lines.push('');
  lines.push(buildPropsTable(propsMap[name] || []));

  const demos = (demosMap.get(name) || []).filter(d => !d.hidden);
  if (demos.length) {
    lines.push('');
    lines.push('## Examples');
    lines.push('');
    demos.forEach((demo, index) => {
      if (index > 0) lines.push('');
      const codeEntry = codeMap[name]?.[demo.id] || codeMap[name]?.[`${name}.${demo.demo}`] || codeMap[name]?.[`${demo.component}.${demo.demo}`];
      lines.push(formatDemoMarkdown(demo, codeEntry));
    });
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function generate() {
  ensureDir(OUTPUT_DIR);
  ensureDir(COMPONENT_MARKDOWN_DIR);
  const { demos, codeByComponent, componentMeta, propsMeta, componentSourceDir, warningCounts, componentWarnings } = collectDemos();
  const { hooks, codeByHook, hookMeta } = collectHooks();

  // Attach source provenance so docs pages can link to GitHub / npm without
  // duplicating the package layout on the client.
  for (const [comp, sourceDir] of Object.entries(componentSourceDir)) {
    const meta = componentMeta[comp];
    if (!meta) continue;
    const relative = path.relative(ROOT, sourceDir).split(path.sep).join('/');
    meta.sourcePath = relative;
    meta.packageName = relative.startsWith('packages/charts/')
      ? '@platform-blocks/charts'
      : '@platform-blocks/react-ui-library';
    if (fs.existsSync(path.join(sourceDir, 'meta', 'component.md'))) {
      meta.docsPath = `${relative}/meta/component.md`;
    }
  }

  // Sort metadata
  demos.sort((a, b) => a.component.localeCompare(b.component) || a.order - b.order || a.title.localeCompare(b.title));
  hooks.sort((a, b) => a.component.localeCompare(b.component) || a.order - b.order || a.title.localeCompare(b.title));

  // Filter out hidden entities from metadata shards
  const visibleComponentMeta = Object.fromEntries(
    Object.entries(componentMeta).filter(([comp, meta]) => meta.hidden !== true)
  );
  const visibleHookMeta = Object.fromEntries(
    Object.entries(hookMeta).filter(([hook, meta]) => meta?.hidden !== true)
  );

  const demosByComponent = new Map<string, DemoMeta[]>();
  for (const demo of demos) {
    if (!demosByComponent.has(demo.component)) {
      demosByComponent.set(demo.component, []);
    }
    demosByComponent.get(demo.component)!.push(demo);
  }

  writeJsonPretty(path.join(OUTPUT_DIR, 'demos.json'), { demos, components: visibleComponentMeta });
  // Standalone component meta shard for global navigation/search facets
  writeJsonPretty(path.join(OUTPUT_DIR, 'components-meta.json'), visibleComponentMeta);
  // Regression safeguard: ensure no component lost >70% of props vs existing artifact
  const existingPropsPath = path.join(OUTPUT_DIR, 'components-props.json');
  if (fs.existsSync(existingPropsPath)) {
    try {
      const previous = JSON.parse(fs.readFileSync(existingPropsPath, 'utf8'));
      for (const comp of Object.keys(propsMeta)) {
        const prev = previous[comp];
        const curr = propsMeta[comp];
        if (Array.isArray(prev) && prev.length > 0 && curr && curr.length / prev.length < 0.3) {
          console.warn(`[generate-demos] WARNING: Prop extraction regression for ${comp} (prev ${prev.length} -> now ${curr.length}). Retaining previous set.`);
          propsMeta[comp] = prev; // retain previous to avoid data wipe
        }
      }
    } catch { }
  }
  writeJsonPretty(existingPropsPath, propsMeta);

  // Hooks metadata shards
  writeJsonPretty(path.join(OUTPUT_DIR, 'hooks.json'), { hooks });
  writeJsonPretty(path.join(OUTPUT_DIR, 'hooks-meta.json'), visibleHookMeta);

  // Write per-component code shards
  for (const comp of Object.keys(codeByComponent)) {
    const shardPath = path.join(OUTPUT_DIR, `demo-code-${comp}.json`);
    writeJsonPretty(shardPath, codeByComponent[comp]);
  }

  const componentNames = new Set<string>([
    ...Object.keys(componentMeta),
    ...Object.keys(propsMeta),
    ...Object.keys(codeByComponent),
    ...demos.map(d => d.component),
  ]);
  const sortedComponentNames = Array.from(componentNames).sort((a, b) => a.localeCompare(b));

  const markdownIndex: Record<string, string> = {};
  for (const name of sortedComponentNames) {
    if (visibleComponentMeta[name]?.hidden === true) continue;
    const markdown = buildComponentMarkdown(name, componentMeta, propsMeta, demosByComponent, codeByComponent);
    markdownIndex[name] = markdown;
    const filePath = path.join(COMPONENT_MARKDOWN_DIR, `${name}.md`);
    writeTextFile(filePath, markdown);
  }
  writeJsonPretty(path.join(OUTPUT_DIR, 'component-markdown.json'), markdownIndex);

  // Write per-hook code shards
  for (const hook of Object.keys(codeByHook)) {
    const shardPath = path.join(OUTPUT_DIR, `hook-code-${hook}.json`);
    writeJsonPretty(shardPath, codeByHook[hook]);
  }

  // Simple search index combining component and hook names, titles, and demo titles
  const searchEntries: any[] = [];
  for (const comp of Object.keys(componentMeta)) {
    const meta = componentMeta[comp] || {};
    if (meta.hidden === true) continue;

    searchEntries.push({
      id: `component:${comp}`,
      type: 'component',
      title: meta.title || comp,
      description: meta.description?.slice(0, 140) || '',
      category: meta.category || 'component',
      keywords: [comp, ...(meta.tags || [])]
    });
  }

  for (const hookName of Object.keys(hookMeta)) {
    const meta = hookMeta[hookName] || {};
    if (meta.hidden === true) continue;

    searchEntries.push({
      id: `hook:${hookName}`,
      type: 'hook',
      title: meta.title || hookName,
      description: meta.description?.slice(0, 140) || '',
      category: meta.category || 'hook',
      keywords: [hookName, ...(meta.tags || [])]
    });
  }

  for (const demo of demos) {
    searchEntries.push({
      id: `demo:${demo.id}`,
      type: 'demo',
      title: demo.title,
      description: (demo.description || '').slice(0, 140),
      category: demo.category || 'demo',
      keywords: [demo.component, ...(demo.tags || [])]
    });
  }

  for (const demo of hooks) {
    searchEntries.push({
      id: `hook-demo:${demo.id}`,
      type: 'hook-demo',
      title: demo.title,
      description: (demo.description || '').slice(0, 140),
      category: demo.category || 'hook-demo',
      keywords: [demo.component, ...(demo.tags || [])]
    });
  }
  writeJsonPretty(path.join(OUTPUT_DIR, 'search-new.json'), { entries: searchEntries });

  // Manifest placeholder (Phase 1 may replace path strategy)
  const isProd = process.env.NODE_ENV === 'production' || process.argv.includes('--prod');
  const manifestLines: string[] = [];
  manifestLines.push('/* AUTO-GENERATED: demo-manifest */');
  manifestLines.push('// NOTE: This file is regenerated by scripts/generate-demos.ts – do not edit manually.');
  manifestLines.push('// Exports:');
  manifestLines.push('//   DEMO_MODULES: always present, async dynamic imports (code-split)');
  manifestLines.push('//   DEMO_STATIC: dev-only synchronous require map for instant demo rendering');
  manifestLines.push('');
  manifestLines.push('export const DEMO_MODULES = {');
  for (const comp of Object.keys(codeByComponent)) {
    for (const [id, entry] of Object.entries(codeByComponent[comp])) {
      manifestLines.push(`  '${id}': () => import('${entry.importPath}'),`);
    }
  }
  manifestLines.push('};');
  if (!isProd) {
    manifestLines.push('');
    manifestLines.push('// Dev eager map (omitted in production builds to keep bundle lean)');
    manifestLines.push('export const DEMO_STATIC = {');
    for (const comp of Object.keys(codeByComponent)) {
      for (const [id, entry] of Object.entries(codeByComponent[comp])) {
        manifestLines.push(`  '${id}': () => require('${entry.importPath}'),`);
      }
    }
    manifestLines.push('};');
  }
  const manifestPath = path.join(OUTPUT_DIR, 'demo-manifest.ts');
  const manifestContent = manifestLines.join('\n') + '\n';
  if (!fs.existsSync(manifestPath) || fs.readFileSync(manifestPath, 'utf8') !== manifestContent) {
    fs.writeFileSync(manifestPath, manifestContent, 'utf8');
  }

  // Hook manifest for demo components
  const hookManifestLines: string[] = [];
  hookManifestLines.push('/* AUTO-GENERATED: hook demo manifest */');
  hookManifestLines.push('// NOTE: This file is regenerated by scripts/generate-demos.ts – do not edit manually.');
  hookManifestLines.push('// Exports:');
  hookManifestLines.push('//   HOOK_DEMO_MODULES: async dynamic imports for hook demos');
  hookManifestLines.push('//   HOOK_DEMO_STATIC: dev-only synchronous require map');
  hookManifestLines.push('');
  hookManifestLines.push('export const HOOK_DEMO_MODULES = {');
  for (const hook of Object.keys(codeByHook)) {
    for (const [id, entry] of Object.entries(codeByHook[hook])) {
      hookManifestLines.push(`  '${id}': () => import('${entry.importPath}'),`);
    }
  }
  hookManifestLines.push('};');
  if (!isProd) {
    hookManifestLines.push('');
    hookManifestLines.push('// Dev eager map for hook demos (omitted in production)');
    hookManifestLines.push('export const HOOK_DEMO_STATIC = {');
    for (const hook of Object.keys(codeByHook)) {
      for (const [id, entry] of Object.entries(codeByHook[hook])) {
        hookManifestLines.push(`  '${id}': () => require('${entry.importPath}'),`);
      }
    }
    hookManifestLines.push('};');
  }
  const hookManifestPath = path.join(OUTPUT_DIR, 'hook-manifest.ts');
  const hookManifestContent = hookManifestLines.join('\n') + '\n';
  if (!fs.existsSync(hookManifestPath) || fs.readFileSync(hookManifestPath, 'utf8') !== hookManifestContent) {
    fs.writeFileSync(hookManifestPath, hookManifestContent, 'utf8');
  }

  // Generate code loader map for web bundling compatibility
  const codeLoaderLines: string[] = [];
  codeLoaderLines.push('/* AUTO-GENERATED: demo code loaders */');
  codeLoaderLines.push('// NOTE: This file is regenerated by scripts/generate-demos.ts – do not edit manually.');
  codeLoaderLines.push('// Static imports for demo code JSON files to avoid web bundling issues');
  codeLoaderLines.push('');
  codeLoaderLines.push('const DEMO_CODE_MAPS: Record<string, any> = {};');
  codeLoaderLines.push('');

  for (const comp of Object.keys(codeByComponent).sort()) {
    // Shards are written to OUTPUT_DIR alongside this loader, so the specifier
    // must be './' — '../' resolves outside data/generated and the require
    // silently falls into the catch, leaving every demo without code.
    codeLoaderLines.push(`try { DEMO_CODE_MAPS.${comp} = require('./demo-code-${comp}.json'); } catch { /* ignore */ }`);
  }

  codeLoaderLines.push('');
  codeLoaderLines.push('export function loadCodeMap(component: string): Record<string, any> | null {');
  codeLoaderLines.push('  return DEMO_CODE_MAPS[component] || null;');
  codeLoaderLines.push('}');

  const codeLoaderPath = path.join(OUTPUT_DIR, 'demoCodeLoader.ts');
  const codeLoaderContent = codeLoaderLines.join('\n') + '\n';
  if (!fs.existsSync(codeLoaderPath) || fs.readFileSync(codeLoaderPath, 'utf8') !== codeLoaderContent) {
    fs.writeFileSync(codeLoaderPath, codeLoaderContent, 'utf8');
  }

  // Hook code loader map
  const hookCodeLoaderLines: string[] = [];
  hookCodeLoaderLines.push('/* AUTO-GENERATED: hook demo code loaders */');
  hookCodeLoaderLines.push('// NOTE: This file is regenerated by scripts/generate-demos.ts – do not edit manually.');
  hookCodeLoaderLines.push('// Static imports for hook demo code JSON files to avoid web bundling issues');
  hookCodeLoaderLines.push('');
  hookCodeLoaderLines.push('const HOOK_CODE_MAPS: Record<string, any> = {};');
  hookCodeLoaderLines.push('');

  for (const hook of Object.keys(codeByHook).sort()) {
    hookCodeLoaderLines.push(`try { HOOK_CODE_MAPS.${hook} = require('./hook-code-${hook}.json'); } catch { /* ignore */ }`);
  }

  hookCodeLoaderLines.push('');
  hookCodeLoaderLines.push('export function loadHookCodeMap(hook: string): Record<string, any> | null {');
  hookCodeLoaderLines.push('  return HOOK_CODE_MAPS[hook] || null;');
  hookCodeLoaderLines.push('}');

  const hookCodeLoaderPath = path.join(OUTPUT_DIR, 'hookCodeLoader.ts');
  const hookCodeLoaderContent = hookCodeLoaderLines.join('\n') + '\n';
  if (!fs.existsSync(hookCodeLoaderPath) || fs.readFileSync(hookCodeLoaderPath, 'utf8') !== hookCodeLoaderContent) {
    fs.writeFileSync(hookCodeLoaderPath, hookCodeLoaderContent, 'utf8');
  }

  const componentCount = Object.keys(codeByComponent).length;
  const hookCount = Object.keys(codeByHook).length;
  console.log(`[generate-demos] Indexed ${demos.length} component demos across ${componentCount} components and ${hooks.length} hook demos across ${hookCount} hooks.`);
  if (Object.keys(warningCounts).length) {
    console.log('[generate-demos] Warning summary:');
    for (const k of Object.keys(warningCounts)) console.log(`  - ${k}: ${warningCounts[k]}`);
  }
  // Persist warnings shard
  writeJsonPretty(path.join(OUTPUT_DIR, 'warnings.json'), { total: warningCounts, byComponent: componentWarnings });

  // Validation mode (fail build on certain warning types or regression)
  if (process.argv.includes('--validate')) {
    const failTypes = ['unbalanced-interface', 'ambiguous-type'];
    const fatal = failTypes.some(t => warningCounts[t] > 0);
    if (fatal) {
      console.error('[generate-demos] Validation failed due to fatal warnings.');
      process.exit(1);
    } else {
      console.log('[generate-demos] Validation passed.');
    }
  }
}

generate();
