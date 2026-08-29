import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '../../../../packages/ui/src/components/Button';
import { SoundButton } from '../../../../packages/ui/src/components/Button/SoundButton';
import { SoundProvider } from '../../../../packages/ui/src/core/sound/context';
import { getAllSounds } from '../../../../packages/ui/src/core/sound/sounds';
import { useButtonFeedback, useUIFeedback } from '../../../../packages/ui/src/core/sound/hooks';

/**
 * Basic example showing how to use sound feedback in buttons
 */
const BasicSoundExample: React.FC = () => {
  const { onPress } = useButtonFeedback();
  const feedback = useUIFeedback();

  const handleCustomFeedback = async () => {
    // Custom sound and haptic feedback
    await onPress({
      sound: { volume: 0.8 },
      haptic: { type: 'medium' },
    });
    console.log('Button pressed with custom feedback!');
  };

  const handleSuccessAction = async () => {
    // Trigger success feedback
    await feedback.notification.onNotification({ type: 'success' });
    console.log('Success action completed!');
  };

  const handleHover = async () => {
    // Trigger hover feedback
    await feedback.button.onHover();
    console.log('Button hovered!');
  };

  return (
    <View style={{ padding: 20, gap: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Sound Feedback Examples
      </Text>

      {/* Enhanced button with built-in sound feedback */}
      <SoundButton
        title="Enhanced Button (Sound + Haptic)"
        enableSoundFeedback={true}
        enableHapticFeedback={true}
        onPress={() => console.log('Enhanced button pressed!')}
      />

      {/* Regular button with custom feedback */}
      <Button
        title="Custom Feedback Button"
        onPressIn={handleCustomFeedback}
      />

      {/* Hover feedback example */}
      <Button
        title="Hover Me (Web Only)"
        onHoverIn={handleHover}
        onHoverOut={() => console.log('Button hover ended')}
        variant="filled"
        color="success"
      />

      {/* Navigation feedback examples */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button
          title="← Back"
          onPress={() => feedback.navigation.onNavigateBack()}
          variant="outline"
        />
        <Button
          title="Forward →"
          onPress={() => feedback.navigation.onNavigateForward()}
          variant="outline"
        />
      </View>
    </View>
  );
};

/**
 * Complete example with sound provider
 */
export const SoundExample: React.FC = () => {
  return (
    // <SoundProvider initialSounds={getAllUISounds()}>
      <BasicSoundExample />
    // </SoundProvider>
  );
};

export default SoundExample;