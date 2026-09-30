import { AppShell, Block, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth h={240}>
      <AppShell
        header={{ height: 48 }}
        headerContent={<Text p="sm">App header</Text>}
        autoLayout
        withSafeArea={false}
      >
        <Block p="md">
          <Text>Page content</Text>
        </Block>
      </AppShell>
    </Block>
  );
}
