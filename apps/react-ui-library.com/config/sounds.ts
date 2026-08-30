import type { SoundAsset } from '@platform-blocks/react-ui-library';

// Placeholder for sound assets - replace with actual audio files
const SOUND_PLACEHOLDER = require('../assets/sounds/snare.mp3'); // Replace with require('./path/to/sound.mp3')

/**
 * App-specific sound configuration for PlatformBlocks documentation app
 * These sounds should be short, pleasant, and accessible
 * 
 * Note: Replace SOUND_PLACEHOLDER with actual audio file imports:
 * source: require('../assets/sounds/button-press.mp3'),
 */
export const APP_SOUNDS: Record<string, SoundAsset> = {
  // Button interactions
  BUTTON_PRESS: {
    id: 'button-press',
    source: SOUND_PLACEHOLDER, // require('../assets/sounds/button-press.mp3'),
    name: 'Button Press',
    category: 'ui',
    respectsReducedMotion: true,
    defaultOptions: {
      volume: 0.5,
    },
  },
  
  BUTTON_HOVER: {
    id: 'button-hover',
    source: SOUND_PLACEHOLDER, // require('../assets/sounds/button-hover.mp3'),
    name: 'Button Hover',
    category: 'ui',
    respectsReducedMotion: true,
    defaultOptions: {
      volume: 0.3,
    },
  },

  // Navigation sounds
  NAVIGATION_FORWARD: {
    id: 'nav-forward',
    source: SOUND_PLACEHOLDER, // require('../assets/sounds/nav-forward.mp3'),
    name: 'Navigate Forward',
    category: 'navigation',
    respectsReducedMotion: true,
    defaultOptions: {
      volume: 0.4,
    },
  },

  NAVIGATION_BACK: {
    id: 'nav-back',
    source: SOUND_PLACEHOLDER, // require('../assets/sounds/nav-back.mp3'),
    name: 'Navigate Back',
    category: 'navigation',
    respectsReducedMotion: true,
    defaultOptions: {
      volume: 0.4,
    },
  },

  // Feedback sounds
  SUCCESS: {
    id: 'success',
    source: SOUND_PLACEHOLDER, // require('../assets/sounds/success.mp3'),
    name: 'Success',
    category: 'feedback',
    respectsReducedMotion: false, // Important feedback, play even with reduced motion
    defaultOptions: {
      volume: 0.6,
    },
  },

  ERROR: {
    id: 'error',
    source: SOUND_PLACEHOLDER, // require('../assets/sounds/error.mp3'),
    name: 'Error',
    category: 'feedback',
    respectsReducedMotion: false, // Important feedback
    defaultOptions: {
      volume: 0.7,
    },
  },

  WARNING: {
    id: 'warning',
    source: SOUND_PLACEHOLDER, // require('../assets/sounds/warning.mp3'),
    name: 'Warning',
    category: 'feedback',
    respectsReducedMotion: false, // Important feedback
    defaultOptions: {
      volume: 0.6,
    },
  },

  // Input sounds
  INPUT_FOCUS: {
    id: 'input-focus',
    source: SOUND_PLACEHOLDER, // require('../assets/sounds/input-focus.mp3'),
    name: 'Input Focus',
    category: 'ui',
    respectsReducedMotion: true,
    defaultOptions: {
      volume: 0.3,
    },
  },

  INPUT_TYPE: {
    id: 'input-type',
    source: SOUND_PLACEHOLDER, // require('../assets/sounds/input-type.mp3'),
    name: 'Input Type',
    category: 'ui',
    respectsReducedMotion: true,
    defaultOptions: {
      volume: 0.2,
    },
  },

  // Notification sounds
  NOTIFICATION: {
    id: 'notification',
    source: SOUND_PLACEHOLDER, // require('../assets/sounds/notification.mp3'),
    name: 'Notification',
    category: 'notification',
    respectsReducedMotion: false,
    defaultOptions: {
      volume: 0.5,
    },
  },

  MESSAGE_RECEIVED: {
    id: 'message-received',
    source: SOUND_PLACEHOLDER, // require('../assets/sounds/message-received.mp3'),
    name: 'Message Received',
    category: 'notification',
    respectsReducedMotion: false,
    defaultOptions: {
      volume: 0.4,
    },
  },

  // Modal/Dialog sounds
  MODAL_OPEN: {
    id: 'modal-open',
    source: SOUND_PLACEHOLDER, // require('../assets/sounds/modal-open.mp3'),
    name: 'Modal Open',
    category: 'ui',
    respectsReducedMotion: true,
    defaultOptions: {
      volume: 0.4,
    },
  },

  MODAL_CLOSE: {
    id: 'modal-close',
    source: SOUND_PLACEHOLDER, // require('../assets/sounds/modal-close.mp3'),
    name: 'Modal Close',
    category: 'ui',
    respectsReducedMotion: true,
    defaultOptions: {
      volume: 0.4,
    },
  },

  // Selection sounds
  SELECT: {
    id: 'select',
    source: SOUND_PLACEHOLDER, // require('../assets/sounds/select.mp3'),
    name: 'Select Item',
    category: 'ui',
    respectsReducedMotion: true,
    defaultOptions: {
      volume: 0.3,
    },
  },

  DESELECT: {
    id: 'deselect',
    source: SOUND_PLACEHOLDER, // require('../assets/sounds/deselect.mp3'),
    name: 'Deselect Item',
    category: 'ui',
    respectsReducedMotion: true,
    defaultOptions: {
      volume: 0.3,
    },
  },

  // Loading sounds
  LOADING_START: {
    id: 'loading-start',
    source: SOUND_PLACEHOLDER, // require('../assets/sounds/loading-start.mp3'),
    name: 'Loading Start',
    category: 'feedback',
    respectsReducedMotion: true,
    defaultOptions: {
      volume: 0.4,
    },
  },

  LOADING_COMPLETE: {
    id: 'loading-complete',
    source: SOUND_PLACEHOLDER, // require('../assets/sounds/loading-complete.mp3'),
    name: 'Loading Complete',
    category: 'feedback',
    respectsReducedMotion: false,
    defaultOptions: {
      volume: 0.5,
    },
  },
};

/**
 * Get all app sounds as an array for easy registration
 */
export const getAllAppSounds = (): SoundAsset[] => {
  return Object.values(APP_SOUNDS);
};

/**
 * Get app sounds by category
 */
export const getAppSoundsByCategory = (category: SoundAsset['category']): SoundAsset[] => {
  return Object.values(APP_SOUNDS).filter(sound => sound.category === category);
};