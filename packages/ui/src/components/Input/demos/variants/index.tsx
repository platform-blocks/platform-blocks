import { Block, Input } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <Block>
      <Input variant="default" label="Default" placeholder="user@example.com" />
      <Input variant="filled" label="Filled" placeholder="user@example.com" />
      <Input variant="outline" label="Outline" placeholder="user@example.com" />
      <Input variant="unstyled" placeholder="Unstyled — type to edit inline" />
    </Block>
  );
}
