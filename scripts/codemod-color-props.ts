/**
 * Renames the deprecated color props to their canonical spellings.
 *
 *   npm run codemod:color-props -- <paths…>          rewrite in place
 *   npm run codemod:color-props -- --dry <paths…>    preview, change nothing
 *   npm run codemod:color-props -- --check <paths…>  exit 1 if anything is stale
 *
 * `--exclude <substring>` skips paths containing it, repeatable — useful for
 * tests that deliberately exercise the deprecated spelling.
 *
 * Shipped in the repo so downstream consumers can run it against their own app:
 *
 *   npx tsx node_modules/@platform-blocks/react-ui-library/scripts/codemod-color-props.ts src
 *
 * Parses with the TypeScript compiler so it only touches real JSX attributes —
 * a regex would also hit the words in strings, comments, and prop names that
 * merely start the same way. Edits are applied as text ranges, back to front,
 * so every byte outside the renamed identifier is preserved verbatim.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { extname, join } from 'path';
import ts from 'typescript';

/** Rename an attribute only on these tags. `null` = any tag. */
interface Rule {
  from: string;
  to: string;
  tags: string[] | null;
  note?: string;
}

const RULES: Rule[] = [
  // `colorVariant` was only ever the color prop, on every component that had it.
  { from: 'colorVariant', to: 'color', tags: null },

  // `sev` is a behavior prop (it also picks the icon and the haptic), so it keeps
  // its own name — just not an abbreviated one.
  { from: 'sev', to: 'severity', tags: ['Alert', 'Notice', 'Toast'] },

  // `tone` names a semantic color role; `color` is what every other component
  // calls that.
  { from: 'tone', to: 'color', tags: ['MenuItemButton'] },
  { from: 'hoverTone', to: 'hoverColor', tags: ['MenuItemButton'] },
  { from: 'activeTone', to: 'activeColor', tags: ['MenuItemButton'] },

  // Renamed away from the collision with `theme.colorScheme`, which means
  // light/dark. AudioPlayer and BrandIcon keep `colorScheme` — theirs really is
  // the light/dark one.
  { from: 'colorScheme', to: 'color', tags: ['Slider', 'RangeSlider', 'Joystick'] },
];

/**
 * Keys renamed inside object literals — slot props (`labelProps={{ … }}`) and
 * the imperative toast API (`toast.show({ … })`). Only names that are
 * unambiguous everywhere belong here, since this rule has no tag to scope by.
 */
const OBJECT_KEY_RULES: { from: string; to: string }[] = [
  { from: 'sev', to: 'severity' },
  { from: 'colorVariant', to: 'color' },
];

const SKIP_DIRS = new Set(['node_modules', 'lib', '.git', '.expo', 'build', 'coverage']);

/** Generated docs output. Matched on the path, not the bare name — `app/llms/` is source. */
const SKIP_PATHS = ['public/llms'];

/** Build output, whatever it is called — `dist`, `dist-perf`, `dist-web`, … */
const isBuildDir = (name: string) => name === 'dist' || name.startsWith('dist-');
const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts']);

interface Edit {
  start: number;
  end: number;
  text: string;
  label: string;
}

function collectFiles(target: string, exclude: string[], out: string[] = []): string[] {
  if ([...exclude, ...SKIP_PATHS].some((frag) => target.includes(frag))) return out;

  const stat = statSync(target);
  if (stat.isFile()) {
    if (EXTS.has(extname(target))) out.push(target);
    return out;
  }
  for (const entry of readdirSync(target, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name) && !isBuildDir(entry.name) && !entry.name.startsWith('.')) {
        collectFiles(join(target, entry.name), exclude, out);
      }
    } else if (EXTS.has(extname(entry.name))) {
      const path = join(target, entry.name);
      if (![...exclude, ...SKIP_PATHS].some((frag) => path.includes(frag))) out.push(path);
    }
  }
  return out;
}

/** `Menu.Item` → the trailing `Item`, so member-expression tags match by name. */
function tagName(node: ts.JsxOpeningLikeElement): string {
  const raw = node.tagName.getText();
  const dot = raw.lastIndexOf('.');
  return dot === -1 ? raw : raw.slice(dot + 1);
}

