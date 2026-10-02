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
