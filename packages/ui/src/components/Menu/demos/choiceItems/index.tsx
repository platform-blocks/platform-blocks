import { Button, Menu } from '@plocks/ui';

export function Demo() {
  return (
    <Menu>
      <Button>View options</Button>
      <Menu.Dropdown>
        <Menu.CheckboxItem defaultChecked>Show grid</Menu.CheckboxItem>
        <Menu.RadioGroup defaultValue="comfortable">
          <Menu.RadioItem value="comfortable">Comfortable</Menu.RadioItem>
          <Menu.RadioItem value="compact">Compact</Menu.RadioItem>
        </Menu.RadioGroup>
      </Menu.Dropdown>
    </Menu>
  );
}
