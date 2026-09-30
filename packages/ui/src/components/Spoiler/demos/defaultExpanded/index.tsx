import { Block, Spoiler, Text } from '@plocks/ui';

const content =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

export function Demo() {
  return (
    <Block fullWidth>
      <Block>
        <Text variant="small" c="secondary">Initially open</Text>
        <Spoiler mah={48} defaultExpanded>
          <Text>{content}</Text>
        </Spoiler>
      </Block>
      <Block>
        <Text variant="small" c="secondary">Initially closed</Text>
        <Spoiler mah={48}>
          <Text>{content}</Text>
        </Spoiler>
      </Block>
    </Block>
  );
}
