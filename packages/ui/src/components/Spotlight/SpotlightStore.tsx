import React, { createContext, useContext, useCallback, useState, ReactNode, useEffect, useMemo } from 'react';
import { directSpotlightStateManager } from './DirectSpotlightState';
import { isDebugLogging, debugLog, devError } from '../../core/utils/logger';

// Debug flag for spotlight logs

type SpotlightRequestListener = () => void;

const spotlightRequestListeners = new Set<SpotlightRequestListener>();
let pendingSpotlightRequest = false;

function requestSpotlightProvider() {
  if (spotlightRequestListeners.size === 0) {
    pendingSpotlightRequest = true;
    return;
  }

  pendingSpotlightRequest = false;
  spotlightRequestListeners.forEach(listener => {
    try {
      listener();
    } catch (error) {
      if (isDebugLogging) {
        devError('[spotlight] provider listener error', error);
      }
    }
  });
}

export function onSpotlightRequested(listener: SpotlightRequestListener) {
  spotlightRequestListeners.add(listener);
  if (pendingSpotlightRequest) {
    pendingSpotlightRequest = false;
    try {
      listener();
    } catch (error) {
      if (isDebugLogging) {
        devError('[spotlight] provider listener error', error);
      }
    }
  }
  return () => {
    spotlightRequestListeners.delete(listener);
  };
}

export interface SpotlightState {
  opened: boolean;
  query: string;
  selectedIndex: number;
}

export interface SpotlightStore {
  state: SpotlightState;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (query: string) => void;
  setSelectedIndex: (index: number) => void;
  navigateUp: () => void;
  navigateDown: () => void;
}

export interface SpotlightProviderProps {
  children: ReactNode;
}

const SpotlightContext = createContext<SpotlightStore | null>(null);

// Global spotlight state manager for persistence across remounts
interface GlobalSpotlightState {
  opened: boolean;
  query: string;
  selectedIndex: number;
}

type SpotlightStateListener = (state: GlobalSpotlightState) => void;

class SpotlightStateManager {
  private state: GlobalSpotlightState = {
    opened: false,
    query: '',
    selectedIndex: -1
  };
  
  private listeners: Set<SpotlightStateListener> = new Set();

  getState(): GlobalSpotlightState {
    return { ...this.state };
  }

  setState(updates: Partial<GlobalSpotlightState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  subscribe(listener: SpotlightStateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        devError('Error in spotlight state listener:', error);
      }
    });
  }
}

// Create singleton instance
const globalSpotlightState = new SpotlightStateManager();

function openGlobalSpotlight() {
  globalSpotlightState.setState({ opened: true });
  directSpotlightStateManager.open?.();
}

function closeGlobalSpotlight() {
  globalSpotlightState.setState({ opened: false, query: '', selectedIndex: -1 });
  directSpotlightStateManager.close?.();
}

function toggleGlobalSpotlight() {
  const currentState = globalSpotlightState.getState();
  globalSpotlightState.setState({ opened: !currentState.opened });
  directSpotlightStateManager.toggle?.();
}

