# Collapse

Displays content that can be revealed or hidden with an animation.

## Metadata

- Import: `import { Collapse } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/Collapse
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Collapse

## Props

- `isCollapsed` (required): boolean — Whether the content is collapsed (hidden). `false` reveals/expands it.
- `children` (required): ReactNode — Content to show/hide
- `duration`: number = 300 — Animation duration in milliseconds
- `transitionDuration`: number = 300 — Duration (ms) of the height transition. Cross-component spelling that takes precedence over `duration`; `0` snaps open/closed with no animation. Always 0 when the user prefers reduced motion.
- `timing`: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' = 'ease-out' — Animation timing function
- `contentStyle`: StyleProp<ViewStyle> — Style for the content wrapper
- `onAnimationStart`: () => void — Callback fired when animation starts. Safe to pass inline — a new function identity does not restart the animation.
- `onAnimationEnd`: () => void — Callback fired when animation completes. Safe to pass inline.
- `easing`: (value: number) => number — Custom easing function overriding the timing preset. On iOS/Android it must be a Reanimated worklet (e.g. `Easing.bezier(...)` from `react-native-reanimated`); a plain JS function is ignored there (the `timing` preset is used instead, with a dev warning). Web accepts any function.
- `animateOnMount`: boolean = false — Whether to animate on initial mount
- `collapsedHeight`: number = 0 — Custom height when collapsed (useful for partial reveals)
- `fadeContent`: boolean = true — Whether to fade content in/out along with height animation
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

Basic usage of the Collapse component to show and hide content with animation.

```tsx
import { Block, Button, Collapse, Text } from '@plocks/ui';
import { useState } from 'react';
export function Demo() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <Block>
      <Button onPress={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? 'Show' : 'Hide'}
      </Button>
      <Collapse isCollapsed={isCollapsed}>
        <Text>
          This is some content inside the Collapse component. It will be shown or hidden based on the isCollapsed prop.
        </Text>
      </Collapse>
    </Block>
  );
}
```