function planEdits(source: ts.SourceFile): { edits: Edit[]; conflicts: string[] } {
  const edits: Edit[] = [];
  const conflicts: string[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = tagName(node);
      const present = new Set(
        node.attributes.properties
          .filter(ts.isJsxAttribute)
          .map((a) => a.name.getText()),
      );

      for (const attr of node.attributes.properties) {
        if (!ts.isJsxAttribute(attr)) continue;
        const name = attr.name.getText();
        const rule = RULES.find(
          (r) => r.from === name && (r.tags === null || r.tags.includes(tag)),
        );
        if (!rule) continue;

        // Renaming onto a prop the element already sets would produce a
        // duplicate attribute. The canonical one already wins at runtime, so
        // the alias is redundant — but deleting code is the author's call.
        if (present.has(rule.to)) {
          const { line } = source.getLineAndCharacterOfPosition(attr.getStart(source));
          conflicts.push(
            `${source.fileName}:${line + 1}  <${tag}> sets both \`${rule.from}\` and \`${rule.to}\` — ` +
              `remove \`${rule.from}\` by hand (\`${rule.to}\` already wins).`,
          );
          continue;
        }

        edits.push({
          start: attr.name.getStart(source),
          end: attr.name.getEnd(),
          text: rule.to,
          label: `<${tag}> ${rule.from} → ${rule.to}`,
        });
      }
    }

    if (ts.isPropertyAssignment(node) || ts.isShorthandPropertyAssignment(node)) {
      const key = ts.isShorthandPropertyAssignment(node) ? node.name : node.name;
      if (ts.isIdentifier(key) || ts.isStringLiteral(key)) {
        const rule = OBJECT_KEY_RULES.find((r) => r.from === key.text);
        if (rule) {
          // A shorthand `{ sev }` has to become `{ severity: sev }` to keep
          // referring to the same binding.
          const replacement = ts.isShorthandPropertyAssignment(node)
            ? `${rule.to}: ${key.text}`
            : ts.isStringLiteral(key)
              ? `'${rule.to}'`
              : rule.to;
          edits.push({
            start: key.getStart(source),
            end: key.getEnd(),
            text: replacement,
            label: `{ ${rule.from} } → { ${rule.to} }`,
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(source);
  return { edits, conflicts };
}

function apply(text: string, edits: Edit[]): string {
  // Back to front, so earlier offsets stay valid.
  const ordered = [...edits].sort((a, b) => b.start - a.start);
  let out = text;
  for (const edit of ordered) {
    out = out.slice(0, edit.start) + edit.text + out.slice(edit.end);
  }
  return out;
}

function main(): void {
  const argv = process.argv.slice(2);
  const dry = argv.includes('--dry');
  const check = argv.includes('--check');
  const verbose = argv.includes('--verbose');

  const exclude: string[] = [];
  const targets: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--exclude') {
      const frag = argv[++i];
      if (!frag) {
        console.error('--exclude needs a path substring');
        process.exit(2);
      }
      exclude.push(frag);
    } else if (!argv[i].startsWith('--')) {
      targets.push(argv[i]);
    }
  }

  if (targets.length === 0) {
    console.error('usage: codemod-color-props.ts [--dry|--check] [--verbose] [--exclude <frag>…] <paths…>');
    process.exit(2);
  }

  const files = targets.flatMap((t) => collectFiles(t, exclude));
  const counts = new Map<string, number>();
  const allConflicts: string[] = [];
  let changedFiles = 0;
  let totalEdits = 0;

  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    // Cheap prefilter: parsing every file in a large app is the slow part.
    if (!RULES.some((r) => text.includes(r.from)) && !OBJECT_KEY_RULES.some((r) => text.includes(r.from))) {
      continue;
    }

    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const { edits, conflicts } = planEdits(source);
    allConflicts.push(...conflicts);
    if (edits.length === 0) continue;

    changedFiles++;
    totalEdits += edits.length;
    for (const e of edits) counts.set(e.label, (counts.get(e.label) ?? 0) + 1);
    if (verbose) console.log(`${file}  (${edits.length})`);

    if (!dry && !check) writeFileSync(file, apply(text, edits));
  }

  for (const [label, n] of [...counts].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(5)}  ${label}`);
  }

  const verb = dry || check ? 'would rewrite' : 'rewrote';
  console.log(`\n${verb} ${totalEdits} attribute(s) across ${changedFiles} file(s) (${files.length} scanned).`);

  if (allConflicts.length > 0) {
    console.log(`\n${allConflicts.length} site(s) need a human — both spellings are set:`);
    for (const c of allConflicts) console.log(`  ${c}`);
  }

  if (check && (totalEdits > 0 || allConflicts.length > 0)) process.exit(1);
}

main();
