import { SoundButton, SoundProvider } from '@plocks/media';

export function Demo() {
  return (
    <SoundProvider enableAudioMode={false}>
      <SoundButton title="Tap for feedback" enableSoundFeedback={false} onPress={() => {}} />
    </SoundProvider>
  );
}
