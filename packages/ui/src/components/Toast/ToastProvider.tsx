import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { View, ViewStyle, Platform, Dimensions } from 'react-native';
import { Toast } from './Toast';
import { ToastProps, ToastVariant } from './types';
import type { ComponentSizeValue } from '../../core/theme/componentSize';
import { Icon } from '../Icon';
import { semanticIcons } from '../../core/theme/semanticIcons';

type ToastRequestListener = () => void;

const toastRequestListeners = new Set<ToastRequestListener>();
let pendingToastRequest = false;

function notifyToastListeners() {
  if (toastRequestListeners.size === 0) {
    pendingToastRequest = true;
    return;
  }

  pendingToastRequest = false;
  toastRequestListeners.forEach(listener => {
    try {
      listener();
    } catch (error) {
      if (__DEV__) {
        console.error('[toasts] listener error', error);
      }
    }
  });
}

export function onToastRequested(listener: ToastRequestListener) {
  toastRequestListeners.add(listener);
  if (pendingToastRequest) {
    pendingToastRequest = false;
    listener();
  }
  return () => {
    toastRequestListeners.delete(listener);
  };
}

// ---- Viewport offset bridge ----
// The ToastProvider commonly sits ABOVE the app shell (header / navbar) in the
// component tree, so it cannot read the shell layout via context. Any component
// rendered *inside* the shell can publish the safe viewport offset here — e.g.
// header height plus the status-bar / safe-area inset — and the toast layer
// positions its stacks clear of that chrome instead of overlapping it.
export interface ToastViewportOffset {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

let currentToastViewportOffset: ToastViewportOffset = {};
const toastViewportOffsetListeners = new Set<(offset: ToastViewportOffset) => void>();

/** Imperatively set the viewport offset applied to all toast stacks. */
export function setToastViewportOffset(offset: ToastViewportOffset | null | undefined) {
  currentToastViewportOffset = offset ?? {};
  toastViewportOffsetListeners.forEach(listener => {
    try {
      listener(currentToastViewportOffset);
    } catch (error) {
      if (__DEV__) {
        console.error('[toasts] viewport offset listener error', error);
      }
    }
  });
}

function subscribeToastViewportOffset(listener: (offset: ToastViewportOffset) => void) {
  toastViewportOffsetListeners.add(listener);
  listener(currentToastViewportOffset);
  return () => {
    toastViewportOffsetListeners.delete(listener);
  };
}

/**
 * Publish a viewport offset for the toast layer while the calling component is
 * mounted (resets to zero on unmount). Call this from inside the app shell with
 * the header height + safe-area inset so toasts never overlap the shell chrome.
 */
export function useToastViewportOffset(offset: ToastViewportOffset) {
  const { top = 0, bottom = 0, left = 0, right = 0 } = offset || {};
  useEffect(() => {
    setToastViewportOffset({ top, bottom, left, right });
    return () => setToastViewportOffset({});
  }, [top, bottom, left, right]);
}

export type ToastPosition = 
  | 'top-left' 
  | 'top-right' 
  | 'top-center'
  | 'bottom-left' 
  | 'bottom-right' 
  | 'bottom-center';

export type ToastStackDirection = 'up' | 'down';
export type ToastQueuePriority = 'fifo' | 'lifo' | 'priority';

export interface ToastQueueOptions {
  /** Maximum number of visible toasts per position */
  maxVisible: number;
  /** How toasts stack when multiple are shown */
  stackDirection: ToastStackDirection;
  /** Space between stacked toasts */
  spacing: number;
  /** Queue processing priority */
  priority: ToastQueuePriority;
  /** Whether to allow duplicate toasts */
  allowDuplicates: boolean;
}

export interface ToastOptions extends Omit<ToastProps, 'visible' | 'onClose' | 'position'> {
  /** Unique identifier for the toast */
  id?: string;
  /** Position where the toast should appear */
  position?: ToastPosition;
  /** Auto hide duration in ms (0 to disable) */
  autoHide?: number;
  /** Custom message (alternative to children) */
  message?: React.ReactNode;
  /** Priority level for queue management (higher = more important) */
  priority?: number;
  /** Group ID for batch operations */
  groupId?: string;
}

interface ToastItem extends ToastOptions {
  id: string;
  visible: boolean;
  position: ToastPosition;
  timestamp: number;
  priority: number;
}

// Severity-specific toast options (omit sev since it's set by the method)
export type SeverityToastOptions = Omit<ToastOptions, 'sev'>;

// Simplified options for string shortcuts
export type ToastMessage = string;
export type ToastShortcut = ToastMessage | SeverityToastOptions;

interface ToastContextValue {
  show: (options: ToastOptions) => string;
  send: (options: ToastOptions) => string;
  hide: (id: string) => void;
  hideAll: () => void;
  hideGroup: (groupId: string) => void;
  update: (id: string, options: Partial<ToastOptions>) => void;
  // Batch operations
  batch: (toasts: ToastOptions[]) => string[];
  // Promise integration
  promise: <T>(
    promise: Promise<T>,
    options: {
      pending: ToastShortcut;
      success: ToastShortcut | ((data: T) => ToastShortcut);
      error: ToastShortcut | ((error: any) => ToastShortcut);
    }
  ) => Promise<T>;
  // Severity-based methods
  info: (options: ToastShortcut) => string;
  success: (options: ToastShortcut) => string;
  warning: (options: ToastShortcut) => string;
  warn: (options: ToastShortcut) => string; // Alias for warning
  error: (options: ToastShortcut) => string;
}

const ToastApiContext = createContext<ToastContextValue | undefined>(undefined);
const ToastStateContext = createContext<ToastItem[] | undefined>(undefined);

let toastsApiRef: ToastContextValue | null = null;
let toastsStateRef: ToastItem[] = [];
const pendingToastOperations: Array<(api: ToastContextValue) => void> = [];
let pendingToastIdCounter = 0;

// Filled: a toast is a brief, glanceable interruption, so the severity mark
// needs to read as a solid shape rather than a hairline outline.
const severityIconProps = {
  info: { name: semanticIcons.info, size: 'md', variant: 'filled' },
  success: { name: semanticIcons.success, size: 'md', variant: 'filled' },
  warning: { name: semanticIcons.warning, size: 'md', variant: 'filled' },
  error: { name: semanticIcons.error, size: 'md', variant: 'filled' }
} as const;

function enqueueToastOperation(operation: (api: ToastContextValue) => void) {
  pendingToastOperations.push(operation);
  notifyToastListeners();
}

function flushPendingToastOperations() {
  if (!toastsApiRef) return;
  while (pendingToastOperations.length > 0) {
    const operation = pendingToastOperations.shift();
    try {
      operation?.(toastsApiRef);
    } catch (error) {
      if (__DEV__) {
        console.error('[toasts] queued operation failed', error);
      }
    }
  }
}

function ensureToastId(providedId?: string) {
  if (providedId) return providedId;
  pendingToastIdCounter += 1;
  return `pending-toast-${Date.now()}-${pendingToastIdCounter}`;
}

function createSeverityIcon(severity: 'info' | 'success' | 'warning' | 'error') {
  const props = severityIconProps[severity];
  return React.createElement(Icon, props);
}

function normalizeToastShortcut(options: ToastShortcut, severity: 'info' | 'success' | 'warning' | 'error'): ToastOptions {
  if (typeof options === 'string') {
    return {
      message: options,
      sev: severity,
      icon: createSeverityIcon(severity),
    };
  }

  return {
    ...options,
    sev: severity,
    ...(options.icon === undefined ? { icon: createSeverityIcon(severity) } : null)
  };
}

export const useToast = () => {
  const api = useContext(ToastApiContext);

  useEffect(() => {
    if (!api) {
      notifyToastListeners();
    }
  }, [api]);

  return api ?? toasts;
};

export const useActiveToast = () => {
  const state = useContext(ToastStateContext);

  useEffect(() => {
    if (!state) {
      notifyToastListeners();
    }
  }, [state]);

  return state ?? toastsStateRef;
};

interface ToastProviderProps {
  children: React.ReactNode;
  /** Default position for toasts */
  defaultPosition?: ToastPosition;
  /** Maximum number of toasts per position */
  limit?: number;
  /** Default auto hide duration */
  autoHide?: number;
  /** Default visual variant applied to toasts that don't specify their own */
  defaultVariant?: ToastVariant;
  /** Default size token applied to toasts that don't specify their own */
  defaultSize?: ComponentSizeValue;
  /**
   * Static viewport offset (px) reserved for app chrome. A dynamic offset
   * published via `useToastViewportOffset` / `setToastViewportOffset` takes
   * precedence per-axis when set.
   */
  offset?: ToastViewportOffset;
  /** Queue management options */
  queueOptions?: Partial<ToastQueueOptions>;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  defaultPosition = 'top-center',
  limit = 5,
  autoHide = 4000,
  defaultVariant,
  defaultSize,
  offset,
  queueOptions
}) => {
  const [toasts, setToast] = useState<ToastItem[]>([]);

  // Track the shell-published viewport offset so toast stacks stay clear of the
  // app header / status bar. Falls back to the static `offset` prop per axis.
  const [dynamicOffset, setDynamicOffset] = useState<ToastViewportOffset>(currentToastViewportOffset);
  useEffect(() => subscribeToastViewportOffset(setDynamicOffset), []);
  const viewportOffset = useMemo(() => ({
    top: dynamicOffset.top ?? offset?.top ?? 0,
    bottom: dynamicOffset.bottom ?? offset?.bottom ?? 0,
    left: dynamicOffset.left ?? offset?.left ?? 0,
    right: dynamicOffset.right ?? offset?.right ?? 0,
  }), [dynamicOffset, offset?.top, offset?.bottom, offset?.left, offset?.right]);

  // Default queue options
  const defaultQueueOptions: ToastQueueOptions = {
    maxVisible: limit,
    stackDirection: 'down',
    spacing: 8,
    priority: 'fifo',
    allowDuplicates: true,
  };

  const finalQueueOptions = { ...defaultQueueOptions, ...queueOptions };

  const show = useCallback((options: ToastOptions) => {
    const id = ensureToastId(options.id);
    const position = options.position || defaultPosition;
    const hideTimeout = options.autoHide !== undefined ? options.autoHide : autoHide;
    
    const toast: ToastItem = {
      ...options,
      id,
      position,
      variant: options.variant ?? defaultVariant,
      size: options.size ?? defaultSize,
      visible: true,
      children: options.message || options.children,
      timestamp: Date.now(),
      priority: options.priority || 0,
    };
    
    setToast(prev => {
      // Remove oldest toasts if limit exceeded
      const positionToast = prev.filter(n => n.position === position);
      let updatedToast = prev;
      
      if (positionToast.length >= limit) {
        const oldestInPosition = positionToast[0];
        updatedToast = prev.filter(n => n.id !== oldestInPosition.id);
      }
      
      return [...updatedToast, toast];
    });
    
    // Auto hide if specified
    if (hideTimeout > 0) {
      setTimeout(() => {
        hide(id);
      }, hideTimeout);
    }
    
    return id;
  }, [defaultPosition, limit, autoHide, defaultVariant, defaultSize]);

  const hide = useCallback((id: string) => {
    setToast(prev => prev.map(toast => 
      toast.id === id 
        ? { ...toast, visible: false } 
        : toast
    ));
    
    // Remove toast after animation
    setTimeout(() => {
      setToast(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  }, []);

  const hideAll = useCallback(() => {
    setToast(prev => prev.map(toast => ({ 
      ...toast, 
      visible: false 
    })));
    
    // Remove all toasts after animation
    setTimeout(() => {
      setToast([]);
    }, 300);
  }, []);

  const update = useCallback((id: string, options: Partial<ToastOptions>) => {
    setToast(prev => prev.map(toast =>
      toast.id === id 
        ? { ...toast, ...options }
        : toast
    ));
  }, []);

  const send = useCallback((options: ToastOptions) => {
    return show(options);
  }, [show]);

  // Severity-based toast methods
  const info = useCallback((options: ToastShortcut) => {
    return show(normalizeToastShortcut(options, 'info'));
  }, [show]);

  const success = useCallback((options: ToastShortcut) => {
    return show(normalizeToastShortcut(options, 'success'));
  }, [show]);

  const warning = useCallback((options: ToastShortcut) => {
    return show(normalizeToastShortcut(options, 'warning'));
  }, [show]);

  const warn = useCallback((options: ToastShortcut) => {
    return warning(options); // Alias for warning
  }, [warning]);

  const error = useCallback((options: ToastShortcut) => {
    return show(normalizeToastShortcut(options, 'error'));
  }, [show]);

  // Enhanced queue management methods
  const hideGroup = useCallback((groupId: string) => {
    setToast(prev => prev.map(toast => 
      toast.groupId === groupId 
        ? { ...toast, visible: false } 
        : toast
    ));
    
    // Remove toasts after animation
    setTimeout(() => {
      setToast(prev => prev.filter(toast => toast.groupId !== groupId));
    }, 300);
  }, []);

  const batch = useCallback((toastOptions: ToastOptions[]) => {
    const ids: string[] = [];
    toastOptions.forEach(options => {
      ids.push(show(options));
    });
    return ids;
  }, [show]);

  const promise = useCallback(<T,>(
    promiseToResolve: Promise<T>,
    options: {
      pending: ToastShortcut;
      success: ToastShortcut | ((data: T) => ToastShortcut);
      error: ToastShortcut | ((error: any) => ToastShortcut);
    }
  ): Promise<T> => {
    const pendingId = show(normalizeToastShortcut(options.pending, 'info'));
    
    return promiseToResolve
      .then((data) => {
        hide(pendingId);
        const successOptions = typeof options.success === 'function' 
          ? options.success(data) 
          : options.success;
        show(normalizeToastShortcut(successOptions, 'success'));
        return data;
      })
      .catch((error) => {
        hide(pendingId);
        const errorOptions = typeof options.error === 'function' 
          ? options.error(error) 
          : options.error;
        show(normalizeToastShortcut(errorOptions, 'error'));
        throw error;
      });
  }, [show, hide]);

  const contextValue = useMemo<ToastContextValue>(() => ({
    show,
    send,
    hide,
    hideAll,
    hideGroup,
    update,
    batch,
    promise,
    info,
    success,
    warning,
    warn: warning,
    error
  }), [show, send, hide, hideAll, hideGroup, update, batch, promise, info, success, warning, error]);

  useEffect(() => {
    toastsStateRef = toasts;
  }, [toasts]);

  useEffect(() => {
    toastsApiRef = contextValue;
    flushPendingToastOperations();
    return () => {
      if (toastsApiRef === contextValue) {
        toastsApiRef = null;
        toastsStateRef = [];
      }
    };
  }, [contextValue]);

  const getPositionStyle = (position: ToastPosition): ViewStyle => {
    // App-shell aware offsets (header height, safe-area/status bar, sidebars).
    const { top: oTop, bottom: oBottom, left: oLeft, right: oRight } = viewportOffset;
    // Keep centered stacks centered within the content region between any side
    // chrome (e.g. a left navbar shifts the visual center rightward).
    const centerShift = (oLeft - oRight) / 2;

    if (Platform.OS === 'web') {
      const horizontalMargin = 20;
      const windowWidth = Dimensions.get('window')?.width ?? 1024;
      const availableWidth = Math.max(windowWidth - horizontalMargin * 2, 0);
      const centerWidth = Math.min(400, availableWidth || 400);
      const centerLeft = Math.max((windowWidth - centerWidth) / 2 + centerShift, horizontalMargin);

      const topPos = 20 + oTop;
      const bottomPos = 20 + oBottom;
      const leftPos = horizontalMargin + oLeft;
      const rightPos = horizontalMargin + oRight;

      const webBase: ViewStyle = {
        position: 'fixed' as any,
        zIndex: 2000,
        pointerEvents: 'box-none',
        maxWidth: 400,
        minWidth: 'auto' as const,
      };

      switch (position) {
        case 'top-left':
          return { ...webBase, top: topPos, left: leftPos };
        case 'top-right':
          return { ...webBase, top: topPos, right: rightPos };
        case 'top-center':
          return { ...webBase, top: topPos, left: centerLeft, width: centerWidth };
        case 'bottom-left':
          return { ...webBase, bottom: bottomPos, left: leftPos };
        case 'bottom-right':
          return { ...webBase, bottom: bottomPos, right: rightPos };
        case 'bottom-center':
          return { ...webBase, bottom: bottomPos, left: centerLeft, width: centerWidth };
        default:
          return { ...webBase, top: topPos, right: rightPos };
      }
    }

    const horizontalMargin = 16;
    const screenWidth = Dimensions.get('window').width;
    const rawWidth = screenWidth - horizontalMargin * 2;
    const containerWidth = rawWidth > 0 ? Math.min(400, rawWidth) : Math.min(400, screenWidth);
    const centerLeft = Math.max((screenWidth - containerWidth) / 2 + centerShift, horizontalMargin);

    const topPos = 20 + oTop;
    const bottomPos = 20 + oBottom;
    const leftPos = horizontalMargin + oLeft;
    const rightPos = horizontalMargin + oRight;

    const nativeBase: ViewStyle = {
      position: 'absolute',
      zIndex: 2000,
      pointerEvents: 'box-none',
      width: containerWidth,
    };

    switch (position) {
      case 'top-left':
        return { ...nativeBase, top: topPos, left: leftPos };
      case 'top-right':
        return { ...nativeBase, top: topPos, right: rightPos };
      case 'top-center':
        return { ...nativeBase, top: topPos, left: centerLeft };
      case 'bottom-left':
        return { ...nativeBase, bottom: bottomPos, left: leftPos };
      case 'bottom-right':
        return { ...nativeBase, bottom: bottomPos, right: rightPos };
      case 'bottom-center':
        return { ...nativeBase, bottom: bottomPos, left: centerLeft };
      default:
        return { ...nativeBase, top: topPos, right: rightPos };
    }
  };

  // Group toasts by position
  const toastsByPosition = toasts.reduce((acc, toast) => {
    const position = toast.position;
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(toast);
    return acc;
  }, {} as Record<ToastPosition, ToastItem[]>);

  return (
    <ToastApiContext.Provider value={contextValue}>
      <ToastStateContext.Provider value={toasts}>
        {children}
      
      {/* Render toast containers for each position */}
      {Object.entries(toastsByPosition).map(([position, positionToast]) => (
        <View 
          key={position} 
          style={getPositionStyle(position as ToastPosition)}
        >
          {positionToast.map((toast, index) => {
            // Determine animation direction based on position
            const getAnimationPosition = (pos: string) => {
              if (pos.includes('top')) return 'top';
              if (pos.includes('bottom')) return 'bottom';
              if (pos.includes('left')) return 'left';
              if (pos.includes('right')) return 'right';
              return 'top'; // default
            };

            const isBottomPosition = position.includes('bottom');
            const isLastItem = index === positionToast.length - 1;
            const isFirstItem = index === 0;

            return (
              <View 
                key={toast.id} 
                style={{ 
                  marginBottom: isBottomPosition 
                    ? (isLastItem ? 0 : 12) 
                    : (isLastItem ? 0 : 12),
                  marginTop: isBottomPosition && !isFirstItem ? 0 : 0
                }}
              >
                <Toast
                  {...toast}
                  visible={toast.visible}
                  position={getAnimationPosition(position)}
                  onClose={() => hide(toast.id)}
                />
              </View>
            );
          })}
        </View>
      ))}
    </ToastStateContext.Provider>
    </ToastApiContext.Provider>
  );
};

// Export a simple toasts object for easier usage
export const toasts: ToastContextValue = {
  show: (options: ToastOptions) => {
    const id = ensureToastId(options.id);
    const payload = { ...options, id };
    if (toastsApiRef) {
      return toastsApiRef.show(payload);
    }
    enqueueToastOperation(api => api.show(payload));
    return id;
  },
  send: (options: ToastOptions) => {
    return toasts.show(options);
  },
  hide: (id: string) => {
    if (toastsApiRef) {
      toastsApiRef.hide(id);
      return;
    }
    enqueueToastOperation(api => api.hide(id));
  },
  hideAll: () => {
    if (toastsApiRef) {
      toastsApiRef.hideAll();
      return;
    }
    enqueueToastOperation(api => api.hideAll());
  },
  hideGroup: (groupId: string) => {
    if (toastsApiRef) {
      toastsApiRef.hideGroup(groupId);
      return;
    }
    enqueueToastOperation(api => api.hideGroup(groupId));
  },
  batch: (toastOptions: ToastOptions[]) => {
    if (toastsApiRef) {
      return toastsApiRef.batch(toastOptions);
    }
    const ids: string[] = [];
    enqueueToastOperation(api => {
      ids.push(...api.batch(toastOptions));
    });
    return ids;
  },
  promise: <T,>(
    promiseToResolve: Promise<T>,
    options: {
      pending: ToastShortcut;
      success: ToastShortcut | ((data: T) => ToastShortcut);
      error: ToastShortcut | ((error: any) => ToastShortcut);
    }
  ) => {
    if (toastsApiRef) {
      return toastsApiRef.promise(promiseToResolve, options);
    }
    // Fallback for when provider is not available
    return promiseToResolve;
  },
  update: (id: string, options: Partial<ToastOptions>) => {
    if (toastsApiRef) {
      toastsApiRef.update(id, options);
      return;
    }
    enqueueToastOperation(api => api.update(id, options));
  },
  info: (options: ToastShortcut) => toasts.show(normalizeToastShortcut(options, 'info')),
  success: (options: ToastShortcut) => toasts.show(normalizeToastShortcut(options, 'success')),
  warning: (options: ToastShortcut) => toasts.show(normalizeToastShortcut(options, 'warning')),
  warn: (options: ToastShortcut) => toasts.show(normalizeToastShortcut(options, 'warning')),
  error: (options: ToastShortcut) => toasts.show(normalizeToastShortcut(options, 'error')),
};

// Hook to get toasts object with actual context
export const useToastApi = () => useToast();

export const useActiveToasts = useActiveToast;

export const onToastsRequested = onToastRequested;
