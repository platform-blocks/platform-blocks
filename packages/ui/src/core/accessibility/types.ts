import React from 'react';

export interface AccessibilityContextValue {
  // Reduced motion preferences
  prefersReducedMotion: boolean;
  
  // Focus management
  currentFocusId: string | null;
  focusHistory: string[];
  
  // Screen reader support
  screenReaderEnabled: boolean;
  announcements: string[];
  
  // Actions
  setFocus: (id: string) => void;
  restoreFocus: () => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  clearAnnouncements: () => void;
}

export interface AccessibilityProviderProps {
  children: React.ReactNode;
  reducedMotion?: boolean;
}

// Focus management types
export interface FocusableElement {
  id: string;
  ref: React.RefObject<unknown>;
  priority?: number;
}

export interface FocusOptions {
  preventScroll?: boolean;
  restoreOnUnmount?: boolean;
}

// Announcer types
export interface AnnouncementOptions {
  priority?: 'polite' | 'assertive';
  timeout?: number;
  clearPrevious?: boolean;
}

// Motion preferences
export type MotionPreference = 'no-preference' | 'reduce';

// Screen reader types
export interface ScreenReaderInfo {
  enabled: boolean;
  type?: 'voiceover' | 'talkback' | 'nvda' | 'jaws' | 'unknown';
}