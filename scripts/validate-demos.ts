#!/usr/bin/env ts-node
/**
 * Basic validation for generated demo metadata.
 * Ensures uniqueness, required fields, and simple ordering constraints.
 */
import fs from 'fs';
import path from 'path';

import { CORE_COMPONENTS } from '../apps/platform-blocks.com/config/coreComponents';

// Optional zod import for component meta validation
let z: any; try { z = require('zod'); } catch { z = null; }

const ComponentMetaSchema = z?.object?.({
  name: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.string().optional(),
  since: z.string().optional(),
  category: z.string().optional(),
}) || { safeParse: () => ({ success: true }) };

interface DemoMeta { id: string; component: string; demo: string; title: string; order: number; hidden?: boolean; }

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'apps', 'platform-blocks.com', 'data', 'generated');
const FILE = path.join(OUTPUT_DIR, 'demos.json');

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
  console.log(`✔ validate-demos: ${demos.length} demos OK (${Object.keys(componentsMeta).length} components meta)`);
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

main();
