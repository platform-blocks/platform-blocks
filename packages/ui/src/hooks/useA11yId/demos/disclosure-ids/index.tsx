import { useState } from 'react';
import { Block, Button, Code, Icon, Text, a11yProps, useA11yId } from '@plocks/ui';

interface DisclosureProps {
  id?: string;
  title: string;
  children: string;
}

function Disclosure({ id, title, children }: DisclosureProps) {
  const [open, setOpen] = useState(false);
  const panelId = useA11yId(id, 'faq');

  return (
    <Block gap="xs">
      <Block direction="row" align="center" justify="space-between" gap="md">
        <Button
          variant="subtle"
          endSection={<Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} />}
          onPress={() => setOpen((current) => !current)}
          {...a11yProps({ expanded: open, controls: open ? panelId : undefined })}
        >
          {title}
        </Button>
        <Code>{panelId}</Code>
      </Block>
      {open ? (
        <Block id={panelId} px="md">
          <Text>{children}</Text>
        </Block>
      ) : null}
    </Block>
  );
}

export function Demo() {
  return (
    <Block fullWidth maw={420}>
      <Disclosure title="Shipping">Orders ship within two business days.</Disclosure>
      <Disclosure id="returns-policy" title="Returns">
        Unused items can be returned within 30 days.
      </Disclosure>
    </Block>
  );
}
