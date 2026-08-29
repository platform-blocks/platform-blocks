import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ViewStyle, Platform, useWindowDimensions } from 'react-native';
import { ToastStack } from './ToastStack';
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

// `visible`, `onClose`, `position`, `paused` and `onExited` are owned by the
// provider: it drives the show/hide lifecycle, resolves the screen position, and
// pauses a whole stack while the pointer rests on it.
export interface ToastOptions extends Omit<ToastProps, 'visible' | 'onClose' | 'position' | 'paused' | 'onExited'> {
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

export interface ToastItem extends ToastOptions {
  id: string;
  /** False once the toast has started leaving; it is unmounted when it lands. */
  visible: boolean;
  position: ToastPosition;
  timestamp: number;
  priority: number;
}

/**
 * Backstop for the `onExited` handshake. A toast is normally removed the instant
 * its hide transition reports completion; this only fires if that callback never
 * arrives (the toast was unmounted mid-transition, or animations are stubbed in
 * a test environment) so a hidden toast can never wedge the stack open.
 */
const removalFallbackDelay = (toast: ToastItem): number => {
  const configured = toast.animationConfig?.duration
    ?? toast.transitionDuration
    ?? toast.animationDuration
    ?? 300;
  return Math.max(configured, 0) + 250;
};

// Severity-specific toast options (omit severity since it's set by the method)
export type SeverityToastOptions = Omit<ToastOptions, 'severity'>;

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
      severity,
      icon: createSeverityIcon(severity),
    };
  }

  return {
    ...options,
    severity,
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

  // Subscribed rather than read once: a centred stack has to re-centre when the
  // window resizes, and a stack read from a stale width lands off-screen.
  const { width: windowWidth } = useWindowDimensions();

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

  const { maxVisible, spacing } = useMemo<ToastQueueOptions>(() => ({
    maxVisible: limit,
    stackDirection: 'down',
    // Enough air for each toast's shadow to read as its own surface.
    spacing: 12,
    priority: 'fifo',
    allowDuplicates: true,
    ...queueOptions,
  }), [limit, queueOptions]);

  // Dismissal is a two-step lifecycle: `visible: false` starts the hide
  // transition and keeps the toast mounted, then the toast reports `onExited`
  // and it is removed. These timers only cover the case where that report never
  // arrives — see `removalFallbackDelay`.
  const removalTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const remove = useCallback((id: string) => {
    const timer = removalTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      removalTimers.current.delete(id);
    }
    setToast(prev => (prev.some(toast => toast.id === id)
      ? prev.filter(toast => toast.id !== id)
      : prev));
  }, []);

  const show = useCallback((options: ToastOptions) => {
    const id = ensureToastId(options.id);
    const position = options.position || defaultPosition;

    const toast: ToastItem = {
      ...options,
      id,
      position,
      variant: options.variant ?? defaultVariant,
      size: options.size ?? defaultSize,
      visible: true,
      children: options.message || options.children,
      // The countdown belongs to the toast, which is the only thing that knows
      // whether the pointer is resting on the stack. Running a second timer here
      // used to double-fire the dismissal — and hid `persistent` toasts anyway.
      autoHide: options.autoHide ?? autoHide,
      timestamp: Date.now(),
      priority: options.priority || 0,
    };

    setToast(prev => {
      const next = [...prev, toast];
      const live = next.filter(item => item.position === position && item.visible);
      const overflow = live.length - Math.max(maxVisible, 1);
      if (overflow <= 0) return next;
      // Over the limit: retire the oldest, but let them play their exit instead
      // of deleting them out from under the toast that replaced them.
      const retiring = new Set(live.slice(0, overflow).map(item => item.id));
      return next.map(item => (retiring.has(item.id) ? { ...item, visible: false } : item));
    });

    return id;
  }, [defaultPosition, maxVisible, autoHide, defaultVariant, defaultSize]);

  const startHiding = useCallback((matches: (toast: ToastItem) => boolean) => {
    setToast(prev => {
      let changed = false;
      const next = prev.map(toast => {
        if (!toast.visible || !matches(toast)) return toast;
        changed = true;
        return { ...toast, visible: false };
      });
      return changed ? next : prev;
    });
  }, []);

  const hide = useCallback((id: string) => {
    startHiding(toast => toast.id === id);
  }, [startHiding]);

  const hideAll = useCallback(() => {
    startHiding(() => true);
  }, [startHiding]);

  const update = useCallback((id: string, options: Partial<ToastOptions>) => {
    setToast(prev => prev.map(toast =>
      toast.id === id
        // `message` is the shortcut spelling of `children`; honouring it here
        // means an update can replace a toast's body the same way `show` sets it.
        ? { ...toast, ...options, children: options.message ?? options.children ?? toast.children }
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
    startHiding(toast => toast.groupId === groupId);
  }, [startHiding]);

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
    // One toast for the whole operation. Hiding the pending toast and showing a
    // second one crossfades two messages in the same slot; settling in place
    // reads as the same notification resolving, and keeps the outcome where the
    // user was already looking. The pending toast is persistent because a
    // promise that outlives the default timeout would otherwise leave the user
    // with no toast at all until it settles.
    const pendingId = show({
      ...normalizeToastShortcut(options.pending, 'info'),
      persistent: true,
    });

    const settle = (
      shortcut: ToastShortcut,
      severity: 'success' | 'error',
    ) => {
      update(pendingId, {
        ...normalizeToastShortcut(shortcut, severity),
        persistent: false,
        autoHide,
      });
    };

    return promiseToResolve
      .then((data) => {
        const successOptions = typeof options.success === 'function'
          ? options.success(data)
          : options.success;
        settle(successOptions, 'success');
        return data;
      })
      .catch((error) => {
        const errorOptions = typeof options.error === 'function'
          ? options.error(error)
          : options.error;
        settle(errorOptions, 'error');
        throw error;
      });
  }, [show, update, autoHide]);

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

  // Arm the fallback removal for anything that has started leaving.
  useEffect(() => {
    toasts.forEach(toast => {
      if (toast.visible || removalTimers.current.has(toast.id)) return;
      const timer = setTimeout(() => {
        removalTimers.current.delete(toast.id);
        setToast(prev => prev.filter(item => item.id !== toast.id));
      }, removalFallbackDelay(toast));
      removalTimers.current.set(toast.id, timer);
    });
  }, [toasts]);

  useEffect(() => {
    const timers = removalTimers.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

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

    const isWeb = Platform.OS === 'web';
    const horizontalMargin = isWeb ? 20 : 16;
    const available = Math.max(windowWidth - horizontalMargin * 2, 0);
    // Stacks position their toasts absolutely, so the container needs a real
    // width — an auto-width container would collapse and take every toast's
    // `width: '100%'` down with it.
    const containerWidth = Math.min(400, available || 400);
    const centerLeft = Math.max((windowWidth - containerWidth) / 2 + centerShift, horizontalMargin);

    const topPos = 20 + oTop;
    const bottomPos = 20 + oBottom;
    const leftPos = horizontalMargin + oLeft;
    const rightPos = horizontalMargin + oRight;

    const base: ViewStyle = {
      position: (isWeb ? 'fixed' : 'absolute') as ViewStyle['position'],
      zIndex: 2000,
      pointerEvents: 'box-none',
      width: containerWidth,
      maxWidth: 400,
    };

    switch (position) {
      case 'top-left':
        return { ...base, top: topPos, left: leftPos };
      case 'top-right':
        return { ...base, top: topPos, right: rightPos };
      case 'top-center':
        return { ...base, top: topPos, left: centerLeft };
      case 'bottom-left':
        return { ...base, bottom: bottomPos, left: leftPos };
      case 'bottom-right':
        return { ...base, bottom: bottomPos, right: rightPos };
      case 'bottom-center':
        return { ...base, bottom: bottomPos, left: centerLeft };
      default:
        return { ...base, top: topPos, right: rightPos };
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
      
      {/* One stack per occupied position; the stack owns layout and motion. */}
      {Object.entries(toastsByPosition).map(([position, positionToast]) => (
        <ToastStack
          key={position}
          position={position as ToastPosition}
          items={positionToast}
          containerStyle={getPositionStyle(position as ToastPosition)}
          spacing={spacing}
          onClose={hide}
          onExited={remove}
        />
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
