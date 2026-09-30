/**
 * llms.txt generator.
 *
 * Follows the https://llmstxt.org convention: instead of one enormous
 * truncated file, the site publishes
 *
 *   /llms.txt                    a compact index — one link + summary per page,
 *                                led by the library-wide conventions
 *   /llms-small.txt              every API in one file: imports, own props,
 *                                one example per component — sized to fit a
 *                                context window
 *   /llms-full.txt               every page concatenated, nothing truncated
 *   /llms/<section>/<page>.md    each page as a standalone Markdown file
 *
 * An agent reads the index, then fetches only the handful of pages it needs.
 *
 * Inputs are the artifacts written by scripts/generate-demos.ts plus the
 * JSX-free content modules under apps/docs/config/. Run
 * `npm run demos:generate` first — without the generated data this emits an
 * index of whatever it can find and warns about the rest.
 */

import { promises as fs, type Dirent } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CORE_COMPONENTS, type CoreComponentConfig } from '../apps/docs/config/coreComponents';
import { FAQ_ITEMS } from '../apps/docs/config/faq';
import { GITHUB_REPO, NPM_PACKAGE, SITE_URL } from '../apps/docs/config/urls';
import { LLMS_FULL_URL, LLMS_SKILLS_REPO_URL, LLMS_SMALL_URL } from '../apps/docs/config/llmsDocs';
import { LLMS_CHOOSING, LLMS_CONVENTIONS } from '../apps/docs/config/llmsGuidance';
import {
  THEMING_INTRO,
  THEMING_SECTIONS,
  THEMING_SUBTITLE,
  THEMING_TITLE,
} from '../apps/docs/config/theming';
import {
  GETTING_STARTED_PREREQUISITES,
  GETTING_STARTED_STEPS,
  GETTING_STARTED_SUBTITLE,
} from '../apps/docs/config/gettingStarted';
import {
  STARTER_TEMPLATES,
  TEMPLATES_CREATE_COMMAND,
  TEMPLATES_GUIDANCE,
  TEMPLATES_TITLE,
  getTemplateCreateCommand,
} from '../apps/docs/config/templates';
import {
  ACCESSIBILITY_EXAMPLE_LEAD,
  ACCESSIBILITY_EXAMPLE_SNIPPET,
  ACCESSIBILITY_EXAMPLE_TITLE,
  ACCESSIBILITY_INTRO,
  ACCESSIBILITY_OUTRO,
  ACCESSIBILITY_SECTIONS,
  ACCESSIBILITY_TITLE,
} from '../apps/docs/config/accessibility';
import {
  LOCALIZATION_NOTE_KEYS,
  LOCALIZATION_STEPS,
} from '../apps/docs/config/localization';
import {
  CONTRIBUTE_INTRO,
  CONTRIBUTE_OUTRO,
  CONTRIBUTE_REPO_LAYOUT,
  CONTRIBUTE_SECTIONS,
  CONTRIBUTE_SUBTITLE,
  CONTRIBUTE_TITLE,
} from '../apps/docs/config/contribute';
import { iconUsageLines, readIconNames } from './lib/icons';
import { CHARTS_PACKAGE, UI_PACKAGE, listWorkspacePackages, type WorkspacePackage } from './lib/packages';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const docsDir = path.join(repoRoot, 'apps', 'docs');
const generatedDir = path.join(docsDir, 'data', 'generated');
const publicDir = path.join(docsDir, 'public');
const llmsDir = path.join(publicDir, 'llms');
const uiDir = path.join(repoRoot, 'packages', 'ui');
const uiSrc = path.join(uiDir, 'src');
const chartsDir = path.join(repoRoot, 'packages', 'charts');

const GITHUB_BRANCH = 'main';
const GITHUB_TREE = `${GITHUB_REPO}/tree/${GITHUB_BRANCH}`;

type JSONObject = Record<string, unknown>;

/** One published page: a Markdown file plus its row in the index. */
interface LlmsPage {
  /** Path under /llms, e.g. `components/Button.md`. */
  slug: string;
  /** Link text in the index. */
  title: string;
  /** Trailing summary in the index. Omitted when there is nothing useful to say. */
  summary?: string;
  /** Full Markdown body of the page. */
  body: string;
  /**
   * The llms-small.txt variant of the page. Pages without one are left out of
   * that file; `body` is used as-is when it is already small.
   */
  compact?: string;
  /**
   * The docs-site routes this page mirrors (`/ui/Button`, `/charts/BarChart`). The web build serves the Markdown at
   * `<route>.md` too and links it from each page's head.
   */
  routes?: string[];
}

/** An `## Heading` group of pages in llms.txt. */
interface LlmsSection {
  heading: string;
  pages: LlmsPage[];
}

// ---------------------------------------------------------------------------
// IO helpers
// ---------------------------------------------------------------------------

async function readTextIfExists(filePath: string): Promise<string | null> {
  try {
    return (await fs.readFile(filePath, 'utf8')).replace(/\r\n/g, '\n');
  } catch {
    return null;
  }
}

async function readJSONIfExists<T = any>(filePath: string): Promise<T | null> {
  const raw = await readTextIfExists(filePath);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Writes every page and removes any `.md` left over from a previous run, so a
 * renamed or deleted component never lingers as a stale URL the index no longer
 * links to.
 */
async function writePages(pages: LlmsPage[]): Promise<void> {
  const expected = new Set(pages.map(page => path.join(llmsDir, page.slug)));

  const stale: string[] = [];
  async function walk(dir: string): Promise<void> {
    let entries: Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.name.endsWith('.md') && !expected.has(full)) {
        stale.push(full);
      }
    }
  }
  await walk(llmsDir);
  await Promise.all(stale.map(file => fs.rm(file, { force: true })));

  for (const page of pages) {
    const target = path.join(llmsDir, page.slug);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, `${page.body.trimEnd()}\n`, 'utf8');
  }

  if (stale.length) {
    console.log(`   Removed ${stale.length} stale page(s)`);
  }
}

// ---------------------------------------------------------------------------
// Markdown helpers
// ---------------------------------------------------------------------------

/**
 * Collapses a multi-paragraph description to the one line the index shows.
 *
 * Leading noise is skipped — a stray `---` left over from frontmatter, or a
 * heading that repeats the page title. Any other heading, list or table means
 * the text opens on a section rather than a summary (Calendar's description
 * starts with its accessibility notes), so there is no summary to take and the
 * caller falls back to the next source.
 */
