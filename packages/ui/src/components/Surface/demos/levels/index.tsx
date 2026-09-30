import { Block, Surface, Text } from '@plocks/ui';

const LEVELS = [0, 1, 2, 3] as const;

export function Demo() {
  return (
    <Block fullWidth>
      {LEVELS.map((level) => (
        <Surface key={level} level={level} padding="md" radius="lg" fullWidth>
          <Text size="sm">Level {level}</Text>
        </Surface>
      ))}
    </Block>
  );
}
