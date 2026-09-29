import { Badge, Block, Input, Text, useMaskedInput } from '@platform-blocks/ui';

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
