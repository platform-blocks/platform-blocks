import { useCallback, useRef, useState, useEffect } from 'react';
import { createMask, MaskDefinition, MaskResult } from './utils/mask';

export interface UseMaskedInputOptions {
  /** The mask definition */
  mask: MaskDefinition | ReturnType<typeof createMask>;
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

export function useMaskedInput(options: UseMaskedInputOptions): UseMaskedInputReturn {
  const { mask: maskDefinition, initialValue = '', onValueChange, onUnmaskedValueChange } = options;
  
  // Create mask function if needed
  const maskRef = useRef(
    typeof maskDefinition === 'function' || 'applyMask' in maskDefinition 
      ? maskDefinition 
      : createMask(maskDefinition)
  );
  const mask = maskRef.current;

  // Initialize state
  const initialResult = mask.applyMask(initialValue);
  const [state, setState] = useState({
    value: initialResult.value,
    unmaskedValue: initialResult.unmaskedValue,
    isComplete: initialResult.isComplete,
    cursorPosition: initialResult.cursorPosition,
    previousValue: initialResult.value
  });

  const selectionRef = useRef({ start: 0, end: 0 });

  const updateState = useCallback((newResult: MaskResult) => {
    setState(prevState => {
      if (
        prevState.value === newResult.value &&
        prevState.unmaskedValue === newResult.unmaskedValue &&
        prevState.isComplete === newResult.isComplete &&
        prevState.cursorPosition === newResult.cursorPosition
      ) {
        return prevState;
      }

      return {
        value: newResult.value,
        unmaskedValue: newResult.unmaskedValue,
        isComplete: newResult.isComplete,
        cursorPosition: newResult.cursorPosition,
        previousValue: prevState.value
      };
    });
  }, []);

  // Handle callbacks in useEffect to avoid calling them during render
  const prevUnmaskedValueRef = useRef(state.unmaskedValue);
  useEffect(() => {
    if (state.unmaskedValue !== prevUnmaskedValueRef.current) {
      prevUnmaskedValueRef.current = state.unmaskedValue;
      const result = {
        value: state.value,
        unmaskedValue: state.unmaskedValue,
        isComplete: state.isComplete,
        cursorPosition: state.cursorPosition
      };
      onValueChange?.(result);
      onUnmaskedValueChange?.(state.unmaskedValue, result);
    }
  }, [state.value, state.unmaskedValue, state.isComplete, state.cursorPosition, onValueChange, onUnmaskedValueChange]);

  const handleChangeText = useCallback((text: string) => {
    // `state.value` — not `state.previousValue` — is what the field is currently
    // showing, and it is what `processInput` has to diff against to tell an
    // edited separator from an edited payload character.
    const result = mask.processInput(
      text,
      state.value,
      selectionRef.current.start
    );
    updateState(result);
  }, [mask, state.value, updateState]);

  const handleSelectionChange = useCallback((selection: { start: number; end: number }) => {
    selectionRef.current = selection;
  }, []);

  const reset = useCallback(() => {
    const result = mask.applyMask(initialValue);
    updateState(result);
  }, [mask, initialValue, updateState]);

  const setValue = useCallback((value: string) => {
    const result = mask.applyMask(value);
    updateState(result);
  }, [mask, updateState]);

  const setUnmaskedValue = useCallback((unmaskedValue: string) => {
    const result = mask.applyMask(unmaskedValue);
    updateState(result);
  }, [mask, updateState]);

  return {
    value: state.value,
    unmaskedValue: state.unmaskedValue,
    isComplete: state.isComplete,
    handleChangeText,
    handleSelectionChange,
    cursorPosition: state.cursorPosition,
    reset,
    setValue,
    setUnmaskedValue
  };
}