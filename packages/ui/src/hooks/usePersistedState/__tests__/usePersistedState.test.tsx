import { act, renderHook } from '@testing-library/react-native';

import type { PersistedStateStorage } from '../usePersistedState';
import { usePersistedState } from '../usePersistedState';

/** A synchronous storage over a Map, with spies. */
function createSyncStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  const storage = {
    getItem: jest.fn((key: string) => values.get(key) ?? null),
    setItem: jest.fn((key: string, value: string) => {
      values.set(key, value);
    }),
    removeItem: jest.fn((key: string) => {
      values.delete(key);
    }),
  };
  return { storage: storage as PersistedStateStorage & typeof storage, values };
}

/** An AsyncStorage-like storage whose reads resolve when `flush()` is called. */
function createAsyncStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  const pending: Array<() => void> = [];
  const storage: PersistedStateStorage = {
    getItem: (key) =>
      new Promise((resolve) => {
        pending.push(() => resolve(values.get(key) ?? null));
      }),
    setItem: async (key, value) => {
      values.set(key, value);
    },
    removeItem: async (key) => {
      values.delete(key);
    },
  };
  const flush = async () => {
    await act(async () => {
      pending.splice(0).forEach((resolve) => resolve());
      await Promise.resolve();
    });
  };
  return { storage, values, flush };
}

describe('usePersistedState (sync storage)', () => {
  it('starts on the stored value when there is one, else the default', () => {
    const { storage } = createSyncStorage({ theme: '"dark"' });
    const stored = renderHook(() => usePersistedState('theme', 'light', { storage }));
    expect(stored.result.current[0]).toBe('dark');
    expect(stored.result.current[2].ready).toBe(true);

    const empty = renderHook(() => usePersistedState('other', 'light', { storage }));
    expect(empty.result.current[0]).toBe('light');
  });

  it('writes the serialized value and composes updaters', () => {
    const { storage, values } = createSyncStorage();
    const { result } = renderHook(() => usePersistedState('count', 0, { storage }));

    act(() => {
      result.current[1]((n) => n + 1);
      result.current[1]((n) => n + 1);
    });
    expect(result.current[0]).toBe(2);
    expect(values.get('count')).toBe('2');
  });

  it('shares one value between every hook on the same key', () => {
    const { storage } = createSyncStorage();
    const a = renderHook(() => usePersistedState('shared', 'a', { storage }));
    const b = renderHook(() => usePersistedState('shared', 'a', { storage }));

    act(() => a.result.current[1]('b'));
    expect(b.result.current[0]).toBe('b');
  });

  it('remove() deletes the stored value and falls back to the default', () => {
    const { storage, values } = createSyncStorage({ name: '"Ada"' });
    const { result } = renderHook(() => usePersistedState('name', 'anonymous', { storage }));

    act(() => result.current[2].remove());
    expect(result.current[0]).toBe('anonymous');
    expect(values.has('name')).toBe(false);
  });

  it('treats an undefined value as a removal', () => {
    const { storage, values } = createSyncStorage({ maybe: '1' });
    const { result } = renderHook(() => usePersistedState<number | undefined>('maybe', undefined, { storage }));

    act(() => result.current[1](undefined));
    expect(values.has('maybe')).toBe(false);
    expect(result.current[0]).toBeUndefined();
  });

  it('uses the default when the stored value is unreadable', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { storage } = createSyncStorage({ broken: '{not json' });
    const { result } = renderHook(() => usePersistedState('broken', 42, { storage }));
    expect(result.current[0]).toBe(42);
    warn.mockRestore();
  });

  it('supports custom serialize / deserialize, rejecting values by throwing', () => {
    const { storage, values } = createSyncStorage({ mode: 'sepia' });
    const deserialize = (raw: string) => {
      if (raw !== 'light' && raw !== 'dark') throw new Error('unknown mode');
      return raw;
    };
    const { result } = renderHook(() =>
      usePersistedState<'light' | 'dark'>('mode', 'light', { storage, serialize: (v) => v, deserialize })
    );
    expect(result.current[0]).toBe('light');

    act(() => result.current[1]('dark'));
    expect(values.get('mode')).toBe('dark');
    expect(result.current[0]).toBe('dark');
  });

  it('keeps setValue and the value identity stable across unrelated renders', () => {
    const { storage } = createSyncStorage({ list: '[1,2]' });
    const { result, rerender } = renderHook(() => usePersistedState<number[]>('list', [], { storage }));
    const [value, setValue, controls] = result.current;
    rerender({});
    expect(result.current[0]).toBe(value);
    expect(result.current[1]).toBe(setValue);
    expect(result.current[2]).toBe(controls);
  });

  it('reports a failed write without throwing', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { storage } = createSyncStorage();
    storage.setItem.mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const { result } = renderHook(() => usePersistedState('big', '', { storage }));
    expect(() => act(() => result.current[1]('x'.repeat(10)))).not.toThrow();
    expect(result.current[0]).toBe('x'.repeat(10));
    warn.mockRestore();
  });
});

describe('usePersistedState (async storage)', () => {
  it('shows the default with ready=false until the stored value arrives', async () => {
    const { storage, flush } = createAsyncStorage({ onboarded: 'true' });
    const { result } = renderHook(() => usePersistedState('onboarded', false, { storage }));
    expect(result.current[0]).toBe(false);
    expect(result.current[2].ready).toBe(false);

    await flush();
    expect(result.current[0]).toBe(true);
    expect(result.current[2].ready).toBe(true);
  });

  it('keeps a value set while the read was still in flight', async () => {
    const { storage, values, flush } = createAsyncStorage({ step: '1' });
    const { result } = renderHook(() => usePersistedState('step', 0, { storage }));

    act(() => result.current[1](5));
    await flush();
    expect(result.current[0]).toBe(5);
    expect(values.get('step')).toBe('5');
  });

  it('resolves an empty store to the default and ready=true', async () => {
    const { storage, flush } = createAsyncStorage();
    const { result } = renderHook(() => usePersistedState('missing', 'fallback', { storage }));
    await flush();
    expect(result.current[0]).toBe('fallback');
    expect(result.current[2].ready).toBe(true);
  });
});
