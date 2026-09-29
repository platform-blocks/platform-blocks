import { Block, Text } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block gap="lg">
      <Block>
        <Text c="primary">primary</Text>
        <Text c="secondary">secondary</Text>
        <Text c="muted">muted</Text>
        <Text c="disabled">disabled</Text>
        <Text c="link">link</Text>
      </Block>
      <Block>
        <Text c="success">success</Text>
        <Text c="error">error</Text>
        <Text c="primary.5">primary.5</Text>
        <Text c="error.7">error.7</Text>
      </Block>
      <Block>
        <Text c="#ff6b6b">#ff6b6b</Text>
        <Text c="#4ecdc4">#4ecdc4</Text>
        <Text c="#45b7d1">#45b7d1</Text>
        <Text c="#96ceb4">#96ceb4</Text>
        <Text c="#feca57">#feca57</Text>
      </Block>
    </Block>
  );
}
