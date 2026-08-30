/**
 * Builds "Open in Snack" URLs so visitors can run a demo on a real device
 * through Expo Go, by scanning the QR code on the Snack website.
 *
 * Two constraints shape everything here:
 *
 * 1. Snack tops out at Expo SDK 55 (default 54), while this repo is on SDK 57.
 *    Snacks are therefore pinned to SDK 54 and run against the published npm
 *    package, not the workspace source.
 * 2. Snack's package bundler will not finish building the main
 *    `@platform-blocks/react-ui-library` entry (~2 MB single-file bundle), so demo code is
 *    rewritten to import from the trimmed `@platform-blocks/react-ui-library/snack` entry.
 *    Demos that reach outside that entry get no button.
 */

import snackExports from '../data/generated/snack-exports.json';

/** Expo SDK the Snack runs on. Must be a version Snack still supports. */
export const SNACK_SDK_VERSION = '54.0.0';

/**
 * Longest URL snack.expo.dev will serve. Measured against the live site: it
 * answers 200 up to ~15.9 KB and 431 (Request Header Fields Too Large) from
 * ~16.1 KB, i.e. a 16 KB request-line + headers budget. The cap sits below that
 * so a browser's own headers (cookies, UA) still fit; a longer Snack gets no
 * link rather than a link to an error page.
 */
const SNACK_MAX_URL_LENGTH = 14000;

/** Published package version the Snack pulls from npm. */
export const SNACK_PACKAGE_VERSION: string = snackExports.version;

const SNACK_IMPORT_PATH = snackExports.entry;

/** Runtime exports of packages/ui/src/snack.ts (see scripts/generate-snack-exports.ts). */
const SNACK_EXPORTS = new Set<string>(snackExports.exports);

/**
 * Modules a Snack may import besides the UI package: bundled into Expo Go, so
 * they resolve without a package.json entry. Demos importing anything else
 * (charts, expo-document-picker, …) are skipped rather than shipped broken.
 */
const ALLOWED_MODULES = new Set([
  'react',
  'react-native',
  'react-native-svg',
  'react-native-safe-area-context',
  'react-native-reanimated',
  'react-native-gesture-handler',
]);

const UI_PACKAGE = '@platform-blocks/react-ui-library';

/**
 * Charts ship to a Snack as the whole published barrel: at ~950 KB it is
 * already inside the size that Snackager is known to build, so it needs no
 * trimmed entry of its own. It is declared as a dependency only by Snacks that
 * import from it, so a Button demo does not wait on a second package build.
 */
const CHARTS_PACKAGE: string = snackExports.charts.entry;
const CHARTS_PACKAGE_VERSION: string = snackExports.charts.version;
const CHARTS_EXPORTS = new Set<string>(snackExports.charts.exports);

/**
 * Fixture module a component's demos share (`packages/ui/src/components/<C>/
 * demos/data.ts`). It sits one directory above the demo, so it is not picked up
 * as a sibling; generate-demos.ts ships it beside the demo as `data.ts`, and
 * these redirect the import that reached for it — extensionless, as written.
 */
const SHARED_DATA_IMPORT = './data';
const SHARED_DATA_RE = /^(?:\.\.\/)+(?:[^/]+\/demos\/)?data(?:\.ts)?$/;

/**
 * Modules the UI package require()s statically for Metro's benefit (see
 * packages/ui/src/utils/optionalModule.ts). Loading is guarded at runtime, but
 * bundling is not — Metro and Snackager both fail to resolve the entry unless
 * these are installed, so the Snack has to declare them. All are bundled into
 * Expo Go except lodash.debounce, which is plain JavaScript.
 */
const OPTIONAL_MODULE_DEPS = [
  'expo-clipboard',
  'expo-haptics',
  'expo-linear-gradient',
  'expo-document-picker',
  'expo-audio',
  'expo-status-bar',
  'expo-navigation-bar',
  'react-native-webview',
  'react-native-gesture-handler',
  'lodash.debounce',
];

/** Every `from '...'` specifier in a source file. */
function importedModules(code: string): string[] {
  const re = /from\s*['"]([^'"]+)['"]/g;
  const modules: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(code)) !== null) modules.push(match[1]);
  return modules;
}

