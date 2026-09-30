import React from 'react';
import { Keyboard } from 'react-native';
import type { KeyboardEvent } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';

import { KeyboardManagerProvider } from '../../../core/providers/KeyboardManagerProvider';
import { useKeyboardHeight } from '../useKeyboardHeight';

type Handler = (event?: KeyboardEvent) => void;

describe('useKeyboardHeight (native)', () => {
  let handlers: Record<string, Handler[]>;
  let removed: number;

  beforeEach(() => {
    handlers = {};
    removed = 0;
    jest.spyOn(Keyboard, 'addListener').mockImplementation(((name: string, handler: Handler) => {
      (handlers[name] ??= []).push(handler);
      return {
        remove: () => {
          removed += 1;
          handlers[name] = handlers[name].filter((h) => h !== handler);
        },
      };
    }) as never);
  });
  afterEach(() => jest.restoreAllMocks());

  const emit = (name: string, height?: number) =>
    act(() => {
      const event = height === undefined ? undefined : ({ endCoordinates: { height, width: 390, screenX: 0, screenY: 500 } } as KeyboardEvent);
      (handlers[name] ?? []).forEach((handler) => handler(event));
    });

  it('follows the keyboard (iOS will-events)', () => {
    const { result } = renderHook(() => useKeyboardHeight());
    expect(result.current).toBe(0);

    emit('keyboardWillShow', 301.4);
    expect(result.current).toBe(301);

    emit('keyboardWillHide');
    expect(result.current).toBe(0);
  });

  it('shares one set of listeners between consumers and detaches with the last', () => {
    const first = renderHook(() => useKeyboardHeight());
    const second = renderHook(() => useKeyboardHeight());
    expect(handlers.keyboardWillShow).toHaveLength(1);

    emit('keyboardWillShow', 250);
    expect(first.result.current).toBe(250);
    expect(second.result.current).toBe(250);

    first.unmount();
    expect(removed).toBe(0);
    second.unmount();
    expect(removed).toBe(2);
  });

  it('returns 0 and adds no listeners when disabled', () => {
    const { result } = renderHook(() => useKeyboardHeight({ enabled: false }));
    expect(handlers.keyboardWillShow).toBeUndefined();
    expect(result.current).toBe(0);
  });

  it('reads KeyboardManagerProvider metrics instead of listening itself', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <KeyboardManagerProvider>{children}</KeyboardManagerProvider>
    );
    const { result } = renderHook(() => useKeyboardHeight(), { wrapper });
    // Only the provider's own listener is attached.
    expect(handlers.keyboardWillShow).toHaveLength(1);

    emit('keyboardWillShow', 280);
    expect(result.current).toBe(280);
    emit('keyboardWillHide');
    expect(result.current).toBe(0);
  });
});
