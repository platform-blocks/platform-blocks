import { useCallback, useMemo } from 'react';

import { useLatestCallback } from '../hooks/useLatestCallback';
import { a11yProps, type A11yProps } from './a11yProps';
import { consumeEvent, readKey, type KeyboardEventLike } from './keyboard';

export interface UseListNavigationOptions {
  /** Number of options. */
  count: number;
  /** Highlighted option (virtual focus); -1 for none. Controlled. */
  activeIndex: number;
  onActiveChange: (index: number) => void;
  /** Enter on the highlighted option. */
  onSelect?: (index: number) => void;
  /** Wrap past the ends. Default `true`. */
  loop?: boolean;
  /** DOM id of option `i` (referenced by `aria-activedescendant`). */
  getId: (index: number) => string;
  /** Options to skip. */
  isDisabled?: (index: number) => boolean;
  /** Whether the list is showing. Default `true`. Arrows open a closed list via `onOpen`. */
  opened?: boolean;
  onOpen?: () => void;
  /** Escape. */
  onClose?: () => void;
  /** Id of the listbox element (`aria-controls`). */
  listId?: string;
  /**
   * Home/End move the highlight. Default `false`: in an editable combobox they
   * move the text caret. Turn on for non-editable pickers (Select).
   */
  homeEndKeys?: boolean;
  /** Options moved by PageUp/PageDown. Default 10. */
  pageSize?: number;
}

export type ListNavigationInputProps = A11yProps & {
  'aria-autocomplete'?: 'list' | 'none' | 'inline' | 'both';
  onKeyDown: (event: KeyboardEventLike) => void;
};

export type ListNavigationOptionProps = A11yProps & { id: string };

export interface UseListNavigationResult {
  /** Spread on the input / trigger that keeps real focus (combobox). */
  inputProps: ListNavigationInputProps;
  /** Spread on the list container. */
  listProps: A11yProps;
  /** Spread on option `index`. */
  getOptionProps: (index: number) => ListNavigationOptionProps;
  /** The key handler, for inputs that route keys themselves. Returns true when handled. */
  handleKeyDown: (event: KeyboardEventLike) => boolean;
  /** Move virtual focus without a keyboard event. */
  moveNext: () => void;
  movePrevious: () => void;
  /** Select the active option, optionally using the first when none is active. */
  selectActive: (fallbackToFirst?: boolean) => void;
  /** Id of the highlighted option, if any. */
  activeId: string | undefined;
}

/**
 * Combobox / listbox keyboard navigation with virtual focus: real focus stays in
 * the input while `aria-activedescendant` points at the highlighted option
 * (Select, AutoComplete, Spotlight). Arrows move (skipping disabled options),
 * PageUp/PageDown jump, Enter selects, Escape closes; Home/End optionally.
 *
 * @example
 * const nav = useListNavigation({ count: items.length, activeIndex, onActiveChange: setActiveIndex,
 *   onSelect: (i) => pick(items[i]), getId: (i) => `${listId}-opt-${i}`, listId, opened, onOpen, onClose });
 * const { onKeyDown, ...inputProps } = nav.inputProps;
 * <TextInput {...inputProps} onKeyPress={onKeyDown} /> // react-native-web routes TextInput keys through onKeyPress
 * <View {...nav.listProps}>{items.map((item, i) => <Pressable key={item.id} {...nav.getOptionProps(i)} />)}</View>
 */
