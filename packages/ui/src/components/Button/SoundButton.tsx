import React from 'react';
import type { View } from 'react-native';
import { Button as BaseButton } from '.';
import { useButtonFeedback } from '../../core/sound/hooks';
import type { ButtonProps } from './types';
import type { SoundOptions, HapticFeedbackOptions } from '../../core/sound/types';

interface SoundButtonProps extends ButtonProps {
  /** Whether to play sound feedback on press */
  enableSoundFeedback?: boolean;
  /** Whether to play haptic feedback on press */
  enableHapticFeedback?: boolean;
  /** Custom sound options for button press */
  soundOptions?: SoundOptions;
  /** Custom haptic options for button press */
  hapticOptions?: HapticFeedbackOptions;
  /** Whether to play hover sound (web only) */
  enableHoverSound?: boolean;
  /** Custom sound options for hover */
  hoverSoundOptions?: SoundOptions;
}

/**
 * Enhanced Button component with integrated sound and haptic feedback
 */
export const SoundButton = React.forwardRef<View, SoundButtonProps>(({
  onPress,
  enableSoundFeedback = true,
  enableHapticFeedback = true,
  soundOptions,
  hapticOptions,
  enableHoverSound = false,
  hoverSoundOptions,
  ...props
}, ref) => {
  const { onPress: playPressSound, onHover: playHoverSound } = useButtonFeedback();

  const handlePress = React.useCallback(async () => {
    // Play feedback first (immediate response)
    if (enableSoundFeedback || enableHapticFeedback) {
      await playPressSound({
        sound: soundOptions,
        haptic: hapticOptions,
        playSound: enableSoundFeedback,
        playHaptic: enableHapticFeedback,
      });
    }

    // Then call the original onPress
    onPress?.();
  }, [
    onPress, 
    playPressSound, 
    enableSoundFeedback, 
    enableHapticFeedback, 
    soundOptions, 
    hapticOptions
  ]);

  const handleHover = React.useCallback(async () => {
    if (enableHoverSound) {
      await playHoverSound(hoverSoundOptions);
    }
  }, [enableHoverSound, playHoverSound, hoverSoundOptions]);

  return (
    <BaseButton
      ref={ref}
      {...props}
      onPress={handlePress}
      // Add hover support for web
      {...(enableHoverSound && {
        onMouseEnter: handleHover,
      })}
    />
  );
});

SoundButton.displayName = 'SoundButton';