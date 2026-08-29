import { Badge, Block, Button, Dialog, Row, Text, useDisclosure } from '@platform-blocks/ui';

export function Demo() {
  const [opened, { open, close, toggle }] = useDisclosure(false, {
    onOpen: () => console.log('opened'),
    onClose: () => console.log('closed'),
  });

  return (
    <Block align="flex-start">
      <Badge color={opened ? 'success' : 'gray'}>{opened ? 'Open' : 'Closed'}</Badge>

      <Row gap="sm" wrap="wrap">
        <Button onPress={open}>open</Button>
        <Button variant="outline" onPress={close}>close</Button>
        <Button variant="ghost" onPress={toggle}>toggle</Button>
      </Row>

      <Dialog visible={opened} title="Dialog title" onClose={close}>
        <Block p="md">
          <Text>This dialog's open state is managed by useDisclosure.</Text>
          <Button onPress={close}>Close</Button>
        </Block>
      </Dialog>
    </Block>
  );
}
