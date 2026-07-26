import { renderHook, act } from '@testing-library/react-native';
import { useControllableState } from '../useControllableState';

describe('useControllableState', () => {
  describe('uncontrolled', () => {
    it('starts from defaultValue', () => {
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: 'a', finalValue: '' }),
      );
      expect(result.current[0]).toBe('a');
      expect(result.current[2]).toBe(false);
    });

    it('falls back to finalValue when defaultValue is undefined', () => {
      const { result } = renderHook(() => useControllableState({ finalValue: 0 }));
      expect(result.current[0]).toBe(0);
    });

    it('accepts a lazy defaultValue and calls it exactly once', () => {
      const factory = jest.fn(() => 'seeded');
      const { result, rerender } = renderHook(() =>
        useControllableState({ defaultValue: factory, finalValue: '' }),
      );

      expect(result.current[0]).toBe('seeded');
      rerender();
      act(() => result.current[1]('changed'));
      expect(factory).toHaveBeenCalledTimes(1);
    });

    it('treats a falsy defaultValue as provided', () => {
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: false, finalValue: true }),
      );
      expect(result.current[0]).toBe(false);
    });

    it('updates internal state and calls onChange', () => {
      const onChange = jest.fn();
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: 'a', finalValue: '', onChange }),
      );

      act(() => result.current[1]('b'));

      expect(result.current[0]).toBe('b');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('b');
    });

    it('supports the updater form', () => {
      const { result } = renderHook(() =>
        useControllableState<number>({ defaultValue: 1, finalValue: 0 }),
      );

      act(() => result.current[1]((previous) => previous + 1));
      expect(result.current[0]).toBe(2);
    });

    it('composes several updater calls inside one handler', () => {
      const onChange = jest.fn();
      const { result } = renderHook(() =>
        useControllableState<number>({ defaultValue: 0, finalValue: 0, onChange }),
      );

      act(() => {
        result.current[1]((previous) => previous + 1);
        result.current[1]((previous) => previous + 1);
        result.current[1]((previous) => previous + 1);
      });

      expect(result.current[0]).toBe(3);
      expect(onChange).toHaveBeenNthCalledWith(1, 1);
      expect(onChange).toHaveBeenNthCalledWith(3, 3);
    });

    it('forwards extra payload arguments to onChange', () => {
      const onChange = jest.fn();
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: 'a', finalValue: '', onChange }),
      );

      act(() => result.current[1]('b', { source: 'keyboard' }));
      expect(onChange).toHaveBeenCalledWith('b', { source: 'keyboard' });
    });
  });

  describe('controlled', () => {
    it('renders the value prop and reports isControlled', () => {
      const { result } = renderHook(() =>
        useControllableState({ value: 'x', defaultValue: 'a', finalValue: '' }),
      );
      expect(result.current[0]).toBe('x');
      expect(result.current[2]).toBe(true);
    });

    it('does not move on its own — it only calls onChange', () => {
      const onChange = jest.fn();
      const { result } = renderHook(() =>
        useControllableState({ value: 'x', finalValue: '', onChange }),
      );

      act(() => result.current[1]('y'));

      expect(result.current[0]).toBe('x');
      expect(onChange).toHaveBeenCalledWith('y');
    });

    it('follows the value prop when the parent commits', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useControllableState({ value, finalValue: '' }),
        { initialProps: { value: 'x' } },
      );

      rerender({ value: 'y' });
      expect(result.current[0]).toBe('y');
    });

    it('resolves updater functions against the controlled value', () => {
      const onChange = jest.fn();
      const { result } = renderHook(() =>
        useControllableState<number>({ value: 10, finalValue: 0, onChange }),
      );

      act(() => result.current[1]((previous) => previous + 5));
      expect(onChange).toHaveBeenCalledWith(15);
    });
  });

  describe('identity and callbacks', () => {
    it('keeps setValue referentially stable across renders', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value: string }) => useControllableState({ value, finalValue: '' }),
        { initialProps: { value: 'x' } },
      );

      const first = result.current[1];
      rerender({ value: 'y' });
      expect(result.current[1]).toBe(first);
    });

    it('always calls the latest onChange, even though setValue is stable', () => {
      const first = jest.fn();
      const second = jest.fn();
      const { result, rerender } = renderHook(
        ({ onChange }: { onChange: (value: string) => void }) =>
          useControllableState({ defaultValue: 'a', finalValue: '', onChange }),
        { initialProps: { onChange: first } },
      );

      rerender({ onChange: second });
      act(() => result.current[1]('b'));

      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledWith('b');
    });
  });

  describe('mode switching', () => {
    let warn: jest.SpyInstance;

    beforeEach(() => {
      warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warn.mockRestore();
    });

    it('keeps the last controlled value when it becomes uncontrolled', () => {
      const { result, rerender } = renderHook(
        ({ value }: { value?: string }) =>
          useControllableState({ value, defaultValue: 'a', finalValue: '' }),
        { initialProps: { value: 'x' as string | undefined } },
      );

      rerender({ value: undefined });

      expect(result.current[0]).toBe('x');
      expect(result.current[2]).toBe(false);
    });

    it('warns in development when the mode flips', () => {
      const { rerender } = renderHook(
        ({ value }: { value?: string }) => useControllableState({ value, finalValue: '' }),
        { initialProps: { value: undefined as string | undefined } },
      );

      rerender({ value: 'x' });
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('uncontrolled to controlled'));
    });
  });
});
