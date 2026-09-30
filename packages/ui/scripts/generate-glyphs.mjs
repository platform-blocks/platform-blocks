/**
 * Snapshot only the Tabler glyphs in the default Icon registry. Tabler is a
 * development dependency; consumers receive these paths, not the whole icon
 * package. Run `node scripts/generate-glyphs.mjs` after changing the registry.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const registryPath = join(process.cwd(), 'src/components/Icon/icons/tabler.ts');
const outputPath = join(process.cwd(), 'src/components/Icon/icons/glyphs.generated.tsx');
const registry = readFileSync(registryPath, 'utf8');
const definitionsSource = registry.split('export const tablerIcons')[1];
if (!definitionsSource) throw new Error('Default icon registry not found');
const names = [...definitionsSource.matchAll(/(?:outlined|filled):\s*(Icon[A-Za-z0-9]+)/g)].map(([, name]) => name);
const uniqueNames = [...new Set(names)];
const tablerRoot = join(dirname(require.resolve('@tabler/icons-react-native/IconAdjustments')), '../../..');
const tablerVersion = JSON.parse(readFileSync(join(tablerRoot, 'package.json'), 'utf8')).version;
const definitions = uniqueNames.map(name => {
  const file = require.resolve(`@tabler/icons-react-native/${name}`)
    .replace('/dist/cjs/icons/', '/dist/esm/icons/')
    .replace(/\.cjs$/, '.mjs');
  const source = readFileSync(file, 'utf8');
  const match = source.match(/createReactNativeComponent\("(outline|filled)",\s*"[^"]+",\s*"[^"]+",\s*(\[.*\])\);/);
  if (!match) throw new Error(`Cannot read Tabler paths for ${name}`);
  const nodes = JSON.parse(match[2]);
  if (nodes.some(([tag, attrs]) => tag !== 'path' || typeof attrs.d !== 'string' || Object.keys(attrs).some(key => key !== 'd' && key !== 'key'))) {
    throw new Error(`Unsupported Tabler node in ${name}`);
  }
  return { name, filled: match[1] === 'filled', paths: nodes.map(([, attrs]) => attrs.d) };
});

const code = `/**
 * Generated from @tabler/icons-react-native v${tablerVersion}.
 * Tabler Icons are MIT licensed; see THIRD_PARTY_LICENSES.md in this package.
 * Run: node scripts/generate-glyphs.mjs
 */
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { ExternalIconProps } from '../types';

function createGlyph(paths: readonly string[], filled: boolean, name: string) {
  const Glyph = React.forwardRef<Svg, ExternalIconProps>((props, ref) => {
    const { size = 24, color = 'currentColor', strokeWidth = 2, ...rest } = props;
    return (
      <Svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={filled ? color : 'none'}
        stroke={filled ? 'none' : color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...rest}
      >
        {paths.map((d, index) => <Path key={index} d={d} />)}
      </Svg>
    );
  });
  Glyph.displayName = name;
  return Glyph;
}

${definitions.map(({ name, filled, paths }) => {
  if (paths.some(path => path.includes("'"))) throw new Error(`Unescaped quote in ${name}`);
  return `export const ${name} = createGlyph([${paths.map(path => `'${path}'`).join(', ')}], ${filled}, '${name}');`;
}).join('\n')}
`;
if (process.argv.includes('--check')) {
  if (readFileSync(outputPath, 'utf8') !== code) {
    throw new Error('Built-in glyphs are stale; run npm run icons:generate');
  }
  console.log(`Verified ${definitions.length} built-in glyphs`);
} else {
  writeFileSync(outputPath, code);
  console.log(`Wrote ${definitions.length} glyphs to ${outputPath}`);
}
