# useStyleProps

Turn the library's style props (`m`, `p`, `w`, `h`, `bg`, `opacity`, …) into a React Native style resolved against the current theme, so your own components can accept them like the built-in ones do.

## Metadata

- Import: `import { useStyleProps } from '@plocks/ui';`
- Tags: style-props, spacing, theming, custom-components
- Docs: https://plocks.dev/hooks/useStyleProps
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/utils/spacing.ts

## Definition

```ts
export function useStyleProps(props: StyleProps): ViewStyle;
```

## Examples

### Style props on your own component

`Tag` accepts every style prop by typing its props as `StyleProps`, splitting them off with `extractStyleProps(props)` (which returns `{ styleProps, otherProps }`) and resolving them with `useStyleProps(styleProps)`. Spacing tokens resolve through `theme.spacing`, `bg` accepts background tokens (`'surface'`, `'subtle'`), palette names (a subtle tint) or `'primary.5'` shade syntax, and `'full'` sizes become `'100%'`. Horizontal spacing uses logical start/end properties so it mirrors in right-to-left layouts, and edge props win over the shorthands covering them (`pt` over `py` over `p`). The result is memoized on the prop values; `resolveStyleProps(props, theme?)` is the non-hook version.

```tsx
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Row, Text, extractStyleProps, useStyleProps } from '@plocks/ui';
import type { StyleProps } from '@plocks/ui';

type TagProps = StyleProps & { children: ReactNode };

function Tag(props: TagProps) {
  const { styleProps, otherProps } = extractStyleProps(props);
  const style = useStyleProps(styleProps);

  return (
    <View style={[styles.tag, style]}>
      <Text>{otherProps.children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { borderRadius: 8 },
});

export function Demo() {
  return (
    <Row gap="sm" align="center">
      <Tag p="xs" bg="primary">xs</Tag>
      <Tag p="md" bg="success">md</Tag>
      <Tag px="xl" py="sm" bg="warning">xl</Tag>
    </Row>
  );
}
```
