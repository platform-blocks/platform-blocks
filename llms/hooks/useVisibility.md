# useVisibility

Decide whether your own component should render from the visibility props every library component accepts: `hiddenFrom` and `visibleFrom` (breakpoints) and `lightHidden` and `darkHidden` (color scheme).

## Metadata

- Import: `import { useVisibility } from '@plocks/ui';`
- Tags: visibility, responsive, breakpoints, color-scheme, custom-components
- Docs: https://plocks.dev/hooks/useVisibility
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/factory/visibility.tsx

## Definition

```ts
export function useVisibility(props: VisibilityProps): boolean;
```

## Examples

### Show and hide by breakpoint

Two of the four tags render at any time: one per breakpoint rule, one per color scheme. `useVisibility(props)` returns `false` when `hiddenFrom="md"` and the viewport is `md` or wider, when `visibleFrom="md"` and it is narrower, or when `lightHidden` / `darkHidden` matches the current scheme; a hidden component should return `null` rather than hide with styles. Components built with `factory` (every library component) already handle these props, so the hook is for components you write yourself. It only subscribes to the viewport while `hiddenFrom` or `visibleFrom` is set, and static rendering assumes the `xl` breakpoint until hydration.

```tsx
import type { ReactNode } from 'react';
import { Badge, Row, useVisibility } from '@plocks/ui';
import type { VisibilityProps } from '@plocks/ui';

type TagProps = VisibilityProps & { children: ReactNode };

function Tag({ children, ...visibility }: TagProps) {
  const visible = useVisibility(visibility);
  if (!visible) return null;

  return <Badge size="lg">{children}</Badge>;
}

export function Demo() {
  return (
    <Row gap="sm">
      <Tag hiddenFrom="md">Below md</Tag>
      <Tag visibleFrom="md">md and up</Tag>
      <Tag darkHidden>Light scheme</Tag>
      <Tag lightHidden>Dark scheme</Tag>
    </Row>
  );
}
```
