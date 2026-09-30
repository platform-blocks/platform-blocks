#!/usr/bin/env ts-node
/**
 * Basic validation for generated demo metadata.
 * Ensures uniqueness, required fields, and simple ordering constraints.
 */
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

import { CHART_DOCS } from '../apps/docs/config/charts';
import { CORE_COMPONENTS } from '../apps/docs/config/coreComponents';
import { UI_PACKAGE, listWorkspacePackages, packageContaining } from './lib/packages';

// Optional zod import for component meta validation
let z: any; try { z = require('zod'); } catch { z = null; }

const ComponentMetaSchema = z?.object?.({
  name: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.string().optional(),
  category: z.string().optional(),
}) || { safeParse: () => ({ success: true }) };

interface DemoMeta { id: string; component: string; demo: string; title: string; order: number; hidden?: boolean; }

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'apps', 'docs', 'data', 'generated');
const FILE = path.join(OUTPUT_DIR, 'demos.json');
const WORKSPACE_PACKAGES = listWorkspacePackages(ROOT);
/** Where generate-demos looks for `<Owner>/demos` folders. */
const DEMO_ROOTS = [
  ...WORKSPACE_PACKAGES.map(pkg => pkg.components),
  path.join(ROOT, 'packages', 'ui', 'src', 'hooks'),
];

function fail(msg: string): never { console.error(`✖ ${msg}`); process.exit(1); }

