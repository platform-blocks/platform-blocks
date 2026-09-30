import { useCallback } from 'react';
import { useSound } from './context';
import { useHaptics } from './context';
import type { SoundOptions, HapticFeedbackOptions } from './types';

/**
 * Default sound IDs for common UI interactions
 * Apps can override these by providing different IDs to the hooks
 */
export const DEFAULT_SOUND_IDS = {
  BUTTON_PRESS: 'button-press',
  BUTTON_HOVER: 'button-hover',
  NAVIGATION_FORWARD: 'nav-forward',
  NAVIGATION_BACK: 'nav-back',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INPUT_FOCUS: 'input-focus',
  INPUT_TYPE: 'input-type',
  NOTIFICATION: 'notification',
  MESSAGE_RECEIVED: 'message-received',
  MODAL_OPEN: 'modal-open',
  MODAL_CLOSE: 'modal-close',
  SELECT: 'select',
  DESELECT: 'deselect',
  LOADING_START: 'loading-start',
  LOADING_COMPLETE: 'loading-complete',
};

/**
 * Hook for button interaction sounds and haptics
 */
export const useButtonFeedback = (soundIds?: {
  press?: string;
  hover?: string;
}) => {
  const { playSound } = useSound();
  const { triggerHaptic } = useHaptics();

  const onPress = useCallback(async (options?: {
    sound?: SoundOptions;
    haptic?: HapticFeedbackOptions;
    playSound?: boolean;
    playHaptic?: boolean;
  }) => {
    const { 
      sound = {}, 
      haptic = { type: 'light' }, 
      playSound: shouldPlaySound = true,
      playHaptic: shouldPlayHaptic = true 
    } = options || {};

    const promises: Promise<void>[] = [];

    if (shouldPlaySound) {
      promises.push(playSound(soundIds?.press || DEFAULT_SOUND_IDS.BUTTON_PRESS, sound));
    }

    if (shouldPlayHaptic) {
      promises.push(triggerHaptic(haptic));
    }

    await Promise.all(promises);
  }, [playSound, triggerHaptic, soundIds]);

  const onHover = useCallback(async (options?: SoundOptions) => {
    await playSound(soundIds?.hover || DEFAULT_SOUND_IDS.BUTTON_HOVER, options);
  }, [playSound, soundIds]);

  return { onPress, onHover };
};

/**
 * Hook for form input feedback
 */
export const useInputFeedback = (soundIds?: {
  focus?: string;
  type?: string;
  error?: string;
  success?: string;
}) => {
  const { playSound } = useSound();
  const { triggerHaptic } = useHaptics();

  const onFocus = useCallback(async (options?: SoundOptions) => {
    await playSound(soundIds?.focus || DEFAULT_SOUND_IDS.INPUT_FOCUS, options);
  }, [playSound, soundIds]);

  const onType = useCallback(async (options?: SoundOptions) => {
    await playSound(soundIds?.type || DEFAULT_SOUND_IDS.INPUT_TYPE, {
      volume: 0.1, // Very quiet for typing
      ...options,
    });
  }, [playSound, soundIds]);

  const onValidationError = useCallback(async (options?: {
    sound?: SoundOptions;
    haptic?: HapticFeedbackOptions;
  }) => {
    const { sound = {}, haptic = { type: 'error' } } = options || {};

    await Promise.all([
      playSound(soundIds?.error || DEFAULT_SOUND_IDS.ERROR, sound),
      triggerHaptic(haptic),
    ]);
  }, [playSound, triggerHaptic, soundIds]);

  const onValidationSuccess = useCallback(async (options?: {
    sound?: SoundOptions;
    haptic?: HapticFeedbackOptions;
  }) => {
    const { sound = {}, haptic = { type: 'success' } } = options || {};

    await Promise.all([
      playSound(soundIds?.success || DEFAULT_SOUND_IDS.SUCCESS, sound),
      triggerHaptic(haptic),
    ]);
  }, [playSound, triggerHaptic, soundIds]);

  return { onFocus, onType, onValidationError, onValidationSuccess };
};

/**
 * Hook for navigation feedback
 */
export const useNavigationFeedback = (soundIds?: {
  forward?: string;
  back?: string;
}) => {
  const { playSound } = useSound();
  const { triggerHaptic } = useHaptics();

  const onNavigateForward = useCallback(async (options?: {
    sound?: SoundOptions;
    haptic?: HapticFeedbackOptions;
  }) => {
    const { sound = {}, haptic = { type: 'light' } } = options || {};

    await Promise.all([
      playSound(soundIds?.forward || DEFAULT_SOUND_IDS.NAVIGATION_FORWARD, sound),
      triggerHaptic(haptic),
    ]);
  }, [playSound, triggerHaptic, soundIds]);

  const onNavigateBack = useCallback(async (options?: {
    sound?: SoundOptions;
    haptic?: HapticFeedbackOptions;
  }) => {
    const { sound = {}, haptic = { type: 'light' } } = options || {};

    await Promise.all([
      playSound(soundIds?.back || DEFAULT_SOUND_IDS.NAVIGATION_BACK, sound),
      triggerHaptic(haptic),
    ]);
  }, [playSound, triggerHaptic, soundIds]);

  return { onNavigateForward, onNavigateBack };
};

/**
 * Hook for modal/dialog feedback
 */
