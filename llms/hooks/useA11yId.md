# useA11yId

A stable, SSR-safe element id for ARIA references like `aria-controls` and `aria-labelledby`. It returns the id you pass, or a sanitized `useId()` that is valid as a DOM id, a CSS selector and a native `nativeID`.

## Metadata

- Import: `import { useA11yId } from '@plocks/ui';`
- Tags: accessibility, id, aria
- Docs: https://plocks.dev/hooks/useA11yId
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/accessibility/useA11yId.ts

## Definition

```ts
export function useA11yId(explicitId?: string, prefix: string = 'plocks'): string;
```

## Examples

### Disclosure ids

`useA11yId(explicitId?, prefix = 'plocks')` returns `explicitId` when you pass one. Otherwise it returns React's `useId()` stripped to `[A-Za-z0-9_-]` behind the prefix (`«r1»` becomes `faq-r1`), which is unique per instance and the same on server and client. Here each trigger points `aria-controls` at its own panel, and the second disclosure passes `id="returns-policy"` through unchanged. Pass the id to an element's `id` prop: it becomes the DOM `id` on web, and React Native maps it to `nativeID`.

```tsx
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
```
