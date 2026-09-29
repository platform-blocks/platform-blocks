import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { hasDOM, isWeb } from '../../core/platform/flags';
import { resolveOptionalModule } from '../../utils/optionalModule';

export interface UseClipboardOptions {
  /** Time in ms after which the copied state will reset, 2000 by default. `0` keeps it until `reset()`. */
  timeout?: number;
}

export interface UseClipboardReturnValue {
  /**
   * Copies `value` (strings as-is, anything else JSON-stringified). Resolves
   * `true` once the text is on the clipboard, `false` when copying failed —
   * the failure also lands in `error`; it never rejects.
   */
  copy: (value: unknown) => Promise<boolean>;
  /** Function to reset copied state and error */
  reset: () => void;
  /** Error if copying failed */
  error: Error | null;
  /** Boolean indicating if the value was copied successfully */
  copied: boolean;
  /** The last copied value (stringified) */
  lastValue: string | null;
  /**
   * True when there is no way to copy: web without both `navigator.clipboard`
   * and the `execCommand('copy')` fallback, or native without `expo-clipboard`.
   * Always `false` during server rendering and hydration.
   */
  unsupported: boolean;
}

/** The part of expo-clipboard this hook uses (optional dependency, native only). */
interface ExpoClipboardModule {
  setStringAsync?: (text: string) => Promise<unknown>;
}

// Resolved lazily and only on native: the web never needs expo-clipboard.
const getExpoClipboard = (): ExpoClipboardModule | null =>
  isWeb
    ? null
    : resolveOptionalModule<ExpoClipboardModule>('expo-clipboard', {
        devWarning: 'expo-clipboard not found, clipboard support will be limited on native platforms',
      });

const toText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
};

const toError = (value: unknown): Error =>
  value instanceof Error ? value : new Error(typeof value === 'string' ? value : 'Copy failed');

/** Web fallback for insecure contexts / old browsers: select a hidden textarea and `execCommand('copy')`. */
function execCommandCopy(text: string): boolean {
  if (!hasDOM || !document.body || typeof document.execCommand !== 'function') return false;

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.setAttribute('aria-hidden', 'true');
  textarea.style.position = 'fixed';
  textarea.style.top = '-1000px';
  textarea.style.opacity = '0';

  // `select()` moves focus and the selection; put both back afterwards.
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const selection = document.getSelection();
  const previousRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  document.body.appendChild(textarea);
  try {
    textarea.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
    if (previousRange && selection) {
      selection.removeAllRanges();
      selection.addRange(previousRange);
    }
    previousFocus?.focus?.({ preventScroll: true });
  }
}

/** Writes `text` to the system clipboard; throws when every strategy failed. */
async function writeToClipboard(text: string): Promise<void> {
  if (isWeb) {
    if (!hasDOM) throw new Error('The clipboard is not available outside the browser.');
    let clipboardError: unknown = null;
    if (typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch (error) {
        // Permission denied / insecure context: try the fallback below.
        clipboardError = error;
      }
    }
    if (execCommandCopy(text)) return;
    throw toError(clipboardError ?? new Error('The copy command was unsuccessful.'));
  }

  const clipboard = getExpoClipboard();
  if (typeof clipboard?.setStringAsync !== 'function') {
    throw new Error('Clipboard is unavailable: install expo-clipboard to copy on native platforms.');
  }
  await clipboard.setStringAsync(text);
}

function isClipboardUnsupported(): boolean {
  if (isWeb) {
    if (!hasDOM) return false;
    const hasClipboardApi = typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function';
    return !hasClipboardApi && typeof document.execCommand !== 'function';
  }
  return typeof getExpoClipboard()?.setStringAsync !== 'function';
}

const subscribeNothing = () => () => {};
const getUnsupportedServerSnapshot = () => false;

/**
 * Copies text to the clipboard and tracks the copied state, which resets after
 * `timeout` ms.
 *
 * - Web: `navigator.clipboard.writeText`, falling back to a hidden textarea +
 *   `execCommand('copy')` (insecure contexts, older browsers).
 * - Native: `expo-clipboard` (optional dependency); without it `copy()` sets `error`.
 *
 * The returned object keeps its identity until its state changes; `copy` and
 * `reset` are stable (while `timeout` is unchanged).
 *
 * @example
 * const { copy, copied } = useClipboard({ timeout: 1500 });
 * <Button onPress={() => copy(url)}>{copied ? 'Copied' : 'Copy link'}</Button>
 *
 * // `copy` resolves with the outcome:
 * if (await copy(url)) toast.show({ title: 'Link copied' });
 */
export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturnValue {
  const { timeout = 2000 } = options;
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastValue, setLastValue] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  // Capabilities are only known in a live client render (server + hydration: supported).
  const unsupported = useSyncExternalStore(subscribeNothing, isClipboardUnsupported, getUnsupportedServerSnapshot);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    };
  }, []);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setCopied(false);
    setError(null);
  }, [clearTimer]);

  const copy = useCallback(
    async (value: unknown): Promise<boolean> => {
      reset();
      const text = toText(value);
      setLastValue(text);
      try {
        await writeToClipboard(text);
      } catch (caught) {
        if (mountedRef.current) setError(toError(caught));
        return false;
      }
      if (!mountedRef.current) return true;
      setCopied(true);
      if (timeout > 0) {
        clearTimer();
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          setCopied(false);
          setError(null);
        }, timeout);
      }
      return true;
    },
    [reset, clearTimer, timeout]
  );

  return useMemo(
    () => ({ copy, reset, error, copied, lastValue, unsupported }),
    [copy, reset, error, copied, lastValue, unsupported]
  );
}

export default useClipboard;
