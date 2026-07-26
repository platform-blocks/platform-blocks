import { Block, CodeBlock, Text } from '@platform-blocks/ui';

const sample = `// Example showcasing highlighted lines
import React from 'react';
import { View, Text } from 'react-native';

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

export default function Demo() {
  return (
    <Block fullWidth>
      <Text weight="semibold">Highlighted lines</Text>
      <Text size="sm" colorVariant="secondary">
        Combine individual lines and ranges in the highlightLines prop to emphasize key logic.
      </Text>
  <CodeBlock title="Highlighted lines" showLineNumbers highlightLines={['1', '5-9', '11-14', '20-22']}>
        {sample}
      </CodeBlock>
    </Block>
  );
}
