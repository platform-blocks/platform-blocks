import { Block, Menu, Menubar } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Menubar>
        <Menubar.Menu>
          <Menubar.Target>File</Menubar.Target>
          <Menubar.Dropdown>
            <Menu.Sub label="Share">
              <Menu.Item>Email</Menu.Item>
              <Menu.Item>Copy link</Menu.Item>
            </Menu.Sub>
          </Menubar.Dropdown>
        </Menubar.Menu>
      </Menubar>
    </Block>
  );
}
