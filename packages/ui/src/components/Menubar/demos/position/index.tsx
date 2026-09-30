import { Block, Menu, Menubar } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Menubar>
        <Menubar.Menu position="bottom-end">
          <Menubar.Target>Options</Menubar.Target>
          <Menubar.Dropdown>
            <Menu.Item>Settings</Menu.Item>
          </Menubar.Dropdown>
        </Menubar.Menu>
      </Menubar>
    </Block>
  );
}
