import React from 'react';
import { AccessibilityInfo, findNodeHandle, Platform } from 'react-native';
import type { View } from 'react-native';
import { useAnnounce } from './context';

/**
 * Hook for managing announcement queues with priorities
 * Works with or without an AccessibilityProvider.
 */
export const useAnnouncementQueue = () => {
  const announce = useAnnounce();
  const queueRef = React.useRef<Array<{ message: string; priority: 'low' | 'medium' | 'high' }>>([]);
  const processingRef = React.useRef(false);

  const processQueue = React.useCallback(async () => {
    if (processingRef.current || queueRef.current.length === 0) return;
    
    processingRef.current = true;
    
    // Sort by priority (high > medium > low)
    queueRef.current.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    while (queueRef.current.length > 0) {
      const item = queueRef.current.shift()!;
      announce(item.message, item.priority === 'high' ? 'assertive' : 'polite');
      
      // Wait between announcements to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    processingRef.current = false;
  }, [announce]);

  const addToQueue = React.useCallback((message: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    queueRef.current.push({ message, priority });
    processQueue();
  }, [processQueue]);

  const clearQueue = React.useCallback(() => {
    queueRef.current = [];
    processingRef.current = false;
  }, []);

  return {
    addToQueue,
    clearQueue,
    queueLength: queueRef.current.length,
  };
};

/**
 * Elements that can receive keyboard focus, used for focus trapping and for
 * resolving the "first focusable child" of a container on web.
 */
export const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** A web node that can be searched for focusable descendants. */
const isQueryableNode = (node: unknown): node is HTMLElement =>
  typeof node === 'object' &&
  node !== null &&
  typeof (node as { querySelectorAll?: unknown }).querySelectorAll === 'function';

/** The shapes animated/wrapper refs expose their host node through. */
interface WrappedNodeRef {
  getNode?: () => unknown;
  _node?: unknown;
  node?: unknown;
}

/**
 * Unwraps a ref value to the underlying DOM node on web. Refs handed back by
 * `Animated.View` and other wrappers are not always the host node itself, so
 * fall back to the shapes those wrappers expose.
 */
export const resolveDomNode = (ref: unknown): HTMLElement | null => {
  if (!ref || Platform.OS !== 'web') return null;
  if (isQueryableNode(ref)) return ref;
  const wrapper = ref as WrappedNodeRef;
  const node = wrapper.getNode?.() ?? wrapper._node ?? wrapper.node;
  return isQueryableNode(node) ? node : null;
};

/**
 * Hook for managing focus trapping within a component
 * Works with or without an AccessibilityProvider.
 *
 * Web only: on native the returned ref is inert (native focus order is owned
 * by the platform; modal surfaces use `accessibilityViewIsModal`).
 */
export const useFocusTrap = (isActive: boolean = false) => {
  const containerRef = React.useRef<View>(null);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!isActive || Platform.OS !== 'web') return;

    // Store the currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement | null;

    const container = resolveDomNode(containerRef.current);
    if (!container) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          event.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      // Restore previous focus
      previousActiveElement.current?.focus?.();
    };
  }, [isActive]);

  return { containerRef };
};

/** The part of a (DOM or React Native Web) key event `useKeyboardNavigation` reads. */
interface NavigationKeyEvent {
  key: string;
  preventDefault: () => void;
}

/**
 * Hook for keyboard navigation within a list of items
 */
export const useKeyboardNavigation = (items: string[], onSelect?: (id: string) => void) => {
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [isFocused, setIsFocused] = React.useState(false);

  const handleKeyPress = React.useCallback((event: NavigationKeyEvent) => {
    if (!isFocused) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex(prev => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(prev => (prev - 1 + items.length) % items.length);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (activeIndex >= 0 && onSelect) {
          onSelect(items[activeIndex]);
        }
        break;
      case 'Escape':
        setIsFocused(false);
        setActiveIndex(-1);
        break;
    }
  }, [isFocused, activeIndex, items, onSelect]);

  const focusItem = React.useCallback((index: number) => {
    setActiveIndex(index);
    setIsFocused(true);
  }, []);

  const blur = React.useCallback(() => {
    setIsFocused(false);
    setActiveIndex(-1);
  }, []);

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [handleKeyPress]);

  return {
    activeIndex,
    isFocused,
    handleKeyPress,
    focusItem,
    blur,
    activeId: activeIndex >= 0 ? items[activeIndex] : null,
  };
};

