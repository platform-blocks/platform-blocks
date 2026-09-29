/**
 * The built-in icon registry, as published to agents.
 *
 * Shared by generate-skills.ts (the skills' `references/icons.md`) and
 * generate-llms.ts (`/llms/guides/icons.md`), so both describe the same names
 * and the same fallback for anything outside them.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

/** Every icon name registered in the default Tabler-backed registry. */
export function readIconNames(uiSrc: string): string[] {
  const file = join(uiSrc, 'components', 'Icon', 'icons', 'tabler.ts');
  const source = readFileSync(file, 'utf8');
  const names = new Set<string>();
  // Registry entries are `name: <svg path data>` at one indent level.
  for (const match of source.matchAll(/^\s{2}'?([A-Za-z][A-Za-z0-9-]*)'?\s*:/gm)) {
    names.add(match[1]);
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

/** How `name` resolves and what to do outside the registry — prose plus one snippet. */
export function iconUsageLines(version: string, count: number): string[] {
  return [
    `\`@platform-blocks/ui@${version}\` registers ${count} icons by default,`,
    'backed by `@tabler/icons-react-native`. These are the only strings `name`',
    'accepts out of the box — anything else renders nothing, so **do not guess an',
    'icon name**; pick one from this list or pass a component instead.',
    '',
    '```tsx',
    "import { Icon, IconButton } from '@platform-blocks/ui';",
    '',
    '<Icon name="check" size="sm" />',
    '<IconButton icon="trash" onPress={remove} accessibilityLabel="Delete" />',
    '',
    '// Not in the registry? Pass any icon component or element instead:',
    "import { IconRocket } from '@tabler/icons-react-native';",
    '<IconButton icon={IconRocket} onPress={launch} accessibilityLabel="Launch" />',
    '```',
    '',
    'There is no public API for registering additional names —',
    '`registerIcon` / `registerIcons` exist in the source but are not exported',
    'from the package root or from `@platform-blocks/ui/Icon`. Pass a component',
    'for anything outside this list.',
  ];
}
