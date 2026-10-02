# useBreakpoint

Get the current breakpoint name (`base`, `xs`, `sm`, `md`, `lg` or `xl`) from the theme's breakpoint table, re-rendering only when the viewport crosses a breakpoint rather than on every resize.

## Metadata

- Import: `import { useBreakpoint } from '@plocks/ui';`
- Tags: responsive, breakpoints, viewport
- Docs: https://plocks.dev/hooks/useBreakpoint
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/AppShell/hooks/useBreakpoint.ts

## Definition

```ts
export function useBreakpoint(): Breakpoint;
```

## Examples

### Adapt per breakpoint

`useBreakpoint()` returns a `Breakpoint`: `base` below `xs`, then `xs` (480), `sm` (576), `md` (768), `lg` (992) and `xl` (1200) by default. The widths come from `theme.breakpoints`; wrap a subtree in `<BreakpointProvider breakpoints={{ md: 900 }}>` to override some of them there. `resolveResponsiveValue(value, breakpoint)` picks the entry of a `{ base, sm, … }` map defined at or nearest below the current breakpoint, and parses the result as a px number. Breakpoints follow the window, not the preview container, and static rendering assumes `xl` until hydration.

```tsx
import { Badge, Block, Row, resolveResponsiveValue, useBreakpoint } from '@plocks/ui';

export function Demo() {
  const breakpoint = useBreakpoint();
  const columns = resolveResponsiveValue({ base: 1, sm: 2, md: 3, lg: 4 }, breakpoint);

  return (
    <Block fullWidth align="flex-start">
      <Badge size="lg">{breakpoint}</Badge>
      <Row gap="sm" w="full">
        {Array.from({ length: columns }, (_, i) => (
          <Block key={i} grow h={56} radius="md" bg="primary" />
        ))}
      </Row>
    </Block>
  );
}
```
