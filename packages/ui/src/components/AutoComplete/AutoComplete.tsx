import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextStyle, ViewProps, ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { readKey } from '../../core/accessibility/keyboard';
import type { KeyboardEventLike } from '../../core/accessibility/keyboard';
import { useA11yId, getNodeText } from '../../core/accessibility/useA11yId';
import { useListNavigation } from '../../core/accessibility/useListNavigation';
import { factory } from '../../core/factory/factory';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { useThemedStyles } from '../../core/hooks/useThemedStyles';
import { useFloating } from '../../core/overlay/useFloating';
import { hasDOM, isAndroid, isNative, isWeb, webProps, webStyle } from '../../core/platform';
import { useKeyboardFocusOptional } from '../../core/providers/KeyboardManagerProvider';
import { getTextRole } from '../../core/theme/textRoles';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize, resolveSpacing } from '../../core/theme/tokens';
import type { FieldHandle } from '../../core/types/base';
import { getLayoutStyles } from '../../core/utils/layout';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { devError } from '../../core/utils/logger';
import type { PlacementType } from '../../core/utils/positioning-enhanced';
import { useStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';
import { useOverlayMode } from '../../hooks/useOverlayMode';
import { useDisclaimer } from '../_internal/Disclaimer/disclaimerUtils';
import { DropdownSheet } from '../_internal/DropdownSheet/DropdownSheet';
import { Field } from '../_internal/Field/Field';
import { Chip } from '../Chip';
import { Highlight } from '../Highlight';
import { Icon } from '../Icon';
import { Loader } from '../Loader';
import { FieldClearButton } from '../Select/FieldClearButton';
import { getDropdownSurfaceStyle, useFieldControlStyles } from '../Select/fieldControlStyles';
import { OptionRow } from '../Select/OptionRow';
import { Text as PBText } from '../Text';
import type { AutoCompleteHandle, AutoCompleteOption, AutoCompleteProps } from './types';

/** Tallest the scrolling suggestion list is allowed to get. */
const SUGGESTIONS_MAX_HEIGHT = 250;
/** Padding and border the dropdown adds around that list. */
const SUGGESTIONS_CHROME_HEIGHT = 8;
/** Blur → close delay, so a press on a suggestion lands before the list unmounts. */
const BLUR_CLOSE_DELAY = 150;

const DEFAULT_FALLBACK_PLACEMENTS: PlacementType[] = ['top-start', 'top-end', 'top', 'bottom-start', 'bottom-end', 'bottom'];
const EMPTY_OPTIONS: AutoCompleteOption[] = [];
const PLOCKS_INPUT_DATASET = { plocksInput: 'true' } as const;

const preventDefault = (event: { preventDefault(): void }) => event.preventDefault();

const defaultFilter = (item: AutoCompleteOption, query: string): boolean => {
  const needle = query.toLowerCase();
  return item.label.toLowerCase().includes(needle) || item.value.toLowerCase().includes(needle);
};

interface SuggestionGroup {
  key: string;
  label: string | null;
  items: { option: AutoCompleteOption; index: number }[];
}

/**
 * Orders suggestions for display: grouped by `group` (first-appearance order,
 * items keep their order within a group). `ordered[i]` is the option at list
 * position `i` — the index keyboard navigation and option ids use.
 */
function groupSuggestions(list: AutoCompleteOption[]): { groups: SuggestionGroup[]; ordered: AutoCompleteOption[] } {
  if (!list.some((option) => !!option.group)) {
    return {
      groups: [{ key: '__all', label: null, items: list.map((option, index) => ({ option, index })) }],
      ordered: list,
    };
  }
  const order: string[] = [];
  const byGroup = new Map<string, AutoCompleteOption[]>();
  list.forEach((option) => {
    const group = option.group ?? '';
    if (!byGroup.has(group)) {
      byGroup.set(group, []);
      order.push(group);
    }
    byGroup.get(group)?.push(option);
  });
  const ordered: AutoCompleteOption[] = [];
  const groups = order.map((group) => {
    const items = (byGroup.get(group) ?? []).map((option) => {
      ordered.push(option);
      return { option, index: ordered.length - 1 };
    });
    return { key: `group-${group}`, label: group || null, items };
  });
  return { groups, ordered };
}

const AutoCompleteInner = (props: AutoCompleteProps, ref: React.ForwardedRef<AutoCompleteHandle>) => {
  const {
    label,
    description,
    helperText,
    error,
    required = false,
    withAsterisk,
    disabled = false,
    readOnly = false,
    size = 'md',
    // Undefined by design — the shared `input` radius token supplies the default.
    radius,
    variant = 'default',
    labelProps,
    descriptionProps,
    accessibilityLabel,
    accessibilityHint,
    keyboardFocusId,
    value,
    defaultValue,
    onChangeText,
    placeholder,
    placeholderTextColor,
    clearable = false,
    clearButtonLabel = 'Clear input',
    onClear,
    onEnter,
    startSection,
    endSection,
    startSectionProps,
    endSectionProps,
    onFocus,
    onBlur,
    data = EMPTY_OPTIONS,
    onSearch,
    minSearchLength = 2,
    searchDelay = 300,
    renderItem,
    renderValue,
    onSelect,
    maxSuggestions = 10,
    showSuggestionsOnFocus = true,
    renderEmptyState,
    renderLoadingState,
    filter = defaultFilter,
    highlightMatches = true,
    highlightColor,
    highlightBackgroundColor = 'transparent',
    suggestionsStyle,
    suggestionItemStyle,
    groupLabelProps,
    multiSelect = false,
    selectedValues = EMPTY_OPTIONS,
    renderSelectedValue,
    selectedValuesContainerStyle,
    selectedValueChipProps,
    refocusAfterSelect,
    freeSolo = false,
    displayProperty = 'label',
    useModal: useModalProp,
    textInputProps,
    placement = 'bottom-start',
    fallbackPlacements = DEFAULT_FALLBACK_PLACEMENTS,
    offset = 4,
    flip = true,
    shift = false,
    boundary = 12,
    autoReposition = true,
    // Native TextInput passthrough.
    autoCapitalize,
    autoCorrect,
    autoFocus,
    returnKeyType,
    blurOnSubmit,
    selectTextOnFocus,
    textContentType,
    textAlign,
    spellCheck,
    inputMode,
    enterKeyHint,
    selectionColor,
    showSoftInputOnFocus,
    editable: editableProp,
    caretHidden,
    fullWidth,
    disclaimer,
    disclaimerProps,
    style,
    testID,
  } = props;

  const theme = useTheme();
  const keyboardFocus = useKeyboardFocusOptional();
  const spacingStyles = useStyleProps(props);
  const renderDisclaimer = useDisclaimer(disclaimer, disclaimerProps);
  const { shouldUseModal } = useOverlayMode({ forceModal: useModalProp });
  const useSheet = shouldUseModal;

  const baseId = useA11yId(undefined, 'plocks-autocomplete');
  const listId = `${baseId}-listbox`;
  const labelText = getNodeText(label) || undefined;
  const metrics = getControlSize(theme, size);

  // --- state -------------------------------------------------------------------
  const [query, setQuery] = useControllableState<string>({
    value,
    defaultValue,
    finalValue: '',
    onChange: onChangeText,
  });
  const [opened, setOpened] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [focused, setFocused] = useState(false);
  const [asyncResults, setAsyncResults] = useState<AutoCompleteOption[]>(EMPTY_OPTIONS);
  const [loading, setLoading] = useState(false);
  // The option chosen in single-select mode, kept so `renderValue` can paint a
  // rich representation of it inside the input.
  const [selectedOption, setSelectedOption] = useState<AutoCompleteOption | null>(null);

  const inputRef = useRef<TextInput | null>(null);
  const sheetInputRef = useRef<TextInput | null>(null);
  const openedRef = useRef(opened);
  openedRef.current = opened;
  const suppressFocusOpenRef = useRef(false);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const cancelBlurTimer = useCallback(() => {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    blurTimerRef.current = null;
  }, []);
  useEffect(() => cancelBlurTimer, [cancelBlurTimer]);

  const dismissKeyboard = useCallback(() => {
    if (keyboardFocus) keyboardFocus.dismissKeyboard();
    else if (isNative) Keyboard.dismiss();
  }, [keyboardFocus]);

  // --- suggestions ---------------------------------------------------------------
  const limit = useCallback(
    (list: AutoCompleteOption[]) => (maxSuggestions > 0 ? list.slice(0, maxSuggestions) : list),
    [maxSuggestions]
  );
  const meetsMinLength = query.length >= minSearchLength;
  // Local data filters during render (always current, no debounce); `onSearch`
  // results arrive asynchronously.
  const suggestions = useMemo(() => {
    if (meetsMinLength && query.length > 0) {
      return onSearch ? asyncResults : limit(data.filter((item) => filter(item, query)));
    }
    if (showSuggestionsOnFocus && data.length > 0) return limit(data);
    if (meetsMinLength && !onSearch) return limit(data.filter((item) => filter(item, query)));
    return EMPTY_OPTIONS;
  }, [meetsMinLength, query, onSearch, asyncResults, limit, data, filter, showSuggestionsOnFocus]);

  const { groups, ordered } = useMemo(() => groupSuggestions(suggestions), [suggestions]);

  const onSearchLatest = useLatestCallback(onSearch);
  const runAsyncSearch = useDebouncedCallback(async (searchQuery: string) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const results = (await onSearchLatest(searchQuery)) ?? EMPTY_OPTIONS;
      if (requestId !== requestIdRef.current) return;
      setAsyncResults(limit(results));
      setActiveIndex(-1);
    } catch (searchError) {
      devError('AutoComplete search error:', searchError);
      if (requestId === requestIdRef.current) setAsyncResults(EMPTY_OPTIONS);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, searchDelay);

  const cancelSearch = useCallback(() => {
    runAsyncSearch.cancel?.();
    requestIdRef.current += 1;
    setLoading(false);
  }, [runAsyncSearch]);

  // What the dropdown / sheet has to show besides options.
  const showEmptyState = meetsMinLength && query.length > 0 && !loading && ordered.length === 0;
  const hasDropdownContent = ordered.length > 0 || loading || showEmptyState;
  const dropdownVisible = opened && (useSheet || hasDropdownContent);

  // --- open / close ------------------------------------------------------------
  const open = useCallback(() => {
    if (disabled || readOnly) return;
    setOpened(true);
    openedRef.current = true;
  }, [disabled, readOnly]);

  const close = useCallback(() => {
    cancelBlurTimer();
    setOpened(false);
    openedRef.current = false;
    setActiveIndex(-1);
  }, [cancelBlurTimer]);

  const openSuggestions = useCallback(() => {
    if (disabled || readOnly) return;
    setActiveIndex(-1);
    if (onSearch && meetsMinLength && query.length > 0) runAsyncSearch(query);
    open();
    if (useSheet && isNative) {
      // The sheet's own input takes over; don't leave the field's keyboard up.
      requestAnimationFrame(() => inputRef.current?.blur());
    }
  }, [disabled, readOnly, onSearch, meetsMinLength, query, runAsyncSearch, open, useSheet]);

  const closeSheet = useCallback(() => {
    close();
    // The sheet returns focus to the field; that focus must not reopen it.
    suppressFocusOpenRef.current = true;
    sheetInputRef.current?.blur();
    inputRef.current?.blur();
    dismissKeyboard();
  }, [close, dismissKeyboard]);

  const focusInput = useCallback(() => {
    if (useSheet && openedRef.current) sheetInputRef.current?.focus();
    else inputRef.current?.focus();
  }, [useSheet]);

  // --- text --------------------------------------------------------------------
  const handleChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      setActiveIndex(-1);
      // A rich single-select value only stands while the text still matches it.
      setSelectedOption((previous) => {
        if (!previous) return previous;
        const display = displayProperty === 'label' ? previous.label : previous.value;
        return text === display ? previous : null;
      });

      const long = text.length >= minSearchLength && text.length > 0;
      if (onSearch) {
        if (long) runAsyncSearch(text);
        else cancelSearch();
      }
      if (long || (showSuggestionsOnFocus && data.length > 0) || useSheet) open();
      else if (!useSheet) close();
    },
    [setQuery, displayProperty, minSearchLength, onSearch, runAsyncSearch, cancelSearch, showSuggestionsOnFocus, data.length, useSheet, open, close]
  );

  // --- selection ---------------------------------------------------------------
  const shouldRefocus = !useSheet && (refocusAfterSelect ?? isWeb);

  const selectItem = useCallback(
    (item: AutoCompleteOption | undefined) => {
      if (!item || item.disabled || readOnly) return;
      if (multiSelect) {
        // The list stays open so several values can be picked in a row.
        onSelect?.(item);
        requestAnimationFrame(focusInput);
        return;
      }

      const display = displayProperty === 'label' ? item.label : item.value;
      setQuery(display);
      setSelectedOption(item);
      onSelect?.(item);

      if (useSheet) {
        closeSheet();
        return;
      }
      close();
      if (shouldRefocus) {
        // Focus normally never left the input (options don't take focus); if it
        // did, bring it back without reopening the list.
        suppressFocusOpenRef.current = true;
        inputRef.current?.focus();
        requestAnimationFrame(() => {
          suppressFocusOpenRef.current = false;
        });
      } else {
        inputRef.current?.blur();
        dismissKeyboard();
      }
    },
    [readOnly, multiSelect, onSelect, focusInput, displayProperty, setQuery, useSheet, closeSheet, close, shouldRefocus, dismissKeyboard]
  );

  const selectIndex = useCallback((index: number) => selectItem(ordered[index]), [selectItem, ordered]);

  const removeSelectedValue = useCallback(
    (item: AutoCompleteOption) => {
      if (disabled || readOnly) return;
      onSelect?.(item);
      requestAnimationFrame(focusInput);
    },
    [disabled, readOnly, onSelect, focusInput]
  );

  const handleClear = useCallback(() => {
    if (disabled || readOnly) return;
    setQuery('');
    setSelectedOption(null);
    setActiveIndex(-1);
    cancelSearch();
    onClear?.();
    if (useSheet || (showSuggestionsOnFocus && data.length > 0)) open();
    else close();
    requestAnimationFrame(focusInput);
  }, [disabled, readOnly, setQuery, cancelSearch, onClear, useSheet, showSuggestionsOnFocus, data.length, open, close, focusInput]);

  const commitCustomValue = useCallback((): boolean => {
    const text = query.trim();
    if (!freeSolo || !text) return false;
    const custom: AutoCompleteOption = { label: text, value: text.toLowerCase().replace(/\s+/g, '-') };
    const exists = data.some((item) => item.value === custom.value || item.label === custom.label);
    if (!exists) onSelect?.(custom);
    if (multiSelect) {
      // Commit the tag and clear the input so the next one can be typed right away.
      setQuery('');
      if (showSuggestionsOnFocus && data.length > 0) open();
      requestAnimationFrame(focusInput);
    } else if (!useSheet) {
      // Single-select keeps the submitted text (it is the value).
      close();
    }
    return true;
  }, [query, freeSolo, data, onSelect, multiSelect, setQuery, showSuggestionsOnFocus, open, focusInput, useSheet, close]);

  // --- keyboard ----------------------------------------------------------------
  const optionId = useCallback((index: number) => `${baseId}-option-${index}`, [baseId]);
  const isOptionDisabled = useCallback((index: number) => !!ordered[index]?.disabled, [ordered]);

  const nav = useListNavigation({
    count: ordered.length,
    activeIndex,
    onActiveChange: setActiveIndex,
    onSelect: selectIndex,
    getId: optionId,
    isDisabled: isOptionDisabled,
    opened: dropdownVisible,
    onOpen: openSuggestions,
    listId,
  });
  const { onKeyDown: _navKeyDown, ...comboboxA11y } = nav.inputProps;
  void _navKeyDown;

  // react-native-web routes a TextInput's keydown through onKeyPress (with the
  // DOM key event); native fires it for Enter / Backspace / characters.
  const handleKeyPress = useCallback(
    (event: KeyboardEventLike) => {
      const { key } = readKey(event);
      if (key === 'Tab') {
        if (!useSheet) close();
        return;
      }
      if (nav.handleKeyDown(event)) return;
      if (key === 'Backspace' && multiSelect && query.length === 0 && selectedValues.length > 0) {
        removeSelectedValue(selectedValues[selectedValues.length - 1]);
        return;
      }
      if (key === 'Enter') {
        if (commitCustomValue()) {
          // Keep focus (RN Web blurs a single-line input on Enter) and don't submit a form.
          event.preventDefault?.();
          return;
        }
        onEnter?.();
      }
    },
    [useSheet, close, nav, multiSelect, query.length, selectedValues, removeSelectedValue, commitCustomValue, onEnter]
  );

  // --- focus -------------------------------------------------------------------
  const handleFocus = useCallback(() => {
    cancelBlurTimer();
    setFocused(true);
    onFocus?.();
    if (suppressFocusOpenRef.current) {
      suppressFocusOpenRef.current = false;
      return;
    }
    if (useSheet || showSuggestionsOnFocus || query.length >= minSearchLength) openSuggestions();
  }, [cancelBlurTimer, onFocus, useSheet, showSuggestionsOnFocus, query.length, minSearchLength, openSuggestions]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    onBlur?.();
    if (useSheet) return;
    cancelBlurTimer();
    blurTimerRef.current = setTimeout(() => {
      blurTimerRef.current = null;
      close();
    }, BLUR_CLOSE_DELAY);
  }, [onBlur, useSheet, cancelBlurTimer, close]);

  // Tapping the field while it already has focus (e.g. after Escape) reopens the list.
  const handleInputPress = useCallback(() => {
    if (disabled || openedRef.current) return;
    suppressFocusOpenRef.current = false;
    openSuggestions();
  }, [disabled, openSuggestions]);

  const handleToggle = useCallback(() => {
    if (disabled || readOnly) return;
    if (openedRef.current) {
      if (useSheet) closeSheet();
      else close();
      return;
    }
    openSuggestions();
    if (!useSheet) {
      suppressFocusOpenRef.current = true;
      inputRef.current?.focus();
    }
  }, [disabled, readOnly, useSheet, closeSheet, close, openSuggestions]);

  // KeyboardManagerProvider hand-off: refocus when this field was requested.
  const pendingFocusTarget = keyboardFocus?.pendingFocusTarget;
  useEffect(() => {
    if (!keyboardFocusId || !keyboardFocus || pendingFocusTarget !== keyboardFocusId) return;
    if (keyboardFocus.consumeFocusTarget(keyboardFocusId)) inputRef.current?.focus();
  }, [keyboardFocus, keyboardFocusId, pendingFocusTarget]);

  useImperativeHandle(
    ref,
    (): FieldHandle => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: handleClear,
      isFocused: () => !!inputRef.current?.isFocused?.(),
    }),
    [handleClear]
  );

  // Keep the highlighted option in view (web: the list scrolls, focus stays in the input).
  const activeId = nav.activeId;
  useEffect(() => {
    if (!hasDOM || !activeId) return;
    const node = document.getElementById(activeId) as (HTMLElement & { scrollIntoView?: (o?: unknown) => void }) | null;
    node?.scrollIntoView?.({ block: 'nearest' });
  }, [activeId]);

  // --- styles ------------------------------------------------------------------
  const control = useFieldControlStyles({
    size,
    radius,
    variant,
    focused: focused && !(useSheet && opened),
    invalid: error !== undefined && error !== null && error !== false && error !== '',
    disabled,
  });
  const fieldFontSize = metrics.fontSize;

  const styles = useThemedStyles(
    (t) => {
      const gap = resolveSpacing(t, 'xs') as number;
      return {
        selectionArea: {
          flex: 1,
          flexDirection: 'row',
          flexWrap: multiSelect ? 'wrap' : 'nowrap',
          alignItems: 'center',
          // Gaps, not per-chip margins: spacing lands between chips and rows only,
          // so a single row of chips adds no height.
          ...(multiSelect ? { rowGap: 4, columnGap: 6 } : null),
        } as ViewStyle,
        input: {
          flexGrow: 1,
          flexShrink: 1,
          minWidth: multiSelect ? 80 : undefined,
        } as TextStyle,
        endArea: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 2, marginStart: gap } as ViewStyle,
        startArea: { flexDirection: 'row', alignItems: 'center', marginEnd: gap } as ViewStyle,
        toggle: {
          minWidth: 24,
          minHeight: 24,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 12,
        } as ViewStyle,
        groupHeader: {
          paddingHorizontal: metrics.paddingX,
          paddingTop: 10,
          paddingBottom: 4,
        } as TextStyle,
        divider: { height: StyleSheet.hairlineWidth, backgroundColor: t.backgrounds.border } as ViewStyle,
        state: { padding: 20, alignItems: 'center', gap: 8 } as ViewStyle,
        stateText: { fontSize: Math.max(12, fieldFontSize - 2), fontFamily: t.fontFamily, color: t.text.secondary } as TextStyle,
        surface: getDropdownSurfaceStyle(t),
        sheetField: { margin: resolveSpacing(t, 'sm') as number } as ViewStyle,
      };
    },
    [multiSelect, metrics.paddingX, fieldFontSize]
  );
  // Group headers use the sectionLabel role, 2px under the option text so
  // they track the field's `size` (unless the theme pins a size).
  const groupLabelSize = getTextRole(theme, 'sectionLabel', { fontSize: Math.max(10, fieldFontSize - 2) }).fontSize;

  const highlightTextColor = highlightColor ?? theme.text.link;
  const hasSelectedValues = multiSelect && selectedValues.length > 0;
  const showValueOverlay = !multiSelect && !!renderValue && !!selectedOption && !focused;
  const showClear = clearable && !disabled && !readOnly && (query.length > 0 || hasSelectedValues);
  const editable = !disabled && !readOnly && editableProp !== false;
  const resolvedPlaceholder = hasSelectedValues && !freeSolo ? '' : placeholder;

  // --- rendering: rows -----------------------------------------------------------
  const renderOptionAt = (option: AutoCompleteOption, index: number) => {
    const isSelected = multiSelect
      ? selectedValues.some((selected) => selected.value === option.value)
      : query.length > 0 && (query === option.value || query === option.label);
    const isActive = index === activeIndex;
    const optionProps = nav.getOptionProps(index);

    if (renderItem) {
      // The custom node owns its press handling (helpers.onSelect); the wrapper
      // carries the option semantics so the list stays navigable and announced.
      return (
        <View
          key={`${option.value}-${index}`}
          {...optionProps}
          aria-selected={isSelected}
          aria-label={option.label}
          {...webProps({ onMouseDown: preventDefault })}
        >
          {renderItem(option, index, {
            query,
            onSelect: selectItem,
            isHighlighted: isActive,
            isSelected,
          })}
        </View>
      );
    }

    const baseTextColor = option.disabled ? theme.text.disabled : theme.text.primary;
    return (
      <OptionRow
        key={`${option.value}-${index}`}
        optionProps={optionProps}
        index={index}
        label={
          <Highlight
            highlight={highlightMatches ? query : undefined}
            size={fieldFontSize}
            c={baseTextColor}
            numberOfLines={1}
            highlightProps={{
              c: option.disabled ? baseTextColor : highlightTextColor,
              style: {
                backgroundColor: option.disabled ? 'transparent' : highlightBackgroundColor,
                fontWeight: '700',
                paddingHorizontal: 0,
                paddingVertical: 0,
              },
            }}
          >
            {option.label}
          </Highlight>
        }
        selected={isSelected}
        active={isActive}
        disabled={option.disabled}
        onSelect={selectIndex}
        onHover={setActiveIndex}
        size={size}
        reserveCheckSpace
        style={suggestionItemStyle}
      />
    );
  };

  const listboxProps = a11yProps({
    role: 'listbox',
    id: listId,
    labelledBy: labelText && !accessibilityLabel ? `${baseId}-label` : undefined,
    label: accessibilityLabel ?? (labelText ? undefined : placeholder),
  });

  const renderList = () => (
    <View {...listboxProps}>
      {groups.map((group) => {
        const rows = group.items.map(({ option, index }, position) => (
          <React.Fragment key={`${option.value}-${index}`}>
            {position > 0 && !renderItem ? <View style={styles.divider} /> : null}
            {renderOptionAt(option, index)}
          </React.Fragment>
        ));
        if (!group.label) return <React.Fragment key={group.key}>{rows}</React.Fragment>;
        const headerId = `${baseId}-${group.key.replace(/[^a-zA-Z0-9_-]/g, '')}`;
        return (
          <View key={group.key} {...a11yProps({ role: 'group', labelledBy: headerId, label: isNative ? group.label : undefined })}>
            <PBText
              {...mergeSlotProps(
                { textRole: 'sectionLabel', size: groupLabelSize, id: headerId, style: styles.groupHeader },
                groupLabelProps
              )}
            >
              {group.label}
            </PBText>
            {rows}
          </View>
        );
      })}
    </View>
  );

  const renderStates = (withHint: boolean) => {
    if (ordered.length > 0) return null;
    if (loading) {
      return (
        <View style={styles.state} {...a11yProps({ live: 'polite' })}>
          {renderLoadingState ? (
            renderLoadingState()
          ) : (
            <>
              <Loader size="sm" />
              <Text style={styles.stateText}>Searching...</Text>
            </>
          )}
        </View>
      );
    }
    if (showEmptyState) {
      return (
        <View style={styles.state} {...a11yProps({ live: 'polite' })}>
          {renderEmptyState ? renderEmptyState() : <Text style={styles.stateText}>No suggestions found</Text>}
        </View>
      );
    }
    if (withHint && minSearchLength > 0) {
      return (
        <View style={styles.state}>
          <Text style={styles.stateText}>Type {minSearchLength} or more characters to search</Text>
        </View>
      );
    }
    return null;
  };

  const renderSelectedValueItem = (item: AutoCompleteOption, index: number, source: 'input' | 'modal') => {
    const onRemove = () => removeSelectedValue(item);
    if (renderSelectedValue) {
      const node = renderSelectedValue(item, index, {
        onRemove,
        disabled,
        isFocused: focused,
        inputValue: query,
        source,
      });
      return node == null ? null : <React.Fragment key={`${source}-${item.value}`}>{node}</React.Fragment>;
    }
    const {
      style: chipStyle,
      onRemove: chipOnRemove,
      children: chipChildren,
      disabled: chipDisabled,
      ...restChipProps
    } = selectedValueChipProps ?? {};
    return (
      <Chip
        key={`${source}-${item.value}`}
        size="sm"
        variant="light"
        color="primary"
        {...restChipProps}
        disabled={chipDisabled ?? disabled}
        onRemove={() => {
          chipOnRemove?.();
          onRemove();
        }}
        style={chipStyle}
      >
        {chipChildren ?? item.label}
      </Chip>
    );
  };

  // --- floating (anchored) -------------------------------------------------------
  const floating = useFloating({
    opened: dropdownVisible && !useSheet,
    onDismiss: close,
    placement,
    fallbackPlacements,
    offset,
    flip,
    shift,
    boundary,
    autoUpdate: autoReposition,
    matchWidth: true,
    // ARIA is owned by the combobox input (aria-expanded / aria-controls / activedescendant).
    withRoles: false,
    id: `${baseId}-dropdown`,
    layer: 'dropdown',
    autoFocus: false,
    // Chosen once from the maximum height, so the side never flips as results filter down.
    desiredHeight: SUGGESTIONS_MAX_HEIGHT + SUGGESTIONS_CHROME_HEIGHT,
  });
  const { refs: floatingRefs } = floating;

  const anchorWidth = floating.position?.finalWidth;
  const positionMaxHeight = floating.position?.maxHeight;
  const listMaxHeight = typeof positionMaxHeight === 'number'
    ? Math.max(80, Math.min(SUGGESTIONS_MAX_HEIGHT, positionMaxHeight - SUGGESTIONS_CHROME_HEIGHT))
    : SUGGESTIONS_MAX_HEIGHT;

  const floatingProps = floating.getFloatingProps({
    style: [styles.surface, anchorWidth ? { width: anchorWidth } : null, suggestionsStyle],
  }) as ViewProps;

  const floatingElement = useSheet
    ? null
    : floating.renderFloating(
        <View {...floatingProps}>
          {ordered.length > 0 ? (
            <ScrollView style={{ maxHeight: listMaxHeight }} keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
              {renderList()}
            </ScrollView>
          ) : (
            renderStates(false)
          )}
        </View>,
        { width: anchorWidth }
      );

  // --- input -------------------------------------------------------------------
  const { style: textInputStyle, ...restTextInputProps } = textInputProps ?? {};
  const forwardedInputProps = {
    autoCapitalize,
    autoCorrect,
    returnKeyType,
    selectTextOnFocus,
    textContentType,
    textAlign,
    spellCheck,
    inputMode,
    enterKeyHint,
    selectionColor,
    showSoftInputOnFocus,
    caretHidden,
  };

  const renderInput = (
    source: 'input' | 'modal',
    controlProps: Record<string, unknown> = {}
  ) => {
    const isSheetInput = source === 'modal';
    return (
      <TextInput
        ref={isSheetInput ? sheetInputRef : inputRef}
        {...restTextInputProps}
        {...forwardedInputProps}
        {...controlProps}
        {...comboboxA11y}
        // The field's input only points at the list it actually shows.
        aria-activedescendant={isSheetInput || !useSheet ? comboboxA11y['aria-activedescendant'] : undefined}
        aria-controls={dropdownVisible ? listId : undefined}
        aria-label={isSheetInput ? accessibilityLabel ?? labelText ?? placeholder : (controlProps['aria-label'] as string | undefined)}
        testID={isSheetInput ? (testID ? `${testID}-sheet-input` : undefined) : testID}
        value={query}
        onChangeText={handleChangeText}
        onFocus={isSheetInput ? undefined : handleFocus}
        onBlur={isSheetInput ? undefined : handleBlur}
        onKeyPress={handleKeyPress}
        {...(isSheetInput ? null : isWeb ? webProps({ onClick: handleInputPress }) : { onPressIn: handleInputPress })}
        placeholder={resolvedPlaceholder}
        placeholderTextColor={placeholderTextColor ?? theme.text.muted}
        editable={editable}
        // freeSolo commits on Enter and keeps focus for the next tag.
        blurOnSubmit={freeSolo ? false : blurOnSubmit}
        autoFocus={isSheetInput ? autoFocus ?? true : useSheet ? false : autoFocus}
        dataSet={isWeb ? PLOCKS_INPUT_DATASET : undefined}
        style={[
          control.input,
          styles.input,
          !isSheetInput && showValueOverlay ? { color: 'transparent' } : null,
          textInputStyle,
        ]}
      />
    );
  };

  const toggleButton = loading ? (
    <Loader size="sm" />
  ) : (
    <Pressable
      onPress={handleToggle}
      disabled={disabled || readOnly}
      {...a11yProps({
        role: 'button',
        label: opened ? 'Hide suggestions' : 'Show suggestions',
        expanded: dropdownVisible,
        disabled: disabled || readOnly,
      })}
      hitSlop={isNative ? 10 : undefined}
      // Not a tab stop (APG combobox): the input is the control.
      {...webProps({ tabIndex: -1, onMouseDown: preventDefault })}
      style={[styles.toggle, webStyle({ cursor: disabled ? 'not-allowed' : 'pointer' })]}
      testID={testID ? `${testID}-toggle` : undefined}
    >
      <Icon name="selector-vertical" size={metrics.iconSize} stroke={2} color={control.iconColor} decorative />
    </Pressable>
  );

  const rootStyle: ViewStyle = {
    position: 'relative',
    width: '100%',
    // Android floor against intrinsic shrink; `miw` overrides it.
    ...(isAndroid ? { minWidth: 240 } : null),
  };
  const layoutStyles = getLayoutStyles({ fullWidth });
  const disclaimerNode = renderDisclaimer();

  return (
    <Field
      id={baseId}
      label={label}
      description={description}
      error={error}
      helperText={helperText}
      required={required}
      withAsterisk={withAsterisk}
      disabled={disabled}
      readOnly={readOnly}
      size={size}
      labelProps={labelProps}
      descriptionProps={descriptionProps}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={[rootStyle, layoutStyles, spacingStyles, style]}
      testID={testID ? `${testID}-root` : undefined}
    >
      {({ controlProps }) => (
        <>
          <View style={ANCHOR_WRAPPER}>
            <View ref={floatingRefs.setReference} style={control.frame}>
              {focused && !(useSheet && opened) ? <View style={control.focusRing} /> : null}
              {startSection ? <View style={styles.startArea}>{startSection}</View> : null}
              <View
                {...startSectionProps}
                style={[styles.selectionArea, selectedValuesContainerStyle, startSectionProps?.style]}
              >
                {multiSelect
                  ? selectedValues.map((selected, index) => renderSelectedValueItem(selected, index, 'input'))
                  : null}
                {renderInput('input', controlProps as Record<string, unknown>)}
                {showValueOverlay && selectedOption && renderValue ? (
                  <Pressable
                    // Tap to edit: focusing the input unmounts the overlay.
                    onPress={() => {
                      if (!disabled) inputRef.current?.focus();
                    }}
                    accessible={false}
                    aria-hidden
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    {...webProps({ tabIndex: -1, onMouseDown: preventDefault })}
                    style={[StyleSheet.absoluteFill, VALUE_OVERLAY]}
                  >
                    {renderValue(selectedOption, { focused, clear: handleClear })}
                  </Pressable>
                ) : null}
              </View>
              <View {...endSectionProps} style={[styles.endArea, endSectionProps?.style]}>
                {endSection}
                {showClear ? (
                  <FieldClearButton
                    onPress={handleClear}
                    label={clearButtonLabel}
                    size={size}
                    preventFocusSteal
                    testID={testID ? `${testID}-clear` : undefined}
                  />
                ) : null}
                {toggleButton}
              </View>
            </View>
            {floatingElement}
          </View>
          {disclaimerNode}
          {useSheet ? (
            <DropdownSheet
              opened={opened}
              onClose={closeSheet}
              placement="center"
              title={labelText}
              accessibilityLabel={accessibilityLabel ?? labelText ?? placeholder}
              withCloseButton
              initialFocusRef={sheetInputRef}
              testID={testID ? `${testID}-sheet` : undefined}
            >
              <View style={[control.frame, styles.sheetField]}>
                <View style={[styles.selectionArea, selectedValuesContainerStyle]}>
                  {multiSelect
                    ? selectedValues.map((selected, index) => renderSelectedValueItem(selected, index, 'modal'))
                    : null}
                  {renderInput('modal')}
                </View>
                <View style={styles.endArea}>
                  {loading ? (
                    <Loader size="sm" />
                  ) : showClear ? (
                    <FieldClearButton onPress={handleClear} label={clearButtonLabel} size={size} preventFocusSteal />
                  ) : null}
                </View>
              </View>
              <ScrollView style={{ flexShrink: 1 }} keyboardShouldPersistTaps="always">
                {ordered.length > 0 ? renderList() : renderStates(true)}
              </ScrollView>
            </DropdownSheet>
          ) : null}
        </>
      )}
    </Field>
  );
};

const ANCHOR_WRAPPER: ViewStyle = { position: 'relative', width: '100%' };
const VALUE_OVERLAY: ViewStyle = { justifyContent: 'center' };

/**
 * A text field with a suggestion list: the editable combobox pattern
 * (`aria-autocomplete="list"`, `aria-activedescendant`), local or async data,
 * single / multi / free-form selection. Anchored dropdown on desktop web, a
 * centered dialog on native and small screens.
 */
export const AutoComplete = factory<{ props: AutoCompleteProps; ref: AutoCompleteHandle }>(AutoCompleteInner, {
  displayName: 'AutoComplete',
});
