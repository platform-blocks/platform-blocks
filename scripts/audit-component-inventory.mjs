/** Rebuild the source-based component inventory: node scripts/audit-component-inventory.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const componentMeta = JSON.parse(read('apps/docs/data/generated/components-meta.json'));
const componentProps = JSON.parse(read('apps/docs/data/generated/components-props.json'));
const demoManifest = JSON.parse(read('apps/docs/data/generated/demos.json'));
const coreSource = read('apps/docs/config/coreComponents.ts');
const coreNames = [...coreSource.matchAll(/\{\s*name:\s*'([^']+)',\s*category:/g)].map((match) => match[1]);
const componentVisualTest = 'apps/docs/tests/component-visuals.spec.ts';
const chartVisualTest = 'apps/docs/tests/chart-baselines.spec.ts';
const screenshotCovered = new Set();
if (exists(componentVisualTest) && /\btoHaveScreenshot\s*\(/.test(read(componentVisualTest))) {
  for (const target of JSON.parse(read('apps/docs/tests/visual-targets.json')).componentPreviews) {
    screenshotCovered.add(target.name);
  }
}
if (exists(chartVisualTest) && /\btoHaveScreenshot\s*\(/.test(read(chartVisualTest))) {
  for (const [, name] of read(chartVisualTest).matchAll(/\bslug:\s*'([A-Za-z0-9]+)'/g)) {
    screenshotCovered.add(name);
  }
}
const packageEntries = new Map();

function moduleFile(specifier) {
  for (const candidate of [specifier, `${specifier}.ts`, `${specifier}.tsx`, `${specifier}/index.ts`, `${specifier}/index.tsx`]) {
    if (exists(candidate) && fs.statSync(path.join(root, candidate)).isFile()) return candidate;
  }
  return null;
}

function moduleValues(file, visited = new Set()) {
  if (!file || visited.has(file)) return new Set();
  visited.add(file);
  const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true);
  const names = new Set();
  for (const statement of source.statements) {
    if (ts.isExportDeclaration(statement) && !statement.isTypeOnly) {
      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const element of statement.exportClause.elements) {
          if (!element.isTypeOnly) names.add(element.name.text);
        }
      } else if (!statement.exportClause && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)) {
        const imported = moduleFile(path.join(path.dirname(file), statement.moduleSpecifier.text));
        for (const name of moduleValues(imported, visited)) names.add(name);
      }
    }
    if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement) || ts.isInterfaceDeclaration(statement)) {
      if (statement.name && statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
        && !ts.isInterfaceDeclaration(statement)) names.add(statement.name.text);
    }
    if (ts.isVariableStatement(statement) && statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) names.add(declaration.name.text);
      }
    }
  }
  return names;
}

function exportedValues(packageName) {
  if (packageEntries.has(packageName)) return packageEntries.get(packageName);
  const packageDir = packageName.replace('@plocks/', '');
  const entry = `packages/${packageDir}/src/index.ts`;
  const names = moduleValues(entry);
  packageEntries.set(packageName, names);
  return names;
}

function testFiles(sourcePath, packageName, componentName) {
  const dirs = [`${sourcePath}/__tests__`, `${sourcePath}/__web_tests__`];
  const result = { component: [], web: [] };
  for (const dir of dirs) {
    if (!exists(dir)) continue;
    const kind = dir.endsWith('__web_tests__') ? 'web' : 'component';
    result[kind].push(...fs.readdirSync(path.join(root, dir))
      .filter((name) => /\.(?:test|spec)\.[jt]sx?$/.test(name))
      .map((name) => `${dir}/${name}`));
  }
  if (packageName === '@plocks/charts') {
    const chartTest = `packages/charts/tests/components/${componentName}.test.tsx`;
    if (exists(chartTest)) result.component.push(chartTest);
  }
  return result;
}

const rows = Object.entries(componentMeta).map(([name, meta]) => {
  const sourcePath = meta.sourcePath;
  const props = componentProps[name] ?? [];
  const demoIds = demoManifest.demos.filter((demo) => demo.component === name).map((demo) => demo.demo);
  const tests = testFiles(sourcePath, meta.packageName, name);
  const documentedVariant = props.some((prop) => prop.name === 'variant' || prop.name === 'variants');
  const variantDemo = demoIds.some((id) => /(?:^|[-_])variants?(?:$|[-_])/.test(id));
  const publicExport = exportedValues(meta.packageName).has(name);
  // These are family pages: the public API is Row/Column and ToggleButton/ToggleGroup.
  const familyPage = !publicExport && ['Layout', 'Toggle'].includes(name);
  const gaps = [];
  if (tests.component.length === 0) gaps.push('noComponentTest');
  if (tests.web.length === 0) gaps.push('noWebComponentTest');
  if (!screenshotCovered.has(name)) gaps.push('noScreenshotRegressionAssertion');
  if (documentedVariant && !variantDemo) gaps.push('noDedicatedVariantDemo');
  if (props.length === 0) gaps.push('noGeneratedProps');
  if (meta.name !== name) gaps.push('metadataNameMismatch');
  if (!publicExport && !familyPage) gaps.push('noMatchingPublicExport');
  return {
    name, package: meta.packageName, category: meta.category, sourcePath,
    docsPath: meta.docsPath, metadataName: meta.name, publicExport, familyPage,
    demoCount: demoIds.length, demoIds, propCount: props.length,
    documentedVariant, variantDemo, playground: Boolean(meta.playground),
    tests, gaps,
  };
}).sort((a, b) => a.name.localeCompare(b.name));

function allTestFiles(dir) {
  if (!exists(dir)) return [];
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const child = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return allTestFiles(child);
    return /\.(?:test|spec)\.[jt]sx?$/.test(entry.name) ? [child] : [];
  });
}
const visualTestFiles = ['tests', 'apps/docs/tests', 'packages'].flatMap(allTestFiles);
const screenshotAssertionFiles = visualTestFiles.filter((file) => /\btoHaveScreenshot\s*\(/.test(read(file)));

const gapDefinitions = {
  noScreenshotRegressionAssertion: 'No in-repo screenshot assertion for this docs component',
  noWebComponentTest: 'No colocated web component test',
  noComponentTest: 'No component test in the source folder or chart component test suite',
  noDedicatedVariantDemo: 'Variant prop documented without a dedicated variant demo',
  noGeneratedProps: 'Generated prop table is empty',
  metadataNameMismatch: 'Metadata name differs from catalog key',
  noMatchingPublicExport: 'Catalog name has no matching named value export from its package',
};
const gaps = Object.entries(gapDefinitions).map(([id, description]) => {
  const affected = rows.filter((row) => row.gaps.includes(id));
  return {
    id, description, count: affected.length,
    byPackage: Object.fromEntries([...new Set(affected.map((row) => row.package))]
      .sort().map((pkg) => [pkg, affected.filter((row) => row.package === pkg).length])),
    components: affected.map((row) => row.name),
  };
}).sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));

const inventory = {
  method: 'Source and generated-docs inventory; absence of a colocated test or named demo is a static signal, not proof of runtime failure.',
  scope: '155 entries in apps/docs/data/generated/components-meta.json, cross-checked with CORE_COMPONENTS.',
  totals: {
    components: rows.length,
    demos: demoManifest.demos.filter((demo) => componentMeta[demo.component]).length,
    packages: Object.fromEntries([...new Set(rows.map((row) => row.package))].sort()
      .map((pkg) => [pkg, rows.filter((row) => row.package === pkg).length])),
    screenshotAssertionFiles,
  },
  catalogConsistency: {
    missingFromCore: rows.filter((row) => !coreNames.includes(row.name)).map((row) => row.name),
    missingFromMetadata: coreNames.filter((name) => !componentMeta[name]),
    duplicateCoreNames: coreNames.filter((name, index) => coreNames.indexOf(name) !== index),
  },
  gaps, components: rows,
};
const output = path.join(root, 'reports/component-inventory.json');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(inventory, null, 2)}\n`);
console.log(`Audited ${rows.length} components and ${inventory.totals.demos} demos.`);
for (const gap of gaps) console.log(`${String(gap.count).padStart(3)}  ${gap.description}`);
console.log(`Wrote ${path.relative(root, output)}`);
