import React from 'react';
import { act, renderHook } from '@testing-library/react-native';

// jest.setup.cjs replaces this module with a stub for component tests; test the real one.
jest.unmock('../DirectionProvider');

import { DirectionProvider, useDirection, useDirectionSafe } from '../DirectionProvider';

describe('useDirection', () => {
  it('returns a stable LTR default without a provider instead of throwing', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { result, rerender } = renderHook(() => useDirection());
    const first = result.current;
    expect(first.dir).toBe('ltr');
    expect(first.isRTL).toBe(false);
    rerender({});
    expect(result.current).toBe(first);
    expect(() => first.setDirection('rtl')).not.toThrow();
    warn.mockRestore();
  });

  it('keeps useDirectionSafe as an alias', () => {
    expect(useDirectionSafe).toBe(useDirection);
  });

  it('memoizes the provider value', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DirectionProvider initialDirection="rtl">{children}</DirectionProvider>
    );
    const { result, rerender } = renderHook(() => useDirection(), { wrapper });
    const first = result.current;
    expect(first.isRTL).toBe(true);
    rerender({});
    expect(result.current).toBe(first);
  });

  it('lets a nested provider without a direction inherit its parent', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DirectionProvider initialDirection="rtl">
        <DirectionProvider>{children}</DirectionProvider>
      </DirectionProvider>
    );
    const { result } = renderHook(() => useDirection(), { wrapper });
    expect(result.current.dir).toBe('rtl');
    // Setters reach the parent.
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    act(() => result.current.setDirection('ltr'));
    expect(result.current.dir).toBe('ltr');
    warn.mockRestore();
  });

  it('lets a nested provider with an explicit direction override', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DirectionProvider initialDirection="rtl">
        <DirectionProvider initialDirection="ltr">{children}</DirectionProvider>
      </DirectionProvider>
    );
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useDirection(), { wrapper });
    expect(result.current.dir).toBe('ltr');
    warn.mockRestore();
  });
});
