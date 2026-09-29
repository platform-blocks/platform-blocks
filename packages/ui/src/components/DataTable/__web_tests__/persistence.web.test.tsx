import React from 'react';
import { act, render } from '@testing-library/react';

import { readPref, usePersistedPref } from '../persistence';

function Persist({ id, value }: { id?: string; value: unknown }) {
  usePersistedPref(id, 'columnWidths', value);
  return null;
}

describe('DataTable preference persistence', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.localStorage.clear();
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('debounces a burst of updates into one write and skips the initial value', () => {
    const setItem = jest.spyOn(Storage.prototype, 'setItem');
    const { rerender } = render(<Persist id="people" value={{ name: 120 }} />);
    expect(setItem).not.toHaveBeenCalled();

    // A resize drag: many width updates in quick succession.
    for (let w = 121; w <= 160; w += 1) rerender(<Persist id="people" value={{ name: w }} />);
    expect(setItem).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(readPref('people', 'columnWidths', {})).toEqual({ name: 160 });
  });

  it('flushes a pending write on unmount', () => {
    const { rerender, unmount } = render(<Persist id="people" value={{ name: 120 }} />);
    rerender(<Persist id="people" value={{ name: 200 }} />);
    unmount();
    expect(readPref('people', 'columnWidths', {})).toEqual({ name: 200 });
  });

  it('never writes without an id', () => {
    const setItem = jest.spyOn(Storage.prototype, 'setItem');
    const { rerender } = render(<Persist value={{ name: 120 }} />);
    rerender(<Persist value={{ name: 200 }} />);
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(setItem).not.toHaveBeenCalled();
  });
});
