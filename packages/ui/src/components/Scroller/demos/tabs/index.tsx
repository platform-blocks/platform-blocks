import { Block, Chip, Scroller } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Scroller>
        {Array.from({ length: 16 }, (_, i) => (
          <Chip key={i} m="xs">
            Section {i + 1}
          </Chip>
        ))}
      </Scroller>
    </Block>
  );
}
