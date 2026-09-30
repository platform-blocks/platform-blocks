import React, { createContext, useContext } from 'react';
import type { ControlFieldContextValue, ControlFieldGroupContextValue } from './types';

const ControlFieldContext = createContext<ControlFieldContextValue | null>(null);

export const ControlFieldProvider = ControlFieldContext.Provider;

const ControlFieldGroupContext = createContext<ControlFieldGroupContextValue | null>(null);

export const ControlFieldGroupProvider = ControlFieldGroupContext.Provider;

/**
 * Returns the shared config of the enclosing `ControlField.Group` (its default
 * `size` for child rows), or `null` outside a group — never throws.
 */
export function useControlFieldGroup(): ControlFieldGroupContextValue | null {
  return useContext(ControlFieldGroupContext);
}

/**
 * Returns the enclosing `ControlField`'s state (`checked`, `onChange`,
 * `disabled`, `invalid`, `required`, `size`, `ids`, …) for custom controls
 * and compound parts, and throws outside a `<ControlField>` — use
 * `useControlFieldContext()` for a non-throwing read.
 *
 * Intended for the compound sub-components (`ControlField.Indicator`, etc.)
 * and custom controls.
 */
export function useControlField(): ControlFieldContextValue {
  const ctx = useContext(ControlFieldContext);
  if (!ctx) {
    throw new Error('useControlField must be used within a <ControlField>.');
  }
  return ctx;
}

/**
 * Returns the enclosing `ControlField`'s state, or `null` outside one — the
 * non-throwing variant of `useControlField()`, for controls that also work on
 * their own.
 */
export function useControlFieldContext(): ControlFieldContextValue | null {
  return useContext(ControlFieldContext);
}

export default ControlFieldContext;