export const useModalFeedback = (soundIds?: {
  open?: string;
  close?: string;
}) => {
  const { playSound } = useSound();
  const { triggerHaptic } = useHaptics();

  const onOpen = useCallback(async (options?: {
    sound?: SoundOptions;
    haptic?: HapticFeedbackOptions;
  }) => {
    const { sound = {}, haptic = { type: 'light' } } = options || {};

    await Promise.all([
      playSound(soundIds?.open || DEFAULT_SOUND_IDS.MODAL_OPEN, sound),
      triggerHaptic(haptic),
    ]);
  }, [playSound, triggerHaptic, soundIds]);

  const onClose = useCallback(async (options?: {
    sound?: SoundOptions;
    haptic?: HapticFeedbackOptions;
  }) => {
    const { sound = {}, haptic = { type: 'light' } } = options || {};

    await Promise.all([
      playSound(soundIds?.close || DEFAULT_SOUND_IDS.MODAL_CLOSE, sound),
      triggerHaptic(haptic),
    ]);
  }, [playSound, triggerHaptic, soundIds]);

  return { onOpen, onClose };
};

/**
 * Hook for selection feedback
 */
export const useSelectionFeedback = (soundIds?: {
  select?: string;
  deselect?: string;
}) => {
  const { playSound } = useSound();
  const { triggerHaptic } = useHaptics();

  const onSelect = useCallback(async (options?: {
    sound?: SoundOptions;
    haptic?: HapticFeedbackOptions;
  }) => {
    const { sound = {}, haptic = { type: 'selection' } } = options || {};

    await Promise.all([
      playSound(soundIds?.select || DEFAULT_SOUND_IDS.SELECT, sound),
      triggerHaptic(haptic),
    ]);
  }, [playSound, triggerHaptic, soundIds]);

  const onDeselect = useCallback(async (options?: {
    sound?: SoundOptions;
    haptic?: HapticFeedbackOptions;
  }) => {
    const { sound = {}, haptic = { type: 'selection' } } = options || {};

    await Promise.all([
      playSound(soundIds?.deselect || DEFAULT_SOUND_IDS.DESELECT, sound),
      triggerHaptic(haptic),
    ]);
  }, [playSound, triggerHaptic, soundIds]);

  return { onSelect, onDeselect };
};

/**
 * Hook for loading state feedback
 */
export const useLoadingFeedback = (soundIds?: {
  start?: string;
  complete?: string;
}) => {
  const { playSound } = useSound();
  const { triggerHaptic } = useHaptics();

  const onStart = useCallback(async (options?: SoundOptions) => {
    await playSound(soundIds?.start || DEFAULT_SOUND_IDS.LOADING_START, options);
  }, [playSound, soundIds]);

  const onComplete = useCallback(async (options?: {
    sound?: SoundOptions;
    haptic?: HapticFeedbackOptions;
  }) => {
    const { sound = {}, haptic = { type: 'success' } } = options || {};

    await Promise.all([
      playSound(soundIds?.complete || DEFAULT_SOUND_IDS.LOADING_COMPLETE, sound),
      triggerHaptic(haptic),
    ]);
  }, [playSound, triggerHaptic, soundIds]);

  return { onStart, onComplete };
};

/**
 * Hook for notification feedback
 */
export const useNotificationFeedback = (soundIds?: {
  notification?: string;
  success?: string;
  warning?: string;
  error?: string;
  messageReceived?: string;
}) => {
  const { playSound } = useSound();
  const { triggerHaptic } = useHaptics();

  const onNotification = useCallback(async (options?: {
    sound?: SoundOptions;
    haptic?: HapticFeedbackOptions;
    type?: 'info' | 'success' | 'warning' | 'error';
  }) => {
    const { sound = {}, haptic, type = 'info' } = options || {};

    let soundId = soundIds?.notification || DEFAULT_SOUND_IDS.NOTIFICATION;
    let hapticType: HapticFeedbackOptions['type'] = 'medium';

    switch (type) {
      case 'success':
        soundId = soundIds?.success || DEFAULT_SOUND_IDS.SUCCESS;
        hapticType = 'success';
        break;
      case 'warning':
        soundId = soundIds?.warning || DEFAULT_SOUND_IDS.WARNING;
        hapticType = 'warning';
        break;
      case 'error':
        soundId = soundIds?.error || DEFAULT_SOUND_IDS.ERROR;
        hapticType = 'error';
        break;
    }

    const finalHaptic = { type: hapticType, ...haptic };

    await Promise.all([
      playSound(soundId, sound),
      triggerHaptic(finalHaptic),
    ]);
  }, [playSound, triggerHaptic, soundIds]);

  const onMessageReceived = useCallback(async (options?: {
    sound?: SoundOptions;
    haptic?: HapticFeedbackOptions;
  }) => {
    const { sound = {}, haptic = { type: 'light' } } = options || {};

    await Promise.all([
      playSound(soundIds?.messageReceived || DEFAULT_SOUND_IDS.MESSAGE_RECEIVED, sound),
      triggerHaptic(haptic),
    ]);
  }, [playSound, triggerHaptic, soundIds]);

  return { onNotification, onMessageReceived };
};

/**
 * Combined hook for all UI feedback types
 */
export const useUIFeedback = () => {
  const button = useButtonFeedback();
  const input = useInputFeedback();
  const navigation = useNavigationFeedback();
  const modal = useModalFeedback();
  const selection = useSelectionFeedback();
  const loading = useLoadingFeedback();
  const notification = useNotificationFeedback();

  return {
    button,
    input,
    navigation,
    modal,
    selection,
    loading,
    notification,
  };
};