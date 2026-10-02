# useViewport

Read the current viewport `{ width, height, breakpoint }` from one shared, hydration-safe store, re-rendering on every resize. Reach for `useBreakpoint` instead when only the breakpoint matters.

## Metadata

- Import: `import { useViewport } from '@plocks/ui';`
- Tags: responsive, viewport, breakpoints, dimensions
- Docs: https://plocks.dev/hooks/useViewport
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/responsive/index.ts

## Definition

```ts
export interface ViewportState extends ViewportSize {
  breakpoint: Breakpoint;
}

export type Breakpoint = 'base' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export function useViewport(): ViewportState;
```

## Examples

### Live viewport size

`useViewport()` takes no arguments and returns `{ width, height, breakpoint }`: the window size in px (dp on native) and the breakpoint that width falls in, from `theme.breakpoints` or the nearest `BreakpointProvider` override. Every consumer shares one listener (a `resize` handler coalesced to one update per animation frame on web, `Dimensions` `change` on native) that attaches with the first subscriber and detaches with the last. Static rendering and the hydration pass see a desktop default (1200 × 800, `xl`), then the real size, so markup never mismatches. It re-renders on every size change; `useBreakpoint()` re-renders only when the breakpoint changes.

```tsx
import { Badge, Row, Text, useViewport } from '@plocks/ui';

export function Demo() {
  const { width, height, breakpoint } = useViewport();

  return (
    <Row gap="sm" align="center">
      <Text size="xl" fw="700">
        {Math.round(width)} × {Math.round(height)}
      </Text>
      <Badge size="lg">{breakpoint}</Badge>
    </Row>
  );
}
```
