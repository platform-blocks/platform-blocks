import { Block, Spoiler, Text } from '@platform-blocks/react-ui-library';

const longText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';

export function Demo() {
  return (
    <Block>
      <Block>
        <Text size="sm" color="muted">Default control</Text>
        <Spoiler maxHeight={60}>
          <Text>{longText}</Text>
        </Spoiler>
      </Block>

      <Block>
        <Text size="sm" color="muted">
          Uppercase tracked control
        </Text>
        <Spoiler
          maxHeight={60}
          showLabel="Read more"
          hideLabel="Hide"
          controlProps={{ uppercase: true, tracking: 1.5, weight: '700', size: 'xs' }}
        >
          <Text>{longText}</Text>
        </Spoiler>
      </Block>

      <Block>
        <Text size="sm" color="muted">
          Monospace control
        </Text>
        <Spoiler
          maxHeight={60}
          showLabel="$ expand"
          hideLabel="$ collapse"
          controlProps={{ ff: 'monospace', weight: '600' }}
        >
          <Text>{longText}</Text>
        </Spoiler>
      </Block>
    </Block>
  );
}