function toSummary(text: unknown, title?: string): string | undefined {
  if (typeof text !== 'string') return undefined;
  const paragraphs = text.split(/\n\s*\n/).map(paragraph => paragraph.trim()).filter(Boolean);
  let lead: string | undefined;
  for (let paragraph of paragraphs) {
    if (/^-{3,}$/.test(paragraph)) continue;
    const [firstLine, ...rest] = paragraph.split('\n');
    const heading = firstLine.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      const repeatsTitle = title && heading[1].replace(/`/g, '').trim().toLowerCase() === title.toLowerCase();
      if (!repeatsTitle) return undefined;
      paragraph = rest.join('\n').trim();
      if (!paragraph) continue;
    }
    if (/^(?:[-*+]|\d+\.)\s|^\|/.test(paragraph)) return undefined;
    lead = paragraph;
    break;
  }
  if (!lead) return undefined;
  const flat = lead
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  if (!flat) return undefined;
  // One sentence is enough for an index row; the page itself carries the rest.
  const sentenceEnd = flat.search(/\.\s/);
  const sentence = sentenceEnd > 40 ? flat.slice(0, sentenceEnd + 1) : flat;
  return sentence.replace(/\s*\.$/, '');
}

/**
 * "The Accordion component groups related content…" → "Groups related
 * content…". The row already names the component; the prefix spends the
 * summary's opening words saying so again.
 */
function stripSubjectPrefix(summary: string, name: string): string {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const stripped = summary
    .replace(new RegExp(`^(?:The\\s+)?\`?${escaped}\`?\\s+component\\s+`, 'i'), '')
    // "…component is used to highlight…" → "Used to highlight…"
    .replace(/^(?:is|are)\s+(?=\w)/i, match => (match === summary.slice(0, match.length) ? match : ''));
  return stripped === summary ? summary : stripped.charAt(0).toUpperCase() + stripped.slice(1);
}

function codeBlock(code: string, language = 'tsx'): string {
  return `\`\`\`${language}\n${code.replace(/\r\n/g, '\n').trim()}\n\`\`\``;
}

/** Shell steps are fenced as `bash` so an agent runs them rather than pasting them into a file. */
function snippetLanguage(code: string, variant?: string): string {
  if (variant === 'terminal') return 'bash';
  return /^\s*(?:npx|npm|yarn|pnpm|bun|expo|git)\s/.test(code) ? 'bash' : 'tsx';
}

