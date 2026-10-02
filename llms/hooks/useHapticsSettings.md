# useHapticsSettings

Read and flip the app-wide haptics switch that `useHaptics`, and every component built on it such as Button, Toast and Wheel, obeys: `enabled`, `setEnabled(on)` and `temporarilyDisable(ms)`. `PlocksProvider` mounts the `HapticsProvider` it reads from; `useOptionalHapticsSettings` returns undefined instead of throwing when there is none.

## Metadata

- Import: `import { useHapticsSettings } from '@plocks/ui';`
- Tags: haptics, settings, feedback, native
- Docs: https://plocks.dev/hooks/useHapticsSettings
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/haptics/HapticsProvider.tsx

## Definition

```ts
export interface HapticsContextValue {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  temporarilyDisable: (ms: number) => void;
}

export function useHapticsSettings(): HapticsContextValue;
```

## Examples

### Haptics switch

`useHaptics` fires the feedback and `useHapticsSettings` gates it: while `enabled` is false every `useHaptics` call is a no-op, including the press feedback built into Button, so one switch in a settings screen silences the whole library. `temporarilyDisable(ms)` turns haptics off for `ms`, then restores the previous setting, which suits a burst of programmatic changes that shouldn't buzz. Set the starting state with `<PlocksProvider haptics={{ defaultEnabled: false }}>`, or pass `haptics={false}` to leave the provider out. Haptics only play on iOS and Android with `expo-haptics` installed, so on web the switch changes nothing you can feel.

```tsx
import { Block, Button, Row, Switch, useHaptics, useHapticsSettings } from '@plocks/ui';

export function Demo() {
  const { enabled, setEnabled, temporarilyDisable } = useHapticsSettings();
  const { notifySuccess } = useHaptics();

  return (
    <Block align="flex-start">
      <Switch label="Haptics" checked={enabled} onChange={setEnabled} />

      <Row gap="sm" wrap="wrap">
        <Button onPress={notifySuccess}>Buzz</Button>
        <Button variant="outline" disabled={!enabled} onPress={() => temporarilyDisable(3000)}>
          Pause 3s
        </Button>
      </Row>
    </Block>
  );
}
```
