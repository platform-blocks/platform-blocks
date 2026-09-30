import { Block, Menu, Menubar } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Menubar>
        <Menubar.Menu>
          <Menubar.Target>View</Menubar.Target>
          <Menubar.Dropdown>
            <Menu.CheckboxItem>Show grid</Menu.CheckboxItem>
            <Menu.RadioGroup defaultValue="list">
              <Menu.RadioItem value="list">List</Menu.RadioItem>
              <Menu.RadioItem value="grid">Grid</Menu.RadioItem>
            </Menu.RadioGroup>
          </Menubar.Dropdown>
        </Menubar.Menu>
      </Menubar>
    </Block>
  );
}
