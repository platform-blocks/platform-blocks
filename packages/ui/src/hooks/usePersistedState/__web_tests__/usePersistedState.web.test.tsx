import React from 'react';
import { renderToString } from 'react-dom/server';
import { act, renderHook } from '@testing-library/react';

import { usePersistedState } from '../usePersistedState';

describe('usePersistedState (web, localStorage)', () => {
  beforeEach(() => window.localStorage.clear());

  it('reads and writes localStorage as JSON by default', () => {
    window.localStorage.setItem('filters', JSON.stringify({ tag: 'new' }));
    const { result } = renderHook(() => usePersistedState('filters', { tag: 'all' }));
    expect(result.current[0]).toEqual({ tag: 'new' });

    act(() => result.current[1]({ tag: 'sale' }));
    expect(window.localStorage.getItem('filters')).toBe('{"tag":"sale"}');
  });

  it('follows changes made in another tab', () => {
    const { result } = renderHook(() => usePersistedState('volume', 5));

    act(() => {
      window.localStorage.setItem('volume', '9');
      window.dispatchEvent(new StorageEvent('storage', { key: 'volume', newValue: '9', storageArea: window.localStorage }));
    });
    expect(result.current[0]).toBe(9);

    act(() => {
      window.localStorage.clear();
      window.dispatchEvent(new StorageEvent('storage', { key: null, storageArea: window.localStorage }));
    });
    expect(result.current[0]).toBe(5);
  });

  it('ignores storage events from sessionStorage', () => {
    const { result } = renderHook(() => usePersistedState('volume', 5));
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'volume', newValue: '1', storageArea: window.sessionStorage }));
    });
    expect(result.current[0]).toBe(5);
  });

  it('renders the default during static rendering, with ready=false', () => {
    window.localStorage.setItem('ssr', '"stored"');
    function Probe() {
      const [value, , { ready }] = usePersistedState('ssr', 'default');
      return <span>{`${value}:${String(ready)}`}</span>;
    }
    expect(renderToString(<Probe />)).toContain('default:false');
  });

  it('works with sessionStorage passed as the storage', () => {
    window.sessionStorage.setItem('tab', '"b"');
    const { result } = renderHook(() => usePersistedState('tab', 'a', { storage: window.sessionStorage }));
    expect(result.current[0]).toBe('b');
    act(() => result.current[1]('c'));
    expect(window.sessionStorage.getItem('tab')).toBe('"c"');
  });
});