function joinLines(lines: Array<string | null | undefined>): string {
  return lines.filter(line => line !== null && line !== undefined).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

// ---------------------------------------------------------------------------
// Source extraction
// ---------------------------------------------------------------------------

/**
 * Index of the next character that is code: skips comments and string
 * literals, whose brackets (`width >= breakpoints[bp]` in a JSDoc line) would
 * otherwise throw a bracket-depth scan off.
 */
function skipTrivia(source: string, index: number): number {
  let i = index;
  for (;;) {
    if (source.startsWith('/*', i)) {
      const end = source.indexOf('*/', i + 2);
      i = end === -1 ? source.length : end + 2;
    } else if (source.startsWith('//', i)) {
      const end = source.indexOf('\n', i);
      i = end === -1 ? source.length : end;
    } else if (source[i] === "'" || source[i] === '"' || source[i] === '`') {
      const quote = source[i];
      let j = i + 1;
      while (j < source.length && source[j] !== quote) j += source[j] === '\\' ? 2 : 1;
      i = j + 1;
    } else {
      return i;
    }
  }
}

/**
 * A named interface or type alias, verbatim with its member JSDoc, from the
 * first of `files` (absolute, or relative to packages/ui/src) that declares it.
 * The declaration's own leading comment is left out: in this codebase it is
 * usually maintainer notes, not API docs.
 *
 * Scanned rather than matched: an alias such as `type BaseProps<S> =
 * SpacingProps & { style?: …; testID?: … }` only ends at the `;` outside every
 * bracket, and a pattern stopping at the first line-ending `;` cut it in half.
 */
async function findDeclaration(name: string, files: string[]): Promise<string | null> {
  const head = new RegExp(`^(?:export\\s+)?(interface|type)\\s+${name}\\b`, 'm');
  for (const file of files) {
    const source = await readTextIfExists(path.isAbsolute(file) ? file : path.join(uiSrc, file));
    if (!source) continue;
    const match = head.exec(source);
    if (!match) continue;
    const isInterface = match[1] === 'interface';
    let depth = 0;
    let started = false;
    for (let i = match.index + match[0].length; i < source.length; i++) {
      i = skipTrivia(source, i);
      const ch = source[i];
      if (ch === '>' && source[i - 1] === '=') continue; // `=>` is not a bracket
      if ('{([<'.includes(ch)) { depth++; started = true; }
      else if ('})]>'.includes(ch)) depth--;
      if (depth !== 0) continue;
      if (isInterface && started && ch === '}') return source.slice(match.index, i + 1).trim();
      if (!isInterface && ch === ';') return source.slice(match.index, i + 1).trim();
    }
  }
  return null;
}

/**
 * A function's signature as a declaration (`export function f(a: A): R;`),
 * from the first of `files` that declares it — the same flattening the hook
 * pages use, so hand-written signatures never drift from the source.
 */
async function findSignature(name: string, files: string[]): Promise<string | null> {
  for (const file of files) {
    const source = await readTextIfExists(path.isAbsolute(file) ? file : path.join(uiSrc, file));
    if (!source) continue;
    const definition = extractHookDefinition(source, name);
    // The signature is the last block; any types it references come before.
    if (definition) return definition.split('\n\n').pop() ?? null;
  }
  return null;
}

/** The members of an interface body at depth one, each with the first line of its JSDoc. */
function topLevelMembers(declaration: string): Array<{ name: string; doc?: string }> {
  const body = declaration.slice(declaration.indexOf('{') + 1, declaration.lastIndexOf('}'));
  const members: Array<{ name: string; doc?: string }> = [];
  let depth = 0;
  let doc: string | undefined;
  let inDoc = false;
  let docDone = false;
  for (const line of body.split('\n')) {
    const trimmed = line.trim();
    if (depth === 0) {
      // A JSDoc block's first line of text, whether it opens on the `/**` line
      // or the one after.
      if (inDoc) {
        const text = trimmed.replace(/^\*\/?/, '').replace(/\*\/$/, '').trim();
        if (text.startsWith('@')) docDone = true;
        if (text && !docDone) doc = doc ? `${doc} ${text}` : text;
        if (trimmed.endsWith('*/')) inDoc = false;
        continue;
      }
      const jsdoc = trimmed.match(/^\/\*\*\s*(.*?)\s*(\*\/)?$/);
      if (jsdoc) {
        doc = jsdoc[1] ? jsdoc[1].trim() : undefined;
        inDoc = !jsdoc[2];
        docDone = false;
        continue;
      }
      const member = trimmed.match(/^(?:readonly\s+)?([A-Za-z_$][\w$]*)\??\s*:/);
      if (member) {
        // First sentence only: the index line, not the whole comment.
        const end = doc ? doc.search(/[.!?](?:\s|$)/) : -1;
        members.push({ name: member[1], doc: doc && end > 0 ? doc.slice(0, end + 1) : doc });
        doc = undefined;
      }
    }
    for (const ch of trimmed.replace(/\/\/.*$/, '').replace(/'[^']*'/g, '')) {
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
    }
  }
  return members;
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

/**
 * Guides — rendered from the same JSX-free config modules the pages import, so
 * the Markdown cannot drift from what the site shows. The theming, style-props
 * and icon guides have no site page; their reference halves are read straight
 * from the library source.
 */
async function buildGuidePages(uiVersion: string): Promise<LlmsPage[]> {
  const pages: LlmsPage[] = [];

  // Getting started
  pages.push({
    slug: 'guides/getting-started.md',
    title: 'Getting started',
    summary: GETTING_STARTED_SUBTITLE.replace(/\.$/, ''),
    routes: ['/getting-started'],
    body: joinLines([
      '# Getting started',
      '',
      GETTING_STARTED_SUBTITLE,
      '',
      `Docs: ${SITE_URL}/getting-started`,
      '',
      '**Prerequisites:**',
      '',
      ...GETTING_STARTED_PREREQUISITES.map(
        p => `- [${p.label} ${p.version}](${p.href}) — ${p.note}`
      ),
      '',
      ...GETTING_STARTED_STEPS.flatMap(step => [
        `## ${step.title}`,
        '',
        step.lead,
        '',
        step.fileName ? `\`${step.fileName}\`` : null,
        step.fileName ? '' : null,
        codeBlock(step.code, snippetLanguage(step.code, step.variant)),
        '',
        step.note ?? null,
        step.note ? '' : null,
      ]),
      `## ${TEMPLATES_TITLE}`,
      '',
      TEMPLATES_GUIDANCE,
      '',
      '```bash',
      TEMPLATES_CREATE_COMMAND,
      '```',
      '',
      ...STARTER_TEMPLATES.flatMap(t =>
        t.available
          ? [
              `- [${t.name}](${t.repo}) — ${t.description} (${t.tags.join(', ')})`,
              '',
              '  ```bash',
              `  ${getTemplateCreateCommand(t)}`,
              '  ```',
            ]
          : [`- ${t.name} (coming soon) — ${t.description} (${t.tags.join(', ')})`]
      ),
      '',
    ]),
  });

  pages.push(await buildThemingPage());
  pages.push(await buildSharedPropsPage());
  pages.push(buildIconsPage(uiVersion));

  // Accessibility
  pages.push({
    slug: 'guides/accessibility.md',
    title: 'Accessibility',
    summary: 'How plocks meets WCAG 2.1 AA for keyboard, screen reader, low-vision, and motion-sensitive users',
    routes: ['/accessibility'],
    body: joinLines([
      `# ${ACCESSIBILITY_TITLE}`,
      '',
      ACCESSIBILITY_INTRO,
      '',
      `Docs: ${SITE_URL}/accessibility`,
      '',
      ...ACCESSIBILITY_SECTIONS.flatMap(section => [
        `## ${section.title}`,
        '',
        section.lead,
        '',
        ...section.items.map(item => `- ${item}`),
        '',
      ]),
      `## ${ACCESSIBILITY_EXAMPLE_TITLE}`,
      '',
      ACCESSIBILITY_EXAMPLE_LEAD,
      '',
      codeBlock(ACCESSIBILITY_EXAMPLE_SNIPPET),
      '',
      ACCESSIBILITY_OUTRO,
    ]),
  });

  // Localization — prose lives in the English i18n bundle the page renders.
  const enBundle = await readJSONIfExists<JSONObject>(
    path.join(docsDir, 'i18n', 'locales', 'en', 'common.json'),
  );
  const localization = (enBundle?.localization ?? {}) as JSONObject;
  const steps = (localization.steps ?? {}) as Record<string, string>;
  if (localization.intro) {
    pages.push({
      slug: 'guides/localization.md',
      title: 'Localization',
      summary: toSummary(localization.intro),
      routes: ['/localization'],
      body: joinLines([
        `# ${localization.title ?? 'Localization'}`,
        '',
        String(localization.intro),
        '',
        `Docs: ${SITE_URL}/localization`,
        '',
        ...LOCALIZATION_STEPS.flatMap(step => [
          `## ${step.title}`,
          '',
          steps[step.key]?.trim() ?? null,
          steps[step.key] ? '' : null,
          `\`${step.fileName}\``,
          '',
          codeBlock(step.snippet),
          '',
        ]),
        '## Notes',
        '',
        ...LOCALIZATION_NOTE_KEYS.map(key => (steps[key] ? `- ${steps[key]}` : null)),
      ]),
    });
  }

  return pages;
}

/**
 * Theming — the prose and worked examples from config/theming.ts, then the
 * reference read from source: the provider's props, the theme's top-level
 * groups, and the mode config and hook return types.
 */
async function buildThemingPage(): Promise<LlmsPage> {
  const themeFiles = [
    'core/theme/PlocksProvider.tsx',
    'core/theme/ThemeProvider.tsx',
    'core/theme/ThemeModeProvider.tsx',
    'core/theme/types.ts',
  ];
  const [providerProps, themePair, modeConfig, modeValue, themeShape, ...signatures] = await Promise.all([
    findDeclaration('PlocksProviderProps', themeFiles),
    findDeclaration('PlocksThemePair', themeFiles),
    findDeclaration('ThemeModeConfig', themeFiles),
    findDeclaration('ThemeModeContextValue', themeFiles),
    findDeclaration('PlocksTheme', themeFiles),
    findSignature('useTheme', themeFiles),
    findSignature('useThemeMode', themeFiles),
    findSignature('createTheme', ['core/theme/utils.ts']),
  ]);
  const missing = [
    ['PlocksProviderProps', providerProps],
    ['PlocksThemePair', themePair],
    ['ThemeModeConfig', modeConfig],
    ['PlocksTheme', themeShape],
  ].filter(([, found]) => !found).map(([name]) => name);
  if (missing.length) console.warn(`⚠️  Theming guide: no declaration found for ${missing.join(', ')}`);

  const members = themeShape ? topLevelMembers(themeShape) : [];

  const body = joinLines([
    `# ${THEMING_TITLE}`,
    '',
    THEMING_INTRO,
    '',
    ...THEMING_SECTIONS.flatMap(section => [
      `## ${section.title}`,
      '',
      section.lead,
      '',
      section.fileName ? `\`${section.fileName}\`` : null,
      section.fileName ? '' : null,
      section.code ? codeBlock(section.code) : null,
      section.code ? '' : null,
    ]),
    '## Provider props',
    '',
    '`PlocksProvider` also mounts the overlay layer, i18n, direction, haptics, reduced motion and a safe-area provider; each has an opt-out below.',
    '',
    providerProps ? codeBlock(providerProps, 'ts') : null,
    '',
    members.length ? '## Theme object' : null,
    members.length ? '' : null,
    members.length ? '`useTheme()` returns a `PlocksTheme` with these top-level groups:' : null,
    members.length ? '' : null,
    ...members.map(member => `- \`${member.name}\`${member.doc ? ` — ${member.doc}` : ''}`),
    '',
    '## Types',
    '',
    codeBlock(
      [
        themePair,
        modeConfig,
        modeValue ? `// Returned by useThemeMode()\n${modeValue}` : null,
        ...signatures,
      ].filter(Boolean).join('\n\n'),
      'ts',
    ),
  ]);

  return {
    slug: 'guides/theming.md',
    title: THEMING_TITLE,
    summary: THEMING_SUBTITLE,
    body,
  };
}

/**
 * The prop bags components share and the token vocabulary their values use.
 * Component pages list only their own props and name the shared groups they
 * accept in one line, linking here, so this is the one place the groups are
 * spelled out — read from source every build.
 */
async function buildSharedPropsPage(): Promise<LlmsPage> {
  const uiFiles = [
    'core/theme/types.ts',
    'core/utils/layout.ts',
    'core/theme/radius.ts',
    'core/theme/shadow.ts',
    'core/types/base.ts',
    'core/theme/componentSize.ts',
    'core/theme/resolveColors.ts',
    'components/_internal/Field/fieldProps.ts',
    'components/_internal/Disclaimer/disclaimerUtils.tsx',
  ];
  const chartFiles = [
    path.join(chartsDir, 'src', 'types', 'base.ts'),
    path.join(chartsDir, 'src', 'core', 'ChartFill.tsx'),
  ];
  const chartTypes = await Promise.all(
    ['ChartDataPoint', 'ChartAxis', 'ChartGrid', 'ChartLegend', 'ChartTooltip', 'ChartAnimation', 'ChartAnnotation', 'ChartFill']
      .map(name => findDeclaration(name, chartFiles)),
  );
  const find = (name: string) => findDeclaration(name, uiFiles);
  const [
    spacing, box, radius, shadow, visibility, base,
    field, textField, disclaimer,
    chart, chartEvents,
    spacingValue, dimension, radiusValue, shadowValue, sizeValue, colorToken, color, breakpoint,
  ] = await Promise.all([
    find('SpacingProps'),
    find('BoxProps'),
    find('BorderRadiusProps'),
    find('ShadowProps'),
    find('VisibilityProps'),
    find('BaseProps'),
    find('FieldBaseProps'),
    find('TextFieldBaseProps'),
    find('DisclaimerSupport'),
    findDeclaration('BaseChartProps', chartFiles),
    findDeclaration('ChartInteractionCallbacks', chartFiles),
    find('SpacingValue'),
    find('DimensionProp'),
    find('RadiusValue'),
    find('ShadowValue'),
    find('ComponentSizeValue'),
    find('ThemeColorToken'),
    find('ThemeColor'),
    find('BreakpointToken'),
  ]);

  // `ComponentSize` is derived from a const array; spell the union out.
  const sizeSource = await readTextIfExists(path.join(uiSrc, 'core/theme/componentSize.ts'));
  const sizeTokens = sizeSource?.match(/COMPONENT_SIZE_BASE\s*=\s*\[([^\]]*)\]/)?.[1]
    .split(',').map(token => token.trim()).filter(Boolean).join(' | ');

  const block = (declarations: Array<string | null>) => {
    const found = declarations.filter(Boolean) as string[];
    return found.length ? codeBlock(found.join('\n\n'), 'ts') : '_Declarations were not found in the source._';
  };
  const tokens = [
    sizeTokens ? `/** Size tokens, smallest to largest (also exported as \`ComponentSize\`). */\nexport type SizeToken = ${sizeTokens};` : null,
    sizeValue ? `/** \`SizeValue\` is the same type. A number is read in px. */\n${sizeValue.replace(/\bComponentSize\b/g, 'SizeToken')}` : null,
    spacingValue,
    dimension,
    radiusValue,
    shadowValue,
    colorToken,
    color,
    breakpoint,
  ];

  const body = joinLines([
    '# Shared props and tokens',
    '',
    'Component pages list each component\'s own props, then name the shared groups it also accepts in one line — "Also accepts the shared props — field (…), spacing (…), …". The groups are defined here once.',
    '',
    '## Style props',
    '',
    'Every component takes the style props — spacing (`m`, `px`, …) and box props (`w`, `h`, `miw`, `maw`, `mih`, `mah`, `bg`, `opacity`) — plus the visibility props and `style` / `testID` (the base group). They apply to the component\'s root. Many also take `radius` and `shadow`. Values are theme tokens or numbers: `p="md"`, `mt={12}`, `w="full"`, `bg="subtle"`. Horizontal spacing (`ml`, `pl`, …) follows the leading and trailing edges, so it flips in right-to-left layouts. Each prop has only its short name — there is no `maxWidth` or `backgroundColor` spelling.',
    '',
    codeBlock(
      "import { Card, Text } from '@plocks/ui';\n\nexport function Demo() {\n  return (\n    <Card p=\"lg\" mt=\"md\" radius=\"lg\" shadow=\"sm\" w=\"full\" maw={480} bg=\"subtle\">\n      <Text fw={600} c=\"dimmed\">Spacing, size, background, radius and shadow come from the shared style props.</Text>\n    </Card>\n  );\n}",
    ),
    '',
    block([spacing, box, radius, shadow, visibility, base]),
    '',
    '`DimensionProp` is a number (dp / px), a percentage such as `\'50%\'`, `\'auto\'`, `\'full\'` (100%), or on web any CSS length.',
    '',
    '## Field props',
    '',
    'Form inputs — `Input`, `Select`, `Checkbox`, `Radio`, `Switch`, the pickers and the rest — share one field frame: label, description, error and helper text wired to the control for assistive technology. Text inputs add the text-field group (`value`, `onChangeText`, `placeholder`, `clearable`, sections). Inside a `Form.Field`, value, change handler and error are injected for you.',
    '',
    block([field, textField, disclaimer]),
    '',
    '## Chart props',
    '',
    'Every chart in `@plocks/charts` accepts the chart group (size, title, legend, tooltip, animation and accessibility options) and the chart event callbacks, on top of its own data props.',
    '',
    block([chart, chartEvents]),
    '',
    'The option types those props take — a chart\'s own data types are on its page:',
    '',
    block(chartTypes),
    '',
    '## Token types',
    '',
    block(tokens),
  ]);

  return {
    slug: 'guides/shared-props.md',
    title: 'Shared props and tokens',
    summary: 'The style, field and chart props many components accept — spacing, sizing, radius, shadow, label/error/helperText, chart options — and the size and color tokens their values use',
    body,
  };
}

/** Every name `<Icon name>` accepts, so an agent never has to guess one. */
function buildIconsPage(uiVersion: string): LlmsPage {
  const names = readIconNames(uiSrc);
  return {
    slug: 'guides/icons.md',
    title: 'Icons',
    summary: `The ${names.length} built-in icon names \`<Icon name>\` and \`IconButton\` accept, and how to use any other icon`,
    body: joinLines([
      '# Icons',
      '',
      ...iconUsageLines(uiVersion, names.length),
      '',
      '## Names',
      '',
      names.join(', '),
    ]),
  };
}

/** Contributing is for working on the library, not with it — listed under Optional. */
function buildContributingPage(): LlmsPage {
  // Its links are written for the site, where `/getting-started` is a router
  // push; in a Markdown file a bare path has nothing to resolve against, so
  // same-site hrefs are absolutized on the way out.
  const absolutize = (text: string) => text.replace(/\]\(\//g, `](${SITE_URL}/`);

  return {
    slug: 'guides/contributing.md',
    title: 'Contributing',
    summary: CONTRIBUTE_SUBTITLE.replace(/\.$/, ''),
    routes: ['/contribute'],
    body: joinLines([
      `# ${CONTRIBUTE_TITLE}`,
      '',
      CONTRIBUTE_SUBTITLE,
      '',
      `Docs: ${SITE_URL}/contribute`,
      '',
      absolutize(CONTRIBUTE_INTRO),
      '',
      '## Repo layout',
      '',
      ...CONTRIBUTE_REPO_LAYOUT.map(entry => `- \`${entry.path}\` — ${absolutize(entry.description)}`),
      '',
      ...CONTRIBUTE_SECTIONS.flatMap(section => [
        `## ${section.title}`,
        '',
        absolutize(section.lead),
        '',
        ...(section.items ?? []).map((item, index) =>
          section.ordered ? `${index + 1}. ${absolutize(item)}` : `- ${absolutize(item)}`),
        section.items ? '' : null,
        ...(section.snippets ?? []).flatMap(snippet => [
          snippet.lead ?? null,
          snippet.lead ? '' : null,
          snippet.fileName ? `\`${snippet.fileName}\`` : null,
          snippet.fileName ? '' : null,
          codeBlock(snippet.code, snippet.language ?? 'bash'),
          '',
        ]),
        section.note ? absolutize(section.note) : null,
        section.note ? '' : null,
      ]),
      absolutize(CONTRIBUTE_OUTRO),
    ]),
  };
}

/** One file per question, so an agent can fetch a single answer. */
function buildFaqPages(): LlmsPage[] {
  return FAQ_ITEMS.map(item => ({
    slug: `faq/${item.key}.md`,
    title: item.question,
    summary: toSummary(item.answer),
    body: joinLines([
      `# ${item.question}`,
      '',
      item.answer,
      '',
      `Docs: ${SITE_URL}/faq`,
    ]),
  }));
}

/**
 * The index row for a component: the curated `summary` frontmatter when there
 * is one, else the opening sentence of its description, else the frontmatter
 * one-liner, else the nav config's blurb — then the sub-components and hooks
 * documented on the same page, so a search for `RadioGroup` or `useToast`
 * lands on the right row. `packageNote` leads the row when there is one.
 */
function componentSummary(
  name: string,
  meta: JSONObject,
  config: CoreComponentConfig | undefined,
  packageNote?: string,
): string | undefined {
  const title = String(meta.title || name);
  const lead =
    (typeof meta.summary === 'string' && meta.summary.trim() ? meta.summary.trim().replace(/\.$/, '') : undefined)
    ?? toSummary(meta.description, title)
    ?? toSummary(meta.tagline, title)
    ?? config?.description?.replace(/\.$/, '');
  const described = lead ? stripSubjectPrefix(lead, title) : undefined;
  const summary = packageNote ? [packageNote, described].filter(Boolean).join(' — ') : described;

  const subs = Array.isArray(meta.subcomponents) ? (meta.subcomponents as string[]) : [];
  const hooks = Array.isArray(meta.relatedHooks) ? (meta.relatedHooks as string[]) : [];
  // Bare aliases (Text's H1–H6, P, …) would crowd the row; the page lists them.
  const also = [...subs.filter(sub => !/^(?:H\d|P)$/.test(sub)).slice(0, 5), ...hooks.slice(0, 3)];
  if (!also.length) return summary;
  const suffix = `Also: ${also.map(n => `\`${n}\``).join(', ')}${subs.length + hooks.length > also.length ? ', …' : ''}`;
  return summary ? `${summary}. ${suffix}` : suffix;
}

/**
 * Components and charts, sourced from the per-component Markdown
 * generate-demos.ts already builds for the docs app's "Copy Markdown" action,
 * plus its compact variant for llms-small.txt.
 */
async function buildComponentPages(): Promise<{ components: LlmsPage[]; charts: LlmsPage[] }> {
  const markdownIndex = await readJSONIfExists<Record<string, string>>(
    path.join(generatedDir, 'component-markdown.json'),
  );
  const compactIndex = (await readJSONIfExists<Record<string, string>>(
    path.join(generatedDir, 'component-markdown-compact.json'),
  )) ?? {};
  const meta = (await readJSONIfExists<Record<string, JSONObject>>(
    path.join(generatedDir, 'components-meta.json'),
  )) ?? {};

  if (!markdownIndex) {
    console.warn('⚠️  component-markdown.json not found — run `npm run demos:generate` first.');
    return { components: [], charts: [] };
  }

  // CORE_COMPONENTS is what the site's nav and /components page are built from,
  // so it decides both which components are published and how they are grouped.
  const configByName = new Map<string, CoreComponentConfig>(
    CORE_COMPONENTS.map(entry => [entry.name, entry]),
  );

  const components: LlmsPage[] = [];
  const charts: LlmsPage[] = [];

  for (const name of Object.keys(markdownIndex).sort((a, b) => a.localeCompare(b))) {
    const config = configByName.get(name);
    const componentMeta = meta[name] ?? {};
    const isChart = config?.category === 'charts' || componentMeta.category === 'charts';
    // Charts are grouped under a heading naming their package. A component from
    // another add-on package (`@plocks/dates`, …) sits with the rest, so its row
    // names the package it has to be installed from.
    const packageName = typeof componentMeta.packageName === 'string' ? componentMeta.packageName : UI_PACKAGE;
    const packageNote = !isChart && packageName !== UI_PACKAGE ? `\`${packageName}\`` : undefined;
    const page: LlmsPage = {
      slug: `components/${name}.md`,
      // The export name, not the display title ("AreaChart", not "Area Chart"):
      // it is what an agent searches the index for and what it imports.
      title: name,
      summary: componentSummary(name, componentMeta, config, packageNote),
      body: markdownIndex[name],
      compact: compactIndex[name],
      routes: [`/${packageName.replace(/^@plocks\//, '')}/${name}`],
    };
    (isChart ? charts : components).push(page);
  }

  return { components, charts };
}

