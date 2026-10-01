import { useState } from 'react';
import { Block, Column, ReorderableList, Text } from '@plocks/ui';

const initialTasks = [
  { id: 'plan', title: 'Plan the release' },
  { id: 'build', title: 'Build the package' },
  { id: 'share', title: 'Share with developers' },
];

export function Demo() {
  const [tasks, setTasks] = useState(initialTasks);
  return (
    <Column gap="sm" fullWidth>
      <ReorderableList
        w="100%"
        scrollEnabled={false}
        data={tasks}
        keyExtractor={(task) => task.id}
        getItemLabel={(task) => task.title}
        onReorder={({ data }) => setTasks(data)}
        renderItem={({ item }) => <Block p="sm" fullWidth><Text>{item.title}</Text></Block>}
      />
    </Column>
  );
}
