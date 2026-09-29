import { Block, CodeBlock } from '@platform-blocks/ui';

const sample = `import { View, Text } from 'react-native';

export function HelloWorld() {
  return (
    <View>
      <Text>Hello, World!</Text>
    </View>
  );
}`;

export function Demo() {
  return (
    <Block fullWidth>
      <CodeBlock>{sample}</CodeBlock>
    </Block>
  );
}
