import React from 'react';
import { renderToString } from 'react-dom/server';
import { act, renderHook } from '@testing-library/react';

import { useClipboard } from '../index';

type WriteText = (text: string) => Promise<void>;

const setClipboard = (writeText: WriteText | undefined) => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: writeText ? { writeText } : undefined,
  });
};

// jsdom implements neither navigator.clipboard nor document.execCommand.
const setExecCommand = (impl: ((command: string) => boolean) | undefined) => {
  Object.defineProperty(document, 'execCommand', { configurable: true, writable: true, value: impl });
};

afterEach(() => {
  setClipboard(undefined);
  setExecCommand(undefined);
  jest.useRealTimers();
});

describe('useClipboard (web)', () => {
  it('copies with navigator.clipboard and resets after the timeout', async () => {
    jest.useFakeTimers();
    const writeText = jest.fn<Promise<void>, [string]>(() => Promise.resolve());
    setClipboard(writeText);

    const { result } = renderHook(() => useClipboard({ timeout: 500 }));
    expect(result.current.unsupported).toBe(false);

    let outcome: boolean | undefined;
    await act(async () => {
      outcome = await result.current.copy('hello');
    });
    expect(outcome).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(result.current.copied).toBe(true);
    expect(result.current.lastValue).toBe('hello');
    expect(result.current.error).toBeNull();

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current.copied).toBe(false);
  });

  it('stringifies non-string values', async () => {
    const writeText = jest.fn<Promise<void>, [string]>(() => Promise.resolve());
    setClipboard(writeText);
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy({ a: 1 });
    });
    expect(writeText).toHaveBeenCalledWith('{"a":1}');
  });

  it('falls back to execCommand when the Clipboard API rejects, restoring focus', async () => {
    setClipboard(() => Promise.reject(new Error('NotAllowedError')));
    const execCommand = jest.fn((command: string) => command === 'copy');
    setExecCommand(execCommand);

    const button = document.createElement('button');
    document.body.appendChild(button);
    button.focus();

    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      await result.current.copy('fallback');
    });

    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(result.current.copied).toBe(true);
    expect(result.current.error).toBeNull();
    // The temporary textarea is gone and focus is back where it was.
    expect(document.querySelector('textarea')).toBeNull();
    expect(document.activeElement).toBe(button);
    button.remove();
  });

  it('reports an error when every strategy fails', async () => {
    setClipboard(() => Promise.reject(new Error('denied')));
    setExecCommand(() => false);

    const { result } = renderHook(() => useClipboard());
    let outcome: boolean | undefined;
    await act(async () => {
      outcome = await result.current.copy('nope');
    });

    expect(outcome).toBe(false);
    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('denied');

    act(() => result.current.reset());
    expect(result.current.error).toBeNull();
  });

  it('is unsupported only when neither the Clipboard API nor execCommand exists', () => {
    const { result } = renderHook(() => useClipboard());
    expect(result.current.unsupported).toBe(true);
  });

  it('returns a stable object while nothing changes', () => {
    setClipboard(() => Promise.resolve());
    const { result, rerender } = renderHook(() => useClipboard());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('renders as supported on the server', () => {
    function Probe() {
      return <span>{String(useClipboard().unsupported)}</span>;
    }
    expect(renderToString(<Probe />)).toContain('false');
  });
});
