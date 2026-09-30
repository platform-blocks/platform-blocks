import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const source = readFileSync('src/index.ts', 'utf8');
const declarations = [...source.matchAll(/^export\s*\{([^}]+)\}\s*from\s*['"][^'"]+['"];?/gm)]
  .map(([, names]) => `export { ${names.trim()} } from '@plocks/ui';`);
if (declarations.length === 0) throw new Error('No Snack exports found');
mkdirSync('lib', { recursive: true });
writeFileSync('lib/index.d.ts', `${declarations.join('\n')}\n`);