/**
 * Hook for managing accessible form validation
 * Works with or without an AccessibilityProvider.
 */
export const useAccessibleValidation = (fieldId: string) => {
  const announce = useAnnounce();
  const [errors, setErrors] = React.useState<string[]>([]);
  const [hasBeenTouched, setHasBeenTouched] = React.useState(false);

  const validate = React.useCallback(<T,>(value: T, rules: ValidationRule<T>[]) => {
    const newErrors: string[] = [];
    
    rules.forEach(rule => {
      if (!rule.validator(value)) {
        newErrors.push(rule.message);
      }
    });
    
    setErrors(newErrors);
    
    // Announce errors to screen readers
    if (newErrors.length > 0 && hasBeenTouched) {
      announce(`Validation errors: ${newErrors.join(', ')}`, 'assertive');
    } else if (newErrors.length === 0 && hasBeenTouched) {
      announce('Validation passed', 'polite');
    }
    
    return newErrors.length === 0;
  }, [announce, hasBeenTouched]);

  const markAsTouched = React.useCallback(() => {
    setHasBeenTouched(true);
  }, []);

  const clearErrors = React.useCallback(() => {
    setErrors([]);
  }, []);

  const getAccessibilityProps = React.useCallback(() => {
    return {
      'aria-invalid': errors.length > 0,
      'aria-describedby': errors.length > 0 ? `${fieldId}-error` : undefined,
    };
  }, [errors.length, fieldId]);

  return {
    errors,
    hasErrors: errors.length > 0,
    validate,
    markAsTouched,
    clearErrors,
    getAccessibilityProps,
    errorId: errors.length > 0 ? `${fieldId}-error` : undefined,
  };
};

interface ValidationRule<T = unknown> {
  validator: (value: T) => boolean;
  message: string;
}

/**
 * Hook for managing accessible loading states
 * Works with or without an AccessibilityProvider.
 */
export const useAccessibleLoading = (initialLoading: boolean = false) => {
  const announce = useAnnounce();
  const [isLoading, setIsLoading] = React.useState(initialLoading);
  const [loadingMessage, setLoadingMessage] = React.useState('Loading...');
  const [progress, setProgress] = React.useState<number | undefined>(undefined);

  const startLoading = React.useCallback((message: string = 'Loading...') => {
    setIsLoading(true);
    setLoadingMessage(message);
    announce(message);
  }, [announce]);

  const stopLoading = React.useCallback((successMessage?: string) => {
    setIsLoading(false);
    setProgress(undefined);
    if (successMessage) {
      announce(successMessage);
    }
  }, [announce]);

  const updateProgress = React.useCallback((newProgress: number, message?: string) => {
    setProgress(newProgress);
    if (message) {
      announce(message);
    } else if (newProgress === 100) {
      announce('Loading complete');
    }
  }, [announce]);

  return {
    isLoading,
    loadingMessage,
    progress,
    startLoading,
    stopLoading,
    updateProgress,
    getAccessibilityProps: () => ({
      'aria-busy': isLoading,
      'aria-live': 'polite',
      'aria-label': isLoading ? loadingMessage : undefined,
    }),
  };
};

/**
 * Hook for accessible toast notifications
 * Works with or without an AccessibilityProvider.
 */
export const useAccessibleToast = () => {
  const announce = useAnnounce();
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = React.useCallback((
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    // Announce to screen readers
    const priority = type === 'error' ? 'assertive' : 'polite';
    announce(`${type}: ${message}`, priority);
    
    // Auto-remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
    
    return id;
  }, [announce]);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts,
  };
};

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}