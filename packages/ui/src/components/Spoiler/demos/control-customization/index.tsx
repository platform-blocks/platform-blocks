import { Block, Spoiler, Text } from '@platform-blocks/ui';

const longText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';

export function Demo() {
  return (
    <Block fullWidth>
      <Block>
        <Text size="sm" c="muted">Default control</Text>
        <Spoiler mah={60}>
          <Text>{longText}</Text>
        </Spoiler>
      </Block>

      <Block>
        <Text size="sm" c="muted">
          Uppercase tracked control
        </Text>
        <Spoiler
          mah={60}
          controlProps={{ tt: 'uppercase', lts: 1.5, fw: '700', size: 'xs' }}
        >
          <Text>{longText}</Text>
        </Spoiler>
      </Block>

      <Block>
        <Text size="sm" c="muted">
          Monospace control
        </Text>
        <Spoiler mah={60} controlProps={{ ff: 'monospace', fw: '600' }}>
          <Text>{longText}</Text>
        </Spoiler>
      </Block>
    </Block>
  );
}