export function useListNavigation(options: UseListNavigationOptions): UseListNavigationResult {
  const {
    count,
    activeIndex,
    loop = true,
    getId,
    isDisabled,
    opened = true,
    listId,
    homeEndKeys = false,
    pageSize = 10,
  } = options;

  const onActiveChange = useLatestCallback(options.onActiveChange);
  const onSelect = useLatestCallback(options.onSelect);
  const onOpen = useLatestCallback(options.onOpen);
  const onClose = useLatestCallback(options.onClose);
  const hasOnOpen = options.onOpen !== undefined;
  const hasOnClose = options.onClose !== undefined;

  const isEnabled = useCallback(
    (index: number) => index >= 0 && index < count && !(isDisabled && isDisabled(index)),
    [count, isDisabled]
  );

  /** First enabled index from `start` stepping by `delta` (±1); wraps when `wrap`. */
  const seek = useCallback(
    (start: number, delta: 1 | -1, wrap: boolean): number => {
      let index = start;
      for (let steps = 0; steps < count; steps += 1) {
        index += delta;
        if (index < 0 || index >= count) {
          if (!wrap) return -1;
          index = index < 0 ? count - 1 : 0;
        }
        if (isEnabled(index)) return index;
      }
      return -1;
    },
    [count, isEnabled]
  );

  const first = useCallback(() => seek(-1, 1, false), [seek]);
  const last = useCallback(() => seek(count, -1, false), [seek, count]);

  const moveNext = useCallback(() => {
    if (count === 0) return;
    const next = activeIndex < 0 || !isEnabled(activeIndex) ? first() : seek(activeIndex, 1, loop);
    if (next !== -1 && next !== activeIndex) onActiveChange(next);
  }, [count, activeIndex, isEnabled, first, seek, loop, onActiveChange]);
  const movePrevious = useCallback(() => {
    if (count === 0) return;
    const next = activeIndex < 0 || !isEnabled(activeIndex) ? last() : seek(activeIndex, -1, loop);
    if (next !== -1 && next !== activeIndex) onActiveChange(next);
  }, [count, activeIndex, isEnabled, last, seek, loop, onActiveChange]);
  const selectActive = useCallback((fallbackToFirst = false) => {
    const index = activeIndex < 0 && fallbackToFirst ? first() : activeIndex;
    if (opened && isEnabled(index)) onSelect(index);
  }, [activeIndex, first, opened, isEnabled, onSelect]);

  const handleKeyDown = useCallback(
    (event: KeyboardEventLike): boolean => {
      if (event.defaultPrevented) return false;
      const { key, alt, composing } = readKey(event);
      if (composing) return false;

      const move = (next: number) => {
        if (next !== -1 && next !== activeIndex) onActiveChange(next);
      };

      switch (key) {
        case 'ArrowDown':
        case 'ArrowUp': {
          const down = key === 'ArrowDown';
          if (!opened) {
            if (!hasOnOpen) return false;
            onOpen();
            // Alt+Down opens without moving the highlight (APG).
            if (!alt) move(down ? first() : last());
          } else if (activeIndex < 0 || !isEnabled(activeIndex)) {
            move(down ? first() : last());
          } else {
            move(seek(activeIndex, down ? 1 : -1, loop));
          }
          consumeEvent(event);
          return true;
        }
        case 'PageDown':
        case 'PageUp': {
          if (!opened || count === 0) return false;
          const down = key === 'PageDown';
          const from = activeIndex < 0 ? (down ? -1 : count) : activeIndex;
          const target = Math.max(0, Math.min(count - 1, from + (down ? pageSize : -pageSize)));
          // Land on the nearest enabled option at or before the jump target.
          const next = isEnabled(target) ? target : seek(target, down ? -1 : 1, false);
          move(next);
          consumeEvent(event);
          return true;
        }
        case 'Home':
        case 'End': {
          if (!opened || !homeEndKeys) return false;
          move(key === 'Home' ? first() : last());
          consumeEvent(event);
          return true;
        }
        case 'Enter': {
          if (!opened || !isEnabled(activeIndex)) return false;
          onSelect(activeIndex);
          consumeEvent(event);
          return true;
        }
        case 'Escape': {
          if (!opened || !hasOnClose) return false;
          onClose();
          consumeEvent(event);
          return true;
        }
        default:
          return false;
      }
    },
    [activeIndex, opened, hasOnOpen, hasOnClose, onOpen, onClose, onSelect, onActiveChange, first, last, seek, isEnabled, loop, count, pageSize, homeEndKeys]
  );

  const activeId = opened && isEnabled(activeIndex) ? getId(activeIndex) : undefined;

  const inputProps = useMemo<ListNavigationInputProps>(
    () => ({
      ...a11yProps({
        role: 'combobox',
        expanded: opened,
        controls: listId,
        activeDescendant: activeId,
      }),
      'aria-autocomplete': 'list',
      onKeyDown: (event: KeyboardEventLike) => {
        handleKeyDown(event);
      },
    }),
    [opened, listId, activeId, handleKeyDown]
  );

  const listProps = useMemo<A11yProps>(() => a11yProps({ role: 'listbox', id: listId }), [listId]);

  const getOptionProps = useCallback(
    (index: number): ListNavigationOptionProps => ({
      ...a11yProps({
        role: 'option',
        selected: index === activeIndex,
        disabled: isDisabled ? isDisabled(index) : undefined,
      }),
      id: getId(index),
    }),
    [activeIndex, isDisabled, getId]
  );

  return { inputProps, listProps, getOptionProps, handleKeyDown, moveNext, movePrevious, selectActive, activeId };
}
