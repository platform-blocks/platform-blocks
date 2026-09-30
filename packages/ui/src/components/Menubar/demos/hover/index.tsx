import { Block, Menu, Menubar } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Menubar trigger="hover">
        <Menubar.Menu>
          <Menubar.Target>File</Menubar.Target>
          <Menubar.Dropdown>
            <Menu.Item>New</Menu.Item>
          </Menubar.Dropdown>
        </Menubar.Menu>
        <Menubar.Menu>
          <Menubar.Target>Edit</Menubar.Target>
          <Menubar.Dropdown>
            <Menu.Item>Undo</Menu.Item>
          </Menubar.Dropdown>
        </Menubar.Menu>
      </Menubar>
    </Block>
  );
}
