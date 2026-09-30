import { Block, Splitter, Text, useTheme } from '@plocks/ui';

export function Demo() {
  const theme = useTheme();
  return (
    <Block fullWidth>
      <Splitter h={160} lineSize={4} handleColor={theme.colors.primary[5]}>
        <Splitter.Pane defaultSize={40} bg="subtle" p="md">
          <Text>Navigation</Text>
        </Splitter.Pane>
        <Splitter.Pane defaultSize={60} bg="surface" p="md">
          <Text>Content</Text>
        </Splitter.Pane>
      </Splitter>
    </Block>
  );
}