export function SpotlightProvider({ children }: SpotlightProviderProps) {
  // Track provider mounting
  const mountTimeRef = React.useRef(Date.now());
  const renderCountRef = React.useRef(0);
  renderCountRef.current += 1;
  
  debugLog('[SpotlightProvider] Render #' + renderCountRef.current + ' (mounted at ' + mountTimeRef.current + ')');
  
  // Use global state manager for persistence across remounts
  const [state, setState] = useState<SpotlightState>(() => {
    const globalState = globalSpotlightState.getState();
  debugLog('[SpotlightProvider] Initializing with global state:', globalState);
    return {
      opened: globalState.opened,
      query: globalState.query,
      selectedIndex: globalState.selectedIndex
    };
  });

  // Subscribe to global state changes
  useEffect(() => {
  debugLog('[SpotlightProvider] Setting up subscription');
    const unsubscribe = globalSpotlightState.subscribe((globalState) => {
  debugLog('[SpotlightProvider] Global state changed:', globalState);
      setState(prev => {
        if (
          prev.opened === globalState.opened &&
          prev.query === globalState.query &&
          prev.selectedIndex === globalState.selectedIndex
        ) {
          return prev; // no change, skip render
        }
        return {
          opened: globalState.opened,
          query: globalState.query,
          selectedIndex: globalState.selectedIndex
        };
      });
    });
    
    return () => {
  debugLog('[SpotlightProvider] Cleaning up subscription - provider unmounting');
      unsubscribe();
    };
  }, []);

  // Create stable callbacks that update global state
  const open = useCallback(() => {
  debugLog('[SpotlightProvider] Opening spotlight');
    globalSpotlightState.setState({ opened: true });
  }, []);

  const close = useCallback(() => {
  debugLog('[SpotlightProvider] Closing spotlight');
    globalSpotlightState.setState({ opened: false, query: '', selectedIndex: -1 });
  }, []);

  const toggle = useCallback(() => {
    const currentState = globalSpotlightState.getState();
  debugLog('[SpotlightProvider] Toggling spotlight, current state:', currentState);
    globalSpotlightState.setState({ opened: !currentState.opened });
  }, []);

  const setQuery = useCallback((query: string) => {
  debugLog('[SpotlightProvider] Setting query:', query);
    globalSpotlightState.setState({ query });
  }, []);

  const setSelectedIndex = useCallback((selectedIndex: number) => {
  debugLog('[SpotlightProvider] Setting selectedIndex:', selectedIndex);
    globalSpotlightState.setState({ selectedIndex });
  }, []);

  const navigateUp = useCallback(() => {
    const currentState = globalSpotlightState.getState();
    const newIndex = currentState.selectedIndex > 0 ? currentState.selectedIndex - 1 : -1;
    globalSpotlightState.setState({ selectedIndex: newIndex });
  }, []);

  const navigateDown = useCallback((maxIndex: number = 0) => {
    const currentState = globalSpotlightState.getState();
    const newIndex = currentState.selectedIndex < maxIndex - 1 ? currentState.selectedIndex + 1 : maxIndex - 1;
    globalSpotlightState.setState({ selectedIndex: newIndex });
  }, []);

  // Memoize the store object to prevent unnecessary re-renders
  const store: SpotlightStore = useMemo(() => ({
    state,
    open,
    close,
    toggle,
    setQuery,
    setSelectedIndex,
    navigateUp,
    navigateDown,
  }), [state, open, close, toggle, setQuery, setSelectedIndex, navigateUp, navigateDown]);

  // Register this store as the default for global access - maintain stable callbacks
  useEffect(() => {
    const stableStore: SpotlightStore = {
      state: globalSpotlightState.getState(),
      open: () => globalSpotlightState.setState({ opened: true }),
      close: () => globalSpotlightState.setState({ opened: false, query: '', selectedIndex: -1 }),
      toggle: () => {
        const currentState = globalSpotlightState.getState();
        globalSpotlightState.setState({ opened: !currentState.opened });
      },
      setQuery: (query: string) => globalSpotlightState.setState({ query }),
      setSelectedIndex: (selectedIndex: number) => globalSpotlightState.setState({ selectedIndex }),
      navigateUp: () => {
        const currentState = globalSpotlightState.getState();
        const newIndex = currentState.selectedIndex > 0 ? currentState.selectedIndex - 1 : -1;
        globalSpotlightState.setState({ selectedIndex: newIndex });
      },
      navigateDown: (maxIndex: number = 0) => {
        const currentState = globalSpotlightState.getState();
        const newIndex = currentState.selectedIndex < maxIndex - 1 ? currentState.selectedIndex + 1 : maxIndex - 1;
        globalSpotlightState.setState({ selectedIndex: newIndex });
      }
    };
    
    setDefaultSpotlightStore(stableStore);
    return () => setDefaultSpotlightStore(null);
  }, []); // No dependencies - stable callbacks

  return (
    <SpotlightContext.Provider value={store}>
      {children}
    </SpotlightContext.Provider>
  );
}

