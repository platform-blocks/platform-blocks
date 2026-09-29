import { useCallback, useEffect, useRef, useState } from 'react';

import { useLatestCallback } from '../hooks/useLatestCallback';
import { isWeb } from '../platform';
import { useDirection } from '../providers/DirectionProvider';
import { consumeEvent, focusNode, readKey, type KeyboardEventLike } from './keyboard';

export type RovingOrientation = 'horizontal' | 'vertical' | 'both';

export interface UseRovingFocusOptions {
  /** Number of items in the group. */
  count: number;
  /** Which arrow keys move. `'both'` + `columns` makes a grid. Default `'horizontal'`. */
  orientation?: RovingOrientation;
  /** Wrap from the last item to the first and back. Default `true` (grids never wrap vertically). */
  loop?: boolean;
  /** Controlled active (tab-stop) index. */
  activeIndex?: number;
  /** Initial active index when uncontrolled. Default `0`. */
  defaultActiveIndex?: number;
  /** Called with the new index when keyboard/focus moves the active item. */
  onActiveChange?: (index: number) => void;
  /** Text of item `i` for typeahead (type a letter to jump). Omit to disable typeahead. */
  typeahead?: (index: number) => string;
  /** Override reading direction. Default: `useDirection().isRTL`. */
  rtl?: boolean;
  /** Grid width for `orientation: 'both'` (Calendar: 7). Up/Down move by a row. */
  columns?: number;
  /** Items to skip (disabled tabs, options...). */
  isDisabled?: (index: number) => boolean;
  /** Move DOM focus to the new active item (web). Default `true`. */
  moveFocus?: boolean;
}

export interface RovingItemProps {
  /** 0 on the active item, -1 on the rest: one tab stop for the whole group. */
  tabIndex: 0 | -1;
  ref: (node: unknown) => void;
  onKeyDown: (event: KeyboardEventLike) => void;
  onFocus: () => void;
}

export interface UseRovingFocusResult {
  /** The current tab stop (first enabled item when the requested one is unusable). */
  activeIndex: number;
  /** Set the active index without moving focus. */
  setActiveIndex: (index: number) => void;
  /** Make `index` active and move focus to it (web). */
  focusItem: (index: number) => void;
  /** Props for item `index` (spread on a Pressable/View). */
  getItemProps: (index: number) => RovingItemProps;
  /** The key handler, for containers that route keys themselves. Returns true when handled. */
  handleKeyDown: (event: KeyboardEventLike, index: number) => boolean;
}

const TYPEAHEAD_RESET_MS = 500;

/**
 * Roving tabindex for composite widgets (Tabs, SegmentedControl, ToggleGroup,
 * RadioGroup, Menu, Tree, Calendar grid, Stepper, Pagination): one tab stop,
 * arrows move between items (horizontal arrows swap under RTL), Home/End jump
 * to the ends (row ends in a grid; Ctrl+Home/End to the grid ends), optional
 * typeahead. Keyboard handling and DOM focus are web-only; on native the item
 * props are inert apart from `tabIndex`.
 *
 * @example
 * const { getItemProps } = useRovingFocus({ count: tabs.length, activeIndex: selected, onActiveChange: setSelected });
 * tabs.map((tab, i) => <Pressable key={tab.id} role="tab" {...getItemProps(i)} />)
 */