/** Named identifiers imported from `specifier`, e.g. `{ Accordion, Text }`. */
function importedNamesFrom(code: string, specifier: string): string[] {
  const escaped = specifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`import\\s*\\{([^}]*)\\}\\s*from\\s*['"]${escaped}['"]`, 'g');
  const names: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(code)) !== null) {
    for (const raw of match[1].split(',')) {
      const entry = raw.trim();
      if (!entry || entry.startsWith('type ')) continue; // erased at runtime
      names.push((entry.includes(' as ') ? entry.split(' as ')[0] : entry).trim());
    }
  }
  return names;
}

/** `./data`, `./data.ts` and `data.ts` all normalize to the same key. */
function moduleKey(specifier: string): string {
  return specifier.replace(/^\.\//, '').replace(/\.(tsx?|jsx?|json)$/, '');
}

/**
 * Replaces `import type { … } from '…'` statements with local `type X = any`
 * aliases. TypeScript erases the imports before the code ever runs, but they
 * name paths inside the repo (`../../types`) that do not exist in a Snack — so
 * left in place they would fail the gate, and shipped they would fail to
 * resolve. Dropping them outright would leave the annotations that use them
 * dangling, which runs fine but reports errors in the Snack editor; aliasing
 * keeps the source clean there too.
 */
function stripTypeOnlyImports(code: string): string {
  return code.replace(
    /^[ \t]*import\s+type\s+([^;]*?)\s*from\s*['"][^'"]+['"];?[ \t]*\r?\n?/gm,
    (_match, clause: string) => {
      const names = clause
        .replace(/^\{|\}$/g, '')
        .split(',')
        .map(entry => {
          const name = entry.includes(' as ') ? entry.split(' as ')[1] : entry;
          return name.trim();
        })
        .filter(Boolean);
      return names.length ? `${names.map(name => `type ${name} = any;`).join('\n')}\n` : '';
    }
  );
}

/**
 * Rewrites a demo's imports to what a Snack can resolve:
 *
 * - `@platform-blocks/react-ui-library` and repo-relative paths that point back into the
 *   package (`../..`, `../../../Text`, `../../core/theme`) both become the
 *   trimmed Snack entry. Demos import sibling components by relative path
 *   inside the monorepo; on a Snack those names live in the same published
 *   package, so the specifier is all that differs.
 * - `../data` — a fixture shared by a component's demos — becomes `./data`,
 *   matching the file name it is shipped under.
 *
 * A relative path is only redirected when every value it imports exists in the
 * Snack entry; anything else is left alone so the gate below rejects it rather
 * than shipping an import that resolves to the wrong thing.
 */
export function rewriteSnackImports(code: string): string {
  const withoutTypes = stripTypeOnlyImports(code);
  return withoutTypes.replace(
    /(from\s*)(['"])([^'"]+)\2/g,
    (match, prefix: string, quote: string, specifier: string) => {
      const target = snackSpecifierFor(withoutTypes, specifier);
      return target ? `${prefix}${quote}${target}${quote}` : match;
    }
  );
}

/** Where `specifier` should point inside a Snack, or null to leave it as-is. */
function snackSpecifierFor(code: string, specifier: string): string | null {
  if (specifier === UI_PACKAGE) return SNACK_IMPORT_PATH;
  if (specifier === CHARTS_PACKAGE) return null; // resolves as its own dependency
  if (!specifier.startsWith('.')) return null;

  // `../data` and `../../<Component>/demos/data` are fixtures shipped beside the
  // demo; everything else relative is either a demo-local file (`./…`, already
  // resolvable) or a path back into the package.
  if (SHARED_DATA_RE.test(specifier)) return SHARED_DATA_IMPORT;
  if (specifier.startsWith('./')) return null;

  const names = importedNamesFrom(code, specifier);
  if (names.length === 0) return null; // side-effect or default import — not ours to redirect
  // Chart demos reach their component the same way UI demos do, one package over.
  if (names.every(name => CHARTS_EXPORTS.has(name))) return CHARTS_PACKAGE;
  return names.every(name => SNACK_EXPORTS.has(name)) ? SNACK_IMPORT_PATH : null;
}

/**
 * Whether an already-rewritten source only reaches for things a Snack
 * provides: the Snack entry, a module bundled into Expo Go, or a sibling demo
 * file that ships alongside it (`siblings` holds those file names).
 */
function importsAreSatisfied(code: string, siblings: string[]): boolean {
  const siblingKeys = new Set(siblings.map(moduleKey));
  for (const mod of importedModules(code)) {
    if (mod === SNACK_IMPORT_PATH || mod === CHARTS_PACKAGE || ALLOWED_MODULES.has(mod)) continue;
    if (mod.startsWith('./')) {
      if (siblingKeys.has(moduleKey(mod))) continue;
      return false; // demo-local file that isn't being shipped
    }
    return false;
  }
  // Every identifier pulled from a workspace package must exist in what the
  // Snack installs of it.
  return importedNamesFrom(code, SNACK_IMPORT_PATH).every(name => SNACK_EXPORTS.has(name))
    && importedNamesFrom(code, CHARTS_PACKAGE).every(name => CHARTS_EXPORTS.has(name));
}

/** Whether the shipped source imports anything from the charts package. */
function usesCharts(code: string): boolean {
  return importedModules(code).includes(CHARTS_PACKAGE);
}

/**
 * Whether a demo's source can run inside a Snack, judged on the code as it
 * would ship: every module it imports is either a workspace package the Snack
 * installs, bundled into Expo Go, or one of the sibling demo files shipped with
 * it, and every identifier it pulls from a workspace package exists there.
 */
export function isSnackSupported(code: string | undefined, siblingFileNames: string[] = []): boolean {
  if (!code) return false;
  const rewritten = rewriteSnackImports(code);
  if (!importsAreSatisfied(rewritten, siblingFileNames)) return false;
  // A Snack must actually render something from the design system; a demo that
  // imports nothing from it is either not a demo or reaches somewhere Snack can't.
  return importedNamesFrom(rewritten, SNACK_IMPORT_PATH).length > 0 || usesCharts(rewritten);
}

/**
 * `Shell.tsx` — the chrome every Snack this file generates renders through:
 * the provider stack, the scrolling screen, and the React UI Library footer. A
 * Snack's App.tsx supplies only the content, so a single demo and a whole
 * component page look like the same product on device.
 *
 * It may only use identifiers the Snack entry exports (see snack.ts), since it
 * is bundled by Snackager exactly like demo code is.
 */
export const SNACK_SHELL_FILE = `import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  PlatformBlocksProvider,
  DialogProvider,
  ToastProvider,
  Divider,
  Flex,
  Icon,
  Link,
  SegmentedControl,
  Text,
  Title,
  useThemeMode,
} from '${SNACK_IMPORT_PATH}';

const SITE = 'https://react-ui-library.com';

type ThemeMode = 'light' | 'auto' | 'dark';

/**
 * The three modes ThemeModeProvider understands. Icon-only: on a phone the
 * control sits beside the heading, and three word labels would push the title
 * onto a second line.
 */
const THEME_MODES: { value: ThemeMode; label: React.ReactNode; ariaLabel: string }[] = [
  { value: 'light', label: <Icon name="sun" size="sm" />, ariaLabel: 'Light theme' },
  { value: 'auto', label: <Icon name="contrast" size="sm" />, ariaLabel: 'Follow system theme' },
  { value: 'dark', label: <Icon name="moon" size="sm" />, ariaLabel: 'Dark theme' },
];

/**
 * Switches the whole Snack between light, dark and the OS setting — the point
 * being that every demo below re-themes with it, which is the thing a static
 * screenshot on the docs site can't show.
 *
 * Safe to call \`useThemeMode\` here only because Shell passes \`themeModeConfig\`
 * to the provider; without it PlatformBlocksProvider never mounts
 * ThemeModeProvider and the hook throws.
 */
function ThemeToggle() {
  const { mode, setMode } = useThemeMode();
  return (
    <SegmentedControl
      data={THEME_MODES}
      value={mode}
      onChange={value => setMode(value as ThemeMode)}
      size="sm"
    />
  );
}

export interface ShellProps {
  /** Screen heading — the component name. */
  title: string;
  /** Line under the heading: the demo title, or the component's docs path. */
  subtitle?: string;
  /** Muted note above the content, e.g. which demos were left out. */
  note?: string;
  children: React.ReactNode;
}

function Screen({ title, subtitle, note, children }: ShellProps) {
  const insets = useSafeAreaInsets();
  const { actualColorScheme } = useThemeMode();
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
    >
      <Flex direction="row" justify="space-between" align="flex-start" gap="sm" mb={4}>
        <View style={{ flexShrink: 1 }}>
          <Title order={1} size={30} weight="bold">{title}</Title>
          {subtitle ? <Text variant="small" color="muted">{subtitle}</Text> : null}
        </View>
        <ThemeToggle />
      </Flex>
      {note ? <Text variant="small" color="muted" mt={8}>{note}</Text> : null}

      <View style={{ marginTop: 24 }}>{children}</View>

      <Divider mt={40} mb={16} />
      <Title order={2} size={16} weight="bold" mb={2}>React UI Library</Title>
      <Text variant="small" color="muted" mb={8}>
        A React Native design system for iOS, Android and Web.
      </Text>
      <Link href={SITE} external size="sm" target="_blank">react-ui-library.com</Link>
      <Text variant="small" color="muted" mt={8}>
        @platform-blocks/react-ui-library v${SNACK_PACKAGE_VERSION} · Expo SDK ${SNACK_SDK_VERSION} · {actualColorScheme}
      </Text>
    </ScrollView>
  );
}

/**
 * Wraps a Snack's content in the provider stack and the shared chrome.
 *
 * \`themeModeConfig\` is what mounts ThemeModeProvider inside
 * PlatformBlocksProvider — it is opt-in, and the toggle depends on it. The
 * default persistence writes to localStorage, which is web-only and already
 * guarded, so on a device it simply starts from the OS setting each run.
 */
export default function Shell(props: ShellProps) {
  return (
    <SafeAreaProvider>
      <PlatformBlocksProvider themeModeConfig={{ initialMode: 'auto' }}>
        <DialogProvider>
          <ToastProvider>
            <Screen {...props} />
          </ToastProvider>
        </DialogProvider>
      </PlatformBlocksProvider>
    </SafeAreaProvider>
  );
}

/** One titled demo section, so multi-demo Snacks separate them consistently. */
export function Section({
  title,
  first,
  children,
}: {
  title: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginTop: first ? 0 : 24 }}>
      {first ? null : <Divider mb={24} />}
      <Title order={2} size={18} weight="semibold" mb={12}>{title}</Title>
      {children}
    </View>
  );
}
`;

export interface SnackFileMap {
  [fileName: string]: { type: 'CODE'; contents: string };
}

/** Wraps a file map in the snack.expo.dev query string every Snack shares. */
function snackUrlFor(
  name: string,
  description: string,
  files: SnackFileMap,
  platform: 'mydevice' | 'ios' | 'android' | 'web'
): string {
  // Snackager builds each declared package, so charts is only listed when a
  // file actually imports it — otherwise every Snack would pay for it.
  const needsCharts = Object.values(files).some(file => usesCharts(file.contents));
  const dependencies = [
    `${UI_PACKAGE}@${SNACK_PACKAGE_VERSION}`,
    ...(needsCharts ? [`${CHARTS_PACKAGE}@${CHARTS_PACKAGE_VERSION}`] : []),
    ...OPTIONAL_MODULE_DEPS,
  ];

  const params = new URLSearchParams({
    name,
    description,
    sdkVersion: SNACK_SDK_VERSION,
    platform,
    supportedPlatforms: 'mydevice,ios,android',
    dependencies: dependencies.join(','),
    files: JSON.stringify(files),
    hideQueryParams: 'true',
  });

  return `https://snack.expo.dev/?${params.toString()}`;
}

export interface SnackUrlOptions {
  /** Component the demo belongs to, e.g. "Accordion". */
  component: string;
  /** Demo title, used as the Snack name. */
  title: string;
  /** Raw demo source. Must default-export the demo component. */
  code: string | undefined;
  /**
   * Sibling sources of a multi-file demo (`data.ts`, …), including the
   * `index.tsx` entry. They ship next to `Demo.tsx` so its relative imports
   * resolve inside the Snack.
   */
  files?: { name: string; code: string }[];
  /** Open on the QR/device tab (default) or a simulator preview. */
  platform?: 'mydevice' | 'ios' | 'android' | 'web';
}

/** The `Demo.tsx` + siblings file map for one demo, or null if it can't run. */
function buildDemoFiles(
  code: string | undefined,
  demoFiles: { name: string; code: string }[] | undefined
): SnackFileMap | null {
  // Extra sources only — `index.tsx` is already shipped as Demo.tsx.
  const siblings = (demoFiles ?? []).filter(f => f.name !== 'index.tsx');
  const siblingNames = siblings.map(f => f.name);
  if (!code || !isSnackSupported(code, siblingNames)) return null;
  // A sibling that reaches outside Snack's reach would break the same way the
  // entry would, so the whole demo is skipped rather than shipped half-broken.
  // Judged on the rewritten source, exactly as the entry is.
  const rewrittenSiblings = siblings.map(f => ({ name: f.name, code: rewriteSnackImports(f.code) }));
  if (!rewrittenSiblings.every(f => importsAreSatisfied(f.code, siblingNames))) return null;

  const files: SnackFileMap = {
    'Demo.tsx': { type: 'CODE', contents: rewriteSnackImports(code) },
  };
  for (const file of rewrittenSiblings) {
    files[file.name] = { type: 'CODE', contents: file.code };
  }
  return files;
}

/**
 * Every file of a single-demo Snack — shell, entry and demo sources — or null
 * when the demo reaches outside what the Snack entry and Expo Go provide.
 * Exported so examples/snack-local runs the exact same files against a local
 * build; see scripts/snack-local.ts.
 */
export function buildDemoBundle({
  component,
  title,
  code,
  files: demoFiles,
}: Omit<SnackUrlOptions, 'platform'>): SnackFileMap | null {
  const demo = buildDemoFiles(code, demoFiles);
  if (!demo) return null;

  const app = `import Shell from './Shell';
import { Demo } from './Demo';

export default function App() {
  return (
    <Shell title=${jsString(component)} subtitle=${jsString(title)}>
      <Demo />
    </Shell>
  );
}
`;

  return {
    'App.tsx': { type: 'CODE', contents: app },
    'Shell.tsx': { type: 'CODE', contents: SNACK_SHELL_FILE },
    ...demo,
  };
}

/**
 * Returns a snack.expo.dev URL that opens the demo, or null when the demo
 * reaches outside what the Snack entry and Expo Go provide, or when its source
 * is too long to travel in a URL.
 */
export function buildSnackUrl({
  component,
  title,
  code,
  files: demoFiles,
  platform = 'mydevice',
}: SnackUrlOptions): string | null {
  const files = buildDemoBundle({ component, title, code, files: demoFiles });
  if (!files) return null;

  const url = snackUrlFor(
    `${component} — ${title}`,
    `${component} demo from react-ui-library.com`,
    files,
    platform
  );
  return url.length > SNACK_MAX_URL_LENGTH ? null : url;
}

/** A demo as the combined-bundle builder needs it. */
export interface SnackDemoSource {
  /** Demo slug, e.g. `basic`. Becomes the directory name inside the Snack. */
  id: string;
  /** Demo title, used as the section heading on device. */
  title: string;
  /** Demo entry source. */
  code?: string;
  /** Multi-file demo sources, including the `index.tsx` entry. */
  files?: { name: string; code: string }[];
}

export interface ComponentBundle {
  /** Every file of the Snack, keyed by path. */
  files: SnackFileMap;
  /** Ids of the demos that made it in, in render order. */
  included: string[];
  /** Ids of the demos left out because they can't run in a Snack. */
  skipped: string[];
}

/** `color-override` / `colorOverride` -> `DemoColorOverride`. */
function demoIdentifier(id: string): string {
  const pascal = id
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return `Demo${pascal || 'Unnamed'}`;
}

function jsString(value: string): string {
  return JSON.stringify(value);
}

/**
 * The combined Snack's App.tsx: the shared shell, with every demo rendered
 * under its title as a section.
 */
function buildBundleAppFile(
  component: string,
  demos: { id: string; title: string }[],
  skippedCount: number
): string {
  const imports = demos
    .map(demo => `import { Demo as ${demoIdentifier(demo.id)} } from './demos/${demo.id}';`)
    .join('\n');

  const sections = demos
    .map(demo => `  { title: ${jsString(demo.title)}, Demo: ${demoIdentifier(demo.id)} },`)
    .join('\n');

  // Readers should know the Snack is a subset rather than assume the component
  // only has this many demos. Demos drop out for two reasons — they reach
  // outside Expo Go, or they did not fit in the URL — so the note stays neutral
  // about which one applies.
  const omittedNote = skippedCount === 1
    ? '1 more demo on react-ui-library.com — not included in this Snack.'
    : `${skippedCount} more demos on react-ui-library.com — not included in this Snack.`;
  const note = skippedCount ? `\n      note={${jsString(omittedNote)}}` : '';

  return `import Shell, { Section } from './Shell';
${imports}

const SECTIONS = [
${sections}
];

export default function App() {
  return (
    <Shell
      title=${jsString(component)}
      subtitle=${jsString(`react-ui-library.com/components/${component}`)}${note}
    >
      {SECTIONS.map(({ title, Demo }, index) => (
        <Section key={title} title={title} first={index === 0}>
          <Demo />
        </Section>
      ))}
    </Shell>
  );
}
`;
}

/**
 * Assembles every snack-able demo of a component into one Snack: `App.tsx`
 * lists them as sections, and each demo keeps its own directory
 * (`demos/<id>/index.tsx` plus any siblings) so its relative imports resolve
 * exactly as they do in the repo.
 *
 * Returns null when no demo of the component can run in a Snack.
 */
export function buildComponentBundle(
  component: string,
  demos: SnackDemoSource[],
  /** Ids the caller already dropped (e.g. to fit the URL), counted in the note. */
  preSkipped: string[] = []
): ComponentBundle | null {
  const files: SnackFileMap = {};
  const included: { id: string; title: string }[] = [];
  const skipped: string[] = [...preSkipped];

  for (const demo of demos) {
    const demoFiles = buildDemoFiles(demo.code, demo.files);
    if (!demoFiles) {
      skipped.push(demo.id);
      continue;
    }

    const entries = Object.entries(demoFiles);
    if (entries.length === 1) {
      // Single-file demo: a plain module, so `./demos/<id>` needs no directory
      // index resolution from the bundler.
      files[`demos/${demo.id}.tsx`] = demoFiles['Demo.tsx'];
    } else {
      for (const [name, file] of entries) {
        // The entry becomes the directory's index so the demo's `./data`-style
        // imports resolve against the siblings shipped beside it.
        const fileName = name === 'Demo.tsx' ? 'index.tsx' : name;
        files[`demos/${demo.id}/${fileName}`] = file;
      }
    }
    included.push({ id: demo.id, title: demo.title });
  }

  if (included.length === 0) return null;

  files['App.tsx'] = {
    type: 'CODE',
    contents: buildBundleAppFile(component, included, skipped.length),
  };
  files['Shell.tsx'] = { type: 'CODE', contents: SNACK_SHELL_FILE };

  return { files, included: included.map(d => d.id), skipped };
}

/**
 * Returns a snack.expo.dev URL running the component's snack-able demos, or
 * null when none of them can run there.
 *
 * Every demo travels in the query string, so a component with many or long
 * demos overshoots what Snack will serve. Trailing demos are dropped until the
 * URL fits — the leading demos are the introductory ones — and the Snack's own
 * note reports how many were left behind.
 */
export function buildComponentSnackUrl(
  component: string,
  demos: SnackDemoSource[],
  platform: 'mydevice' | 'ios' | 'android' | 'web' = 'mydevice'
): string | null {
  for (let count = demos.length; count > 0; count--) {
    const bundle = buildComponentBundle(
      component,
      demos.slice(0, count),
      demos.slice(count).map(demo => demo.id)
    );
    // No prefix of the demo list can run in a Snack, so neither can a shorter one.
    if (!bundle) return null;

    const url = snackUrlFor(
      `${component} — platform-blocks`,
      `${component} demos from react-ui-library.com`,
      bundle.files,
      platform
    );
    if (url.length <= SNACK_MAX_URL_LENGTH) return url;
  }
  return null;
}