export function useSpotlightStore(): SpotlightStore {
  const store = useContext(SpotlightContext);
  useEffect(() => {
    if (!store) {
      requestSpotlightProvider();
    }
  }, [store]);

  if (store) {
    return store;
  }

  const navigate = (direction: 'up' | 'down', maxIndex: number = 0) => {
    requestSpotlightProvider();
    const currentState = globalSpotlightState.getState();
    if (direction === 'up') {
      const newIndex = currentState.selectedIndex > 0 ? currentState.selectedIndex - 1 : -1;
      globalSpotlightState.setState({ selectedIndex: newIndex });
    } else {
      const newIndex = currentState.selectedIndex < maxIndex - 1 ? currentState.selectedIndex + 1 : maxIndex - 1;
      globalSpotlightState.setState({ selectedIndex: newIndex });
    }
  };

  return {
    state: globalSpotlightState.getState(),
    open: () => {
      requestSpotlightProvider();
      openGlobalSpotlight();
    },
    close: () => {
      requestSpotlightProvider();
      closeGlobalSpotlight();
    },
    toggle: () => {
      requestSpotlightProvider();
      toggleGlobalSpotlight();
    },
    setQuery: (query: string) => {
      requestSpotlightProvider();
      globalSpotlightState.setState({ query });
    },
    setSelectedIndex: (index: number) => {
      requestSpotlightProvider();
      globalSpotlightState.setState({ selectedIndex: index });
    },
    navigateUp: () => navigate('up'),
    navigateDown: (maxIndex: number = 0) => navigate('down', maxIndex),
  };
}

// Default spotlight store for simple usage
const defaultStore: SpotlightStore = {
  state: { opened: false, query: '', selectedIndex: -1 },
  open: () => {},
  close: () => {},
  toggle: () => {},
  setQuery: () => {},
  setSelectedIndex: () => {},
  navigateUp: () => {},
  navigateDown: () => {},
};

let defaultStoreCallbacks: SpotlightStore | null = null;

export function useSpotlightStoreInstance(): [SpotlightStore, SpotlightStore] {
  const [state, setState] = useState<SpotlightState>({
    opened: false,
    query: '',
    selectedIndex: -1
  });

  const open = useCallback(() => setState(prev => ({ ...prev, opened: true })), []);
  const close = useCallback(() => setState(prev => ({ ...prev, opened: false, query: '', selectedIndex: -1 })), []);
  const toggle = useCallback(() => setState(prev => ({ ...prev, opened: !prev.opened })), []);
  const setQuery = useCallback((query: string) => setState(prev => ({ ...prev, query })), []);
  const setSelectedIndex = useCallback((selectedIndex: number) => setState(prev => ({ ...prev, selectedIndex })), []);
  const navigateUp = useCallback(() => setState(prev => ({ ...prev, selectedIndex: prev.selectedIndex > 0 ? prev.selectedIndex - 1 : -1 })), []);
  const navigateDown = useCallback((maxIndex: number = 0) => setState(prev => ({ ...prev, selectedIndex: prev.selectedIndex < maxIndex - 1 ? prev.selectedIndex + 1 : maxIndex - 1 })), []);

  const store: SpotlightStore = useMemo(() => ({
    state,
    open,
    close,
    toggle,
    setQuery,
    setSelectedIndex,
    navigateUp,
    navigateDown,
  }), [state, open, close, toggle, setQuery, setSelectedIndex, navigateUp, navigateDown]);

  const actions: SpotlightStore = useMemo(() => ({
    state,
    open,
    close,
    toggle,
    setQuery,
    setSelectedIndex,
    navigateUp,
    navigateDown,
  }), [state, open, close, toggle, setQuery, setSelectedIndex, navigateUp, navigateDown]);

  return [store, actions];
}

export const createSpotlightStore = useSpotlightStoreInstance;

// Global spotlight actions - use global state manager
export const spotlight = {
  open: () => {
  debugLog('[Global spotlight] Opening via global action');
    requestSpotlightProvider();
    openGlobalSpotlight();
  },
  close: () => {
  debugLog('[Global spotlight] Closing via global action');
    requestSpotlightProvider();
    closeGlobalSpotlight();
  },
  toggle: () => {
    const currentState = globalSpotlightState.getState();
  debugLog('[Global spotlight] Toggling via global action, current state:', currentState);
    requestSpotlightProvider();
    toggleGlobalSpotlight();
  },
};

export function setDefaultSpotlightStore(store: SpotlightStore | null) {
  defaultStoreCallbacks = store;
}
