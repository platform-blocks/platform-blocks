# useMediaQuery

Evaluate a CSS media query on web and width/height queries on native, updating as the viewport changes.

## Metadata

- Import: `import { useMediaQuery } from '@plocks/ui';`
- Tags: media-query, responsive, dimensions
- Docs: https://plocks.dev/hooks/useMediaQuery
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/hooks/useMediaQuery/useMediaQuery.ts

## Definition

```ts
export function useMediaQuery(query: string, initialValue: boolean = false): boolean;
```

## Examples

### Responsive layout

Web: subscribes to a CSS media query via `window.matchMedia`. Native: parses width/height queries (`(min-width: 640px)`, `(max-height: 480px)`) and watches `Dimensions.addEventListener('change')`. Unparseable queries on native return the supplied `initialValue`.

```tsx
import { Badge, Block, Row, Text, useMediaQuery } from '@plocks/ui';

export function Demo() {
  const isCompact = useMediaQuery('(max-width: 640px)');
  const isWide = useMediaQuery('(min-width: 1024px)');
  const columns = isCompact ? 1 : isWide ? 4 : 2;

  return (
    <Block>
      <Row gap="xs" wrap="wrap">
        <Badge variant={isCompact ? 'light' : 'outline'} c={isCompact ? 'success' : 'gray'}>
          Compact (≤640px)
        </Badge>
        <Badge variant={isWide ? 'light' : 'outline'} c={isWide ? 'success' : 'gray'}>
          Wide (≥1024px)
        </Badge>
      </Row>

      <Row gap="md" wrap="wrap">
        {Array.from({ length: columns }).map((_, i) => (
          <Block key={i} bg="primary" p="md" radius="md" miw={120}>
            <Text c="white">Card {i + 1}</Text>
          </Block>
        ))}
      </Row>

      <Text size="sm" c="muted">
        Resize the viewport (or rotate the device) to see the layout adapt.
      </Text>
    </Block>
  );
}
```
