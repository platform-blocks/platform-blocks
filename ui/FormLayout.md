# FormLayout

FormLayout arranges fields in spaced form sections.

## Metadata

- Import: `import { FormLayout } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/FormLayout
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/FormLayout

## Props

- `children` (required): ReactNode
- `spacing`: 'sm' | 'md' | 'lg' | 'xl'
- `variant`: 'default' | 'card' | 'modal' — `card`: subtle filled panel with a border. `modal`: raised surface with a shadow.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { FormSection, FormGroup } from '@plocks/ui';`

### FormSection

- `title`: ReactNode
- `description`: ReactNode
- `children` (required): ReactNode
- `spacing`: 'sm' | 'md' | 'lg'
- `collapsible`: boolean — Let the user collapse the section from its header.
- `expanded`: boolean — Controlled expanded state (with `collapsible`).
- `defaultExpanded`: boolean — Initial expanded state while uncontrolled. Default true.
- `onExpandedChange`: (expanded: boolean) => void — Called when the header toggles the section.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### FormGroup

- `children` (required): ReactNode
- `direction`: 'row' | 'column'
- `columns`: 2 | 3 | 4
- `spacing`: 'xs' | 'sm' | 'md' | 'lg'
- `align`: 'start' | 'center' | 'end' | 'stretch'
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

FormLayout arranges fields in spaced form sections.

```tsx
import { FormLayout, FormSection, Input } from '@plocks/ui';

export function Demo() {
  return (
    <FormLayout variant="card">
      <FormSection title="Profile">
        <Input label="Name" placeholder="Your name" />
        <Input label="Email" placeholder="you@example.com" />
      </FormSection>
    </FormLayout>
  );
}
```

### Variants

Compare plain form spacing, the bordered card, and the raised modal surface.

```tsx
import { Column, FormLayout, FormSection, Input, Text } from '@plocks/ui';

const variants = ['default', 'card', 'modal'] as const;

export function Demo() {
  return (
    <Column gap="lg" fullWidth>
      {variants.map(variant => (
        <Column key={variant} gap="xs" fullWidth>
          <Text fw="semibold">{variant}</Text>
          <FormLayout variant={variant}>
            <FormSection title="Profile"><Input label="Name" placeholder="Your name" /></FormSection>
          </FormLayout>
        </Column>
      ))}
    </Column>
  );
}
```
