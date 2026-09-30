import * as React from 'react';

export interface HapticsContextValue {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  temporarilyDisable: (ms: number) => void;
}

const HapticsContext = React.createContext<HapticsContextValue | undefined>(undefined);

export interface HapticsProviderProps {
  children: React.ReactNode;
  /** Initial on/off state. Default `true` (or the parent provider's state when nested). */
  defaultEnabled?: boolean;
}

/** The provider that owns haptics state (see `HapticsProvider`). */
const HapticsProviderRoot: React.FC<HapticsProviderProps> = ({ children, defaultEnabled = true }) => {
  const [enabled, setEnabled] = React.useState(defaultEnabled);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const enabledRef = React.useRef(defaultEnabled);
  const restoreRef = React.useRef(defaultEnabled);

  const updateEnabled = React.useCallback((next: boolean) => {
    enabledRef.current = next;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      restoreRef.current = next;
    }
    setEnabled(next);
  }, []);

  const temporarilyDisable = React.useCallback((ms: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    else restoreRef.current = enabledRef.current;
    setEnabled(false);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      enabledRef.current = restoreRef.current;
      setEnabled(restoreRef.current);
    }, ms);
  }, []);

  React.useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const value = React.useMemo<HapticsContextValue>(
    () => ({ enabled, setEnabled: updateEnabled, temporarilyDisable }),
    [enabled, updateEnabled, temporarilyDisable]
  );

  return (
    <HapticsContext.Provider value={value}>
      {children}
    </HapticsContext.Provider>
  );
};

/**
 * App-wide haptics switch. A nested HapticsProvider without `defaultEnabled`
 * shares its parent's state instead of starting a separate one, so an app-level
 * provider above `PlocksProvider` (which mounts one) stays in control.
 */
export const HapticsProvider: React.FC<HapticsProviderProps> = (props) => {
  const parent = React.useContext(HapticsContext);
  if (parent && props.defaultEnabled === undefined) {
    return <>{props.children}</>;
  }
  return <HapticsProviderRoot {...props} />;
};

HapticsProvider.displayName = 'HapticsProvider';

export function useHapticsSettings(): HapticsContextValue {
  const ctx = React.useContext(HapticsContext);
  if (!ctx) throw new Error('useHapticsSettings must be used within <HapticsProvider>');
  return ctx;
}

export function useOptionalHapticsSettings(): HapticsContextValue | undefined {
  return React.useContext(HapticsContext);
}
