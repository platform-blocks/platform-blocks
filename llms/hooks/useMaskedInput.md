# useMaskedInput

Keep controlled inputs in sync with formatted masks while exposing the unmasked value and completion status.

## Metadata

- Import: `import { useMaskedInput } from '@plocks/ui';`
- Tags: forms, masking
- Docs: https://plocks.dev/hooks/useMaskedInput
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/hooks/useMaskedInput/index.ts

## Definition

```ts
export interface UseMaskedInputOptions {
  /** The mask definition, or a mask built with `createMask`. Read once, on mount. */
  mask: MaskDefinition | Mask;
  /** Initial value */
  initialValue?: string;
  /** Callback when value changes */
  onValueChange?: (result: MaskResult) => void;
  /** Callback when unmasked value changes */
  onUnmaskedValueChange?: (unmaskedValue: string, result: MaskResult) => void;
}

export interface UseMaskedInputReturn {
  /** Current masked value for display */
  value: string;
  /** Current unmasked value */
  unmaskedValue: string;
  /** Whether the mask is complete */
  isComplete: boolean;
  /** Handle text input changes */
  handleChangeText: (text: string) => void;
  /** Handle selection change (for cursor positioning) */
  handleSelectionChange: (selection: { start: number; end: number }) => void;
  /** Current cursor position */
  cursorPosition: number;
  /** Reset to initial value */
  reset: () => void;
  /** Set value programmatically */
  setValue: (value: string) => void;
  /** Set unmasked value programmatically */
  setUnmaskedValue: (unmaskedValue: string) => void;
}

export function useMaskedInput(options: UseMaskedInputOptions): UseMaskedInputReturn;
```

## Examples

### Phone number mask

Apply a phone-number mask and show both masked and raw values while users type.

```tsx
import { Badge, Block, Input, Text, useMaskedInput } from '@plocks/ui';

export function Demo() {
  const { value, unmaskedValue, isComplete, handleChangeText, handleSelectionChange } = useMaskedInput({
    mask: { mask: '(000) 000-0000', placeholderChar: '_' }
  });

  return (
    <Block align="flex-start" maw={360} fullWidth>
      <Input
        label="Phone number"
        placeholder="(555) 555-1234"
        value={value}
        onChangeText={handleChangeText}
        textInputProps={{
          keyboardType: 'number-pad',
          onSelectionChange: event => handleSelectionChange(event.nativeEvent.selection)
        }}
      />
      <Badge variant="subtle" c={isComplete ? 'success' : 'gray'}>
        {isComplete ? 'Mask complete' : 'Enter all digits'}
      </Badge>
      <Text size="xs" c="muted">Raw value: {unmaskedValue || '—'}</Text>
    </Block>
  );
}
```
