import { useState } from 'react';
import { Block, Menu, Menubar } from '@plocks/ui';

export function Demo() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <Block fullWidth>
      <Menubar openIndex={openIndex} onOpenChange={setOpenIndex}>
        <Menubar.Menu>
          <Menubar.Target>File</Menubar.Target>
          <Menubar.Dropdown>
            <Menu.Item>New</Menu.Item>
            <Menu.Item>Open</Menu.Item>
          </Menubar.Dropdown>
        </Menubar.Menu>
        <Menubar.Menu>
          <Menubar.Target>Edit</Menubar.Target>
          <Menubar.Dropdown>
            <Menu.Item>Undo</Menu.Item>
            <Menu.Item>Redo</Menu.Item>
          </Menubar.Dropdown>
        </Menubar.Menu>
      </Menubar>
    </Block>
  );
}
