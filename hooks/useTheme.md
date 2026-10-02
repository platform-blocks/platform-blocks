# useTheme

Read the active `PlocksTheme` (color ramps, text and background roles, spacing, radii, font sizes) to style your own primitives; outside a provider it returns `DEFAULT_THEME`. Use `useThemeVisuals()` when a component reads only colors (`colors`, `text`, `backgrounds`, `states`, `colorScheme`, `primaryColor`), so layout-token changes don't re-render it. Use `useThemeLayout()` when it reads only layout tokens (`spacing`, `radii`, `fontSizes`, `shadows`, `breakpoints`, `controlSizes`, `zIndices`, fonts), so color changes don't re-render it.

## Metadata

- Import: `import { useTheme } from '@plocks/ui';`
- Tags: theme, tokens, colors, design-tokens
- Docs: https://plocks.dev/hooks/useTheme
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/theme/ThemeProvider.tsx

## Definition

```ts
export function useTheme(): PlocksTheme;
```

## Examples

### Read theme tokens

`useTheme()` returns the active `PlocksTheme`. The demo renders `theme.colors.primary`, a ten-shade ramp with the base color at index 5, and re-renders when the color scheme switches (dark ramps run darkest to lightest). `theme.text`, `theme.backgrounds` and `theme.surfaces` hold semantic colors; `theme.spacing`, `theme.radii` and `theme.fontSizes` hold CSS pixel strings such as `'16px'`, so convert them with `resolveSpacing` / `resolveRadius` / `resolveFontSize` before handing them to a React Native style. Prefer component props (`c`, `bg`, `p`, `radius`) where they exist.

```tsx
import { Block, Row, Text, readableTextOn, useTheme } from '@plocks/ui';

export function Demo() {
  const theme = useTheme();

  return (
    <Block fullWidth maw={560}>
      <Text size="sm" fw="600">
        colors.primary ({theme.colorScheme})
      </Text>
      <Row gap={4}>
        {theme.colors.primary.map((shade, index) => (
          <Block key={index} grow={1} h={48} radius="sm" bg={shade} align="center" justify="center">
            <Text size="xs" c={readableTextOn(shade)}>
              {index}
            </Text>
          </Block>
        ))}
      </Row>
    </Block>
  );
}
```
