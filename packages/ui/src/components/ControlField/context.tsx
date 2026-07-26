import React, { createContext, useContext } from 'react';
import type { ControlFieldContextValue, ControlFieldGroupContextValue } from './types';

const ControlFieldContext = createContext<ControlFieldContextValue | null>(null);

export const ControlFieldProvider = ControlFieldContext.Provider;

const ControlFieldGroupContext = createContext<ControlFieldGroupContextValue | null>(null);

export const ControlFieldGroupProvider = ControlFieldGroupContext.Provider;

/** Read the enclosing `ControlField.Group` config, if any (non-throwing). */
export function useControlFieldGroup(): ControlFieldGroupContextValue | null {
  return useContext(ControlFieldGroupContext);
}

/**
 * Access the enclosing `ControlField` state. Intended for the compound
 * sub-components (`ControlField.Indicator`, etc.) and custom controls.
 */
export function useControlField(): ControlFieldContextValue {
  const ctx = useContext(ControlFieldContext);
  if (!ctx) {
    throw new Error('useControlField must be used within a <ControlField>.');
  }
  return ctx;
}

/** Non-throwing variant for optional consumers. */
export function useControlFieldContext(): ControlFieldContextValue | null {
  return useContext(ControlFieldContext);
}

export default ControlFieldContext;
