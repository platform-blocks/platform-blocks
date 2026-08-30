import { Block, Surface, Text } from '@platform-blocks/react-ui-library';

const LEVELS = [
  { level: 0 as const, label: 'Level 0 — the page' },
  { level: 1 as const, label: 'Level 1 — resting content' },
  { level: 2 as const, label: 'Level 2 — floating over content' },
  { level: 3 as const, label: 'Level 3 — takes over the screen' },
];

export function Demo() {
  return (
    <Block fullWidth>
      {LEVELS.map(({ level, label }) => (
        <Surface key={level} level={level} padding="md" radius="lg" fullWidth>
          <Text size="sm">{label}</Text>
        </Surface>
      ))}
    </Block>
  );
}
