import { KeyCap, Row, Search, useToast } from '@plocks/ui';

export function Demo() {
  const toast = useToast();

  return (
    <Search
      buttonMode
      maw={420}
      placeholder="Search the workspace"
      onPress={() => toast.show({ message: 'Open your search here' })}
      rightComponent={(
        <Row gap="xs" align="center">
          <KeyCap size="xs">⌘</KeyCap>
          <KeyCap size="xs">K</KeyCap>
        </Row>
      )}
    />
  );
}
