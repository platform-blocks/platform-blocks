import { Column } from '@plocks/ui';
import { EmojiPickerInput } from '@plocks/emoji-picker';

const variants = ['default', 'filled', 'outline', 'unstyled'] as const;

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      {variants.map(variant => (
        <EmojiPickerInput key={variant} variant={variant} label={`${variant} variant`} placeholder="Choose a reaction" />
      ))}
    </Column>
  );
}
