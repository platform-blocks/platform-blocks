import { Block, CodeBlock, Text } from '@platform-blocks/ui';

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
      <Text weight="semibold">Basic code block</Text>
      <Text size="sm" color="secondary">
        The default CodeBlock renders formatted code with copy support and automatic language detection.
      </Text>
      <CodeBlock language="tsx">{sample}</CodeBlock>
    </Block>
  );
}
