# FloatingIndicator

Give the parent `position: 'relative'`. On native, placement updates when the target or parent changes or the screen dimensions change.

## Metadata

- Import: `import { FloatingIndicator } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/FloatingIndicator
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/FloatingIndicator

## Props

- `target` (required): View | HTMLElement | null — Element to highlight; null hides the indicator.
- `parent` (required): View | HTMLElement | null — Positioned ancestor used for relative coordinates.
- `transitionDuration`: number = 150 — Animation time in ms. @default 150
- `onTransitionStart`: () => void — Called before animated movement.
- `onTransitionEnd`: () => void — Called when animated movement finishes.
- `displayAfterTransitionEnd`: boolean — Defer appearance until a parent CSS transition finishes on web.
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

The indicator follows the selected target and remains behind the controls.

```tsx
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Block, FloatingIndicator, Text } from '@plocks/ui';

export function Demo() {
  const [parent, setParent] = useState<View | null>(null);
  const [targets, setTargets] = useState<(View | null)[]>([]);
  const [active, setActive] = useState(0);
  const refs = useMemo(
    () =>
      [0, 1, 2].map(
        (i) => (node: View | null) =>
          setTargets((current) =>
            current[i] === node ? current : Object.assign([...current], { [i]: node }),
          ),
      ),
    [],
  );
  return (
    <Block fullWidth>
      <View ref={setParent} style={{ position: 'relative', flexDirection: 'row', padding: 4 }}>
        <FloatingIndicator
          parent={parent}
          target={targets[active] ?? null}
          bg="primary.2"
          style={{ borderRadius: 8 }}
        />
        {['React', 'Vue', 'Svelte'].map((label, i) => (
          <Pressable key={label} ref={refs[i]} onPress={() => setActive(i)} style={{ padding: 12 }}>
            <Text>{label}</Text>
          </Pressable>
        ))}
      </View>
    </Block>
  );
}
```

### Multiple Rows

The indicator can move between targets in a grid.

```tsx
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Block, FloatingIndicator, Text } from '@plocks/ui';

export function Demo() {
  const [parent, setParent] = useState<View | null>(null);
  const [targets, setTargets] = useState<(View | null)[]>([]);
  const [active, setActive] = useState(4);
  const refs = useMemo(
    () =>
      Array.from(
        { length: 9 },
        (_, i) => (node: View | null) =>
          setTargets((current) =>
            current[i] === node ? current : Object.assign([...current], { [i]: node }),
          ),
      ),
    [],
  );
  return (
    <Block fullWidth>
      <View
        ref={setParent}
        style={{ position: 'relative', flexDirection: 'row', flexWrap: 'wrap', width: 180 }}
      >
        <FloatingIndicator
          parent={parent}
          target={targets[active] ?? null}
          bg="primary.2"
          style={{ borderRadius: 8 }}
        />
        {Array.from({ length: 9 }, (_, i) => (
          <Pressable
            key={i}
            ref={refs[i]}
            onPress={() => setActive(i)}
            style={{ width: 60, height: 50, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text>{i + 1}</Text>
          </Pressable>
        ))}
      </View>
    </Block>
  );
}
```

### Tab Highlight

A decorative indicator can follow an accessible tab selection.

```tsx
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Block, FloatingIndicator, Text } from '@plocks/ui';

export function Demo() {
  const [parent, setParent] = useState<View | null>(null);
  const [targets, setTargets] = useState<(View | null)[]>([]);
  const [active, setActive] = useState(0);
  const refs = useMemo(
    () =>
      [0, 1, 2].map(
        (i) => (node: View | null) =>
          setTargets((current) =>
            current[i] === node ? current : Object.assign([...current], { [i]: node }),
          ),
      ),
    [],
  );
  return (
    <Block fullWidth>
      <View ref={setParent} role="tablist" style={{ position: 'relative', flexDirection: 'row' }}>
        <FloatingIndicator
          parent={parent}
          target={targets[active] ?? null}
          bg="primary.2"
          style={{ borderRadius: 8 }}
        />
        {['Overview', 'Details', 'Activity'].map((label, i) => (
          <Pressable
            key={label}
            ref={refs[i]}
            role="tab"
            aria-selected={active === i}
            onPress={() => setActive(i)}
            style={{ padding: 12 }}
          >
            <Text>{label}</Text>
          </Pressable>
        ))}
      </View>
    </Block>
  );
}
```
