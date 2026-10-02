# SoundButton

SoundButton adds sound and haptic feedback to a button.

## Metadata

- Import: `import { SoundButton } from '@plocks/media';`
- Install: `npm install @plocks/media` — a separate package from `@plocks/ui`
- Status: beta
- Docs: https://plocks.dev/components/SoundButton
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/media/src/components/SoundButton

## Props

- `enableSoundFeedback`: boolean — Whether to play sound feedback on press
- `enableHapticFeedback`: boolean — Whether to play haptic feedback on press
- `soundOptions`: SoundOptions — Custom sound options for button press
- `hapticOptions`: HapticFeedbackOptions — Custom haptic options for button press
- `enableHoverSound`: boolean — Whether to play hover sound (web only)
- `hoverSoundOptions`: SoundOptions — Custom sound options for hover
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Plus the `Button` props (`title` `children` `onPress` `onPressIn` `onPressOut` `onHoverIn` `onHoverOut` `onLongPress` `onLayout` `variant` `color` `size` `disabled` `loading` `loadingTitle` `fullWidth` `textColor` `icon` `startSection` `endSection` `tooltip` `transitionDuration` `accessibilityLabel` `accessibilityHint` `labelProps`): https://plocks.dev/llms/components/Button.md

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), `radius`, `shadow`, visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

SoundButton adds sound and haptic feedback to a button.

```tsx
import { SoundButton, SoundProvider } from '@plocks/media';

export function Demo() {
  return (
    <SoundProvider enableAudioMode={false}>
      <SoundButton title="Tap for feedback" enableSoundFeedback={false} onPress={() => {}} />
    </SoundProvider>
  );
}
```

### Variants

Compare Button-style variants while audio feedback is disabled for the preview.

```tsx
import { Column } from '@plocks/ui';
import { SoundButton, SoundProvider } from '@plocks/media';

const variants = ['default', 'filled', 'light', 'outline', 'ghost'] as const;

export function Demo() {
  return (
    <SoundProvider enableAudioMode={false}>
      <Column gap="sm" align="flex-start">
        {variants.map(variant => (
          <SoundButton key={variant} variant={variant} title={`${variant} action`} enableSoundFeedback={false} onPress={() => {}} />
        ))}
      </Column>
    </SoundProvider>
  );
}
```