/**
 * Resolves the file that actually declares a hook.
 *
 * Starts at the package barrel (`src/index.ts`) and follows the re-export that
 * names the hook one hop at a time — through `./hooks`, a hook folder's
 * `index.ts`, or straight into `core/` for hooks whose docs folder holds only
 * meta and demos — until a file declares it. So the Definition block and the
 * Source link point at the implementation, never at a barrel.
 */
async function resolveHookSource(name: string): Promise<{ source: string; file: string } | null> {
  const declares = (source: string) =>
    new RegExp(`^export\\s+(?:function|const)\\s+${name}\\b`, 'm').test(source);

  const resolveModule = async (from: string, specifier: string): Promise<string | null> => {
    const base = path.resolve(path.dirname(from), specifier);
    for (const candidate of [`${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')]) {
      if ((await readTextIfExists(candidate)) !== null) return candidate;
    }
    return null;
  };

  // Depth-first: a named re-export of the hook is followed first; `export *`
  // barrels (core/i18n) are searched only when there is none.
  const queue = [path.join(uiDir, 'src', 'index.ts')];
  const seen = new Set<string>();

  while (queue.length) {
    const current = queue.shift()!;
    if (seen.has(current)) continue;
    seen.add(current);
    const source = await readTextIfExists(current);
    if (!source) continue;
    if (declares(source)) return { source, file: current };

    // `export { name, type Foo } from './somewhere';` — follow the one that
    // re-exports this hook.
    const reExport = [...source.matchAll(/export\s*\{([^}]*)\}\s*from\s*'([^']+)'/g)]
      .find(match => match[1].split(',').some(part => part.trim().replace(/^type\s+/, '') === name));
    if (reExport) {
      const next = await resolveModule(current, reExport[2]);
      if (next) queue.unshift(next);
      continue;
    }

    for (const star of source.matchAll(/export\s*\*\s*from\s*'([^']+)'/g)) {
      const next = await resolveModule(current, star[1]);
      if (next) queue.push(next);
    }
  }

  return null;
}

/**
 * Pulls a hook's public surface out of its source: its signature plus the
 * exported types that signature names. This is the part an agent needs most —
 * hooks have no equivalent of the components' generated props tables.
 *
 * Scoped to the types the signature actually references, because several hooks
 * are declared alongside unrelated siblings in useHotkeys/index.ts.
 */
function extractHookDefinition(source: string, name: string): string | null {
  const signatureMatch =
    source.match(new RegExp(`^export\\s+function\\s+${name}\\b[\\s\\S]*?\\)\\s*(?::\\s*[^{]+?)?\\s*\\{`, 'm'))
    ?? source.match(new RegExp(`^export\\s+const\\s+${name}\\b[^=]*=\\s*[\\s\\S]*?\\)\\s*(?::\\s*[^=]+?)?\\s*=>`, 'm'));
  if (!signatureMatch) return null;

  // Flattened to one line: a multi-line parameter list reads worse than a
  // single signature once the body is gone.
  // A const arrow is written as a function declaration — `export const useX =
  // <T>(a: A): R;` is not valid TypeScript, `export function useX<T>(a: A): R;` is.
  const signature = `${signatureMatch[0]
    .replace(/\s*(?:\{|=>)$/, '')
    .replace(/\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/,?\s+\)/g, ')')
    .replace(/^export const (\w+)[^=]*=\s*(?:async\s+)?/, 'export function $1')
    .trim()};`;

  // Exported interfaces and type aliases, kept whole so the member JSDoc
  // travels with them. Braced forms are matched before the `= ...;` form so a
  // one-line alias never swallows the file down to the next column-0 `}`.
  const declarations = new Map<string, string>();
  const patterns = [
    /^export\s+interface\s+(\w+)(?:<[^>]*>)?[^{]*\{[\s\S]*?^\}/gm,
    /^export\s+type\s+(\w+)(?:<[^>]*>)?\s*=\s*\{[\s\S]*?^\}/gm,
    /^export\s+type\s+(\w+)(?:<[^>]*>)?\s*=[^;]*?;$/gm,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      if (!declarations.has(match[1])) declarations.set(match[1], match[0].trim());
    }
  }

  // Follow references transitively: a hook returning `UseDisclosureReturn` is
  // only readable if the alias it points at comes along too.
  const included: string[] = [];
  const pending = [signature];
  while (pending.length) {
    const text = pending.shift()!;
    for (const [typeName, declaration] of declarations) {
      if (included.includes(typeName)) continue;
      if (!new RegExp(`\\b${typeName}\\b`).test(text)) continue;
      included.push(typeName);
      pending.push(declaration);
    }
  }

  return [...included.map(typeName => declarations.get(typeName)!), signature].join('\n\n');
}

async function buildHookPages(): Promise<LlmsPage[]> {
  const hooksMeta = (await readJSONIfExists<Record<string, JSONObject>>(
    path.join(generatedDir, 'hooks-meta.json'),
  )) ?? {};
  const hooksJson = (await readJSONIfExists<{ hooks: Array<Record<string, any>> }>(
    path.join(generatedDir, 'hooks.json'),
  )) ?? { hooks: [] };

  const names = Object.keys(hooksMeta).sort((a, b) => a.localeCompare(b));
  if (!names.length) {
    console.warn('⚠️  hooks-meta.json not found or empty — run `npm run demos:generate` first.');
    return [];
  }

  const demosByHook = new Map<string, Array<Record<string, any>>>();
  for (const demo of hooksJson.hooks) {
    if (demo.hidden) continue;
    const hook = demo.component as string | undefined;
    if (!hook) continue;
    if (!demosByHook.has(hook)) demosByHook.set(hook, []);
    demosByHook.get(hook)!.push(demo);
  }

  const pages: LlmsPage[] = [];
  const missingDefinitions: string[] = [];
  for (const name of names) {
    const meta = hooksMeta[name];
    if (meta.hidden === true) continue;

    const resolved = await resolveHookSource(name);
    const sourcePath = resolved
      ? path.relative(repoRoot, resolved.file).split(path.sep).join('/')
      : `packages/ui/src/hooks/${name}`;
    const definition = resolved ? extractHookDefinition(resolved.source, name) : null;
    if (!definition) missingDefinitions.push(name);

    const importLine = `- Import: \`import { ${name} } from '@plocks/ui';\``;
    const metaList: string[] = [importLine];
    if (meta.status && meta.status !== 'stable') metaList.push(`- Status: ${meta.status}`);
    if (Array.isArray(meta.tags) && meta.tags.length) {
      metaList.push(`- Tags: ${(meta.tags as string[]).join(', ')}`);
    }
    metaList.push(`- Docs: ${SITE_URL}/hooks/${name}`);
    metaList.push(`- Source: ${GITHUB_TREE}/${sourcePath}`);

    const demos = (demosByHook.get(name) ?? []).sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
    const renderDemo = (demo: Record<string, any>) => [
      `### ${demo.title || demo.demo}`,
      '',
      demo.description ? String(demo.description) : null,
      demo.description ? '' : null,
      demo.code ? codeBlock(demo.code) : null,
      '',
    ];
    const title = String(meta.title || name);
    const description = meta.description ? String(meta.description) : null;

    pages.push({
      slug: `hooks/${name}.md`,
      title,
      summary: toSummary(meta.description, title),
      routes: [`/hooks/${name}`],
      body: joinLines([
        `# ${title}`,
        '',
        description,
        '',
        '## Metadata',
        '',
        ...metaList,
        '',
        definition ? '## Definition' : null,
        definition ? '' : null,
        definition ? codeBlock(definition, 'ts') : null,
        definition ? '' : null,
        demos.length ? '## Examples' : null,
        demos.length ? '' : null,
        ...demos.flatMap(renderDemo),
      ]),
      compact: joinLines([
        `# ${title}`,
        '',
        description ? description.split(/\n\s*\n/)[0] : null,
        '',
        '## Metadata',
        '',
        importLine,
        `- Full page: ${SITE_URL}/llms/hooks/${name}.md`,
        '',
        definition ? '## Definition' : null,
        definition ? '' : null,
        definition ? codeBlock(definition, 'ts') : null,
        definition ? '' : null,
        demos.length ? '## Example' : null,
        demos.length ? '' : null,
        ...(demos.length ? renderDemo(demos[0]) : []),
      ]),
    });
  }

  if (missingDefinitions.length) {
    console.warn(`⚠️  No type definition found for: ${missingDefinitions.join(', ')}`);
  }

  return pages;
}

// ---------------------------------------------------------------------------
// Index + full text
// ---------------------------------------------------------------------------

function pageUrl(page: LlmsPage): string {
  return `${SITE_URL}/llms/${page.slug}`;
}

/**
 * What every agent needs before any page: the packages and the version these
 * docs describe, the library-wide conventions, and which of two similar
 * components to use. Plain lists with bold labels rather than headings — the
 * llms.txt format reserves headings for the link sections that follow.
 */
function guidanceLines(packages: WorkspacePackage[]): string[] {
  const addOns = packages.filter(pkg => pkg.name !== UI_PACKAGE).map(pkg => `\`${pkg.name}\``);
  return [
    `Install: \`npm install ${UI_PACKAGE}\`${addOns.length ? ` — separate packages, installed alongside it: ${addOns.join(', ')}. A component page's Import line names the package it comes from.` : ''}`,
    `Version: generated from the \`${GITHUB_BRANCH}\` branch — ${packages.map(pkg => `\`${pkg.name}\` ${pkg.version}`).join(', ')}. The branch can be ahead of the latest npm release; if an API here is missing from your installed version, check the changelog: ${GITHUB_TREE}/changelog`,
    `Website: ${SITE_URL} • GitHub: ${GITHUB_REPO} • npm: ${NPM_PACKAGE}`,
    '',
    '**Conventions**',
    '',
    ...LLMS_CONVENTIONS.map(rule => `- ${rule}`),
    '',
    '**Choosing between similar components**',
    '',
    ...LLMS_CHOOSING.map(choice => `- ${choice.need}: ${choice.options}`),
    '',
  ];
}

/** Rough token count for the index's file descriptions (~3.8 characters per token on this content). */
function approxTokens(text: string): string {
  return `~${Math.max(5, Math.round(text.length / 3.8 / 5000) * 5)}k tokens`;
}

function buildIndex(
  sections: LlmsSection[],
  counts: Record<string, number>,
  packages: WorkspacePackage[],
  sizes: { small: string; full: string },
): string {
  const lines: string[] = [
    '# plocks',
    '',
    `> A cross-platform React Native UI library — ${counts.components} components, ${counts.charts} charts,`,
    `> and ${counts.hooks} hooks that render natively on iOS and Android and as real DOM on the web,`,
    '> from one themeable component model.',
    '',
    'This index lists plocks documentation pages formatted for LLMs.',
    'Each link points to a standalone Markdown file under the /llms path; any docs URL',
    `with \`.md\` appended (${SITE_URL}/ui/Button.md) serves the same file.`,
    '',
    'Whole-library files:',
    `- ${LLMS_SMALL_URL} (${sizes.small}) — every component, chart and hook: imports, own props, one example each. Loads the whole API at once.`,
    `- ${LLMS_FULL_URL} (${sizes.full}) — every page in full, nothing truncated. Larger than most context windows; suited to search and embedding.`,
    '',
    `Agent skills for Claude Code, Cursor and others: ${LLMS_SKILLS_REPO_URL} (\`npx skills add ${LLMS_SKILLS_REPO_URL} --skill plocks-setup\`)`,
    '',
    ...guidanceLines(packages),
  ];

  for (const section of sections) {
    if (!section.pages.length) continue;
    lines.push(`## ${section.heading}`, '');
    for (const page of section.pages) {
      const summary = page.summary ? `: ${page.summary}` : '';
      lines.push(`- [${page.title}](${pageUrl(page)})${summary}`);
    }
    lines.push('');
  }

  return `${lines.join('\n').trimEnd()}\n`;
}

function buildFullText(
  sections: LlmsSection[],
  packages: WorkspacePackage[],
  variant: 'full' | 'small',
): string {
  const parts: string[] = variant === 'full'
    ? [
      '# plocks — Complete Documentation',
      '',
      'Every documentation page concatenated in full: component and chart pages with',
      'their props, sub-components and every example, hook pages with their type',
      'definitions, the guides, and the FAQ. Nothing here is truncated.',
      '',
      `For an index of the same content as individually fetchable pages, use ${SITE_URL}/llms.txt.`,
      `For one file sized to a context window, use ${LLMS_SMALL_URL}.`,
      '',
      `Every example is a complete module that imports from the published packages (${packages.map(pkg => pkg.name).join(', ')}).`,
      '',
    ]
    : [
      '# plocks — API Reference (compact)',
      '',
      'Every component, chart and hook in one file: import line, own props with a',
      'one-sentence description, sub-components, and one complete example each.',
      'Each entry links its full page, which adds every example and the longer',
      'prop descriptions.',
      '',
      `Index of individual pages: ${SITE_URL}/llms.txt • Everything in full: ${LLMS_FULL_URL}`,
      '',
    ];
  parts.push(...guidanceLines(packages), '='.repeat(80), '');

  for (const section of sections) {
    const pages = variant === 'small' ? section.pages.filter(page => page.compact) : section.pages;
    if (!pages.length) continue;
    // Upper-cased so section breaks stand apart from the pages' own `#` titles;
    // a parenthesized package name keeps its case.
    parts.push(`# ${section.heading.replace(/^[^(]+/, label => label.toUpperCase())}`, '');
    for (const page of pages) {
      const body = variant === 'small' ? page.compact! : page.body;
      parts.push(`<!-- source: ${pageUrl(page)} -->`, '', body.trim(), '', '-'.repeat(80), '');
    }
  }

  return `${parts.join('\n').trimEnd()}\n`;
}

// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const packages = listWorkspacePackages(repoRoot);
  const uiVersion = packages.find(pkg => pkg.name === UI_PACKAGE)?.version ?? 'unknown';

  const [guides, faq, { components, charts }, hooks] = await Promise.all([
    buildGuidePages(uiVersion),
    Promise.resolve(buildFaqPages()),
    buildComponentPages(),
    buildHookPages(),
  ]);

  // The guides an agent needs to write code go into llms-small.txt whole;
  // accessibility and localization stay in the index and the full file.
  const smallGuides = new Set(['guides/getting-started.md', 'guides/theming.md', 'guides/shared-props.md', 'guides/icons.md']);
  for (const guide of guides) {
    if (smallGuides.has(guide.slug)) guide.compact = guide.body;
  }

  const sections: LlmsSection[] = [
    { heading: 'Guides', pages: guides },
    { heading: 'Components', pages: components },
    { heading: `Charts (${CHARTS_PACKAGE})`, pages: charts },
    { heading: 'Hooks', pages: hooks },
    // llms.txt's reserved section: links an agent can skip when context is short.
    { heading: 'Optional', pages: [buildContributingPage(), ...faq] },
  ];

  const pages = sections.flatMap(section => section.pages);

  await fs.mkdir(llmsDir, { recursive: true });
  await writePages(pages);

  const small = buildFullText(sections, packages, 'small');
  await fs.writeFile(path.join(publicDir, 'llms-small.txt'), small, 'utf8');

  const full = buildFullText(sections, packages, 'full');
  await fs.writeFile(path.join(publicDir, 'llms-full.txt'), full, 'utf8');

  const index = buildIndex(sections, {
    components: components.length,
    charts: charts.length,
    hooks: hooks.length,
  }, packages, { small: approxTokens(small), full: approxTokens(full) });
  await fs.writeFile(path.join(publicDir, 'llms.txt'), index, 'utf8');

  // Route → Markdown map for the web build's post-processing
  // (apps/docs/scripts/inject-seo-tags.ts), which serves each
  // page at `<route>.md` and links it from the page's <head>.
  const routes = Object.fromEntries(
    pages.flatMap(page => (page.routes ?? []).map(route => [route, `llms/${page.slug}`])),
  );
  await fs.mkdir(generatedDir, { recursive: true });
  await fs.writeFile(path.join(generatedDir, 'llms-routes.json'), `${JSON.stringify(routes, null, 2)}\n`, 'utf8');

  console.log('✅ llms.txt generated');
  for (const section of sections) {
    if (section.pages.length) console.log(`   ${section.heading}: ${section.pages.length} pages`);
  }
  console.log(`   Index: ${(index.length / 1024).toFixed(1)} KB (${approxTokens(index)}) → public/llms.txt`);
  console.log(`   Small: ${(small.length / 1024).toFixed(1)} KB (${approxTokens(small)}) → public/llms-small.txt`);
  console.log(`   Full:  ${(full.length / 1024).toFixed(1)} KB (${approxTokens(full)}) → public/llms-full.txt`);
  console.log(`   Pages: ${pages.length} files → public/llms/`);
}

main().catch(error => {
  console.error('❌ Failed to generate llms.txt', error);
  process.exitCode = 1;
});
