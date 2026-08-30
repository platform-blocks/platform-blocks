# useOverlayMode

Return consistent booleans for deciding whether a component should render as a fullscreen modal or an anchored overlay/portal across web and native platforms.

## Metadata

- Canonical name: `useOverlayMode`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { useOverlayMode } from '@platform-blocks/react-ui-library';`
- Status: beta
- Since: 1.0.0
- Category: layout
- Tags: modal, overlay, responsive
- Docs: https://react-ui-library.com/hooks/useOverlayMode
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/hooks/useOverlayMode

## Definition

```ts
export interface UseOverlayModeOptions {
  /** Force modal presentation regardless of platform */
  forceModal?: boolean;
  /** Force anchored overlay/portal regardless of platform */
  forceOverlay?: boolean;
}

export interface UseOverlayModeResult {
  /** Raw device info reference (forwarded for convenience) */
  deviceInfo: ReturnType<typeof useDeviceInfo>;
  /** True when running on React Native Web */
  isWeb: boolean;
  /** Consolidated mobile experience flag (native or narrow web) */
  isMobileExperience: boolean;
  /** Inverse of mobile experience flag */
  isDesktopExperience: boolean;
  /** Prefer fullscreen/modal surfaces (native + mobile web) */
  shouldUseModal: boolean;
  /** Prefer anchored overlays/portals (desktop web) */
  shouldUseOverlay: boolean;
  /** Alias for shouldUseOverlay for popover/portal driven surfaces */
  shouldUsePortal: boolean;
}

export function useOverlayMode(options: UseOverlayModeOptions = {}): UseOverlayModeResult;
```

## Examples

### Overlay mode overview

The hook inspects platform + device heuristics and returns booleans you can plug into dialogs, popovers, or sheets. Resize the preview or switch platforms to see the recommendation change.

```tsx
import { Badge, Block, Row, Text, useOverlayMode } from '@platform-blocks/react-ui-library';

export function Demo() {
  const { shouldUseModal, shouldUseOverlay, isMobileExperience, isDesktopExperience, isWeb } = useOverlayMode();

  const flags = [
    { label: 'Mobile experience', on: isMobileExperience },
    { label: 'Desktop experience', on: isDesktopExperience },
    { label: 'Web platform', on: isWeb },
    { label: 'Overlay available', on: shouldUseOverlay }
  ];

  return (
    <Block align="flex-start">
      <Badge size="lg" color={shouldUseModal ? 'primary' : 'success'}>
        {shouldUseModal ? 'Render a fullscreen modal' : 'Render an anchored overlay'}
      </Badge>
      <Row gap="xs" wrap="wrap">
        {flags.map(({ label, on }) => (
          <Badge key={label} variant={on ? 'light' : 'outline'} color={on ? 'primary' : 'gray'}>
            {label}
          </Badge>
        ))}
      </Row>
      <Text size="sm" color="muted">
        Resize the preview or switch platforms to see the recommendation change.
      </Text>
    </Block>
  );
}
```
