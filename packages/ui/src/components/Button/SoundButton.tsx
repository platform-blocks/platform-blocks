import React, { useCallback } from 'react';
import type { View } from 'react-native';

import { factory } from '../../core/factory';
import { useButtonFeedback } from '../../core/sound/hooks';
import type { HapticFeedbackOptions, SoundOptions } from '../../core/sound/types';
import { Button } from './Button';
import type { ButtonProps } from './types';

export interface SoundButtonProps extends ButtonProps {
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
 * Button with integrated sound and haptic feedback.
 */
export const SoundButton = factory<{ props: SoundButtonProps; ref: View }>(
  (
    {
      onPress,
      onHoverIn,
      enableSoundFeedback = true,
      enableHapticFeedback = true,
      soundOptions,
      hapticOptions,
      enableHoverSound = false,
      hoverSoundOptions,
      ...props
    },
    ref,
  ) => {
    const { onPress: playPressSound, onHover: playHoverSound } = useButtonFeedback();

    const handlePress = useCallback(async () => {
      // Feedback first (immediate response), then the consumer's handler.
      if (enableSoundFeedback || enableHapticFeedback) {
        await playPressSound({
          sound: soundOptions,
          haptic: hapticOptions,
          playSound: enableSoundFeedback,
          playHaptic: enableHapticFeedback,
        });
      }
      onPress?.();
    }, [onPress, playPressSound, enableSoundFeedback, enableHapticFeedback, soundOptions, hapticOptions]);

    const handleHoverIn = useCallback(() => {
      if (enableHoverSound) void playHoverSound(hoverSoundOptions);
      onHoverIn?.();
    }, [enableHoverSound, playHoverSound, hoverSoundOptions, onHoverIn]);

    return <Button ref={ref} {...props} onPress={handlePress} onHoverIn={handleHoverIn} />;
  },
  { displayName: 'SoundButton' },
);
