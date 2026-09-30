import { Block, Menu, Menubar } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Menubar>
        <Menubar.Menu>
          <Menubar.Target>File</Menubar.Target>
          <Menubar.Dropdown>
            <Menu.Item>New</Menu.Item>
            <Menu.Item>Open</Menu.Item>
            <Menu.Divider />
            <Menu.Item>Exit</Menu.Item>
          </Menubar.Dropdown>
        </Menubar.Menu>
        <Menubar.Menu>
          <Menubar.Target>Edit</Menubar.Target>
          <Menubar.Dropdown>
            <Menu.Item>Undo</Menu.Item>
            <Menu.Item>Redo</Menu.Item>
          </Menubar.Dropdown>
        </Menubar.Menu>
        <Menubar.Menu>
          <Menubar.Target>Help</Menubar.Target>
          <Menubar.Dropdown>
            <Menu.Item>Documentation</Menu.Item>
          </Menubar.Dropdown>
        </Menubar.Menu>
      </Menubar>
    </Block>
  );
}
