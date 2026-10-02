# KeyboardAwareLayout

KeyboardAwareLayout adjusts screen content when the on-screen keyboard appears.

## Metadata

- Import: `import { KeyboardAwareLayout } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/KeyboardAwareLayout
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/KeyboardAwareLayout

## Props

- `children` (required): React.ReactNode
- `behavior`: KeyboardAvoidingViewProps['behavior'] — Optional behavior override for KeyboardAvoidingView
- `keyboardVerticalOffset`: number — Additional offset passed to KeyboardAvoidingView (defaults to 0)
- `enabled`: boolean — Enables or disables KeyboardAvoidingView adjustments
- `scrollable`: boolean — When true (default) content is wrapped in a ScrollView
- `extraScrollHeight`: number — Extra padding added in addition to keyboard height
- `contentContainerStyle`: StyleProp<ViewStyle> — Style applied to the ScrollView/inner content container
- `keyboardShouldPersistTaps`: 'always' | 'never' | 'handled' — Controls ScrollView keyboard tap handling
- `scrollRef`: React.Ref<ScrollView> — Forward ref to the internal ScrollView when scrollable is true
- `scrollViewProps`: ScrollViewProps — Additional props that will be spread onto the internal ScrollView
- `scrollEnabled`: boolean — Whether scrolling is enabled
- `bounces`: boolean — Whether the scroll view bounces past the edge of content (iOS)
- `onScroll`: ScrollViewProps['onScroll'] — Scroll event callback
- `scrollEventThrottle`: number — Throttle interval for scroll events in ms
- `onMomentumScrollBegin`: ScrollViewProps['onMomentumScrollBegin'] — Callback when momentum scroll begins
- `onMomentumScrollEnd`: ScrollViewProps['onMomentumScrollEnd'] — Callback when momentum scroll ends
- `showsVerticalScrollIndicator`: boolean — Whether to show the vertical scroll indicator
- `showsHorizontalScrollIndicator`: boolean — Whether to show the horizontal scroll indicator
- `decelerationRate`: ScrollViewProps['decelerationRate'] — Deceleration rate ('normal' | 'fast' | number)
- `overScrollMode`: ScrollViewProps['overScrollMode'] — Over-scroll mode for Android
- `refreshControl`: ScrollViewProps['refreshControl'] — Pull-to-refresh control
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

Keep form fields scrollable when the on-screen keyboard opens.

```tsx
import { Block, Input, KeyboardAwareLayout } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth h={220}>
      <KeyboardAwareLayout>
        <Block p="md" gap="md">
          <Input label="Name" placeholder="Your name" />
          <Input label="Email" placeholder="you@example.com" />
        </Block>
      </KeyboardAwareLayout>
    </Block>
  );
}
```
