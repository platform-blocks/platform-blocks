import React from 'react';
import { AccessibilityInfo, findNodeHandle, Platform } from 'react-native';
import { useOptionalAccessibility } from '../../core/accessibility/context';

/**
 * Hook for managing announcement queues with priorities
 * Gracefully handles cases where AccessibilityProvider is not available (e.g., in overlays)
 */
export const useAnnouncementQueue = () => {
  const accessibilityContext = useOptionalAccessibility();

  React.useEffect(() => {
    if (!accessibilityContext) {
      console.warn('useAnnouncementQueue: AccessibilityProvider not available, announcements will be disabled');
    }
  }, [accessibilityContext]);

  const announce = accessibilityContext?.announce ?? (() => {});
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

/**
 * Unwraps a ref value to the underlying DOM node on web. Refs handed back by
 * `Animated.View` and other wrappers are not always the host node itself, so
 * fall back to the shapes those wrappers expose.
 */
export const resolveDomNode = (ref: any): any => {
  if (!ref || Platform.OS !== 'web') return null;
  if (typeof ref.querySelectorAll === 'function') return ref;
  const node = ref.getNode?.() ?? ref._node ?? ref.node;
  return typeof node?.querySelectorAll === 'function' ? node : null;
};

/**
 * Hook for managing focus trapping within a component
 * Gracefully handles cases where AccessibilityProvider is not available (e.g., in overlays)
 */
export const useFocusTrap = (isActive: boolean = false) => {
  const containerRef = React.useRef<any>(null);
  const previousActiveElement = React.useRef<any>(null);

  React.useEffect(() => {
    if (!isActive) return;

    // Store the currently focused element
    if (Platform.OS === 'web') {
      previousActiveElement.current = document.activeElement;
    }

    const container = Platform.OS === 'web'
      ? resolveDomNode(containerRef.current)
      : containerRef.current;
    if (!container) return;

    const handleKeyDown = (event: any) => {
      if (event.key !== 'Tab') return;

      if (Platform.OS === 'web') {
        const focusableElements = container.querySelectorAll(FOCUSABLE_SELECTOR);

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
      }
    };

    if (Platform.OS === 'web') {
      container.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (Platform.OS === 'web') {
        container?.removeEventListener('keydown', handleKeyDown);
        
        // Restore previous focus
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      }
    };
  }, [isActive]);

  return { containerRef };
};

/**
 * Hook for keyboard navigation within a list of items
 */
export const useKeyboardNavigation = (items: string[], onSelect?: (id: string) => void) => {
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [isFocused, setIsFocused] = React.useState(false);

  const handleKeyPress = React.useCallback((event: any) => {
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
 * Gracefully handles cases where AccessibilityProvider is not available (e.g., in overlays)
 */
export const useAccessibleValidation = (fieldId: string) => {
  const accessibilityContext = useOptionalAccessibility();

  React.useEffect(() => {
    if (!accessibilityContext) {
      console.warn('useAccessibleValidation: AccessibilityProvider not available, validation announcements will be disabled');
    }
  }, [accessibilityContext]);

  const announce = accessibilityContext?.announce ?? (() => {});
  const [errors, setErrors] = React.useState<string[]>([]);
  const [hasBeenTouched, setHasBeenTouched] = React.useState(false);

  const validate = React.useCallback((value: any, rules: ValidationRule[]) => {
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

interface ValidationRule {
  validator: (value: any) => boolean;
  message: string;
}

/**
 * Hook for managing accessible loading states
 * Gracefully handles cases where AccessibilityProvider is not available (e.g., in overlays)
 */
export const useAccessibleLoading = (initialLoading: boolean = false) => {
  const accessibilityContext = useOptionalAccessibility();

  React.useEffect(() => {
    if (!accessibilityContext) {
      console.warn('useAccessibleLoading: AccessibilityProvider not available, loading announcements will be disabled');
    }
  }, [accessibilityContext]);

  const announce = accessibilityContext?.announce ?? (() => {});
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
 * Gracefully handles cases where AccessibilityProvider is not available (e.g., in overlays)
 */
export const useAccessibleToast = () => {
  const accessibilityContext = useOptionalAccessibility();

  React.useEffect(() => {
    if (!accessibilityContext) {
      console.warn('useAccessibleToast: AccessibilityProvider not available, toast announcements will be disabled');
    }
  }, [accessibilityContext]);

  const announce = accessibilityContext?.announce ?? (() => {});
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