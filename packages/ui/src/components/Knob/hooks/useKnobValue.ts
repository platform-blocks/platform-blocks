import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { KnobMark, KnobBehavior } from '../types';
import { clamp } from '../utils/math';
import { useControllableState } from '../../../hooks/useControllableState';
import { normalizeMarks, pickClosestMark } from '../utils/marks';

type UseKnobValueOptions = {
  value?: number;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  marks?: KnobMark[];
  restrictToMarksProp?: boolean;
  resolvedBehavior: KnobBehavior;
  isEndless: boolean;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
};

export type UseKnobValueResult = {
  marksNormalized: KnobMark[];
  restrictToMarks: boolean;
  displayValue: number;
  resolvedValue: number;
  valueRef: MutableRefObject<number>;
  handleValueUpdate: (nextValue: number, final: boolean) => void;
  isControlled: boolean;
  normalizeValue: (value: number | undefined) => number;
  clampValue: (value: number) => number;
};

export const useKnobValue = ({
  value,
  defaultValue,
  min,
  max,
  step,
  marks,
  restrictToMarksProp,
  resolvedBehavior,
  isEndless,
  onChange,
  onChangeEnd,
}: UseKnobValueOptions): UseKnobValueResult => {
  const marksNormalized = useMemo(() => normalizeMarks(marks, min, max), [marks, min, max]);

  const restrictToMarks = useMemo(
    () =>
      Boolean(
        restrictToMarksProp ?? (resolvedBehavior === 'stepped' && marksNormalized.length > 0)
      ),
    [restrictToMarksProp, resolvedBehavior, marksNormalized]
  );

  const clampValue = useCallback(
    (val: number) => clamp(Number.isFinite(val) ? val : min, min, max),
    [min, max]
  );

  const normalizeValue = useCallback(
    (val: number | undefined) => {
      const candidate = Number.isFinite(val as number) ? (val as number) : min;
      return isEndless ? candidate : clampValue(candidate);
    },
    [isEndless, clampValue, min]
  );

  const [rawValue, setValue, isControlled] = useControllableState<number>({
    value,
    defaultValue: () => normalizeValue(defaultValue ?? min),
    finalValue: min,
    onChange,
  });
  const resolvedValue = normalizeValue(rawValue);
  const [displayValue, setDisplayValue] = useState(resolvedValue);

  useEffect(() => {
    const next = isEndless ? resolvedValue : clampValue(resolvedValue);
    setDisplayValue(next);
  }, [resolvedValue, clampValue, isEndless]);

  const valueRef = useRef(displayValue);

  const applyConstraints = useCallback(
    (rawValue: number) => {
      const fallbackValue = Number.isFinite(rawValue) ? rawValue : resolvedValue;
      if (isEndless) {
        let constrained = fallbackValue;
        if (step > 0 && Number.isFinite(step)) {
          const steps = Math.round((constrained - min) / step);
          constrained = min + steps * step;
        }
        return constrained;
      }
      const clampedValue = clampValue(fallbackValue);
      if (restrictToMarks && marksNormalized.length) {
        return pickClosestMark(clampedValue, marksNormalized);
      }
      if (step > 0 && Number.isFinite(step)) {
        const steps = Math.round((clampedValue - min) / step);
        return clampValue(min + steps * step);
      }
      return clampedValue;
    },
    [resolvedValue, isEndless, step, min, clampValue, restrictToMarks, marksNormalized]
  );

  const handleValueUpdate = useCallback(
    (nextValue: number, final: boolean) => {
      const constrained = applyConstraints(nextValue);
      if (constrained !== valueRef.current) {
        setDisplayValue(constrained);
        valueRef.current = constrained;
        setValue(constrained);
      }
      if (final) {
        onChangeEnd?.(constrained);
      }
    },
    [applyConstraints, setValue, onChangeEnd, valueRef]
  );

  useEffect(() => {
    valueRef.current = displayValue;
  }, [displayValue]);

  return {
    marksNormalized,
    restrictToMarks,
    displayValue,
    resolvedValue,
    valueRef,
    handleValueUpdate,
    isControlled,
    normalizeValue,
    clampValue,
  };
};
