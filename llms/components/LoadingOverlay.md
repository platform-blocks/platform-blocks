# LoadingOverlay

LoadingOverlay covers content with a loading indicator while work is in progress.

## Metadata

- Import: `import { LoadingOverlay } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/LoadingOverlay
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/LoadingOverlay

## Props

- `visible`: boolean = false — Controls visibility of the loading overlay.
- `zIndex`: number — z-index applied to the overlay container; `overlayProps.zIndex` wins when both are set. Defaults to Overlay's, which lifts it above the content it covers.
- `overlayProps`: OverlayProps — Props forwarded to the underlying Overlay component.
- `loaderProps`: LoaderProps — Props forwarded to the Loader component.
- `loader`: ReactNode — Custom loader content. When provided, Loader component is not rendered.
- `loadingLabel`: string = 'Loading' — Accessible name of the busy indicator, and what is announced. @default 'Loading'
- `announceAfter`: number | false = 1000 — Announce `loadingLabel` to screen readers when loading lasts longer than this many ms (short waits stay silent). `false` never announces.
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

Locks a simple form while background work finishes and keeps the loader aligned with the card container.

```tsx
import { useState } from 'react';
import { Block, Card, Input, LoadingOverlay, Switch } from '@plocks/ui';

export function Demo() {
  const [visible, setVisible] = useState(true);

  return (
    <Block fullWidth maw={480}>
      <Card>
        <Block>
          <Input label="Name" placeholder="Jane Doe" disabled={visible} />
          <Input label="Email" placeholder="jane@example.com" disabled={visible} />
        </Block>
        <LoadingOverlay visible={visible} overlayProps={{ radius: 'md' }} />
      </Card>

      <Switch label="Loading" checked={visible} onChange={setVisible} />
    </Block>
  );
}
```
