import { CodeBlock } from '@platform-blocks/ui';

export function Demo() {
  return (
    <CodeBlock>
      {`import { View, Text } from 'react-native';

export const HelloWorld = () => {
  return (
    <View>
      <Text>Hello, World!</Text>
    </View>
  );
};`}
    </CodeBlock>
  );
}
