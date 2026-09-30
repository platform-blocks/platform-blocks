/**
 * Global Spotlight Hook for Direct State Access
 * 
 * This hook bypasses the SpotlightProvider context and uses the global state directly.
 * This should be used in the GlobalSpotlight component to avoid provider re-mounting issues.
 */

import { useState, useEffect, useCallback } from 'react';
import type { SpotlightState } from './SpotlightStore';
import { devError } from '@plocks/ui';

// Global spotlight state manager (reuse the same pattern as accordion)
interface GlobalSpotlightState {
  opened: boolean;
  query: string;
  selectedIndex: number;
}

type SpotlightStateListener = (state: GlobalSpotlightState) => void;

class DirectSpotlightStateManager {
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

  open(query?: string): void {
    this.setState({ 
      opened: true,
      ...(query !== undefined && { query })
    });
  }

  close(): void {
    this.setState({ opened: false, query: '', selectedIndex: -1 });
  }

  setQuery(query: string): void {
    this.setState({ query });
  }

  toggle(): void {
    this.setState({ opened: !this.state.opened });
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
        devError('Error in direct spotlight state listener:', error);
      }
    });
  }
}

// Create singleton instance
export const directSpotlightStateManager = new DirectSpotlightStateManager();

// Hook that uses the direct global state (bypasses provider)
export function useDirectSpotlightState() {
  const [state, setState] = useState<SpotlightState>(() => {
    const globalState = directSpotlightStateManager.getState();
    return {
      opened: globalState.opened,
      query: globalState.query,
      selectedIndex: globalState.selectedIndex
    };
  });

  useEffect(() => {
    const unsubscribe = directSpotlightStateManager.subscribe((globalState) => {
      setState({
        opened: globalState.opened,
        query: globalState.query,
        selectedIndex: globalState.selectedIndex
      });
    });
    
    // Sync with current state
    const currentState = directSpotlightStateManager.getState();
    setState({
      opened: currentState.opened,
      query: currentState.query,
      selectedIndex: currentState.selectedIndex
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const open = useCallback((query?: string) => {
    directSpotlightStateManager.open(query);
  }, []);

  const close = useCallback(() => {
    directSpotlightStateManager.close();
  }, []);

  const toggle = useCallback(() => {
    directSpotlightStateManager.toggle();
  }, []);

  const setQuery = useCallback((query: string) => {
    directSpotlightStateManager.setQuery(query);
  }, []);

  return {
    state,
    open,
    close,
    toggle,
    setQuery
  };
}

// Export global actions that can be used from anywhere
export const directSpotlight = {
  open: (query?: string) => directSpotlightStateManager.open(query),
  close: () => directSpotlightStateManager.close(),
  toggle: () => directSpotlightStateManager.toggle(),
  setQuery: (query: string) => directSpotlightStateManager.setQuery(query),
  getState: () => directSpotlightStateManager.getState()
};
