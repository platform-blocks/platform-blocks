#!/usr/bin/env tsx
/**
 * Generate a static code JSON loader map for the new demos system.
 *
 * It scans docs/data/generated/demo-code-*.json files (produced by the new demos generator)
 * and writes docs/utils/generated/codeJsonLoaders.ts which exports a CODE_JSON_LOADERS map
 * used by demosLoader to avoid template string requires (bundler-friendly).
 */
import * as fs from 'fs';
import * as path from 'path';

interface CodeFileMeta {
  filename: string;
  component: string;
}

const ROOT = path.resolve(__dirname, '..'); // scripts -> .. (docs/)
const GENERATED_DIR = path.join(ROOT, 'data', 'generated');
const OUTPUT_UTILS_DIR = path.join(ROOT, 'utils', 'generated');
const OUTPUT_FILE = path.join(OUTPUT_UTILS_DIR, 'codeJsonLoaders.ts');

function discoverCodeJsonFiles(): CodeFileMeta[] {
  if (!fs.existsSync(GENERATED_DIR)) return [];
  return fs.readdirSync(GENERATED_DIR)
    .filter(f => /^demo-code-.+\.json$/.test(f))
    .map(filename => ({
      filename,
      component: filename.replace(/^demo-code-/, '').replace(/\.json$/, '')
    }));
}

function buildFileContent(files: CodeFileMeta[]): string {
  const header = `// AUTO-GENERATED FILE
// Do not edit manually. Run: npm run generate-code-map
// Generated at: ${new Date().toISOString()}
\n`;
  const importsComment = `// Each entry returns a synchronous require so bundlers can statically see it.`;

  // Path note: codeJsonLoaders.ts lives in docs/utils/generated/ so to reach
  // docs/data/generated we must traverse up two directories: ../../data/generated
  const entries = files.map(f => `  '${f.component}': () => require('../../data/generated/${f.filename}')`).join(',\n');

  return `${header}${importsComment}\n\nexport const CODE_JSON_LOADERS: Record<string, () => any> = {\n${entries}\n};\n`;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function main() {
  const files = discoverCodeJsonFiles();
  ensureDir(OUTPUT_UTILS_DIR);
  const content = buildFileContent(files);
  fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
  console.log(`✅ Generated code JSON loaders for ${files.length} component(s): ${OUTPUT_FILE}`);
  if (files.length === 0) {
    console.warn('⚠️  No demo-code-*.json files found. Did you run the new demos generator?');
  }
}

main().catch(err => {
  console.error('Failed to generate static code map', err);
  process.exit(1);
});
