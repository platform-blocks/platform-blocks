# Overlay

Overlay dims or blurs content behind a foreground element.

## Metadata

- Import: `import { Overlay } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/Overlay
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Overlay

## Props

- `color`: ThemeColor = theme.backgrounds.scrim — Background color for the overlay: a raw color, a palette token (`'primary'`, `'primary.6'`) or a `theme.backgrounds` / `theme.text` key.
- `opacity`: number — Opacity of the background color only — children stay opaque. Defaults to 0.6 with a `color`; without one, the theme scrim keeps its own alpha unless this is set.
- `backgroundOpacity`: number — Opacity applied to the background color; takes precedence over `opacity`.
- `gradient`: string — Web-only CSS gradient string. Falls back to `color` on native platforms.
- `blur`: number | string — Amount of backdrop blur (px number or CSS length). Web only.
- `radius`: RadiusValue — Corner radius for the overlay surface.
- `zIndex`: number — z-index applied to the overlay container. Defaults to 1 so the overlay covers its siblings wherever it is rendered, or the theme's `overlay` layer when `fixed`.
- `fixed`: boolean = false — Use viewport-fixed positioning instead of absolute positioning (web only).
- `center`: boolean = false — Center children horizontally and vertically.
- `style`: StyleProp<ViewStyle> — Optional style overrides applied after computed styles.
- `children`: ReactNode — Overlay content rendered on top of the dimmed background.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.

Also accepts the shared props — base (`testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Overlay fills its parent: dim it with `color` and `backgroundOpacity`, fade it with a CSS `gradient`, or frost it with `blur` (gradient and blur are web-only). Children render on top at full strength.

```tsx
import { ImageBackground, StyleSheet } from 'react-native';
import { Block, Overlay, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth maw={520}>
      <ImageBackground source={require('../../../../assets/images/scene-city.png')} style={styles.image} imageStyle={styles.backgroundImage}>
        <Overlay color="#000" backgroundOpacity={0.5} center>
          <Text fw="semibold" c="white">
            Dim
          </Text>
        </Overlay>
      </ImageBackground>

      <ImageBackground source={require('../../../../assets/images/scene-aurora.png')} style={styles.image} imageStyle={styles.backgroundImage}>
        <Overlay gradient="linear-gradient(145deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0) 75%)" center>
          <Text fw="semibold" c="white">
            Gradient
          </Text>
        </Overlay>
      </ImageBackground>

      <ImageBackground source={require('../../../../assets/images/scene-desert.png')} style={styles.image} imageStyle={styles.backgroundImage}>
        <Overlay color="#000" backgroundOpacity={0.35} blur={18} center>
          <Text fw="semibold" c="white">
            Blur
          </Text>
        </Overlay>
      </ImageBackground>
    </Block>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    aspectRatio: 3 / 2,
    borderRadius: 24,
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
});
```
