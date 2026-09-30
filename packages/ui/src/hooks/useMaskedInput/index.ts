import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { createMask, type Mask, type MaskDefinition, type MaskResult } from './utils/mask';

export interface UseMaskedInputOptions {
  /** The mask definition, or a mask built with `createMask`. Read once, on mount. */
  mask: MaskDefinition | Mask;
  /** Initial value */
  initialValue?: string;
  /** Callback when value changes */
  onValueChange?: (result: MaskResult) => void;
  /** Callback when unmasked value changes */
  onUnmaskedValueChange?: (unmaskedValue: string, result: MaskResult) => void;
}

export interface UseMaskedInputReturn {
  /** Current masked value for display */
  value: string;
  /** Current unmasked value */
  unmaskedValue: string;
  /** Whether the mask is complete */
  isComplete: boolean;
  /** Handle text input changes */
  handleChangeText: (text: string) => void;
  /** Handle selection change (for cursor positioning) */
  handleSelectionChange: (selection: { start: number; end: number }) => void;
  /** Current cursor position */
  cursorPosition: number;
  /** Reset to initial value */
  reset: () => void;
  /** Set value programmatically */
  setValue: (value: string) => void;
  /** Set unmasked value programmatically */
  setUnmaskedValue: (unmaskedValue: string) => void;
}

const isMask = (mask: MaskDefinition | Mask): mask is Mask => 'applyMask' in mask;

const toState = (result: MaskResult): MaskResult => ({
  value: result.value,
  unmaskedValue: result.unmaskedValue,
  isComplete: result.isComplete,
  cursorPosition: result.cursorPosition,
});

const sameResult = (a: MaskResult, b: MaskResult) =>
  a.value === b.value &&
  a.unmaskedValue === b.unmaskedValue &&
  a.isComplete === b.isComplete &&
  a.cursorPosition === b.cursorPosition;

/**
 * Formats text input against a mask (phone numbers, dates, card numbers, …).
 * `onValueChange` / `onUnmaskedValueChange` fire after the unmasked value
 * changes (they may be inline functions). The returned object keeps its
 * identity until the value changes; the handlers are stable.
 *
 * @example
 * const { value, handleChangeText } = useMaskedInput({ mask: { mask: '(000) 000-0000' } });
 * <Input value={value} onChangeText={handleChangeText} />
 */
export function useMaskedInput(options: UseMaskedInputOptions): UseMaskedInputReturn {
  const { mask: maskOption, initialValue = '', onValueChange, onUnmaskedValueChange } = options;

  const [mask] = useState<Mask>(() => (isMask(maskOption) ? maskOption : createMask(maskOption)));
  const [state, setState] = useState<MaskResult>(() => toState(mask.applyMask(initialValue)));
  const selectionRef = useRef({ start: 0, end: 0 });

  const emitValueChange = useLatestCallback(onValueChange);
  const emitUnmaskedValueChange = useLatestCallback(onUnmaskedValueChange);

  const commit = useCallback((next: MaskResult) => {
    setState((previous) => (sameResult(previous, next) ? previous : toState(next)));
  }, []);

  // Report changes after commit rather than during render.
  const prevUnmaskedValueRef = useRef(state.unmaskedValue);
  useEffect(() => {
    if (state.unmaskedValue === prevUnmaskedValueRef.current) return;
    prevUnmaskedValueRef.current = state.unmaskedValue;
    emitValueChange(state);
    emitUnmaskedValueChange(state.unmaskedValue, state);
  }, [state, emitValueChange, emitUnmaskedValueChange]);

  const handleChangeText = useCallback(
    (text: string) => {
      const selectionStart = selectionRef.current.start;
      // Diff against what the field is currently showing, so an edited
      // separator can be told apart from an edited payload character.
      setState((previous) => {
        const next = mask.processInput(text, previous.value, selectionStart);
        return sameResult(previous, next) ? previous : toState(next);
      });
    },
    [mask]
  );

  const handleSelectionChange = useCallback((selection: { start: number; end: number }) => {
    selectionRef.current = selection;
  }, []);

  const reset = useCallback(() => commit(mask.applyMask(initialValue)), [commit, mask, initialValue]);
  const setValue = useCallback((value: string) => commit(mask.applyMask(value)), [commit, mask]);
  const setUnmaskedValue = useCallback((unmaskedValue: string) => commit(mask.applyMask(unmaskedValue)), [commit, mask]);

  return useMemo(
    () => ({
      value: state.value,
      unmaskedValue: state.unmaskedValue,
      isComplete: state.isComplete,
      cursorPosition: state.cursorPosition,
      handleChangeText,
      handleSelectionChange,
      reset,
      setValue,
      setUnmaskedValue,
    }),
    [state, handleChangeText, handleSelectionChange, reset, setValue, setUnmaskedValue]
  );
}