export function useRovingFocus(options: UseRovingFocusOptions): UseRovingFocusResult {
  const {
    count,
    orientation = 'horizontal',
    loop = true,
    activeIndex: controlledIndex,
    defaultActiveIndex = 0,
    typeahead,
    columns,
    moveFocus = true,
  } = options;

  const direction = useDirection();
  const rtl = options.rtl ?? direction.isRTL;

  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultActiveIndex);
  const isControlled = controlledIndex !== undefined;
  const requestedIndex = isControlled ? controlledIndex : uncontrolledIndex;

  const onActiveChange = useLatestCallback(options.onActiveChange);
  // Read during render (tab stop), so used directly rather than through a latest-ref.
  const isDisabled = options.isDisabled;

  const isEnabled = useCallback(
    (index: number) => index >= 0 && index < count && !(isDisabled && isDisabled(index)),
    [count, isDisabled]
  );

  // The tab stop must always land on a usable item, or the group can't be tabbed into.
  let activeIndex = requestedIndex;
  if (!isEnabled(activeIndex)) {
    activeIndex = -1;
    for (let i = 0; i < count; i += 1) {
      if (isEnabled(i)) {
        activeIndex = i;
        break;
      }
    }
  }

  const nodes = useRef(new Map<number, unknown>());
  const refCallbacks = useRef(new Map<number, (node: unknown) => void>());
  const typeaheadBuffer = useRef('');
  const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
    },
    []
  );

  const setActiveIndex = useCallback(
    (index: number) => {
      if (!isControlled) setUncontrolledIndex(index);
      onActiveChange(index);
    },
    [isControlled, onActiveChange]
  );

  const focusItem = useCallback(
    (index: number) => {
      if (!isEnabled(index)) return;
      setActiveIndex(index);
      if (isWeb && moveFocus) focusNode(nodes.current.get(index));
    },
    [isEnabled, setActiveIndex, moveFocus]
  );

  /** First enabled index walking from `start` by `delta`, honouring `loop`. */
  const seek = useCallback(
    (start: number, delta: number, wrap: boolean): number => {
      if (count <= 0) return -1;
      let index = start;
      for (let steps = 0; steps < count; steps += 1) {
        index += delta;
        if (index < 0 || index >= count) {
          if (!wrap) return -1;
          index = ((index % count) + count) % count;
        }
        if (isEnabled(index)) return index;
      }
      return -1;
    },
    [count, isEnabled]
  );

  const runTypeahead = useCallback(
    (char: string, from: number): number => {
      if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
      typeaheadTimer.current = setTimeout(() => {
        typeaheadBuffer.current = '';
      }, TYPEAHEAD_RESET_MS);

      const lower = char.toLowerCase();
      const buffer = typeaheadBuffer.current + lower;
      typeaheadBuffer.current = buffer;
      // Repeating one letter cycles through the items starting with it.
      const isRepeat = buffer.length > 1 && buffer.split('').every((c) => c === lower);
      const query = isRepeat ? lower : buffer;
      const startOffset = isRepeat || buffer.length === 1 ? 1 : 0;

      for (let i = 0; i < count; i += 1) {
        const index = (from + startOffset + i) % count;
        if (!isEnabled(index)) continue;
        const text = (typeahead?.(index) ?? '').toLowerCase();
        if (text.startsWith(query)) return index;
      }
      return -1;
    },
    [count, isEnabled, typeahead]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEventLike, index: number): boolean => {
      if (event.defaultPrevented) return false;
      const { key, shift, ctrl, meta, alt, composing } = readKey(event);
      if (composing) return false;
      // Shift+arrow is reserved for range selection by the consumer.
      if (shift && key.startsWith('Arrow')) return false;

      const horizontal = orientation === 'horizontal' || orientation === 'both';
      const vertical = orientation === 'vertical' || orientation === 'both';
      const grid = orientation === 'both' && columns !== undefined && columns > 0;
      const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
      const backward = rtl ? 'ArrowRight' : 'ArrowLeft';

      let next = -1;
      let handled = true;

      if (horizontal && key === forward) next = seek(index, 1, loop);
      else if (horizontal && key === backward) next = seek(index, -1, loop);
      else if (vertical && key === 'ArrowDown') next = seek(index, grid ? columns : 1, grid ? false : loop);
      else if (vertical && key === 'ArrowUp') next = seek(index, grid ? -columns : -1, grid ? false : loop);
      else if (key === 'Home' || key === 'End') {
        const toStart = key === 'Home';
        if (grid && !(ctrl || meta)) {
          const rowStart = index - (index % columns);
          const rowEnd = Math.min(rowStart + columns - 1, count - 1);
          next = toStart ? seek(rowStart - 1, 1, false) : seek(rowEnd + 1, -1, false);
          if (next !== -1 && (next < rowStart || next > rowEnd)) next = -1;
        } else {
          next = toStart ? seek(-1, 1, false) : seek(count, -1, false);
        }
      } else if (typeahead && key.length === 1 && key !== ' ' && !ctrl && !meta && !alt) {
        next = runTypeahead(key, index);
      } else {
        handled = false;
      }

      if (!handled) return false;
      consumeEvent(event);
      if (next !== -1 && next !== index) focusItem(next);
      return true;
    },
    [orientation, columns, rtl, loop, count, seek, typeahead, runTypeahead, focusItem]
  );

  const getRef = useCallback((index: number) => {
    let callback = refCallbacks.current.get(index);
    if (!callback) {
      callback = (node: unknown) => {
        if (node) nodes.current.set(index, node);
        else nodes.current.delete(index);
      };
      refCallbacks.current.set(index, callback);
    }
    return callback;
  }, []);

  const getItemProps = useCallback(
    (index: number): RovingItemProps => ({
      tabIndex: index === activeIndex ? 0 : -1,
      ref: getRef(index),
      onKeyDown: (event: KeyboardEventLike) => {
        handleKeyDown(event, index);
      },
      onFocus: () => {
        if (index !== activeIndex && isEnabled(index)) setActiveIndex(index);
      },
    }),
    [activeIndex, getRef, handleKeyDown, isEnabled, setActiveIndex]
  );

  return { activeIndex, setActiveIndex, focusItem, getItemProps, handleKeyDown };
}
