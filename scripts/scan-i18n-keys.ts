#!/usr/bin/env tsx
/**
 * Simple i18n key scanner for docs source.
 * Scans for t('key') / t("key") usage patterns and reports missing translations per locale.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = join(process.cwd(), 'apps', 'react-ui-library.com');
const LOCALES_DIR = join(ROOT, 'i18n', 'locales');

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, files); else if (/\.(tsx?|jsx?)$/.test(entry)) files.push(full);
  }
  return files;
}

function collectKeys(): Set<string> {
  const files = walk(join(ROOT, 'app'))
    .concat(walk(join(ROOT, 'screens'), []))
    .concat(walk(join(ROOT, 'content'), []))
    .concat(walk(join(ROOT, 'examples'), []));
  const keyRegex = /\bt\(\s*['"]([^'"()]+)['"]/g; // naive but effective
  const keys = new Set<string>();
  for (const f of files) {
    const src = readFileSync(f, 'utf8');
    let m: RegExpExecArray | null;
    while ((m = keyRegex.exec(src))) {
      keys.add(m[1]);
    }
  }
  return keys;
}

function loadLocale(locale: string): any {
  const common = JSON.parse(readFileSync(join(LOCALES_DIR, locale, 'common.json'), 'utf8'));
  return common.translation || common; // we stored keys at root
}

function flatten(obj: any, prefix = '', out: Record<string, string> = {}) {
  Object.keys(obj).forEach(k => {
    const val = obj[k];
    const key = prefix ? `${prefix}.${k}` : k;
    if (val && typeof val === 'object' && !Array.isArray(val)) flatten(val, key, out); else out[key] = String(val);
  });
  return out;
}

function main() {
  const keys = collectKeys();
  const locales = readdirSync(LOCALES_DIR).filter(f => statSync(join(LOCALES_DIR, f)).isDirectory());
  const missing: Record<string, string[]> = {};
  for (const locale of locales) {
    const data = loadLocale(locale);
    const flat = flatten(data);
    for (const k of keys) if (!(k in flat)) {
      (missing[locale] ||= []).push(k);
    }
  }
  console.log('Discovered keys:', [...keys].sort().length);
  for (const locale of Object.keys(missing)) {
    if (missing[locale].length) {
      console.log(`Missing in ${locale}:`);
      missing[locale].forEach(k => console.log('  -', k));
    }
  }
  if (!Object.values(missing).some(arr => arr.length)) console.log('All locale files contain the discovered keys.');
}

main();
