import { Block, CodeBlock } from '@platform-blocks/ui';

const sample = `import { View, Text } from 'react-native';

interface User {
  id: number;
  name: string; // highlighted
  active: boolean;
}

export function UserCard({ user }: { user: User }) {
  if (!user.active) {
    return null; // early return highlighted
  }
  return (
    <View style={{ padding: 8 }}>
      <Text>{user.name}</Text>
    </View>
  );
}

// Utility function (range highlighted)
export function filterActive(users: User[]) {
  return users.filter((u) => u.active);
}`;

export function Demo() {
  return (
    <Block fullWidth>
      <CodeBlock title="Highlighted lines" showLineNumbers highlightLines={['5', '11', '20-23']}>
        {sample}
      </CodeBlock>
    </Block>
  );
}