function main() {
  if (!fs.existsSync(FILE)) fail('demos.json not found. Run generate-demos first.');
  const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const demos: DemoMeta[] = Array.isArray(raw) ? raw : raw.demos || [];
  const componentsMeta = raw.components || {};
  const seen = new Set<string>();
  for (const d of demos) {
    if (!d.id || !d.component || !d.demo || !d.title) fail(`Missing required fields on ${d.id || JSON.stringify(d)}`);
    if (seen.has(d.id)) fail(`Duplicate id detected: ${d.id}`);
    seen.add(d.id);
    if (!/^([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/.test(d.id)) fail(`Invalid id format: ${d.id}`);
    if (typeof d.order !== 'number') fail(`Order must be number: ${d.id}`);
  }
  // Validate component meta if zod available
  if (z) {
    for (const [comp, meta] of Object.entries(componentsMeta)) {
      const r = ComponentMetaSchema.safeParse(meta);
      if (!r.success) fail(`Component meta invalid for ${comp}`);
    }
  }
  validateCategories(componentsMeta);
  validatePackageImports(componentsMeta, demos);
  validateDemoSources();
  console.log(`✔ validate-demos: ${demos.length} demos OK (${Object.keys(componentsMeta).length} components meta)`);
}

/** Keep the package shown in docs aligned with the source folder and demos. */
function validatePackageImports(componentsMeta: Record<string, any>, demos: DemoMeta[]): void {
  const problems: string[] = [];
  const knownPackages = new Set(WORKSPACE_PACKAGES.map(pkg => pkg.name));
  const runtimeMetaFile = path.join(OUTPUT_DIR, 'components-meta.json');
  if (!fs.existsSync(runtimeMetaFile)) fail('components-meta.json not found. Run generate-demos first.');
  const runtimeMeta = JSON.parse(fs.readFileSync(runtimeMetaFile, 'utf8')) as Record<string, any>;

  for (const [component, meta] of Object.entries(componentsMeta)) {
    const packageName = meta?.packageName;
    const sourcePath = meta?.sourcePath;
    if (!packageName || !knownPackages.has(packageName)) {
      problems.push(`${component}: unknown or missing packageName "${packageName ?? '(none)'}"`);
    }
    if (!sourcePath || !fs.existsSync(path.resolve(ROOT, sourcePath))) {
      problems.push(`${component}: missing source directory "${sourcePath ?? '(none)'}"`);
    } else {
      const sourcePackage = packageContaining(WORKSPACE_PACKAGES, path.resolve(ROOT, sourcePath));
      if (sourcePackage?.name !== packageName) {
        problems.push(`${component}: packageName "${packageName}" disagrees with sourcePath "${sourcePath}"`);
      }
    }
    if (runtimeMeta[component]?.packageName !== packageName) {
      problems.push(`${component}: demos.json and components-meta.json disagree on packageName`);
    }
  }
  for (const chart of CHART_DOCS) {
    if (componentsMeta[chart.slug]?.packageName !== chart.packageName) {
      problems.push(`${chart.slug}: chart docs packageName "${chart.packageName}" disagrees with generated component metadata`);
    }
  }

  const codeByComponent = new Map<string, Record<string, { code?: string; files?: { name: string; code: string }[] }>>();
  for (const demo of demos) {
    const packageName = componentsMeta[demo.component]?.packageName;
    if (!packageName) {
      problems.push(`${demo.id}: no documented package for ${demo.component}`);
      continue;
    }
    let codeMap = codeByComponent.get(demo.component);
    if (!codeMap) {
      const file = path.join(OUTPUT_DIR, `demo-code-${demo.component}.json`);
      if (!fs.existsSync(file)) {
        problems.push(`${demo.component}: missing demo code shard`);
        continue;
      }
      codeMap = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, { code?: string; files?: { name: string; code: string }[] }>;
      codeByComponent.set(demo.component, codeMap);
    }
    const entry = codeMap?.[demo.id];
    if (!entry) {
      problems.push(`${demo.id}: missing generated demo code`);
      continue;
    }
    const sources = entry.files?.length ? entry.files : [{ name: 'index.tsx', code: entry.code ?? '' }];
    const ownerImports: string[] = [];
    for (const source of sources) {
      const parsed = ts.createSourceFile(source.name, source.code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      for (const statement of parsed.statements) {
        if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
        const importedPackage = statement.moduleSpecifier.text;
        const workspaceImport = [...knownPackages].find(name =>
          importedPackage === name || importedPackage.startsWith(`${name}/`)
        );
        if (importedPackage.startsWith('@plocks/') && !workspaceImport) {
          problems.push(`${demo.id}: imports unknown package "${importedPackage}"`);
        }
        const bindings = statement.importClause?.namedBindings;
        if (bindings && ts.isNamedImports(bindings) && bindings.elements.some(element =>
          (element.propertyName ?? element.name).text === demo.component
        )) {
          ownerImports.push(workspaceImport ?? importedPackage);
        }
      }
    }
    if (ownerImports.some(importedPackage => importedPackage !== packageName)) {
      problems.push(`${demo.id}: imports ${demo.component} from ${ownerImports.join(', ')}; expected ${packageName}`);
    }
    if (packageName !== UI_PACKAGE && ownerImports.length === 0) {
      problems.push(`${demo.id}: does not import ${demo.component} from ${packageName}`);
    }
  }

  if (problems.length) fail(`Component package mismatches (${problems.length}):\n  - ${problems.join('\n  - ')}`);
}

/**
 * CORE_COMPONENTS is the single source of truth for a component's category — it
 * drives the /components filter chips, the sidebar, and the llms.txt grouping.
 * Each component's `meta/component.md` repeats the value so the generated
 * Markdown page can print it, and the two drifted badly once already (six
 * spellings of "input", components with docs pages missing from the list). This
 * keeps them locked together.
 */
function validateCategories(componentsMeta: Record<string, any>): void {
  const core = new Map(CORE_COMPONENTS.map(c => [c.name, c.category as string]));
  const documented = Object.keys(componentsMeta);
  const problems: string[] = [];

  const duplicates = CORE_COMPONENTS
    .map(c => c.name)
    .filter((name, index, all) => all.indexOf(name) !== index);
  for (const name of new Set(duplicates)) {
    problems.push(`${name}: listed more than once in CORE_COMPONENTS`);
  }

  for (const name of documented) {
    const expected = core.get(name);
    if (!expected) {
      problems.push(`${name}: has a docs page but is missing from CORE_COMPONENTS`);
      continue;
    }
    const actual = componentsMeta[name]?.category;
    if (actual !== expected) {
      problems.push(`${name}: meta/component.md says category "${actual ?? '(none)'}", CORE_COMPONENTS says "${expected}"`);
    }
  }

  for (const name of core.keys()) {
    if (!documented.includes(name)) {
      problems.push(`${name}: listed in CORE_COMPONENTS but has no docs page`);
    }
  }

  if (problems.length) {
    fail(`Component category mismatches (${problems.length}):\n  - ${problems.join('\n  - ')}`);
  }
}

/** A frontmatter-shaped block (`---`, `key: value` lines, `---`) anywhere in the file. */
const FRONTMATTER_BLOCK = /^---\r?\n(?:[A-Za-z][\w-]*:.*\r?\n)+---\s*$/m;
/** The element a Demo returns, and that element's first child. */
const DEMO_ROOT = /export (?:default )?function Demo\b[\s\S]*?return \(\s*<(\w+)\b[^>]*>\s*(?:<(\w+)\b([^>]*)>)?/;
const MUTED_TEXT = /<Text\b[^>]*\b(?:color|c)="(?:secondary|muted|dimmed)"[^>]*>([^<{}]*)<\/Text>/g;
const INSTRUCTION = /^(?:Use|Pass|Set|Provide|Wrap|Control|Switch|Apply|Adjust|Add|Keep|Limit|Gate|Tap|Try|Hover|Click|Drag|Press|Toggle|Combine|Enable|Disable|Choose|Pick|Render|Show|Hide|Customize|Configure|Override|Supply|Swap|Replace|Compare|Resize|Type|Select|Open|Close|Focus)\b/;

/**
 * Checks the demo sources, which demos.json can't show.
 *
 * Errors:
 * - A `.md` whose frontmatter isn't at the very top. generate-demos only parses it
 *   at byte 0, so the page prints the YAML as the blurb and drops the title, category and order.
 * - A loose `demos/<id>.tsx` beside a `demos/<id>/` folder. The manifest imports
 *   `demos/<id>` without an extension and Metro resolves the file first, so the
 *   preview renders the stale file while the code panel shows the folder.
 *
 * Warnings: the docs frame already shows each demo's title and blurb, so a demo
 * wrapped in a padded Card or carrying an explanation sentence repeats it.
 */
function validateDemoSources(): void {
  const problems: string[] = [];
  const warnings: string[] = [];
  const rel = (p: string) => path.relative(ROOT, p);

  for (const root of DEMO_ROOTS) {
    if (!fs.existsSync(root)) continue;
    for (const owner of fs.readdirSync(root)) {
      const demosDir = path.join(root, owner, 'demos');
      if (!fs.existsSync(demosDir) || !fs.statSync(demosDir).isDirectory()) continue;
      const entries = fs.readdirSync(demosDir, { withFileTypes: true });
      const folders = new Set(entries.filter(e => e.isDirectory()).map(e => e.name));
      const flatDemos = entries.filter(e => e.isFile() && /\.(tsx|jsx)$/.test(e.name)).map(e => e.name.replace(/\.\w+$/, ''));

      const markdown: string[] = [];
      for (const e of entries) {
        if (e.isFile() && /\.(tsx?|jsx?)$/.test(e.name) && folders.has(e.name.replace(/\.\w+$/, ''))) {
          problems.push(`${rel(path.join(demosDir, e.name))}: shadows the ${e.name.replace(/\.\w+$/, '')}/ demo folder`);
        }
        // Flat demos pair with `<base>.md` and `<base>.description.<locale>.md`.
        if (e.isFile() && e.name.endsWith('.md') && flatDemos.some(base => e.name.startsWith(`${base}.`))) {
          markdown.push(path.join(demosDir, e.name));
        }
      }

      for (const folder of folders) {
        const folderPath = path.join(demosDir, folder);
        for (const file of fs.readdirSync(folderPath)) {
          if (file.endsWith('.md')) markdown.push(path.join(folderPath, file));
        }
        const indexPath = ['index.tsx', 'index.jsx'].map(f => path.join(folderPath, f)).find(p => fs.existsSync(p));
        if (indexPath) warnings.push(...demoStyleWarnings(owner, rel(indexPath), fs.readFileSync(indexPath, 'utf8')));
      }

      for (const mdPath of markdown) {
        const raw = fs.readFileSync(mdPath, 'utf8');
        if (!raw.startsWith('---') && FRONTMATTER_BLOCK.test(raw)) {
          problems.push(`${rel(mdPath)}: frontmatter must be the first thing in the file`);
        }
      }
    }
  }

  if (warnings.length) {
    console.warn(`⚠ Demo style (${warnings.length}): demos should show only their feature\n  - ${warnings.join('\n  - ')}`);
  }
  if (problems.length) {
    fail(`Demo source problems (${problems.length}):\n  - ${problems.join('\n  - ')}`);
  }
}

function demoStyleWarnings(owner: string, file: string, src: string): string[] {
  const warnings: string[] = [];
  const root = DEMO_ROOT.exec(src);
  if (root && owner !== 'Card') {
    const [, rootTag, childTag, childProps = ''] = root;
    const wrapped = rootTag === 'Card'
      || (['Block', 'View'].includes(rootTag) && childTag === 'Card' && /\bp(?:adding)?=/.test(childProps));
    if (wrapped) warnings.push(`${file}: wrapped in a Card`);
  }
  for (const match of src.matchAll(MUTED_TEXT)) {
    const text = match[1].replace(/\s+/g, ' ').trim();
    if (text.split(' ').length < 5) continue;
    if (text.includes('`') || INSTRUCTION.test(text) || /\b(?:props?|demo|this example)\b/i.test(text)) {
      warnings.push(`${file}: explanation text "${text.length > 70 ? `${text.slice(0, 70)}…` : text}"`);
    }
  }
  return warnings;
}

main();
