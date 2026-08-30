import { CodeBlock } from '@platform-blocks/react-ui-library';

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
