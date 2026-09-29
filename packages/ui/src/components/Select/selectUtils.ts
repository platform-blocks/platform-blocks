import type { GestureResponderEvent } from 'react-native';

/** Anything with an optional `disabled` flag (Select / AutoComplete options). */
interface MaybeDisabled {
  disabled?: boolean;
}

/**
 * First enabled index walking from `start` (exclusive) by `delta`, or -1.
 * `findEnabledIndex(list, -1, 1)` is the first enabled option,
 * `findEnabledIndex(list, list.length, -1)` the last.
 */
export function findEnabledIndex(list: ReadonlyArray<MaybeDisabled>, start: number, delta: 1 | -1): number {
  for (let index = start + delta; index >= 0 && index < list.length; index += delta) {
    if (!list[index]?.disabled) return index;
  }
  return -1;
}

/**
 * Typeahead: the next enabled option whose label starts with `buffer`, searching
 * after `from` and wrapping. Repeating one letter cycles through its matches.
 */
export function matchTypeahead(
  list: ReadonlyArray<MaybeDisabled & { label: string }>,
  buffer: string,
  from: number
): number {
  if (!list.length || !buffer) return -1;
  const isRepeat = buffer.length > 1 && buffer.split('').every((char) => char === buffer[0]);
  const query = isRepeat ? buffer[0] : buffer;
  const offset = isRepeat || buffer.length === 1 ? 1 : 0;
  for (let step = 0; step < list.length; step += 1) {
    const index = (((from + offset + step) % list.length) + list.length) % list.length;
    const option = list[index];
    if (!option.disabled && option.label.toLowerCase().startsWith(query)) return index;
  }
  return -1;
}

/**
 * react-native-web "presses" a focused pressable on Enter keyup (the DOM
 * `keyup` event is passed as the press event). Fields that handle keys on
 * keydown ignore those presses.
 */
export function isKeyboardPress(event: GestureResponderEvent | undefined): boolean {
  const type = (event as unknown as { type?: unknown } | undefined)?.type;
  return type === 'keyup' || type === 'keydown';
}
