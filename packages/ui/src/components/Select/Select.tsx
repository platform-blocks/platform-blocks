import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { FlatList, Keyboard, Text, TextInput, View } from 'react-native';
import type { GestureResponderEvent, ListRenderItemInfo, ViewProps, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { a11yProps } from '../../core/accessibility/a11yProps';
import type { A11yProps } from '../../core/accessibility/a11yProps';
import { consumeEvent, readKey } from '../../core/accessibility/keyboard';
import type { KeyboardEventLike } from '../../core/accessibility/keyboard';
import { useA11yId } from '../../core/accessibility/useA11yId';
import { useListNavigation } from '../../core/accessibility/useListNavigation';
import { factory } from '../../core/factory/factory';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { useReducedMotion } from '../../core/motion/useReducedMotion';
import { useFloating } from '../../core/overlay/useFloating';
import { hasDOM, isWeb } from '../../core/platform';
import { useKeyboardFocusOptional } from '../../core/providers/KeyboardManagerProvider';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize } from '../../core/theme/tokens';
import type { FieldHandle } from '../../core/types/base';
import { getLayoutStyles } from '../../core/utils/layout';
import type { PlacementType } from '../../core/utils/positioning-enhanced';
import { useStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState';
import { useOverlayMode } from '../../hooks/useOverlayMode';
import { useDisclaimer } from '../_internal/Disclaimer/disclaimerUtils';
import { DropdownSheet } from '../_internal/DropdownSheet/DropdownSheet';
import { Field } from '../_internal/Field/Field';
import { Icon } from '../Icon';

import { CustomOption } from './CustomOption';
import { getDropdownSurfaceStyle } from './fieldControlStyles';
import { OptionRow } from './OptionRow';
import { PickerTrigger } from './PickerTrigger';
import type { SelectHandle, SelectOption, SelectProps } from './Select.types';
import { findEnabledIndex, isKeyboardPress, matchTypeahead } from './selectUtils';

/** Matches the Accordion chevron spin so every disclosure affordance reads alike. */
const CHEVRON_SPIN_DURATION = 220;
const DEFAULT_DROPDOWN_MAX_HEIGHT = 260;
const TYPEAHEAD_RESET_MS = 500;

const DROPDOWN_FALLBACK_PLACEMENTS: PlacementType[] = [
  'top-start',
  'top-end',
  'top',
  'bottom-start',
  'bottom-end',
  'bottom',
];

const hasContent = (node: React.ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== true && node !== '';

function SelectInner<T>(props: SelectProps<T>, ref: React.ForwardedRef<SelectHandle>) {
  const {
    value: valueProp,
    defaultValue,
    onChange,
    options,
    placeholder = 'Select…',
    placeholderTextColor,
    size = 'md',
    // Undefined by design — the `input` radius token supplies the default.
    radius,
    variant = 'default',
    disabled = false,
    readOnly = false,
    required = false,
    withAsterisk,
    label,
    description,
    helperText,
    error,
    labelProps,
    descriptionProps,
    accessibilityLabel,
    accessibilityHint,
    searchable = false,
    searchPlaceholder = 'Search…',
    nothingFoundMessage = 'Nothing found',
    renderOption,
    maxDropdownHeight: maxH = DEFAULT_DROPDOWN_MAX_HEIGHT,
    closeOnSelect = true,
    clearable = false,
    clearButtonLabel = 'Clear selection',
    onClear,
    refocusAfterSelect = true,
    keyboardAvoidance = true,
    startSection,
    startSectionProps,
    onDropdownOpen,
    onDropdownClose,
    onFocus,
    onBlur,
    fullWidth,
    w,
    disclaimer,
    disclaimerProps,
    style,
    testID,
    // Style props are resolved by useStyleProps; nothing else to forward.
  } = props;

  const theme = useTheme();
  const { shouldUseModal } = useOverlayMode();
  const keyboardFocus = useKeyboardFocusOptional();
  const reducedMotion = useReducedMotion();
  const spacingStyles = useStyleProps(props);
  const renderDisclaimer = useDisclaimer(disclaimer, disclaimerProps);

  const baseId = useA11yId(undefined, 'pb-select');
  const listId = `${baseId}-listbox`;
  const hasLabel = hasContent(label);

  const [value, setValue] = useControllableState<T | null>({
    value: valueProp,
    defaultValue: defaultValue ?? undefined,
    finalValue: null,
    onChange,
  });

  const [opened, setOpened] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<View | null>(null);
  const searchInputRef = useRef<TextInput | null>(null);
  const openedRef = useRef(opened);
  openedRef.current = opened;

  const useSheet = shouldUseModal;

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value]
  );

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!searchable || !trimmed) return options;
    return options.filter((option) => option.label.toLowerCase().includes(trimmed));
  }, [options, searchable, query]);

  // --- chevron ----------------------------------------------------------------
  // One `chevron-down` spun a half turn rather than two swapped icons, so
  // opening and closing read as one continuous motion.
  const chevronRotation = useSharedValue(0);
  useEffect(() => {
    const target = opened ? 180 : 0;
    chevronRotation.value = reducedMotion
      ? target
      : withTiming(target, { duration: CHEVRON_SPIN_DURATION, easing: Easing.inOut(Easing.ease) });
  }, [opened, reducedMotion, chevronRotation]);
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  // --- open / close / select -------------------------------------------------
  const onDropdownOpenLatest = useLatestCallback(onDropdownOpen);
  const onDropdownCloseLatest = useLatestCallback(onDropdownClose);

  const openDropdown = useCallback(
    (initial: 'selected' | 'first' | 'last' = 'selected') => {
      if (disabled || readOnly || openedRef.current) return;
      // Another field's keyboard would cover the dropdown / sheet.
      if (keyboardFocus) keyboardFocus.dismissKeyboard();
      else if (!isWeb) Keyboard.dismiss();

      const selectedIndex = options.findIndex((option) => option.value === value);
      let next: number;
      if (initial === 'last') next = findEnabledIndex(options, options.length, -1);
      else if (initial === 'first' || selectedIndex < 0 || options[selectedIndex]?.disabled) {
        next = findEnabledIndex(options, -1, 1);
      } else next = selectedIndex;

      setQuery('');
      setActiveIndex(next);
      setOpened(true);
      openedRef.current = true;
      onDropdownOpenLatest();
    },
    [disabled, readOnly, keyboardFocus, options, value, onDropdownOpenLatest]
  );

  const closeDropdown = useCallback(() => {
    if (!openedRef.current) return;
    setOpened(false);
    openedRef.current = false;
    setActiveIndex(-1);
    setQuery('');
    onDropdownCloseLatest();
  }, [onDropdownCloseLatest]);

  const focusTrigger = useCallback(() => {
    triggerRef.current?.focus?.();
  }, []);

  const selectOption = useCallback(
    (option: SelectOption<T> | undefined) => {
      if (!option || option.disabled || readOnly) return;
      setValue(option.value, option);
      if (!closeOnSelect) return;
      closeDropdown();
      // The floating layer / sheet returns focus to the trigger on close.
      if (!refocusAfterSelect) {
        requestAnimationFrame(() => triggerRef.current?.blur?.());
      }
    },
    [readOnly, setValue, closeOnSelect, closeDropdown, refocusAfterSelect]
  );

  const selectIndex = useCallback((index: number) => selectOption(filtered[index]), [selectOption, filtered]);

  const handleClear = useCallback(() => {
    if (disabled || readOnly) return;
    setValue(null, null);
    onClear?.();
    closeDropdown();
    // The clear button unmounts; keep keyboard focus on the field.
    if (isWeb) requestAnimationFrame(focusTrigger);
  }, [disabled, readOnly, setValue, onClear, closeDropdown, focusTrigger]);

  useImperativeHandle(
    ref,
    (): FieldHandle => ({
      focus: focusTrigger,
      blur: () => triggerRef.current?.blur?.(),
      clear: handleClear,
      isFocused: () => hasDOM && document.activeElement === (triggerRef.current as unknown),
    }),
    [focusTrigger, handleClear]
  );

  // --- keyboard ----------------------------------------------------------------
  const optionId = useCallback((index: number) => `${baseId}-option-${index}`, [baseId]);
  const isOptionDisabled = useCallback((index: number) => !!filtered[index]?.disabled, [filtered]);

  const nav = useListNavigation({
    count: filtered.length,
    activeIndex,
    onActiveChange: setActiveIndex,
    onSelect: selectIndex,
    getId: optionId,
    isDisabled: isOptionDisabled,
    opened,
    listId,
    loop: false,
    homeEndKeys: !searchable,
  });

  const typeaheadRef = useRef<{ buffer: string; timer: ReturnType<typeof setTimeout> | null }>({
    buffer: '',
    timer: null,
  });
  useEffect(() => () => {
    const { timer } = typeaheadRef.current;
    if (timer) clearTimeout(timer);
  }, []);

  const runTypeahead = useCallback(
    (char: string): number => {
      const state = typeaheadRef.current;
      if (state.timer) clearTimeout(state.timer);
      state.timer = setTimeout(() => {
        state.buffer = '';
      }, TYPEAHEAD_RESET_MS);
      state.buffer += char.toLowerCase();
      return matchTypeahead(options, state.buffer, activeIndex);
    },
    [options, activeIndex]
  );

  const handleTriggerKeyDown = useCallback(
    (event: KeyboardEventLike) => {
      if (disabled || readOnly) return;
      const { key, alt, ctrl, meta } = readKey(event);
      const printable = key.length === 1 && key !== ' ' && !ctrl && !meta && !alt;

      if (!openedRef.current) {
        if (key === 'ArrowDown' || key === 'Enter' || key === ' ') {
          consumeEvent(event);
          openDropdown('selected');
        } else if (key === 'ArrowUp' || key === 'Home') {
          consumeEvent(event);
          openDropdown('first');
        } else if (key === 'End') {
          consumeEvent(event);
          openDropdown('last');
        } else if (printable && !searchable) {
          const match = runTypeahead(key);
          openDropdown('selected');
          if (match >= 0) setActiveIndex(match);
        }
        return;
      }

      // With a filter input, keys are handled there (it holds focus).
      if (searchable) return;
      if (key === 'Tab') {
        closeDropdown();
        return;
      }
      if (key === ' ') {
        consumeEvent(event);
        selectIndex(activeIndex);
        return;
      }
      if (nav.handleKeyDown(event)) return;
      if (printable) {
        const match = runTypeahead(key);
        if (match >= 0) setActiveIndex(match);
      }
    },
    [disabled, readOnly, openDropdown, searchable, runTypeahead, closeDropdown, selectIndex, activeIndex, nav]
  );

  const handleSearchKeyDown = useCallback(
    (event: KeyboardEventLike) => {
      const { key } = readKey(event);
      if (key === 'Tab') {
        closeDropdown();
        return;
      }
      nav.handleKeyDown(event);
    },
    [closeDropdown, nav]
  );

  const handleQueryChange = useCallback(
    (text: string) => {
      setQuery(text);
      const trimmed = text.trim().toLowerCase();
      const next = trimmed ? options.filter((option) => option.label.toLowerCase().includes(trimmed)) : options;
      setActiveIndex(findEnabledIndex(next, -1, 1));
    },
    [options]
  );

  const handleTriggerPress = useCallback(
    (event: GestureResponderEvent) => {
      // react-native-web also "presses" on Enter keyup; keys are handled on keydown.
      if (isKeyboardPress(event)) return;
      if (openedRef.current) closeDropdown();
      else openDropdown('selected');
    },
    [closeDropdown, openDropdown]
  );

  // Keep the highlighted option in view (web: the list scrolls under a fixed trigger).
  const activeId = nav.activeId;
  useEffect(() => {
    if (!hasDOM || !opened || !activeId) return;
    const node = document.getElementById(activeId) as (HTMLElement & { scrollIntoView?: (o?: unknown) => void }) | null;
    node?.scrollIntoView?.({ block: 'nearest' });
  }, [opened, activeId]);

  // --- positioning -----------------------------------------------------------
  const metrics = getControlSize(theme, size);
  const estimatedDropdownHeight = useMemo(() => {
    // Known before the list mounts, so the first placement picks the right side.
    const rowHeight = Math.max(32, metrics.height - 4) + 1;
    const searchHeight = searchable ? metrics.height + 16 : 0;
    return Math.min(maxH, options.length * rowHeight + 2) + searchHeight;
  }, [metrics.height, searchable, maxH, options.length]);

  const floating = useFloating({
    opened: opened && !useSheet,
    onDismiss: closeDropdown,
    placement: 'bottom-start',
    offset: 6,
    boundary: 8,
    flip: true,
    shift: true,
    matchWidth: true,
    fallbackPlacements: DROPDOWN_FALLBACK_PLACEMENTS,
    role: null,
    popupType: 'listbox',
    id: `${baseId}-dropdown`,
    layer: 'dropdown',
    // Select-only: real focus stays on the trigger (aria-activedescendant).
    // Searchable: the filter input takes focus.
    autoFocus: searchable,
    initialFocusRef: searchable ? searchInputRef : undefined,
    keyboardAvoidance,
    desiredHeight: estimatedDropdownHeight,
  });

  const { refs: floatingRefs } = floating;
  const setTriggerNode = useCallback(
    (node: View | null) => {
      triggerRef.current = node;
      floatingRefs.setReference(node);
    },
    [floatingRefs]
  );

  const positionMaxHeight = floating.position?.maxHeight;
  const listMaxHeight = typeof positionMaxHeight === 'number'
    ? Math.max(80, Math.min(maxH, positionMaxHeight - (searchable ? metrics.height + 16 : 0)))
    : maxH;

  // --- dropdown content ----------------------------------------------------------
  const virtualFocus = !useSheet;
  const renderRow = useCallback(
    ({ item, index }: ListRenderItemInfo<SelectOption<T>>) => {
      const selected = item.value === value;
      const active = index === activeIndex;
      const optionProps = nav.getOptionProps(index);
      if (renderOption) {
        return (
          <CustomOption
            option={item}
            index={index}
            optionProps={optionProps}
            selected={selected}
            active={active}
            virtualFocus={virtualFocus}
            render={renderOption}
            onSelect={selectIndex}
            onHover={setActiveIndex}
          />
        );
      }
      return (
        <OptionRow
          optionProps={optionProps}
          index={index}
          label={item.label}
          description={item.description}
          selected={selected}
          active={active}
          disabled={item.disabled}
          onSelect={selectIndex}
          onHover={setActiveIndex}
          size={size}
          virtualFocus={virtualFocus}
        />
      );
    },
    [value, activeIndex, nav, renderOption, virtualFocus, selectIndex, size]
  );

  const listboxProps = a11yProps({
    role: 'listbox',
    id: listId,
    labelledBy: hasLabel && !accessibilityLabel ? `${baseId}-label` : undefined,
    label: accessibilityLabel ?? (hasLabel ? undefined : placeholder),
  });

  const listbox = (
    <View {...listboxProps} style={[LIST_WRAPPER, { maxHeight: useSheet ? undefined : listMaxHeight }]}>
      <FlatList
        data={filtered}
        extraData={`${String(value)}|${activeIndex}`}
        keyExtractor={optionKey}
        renderItem={renderRow}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={Math.min(filtered.length, 30)}
        ItemSeparatorComponent={renderOption ? undefined : OptionDivider}
        bounces={false}
        style={{ flexGrow: 0 }}
      />
      {filtered.length === 0 ? (
        <Text
          style={{
            paddingHorizontal: metrics.paddingX,
            paddingVertical: metrics.gap * 2,
            color: theme.text.muted,
            fontSize: metrics.fontSize,
            fontFamily: theme.fontFamily,
          }}
        >
          {nothingFoundMessage}
        </Text>
      ) : null}
    </View>
  );

  const { onKeyDown: _navKeyDown, ...searchInputA11y } = nav.inputProps;
  void _navKeyDown;
  const searchInput = searchable ? (
    <View style={{ padding: metrics.gap, borderBottomWidth: 1, borderBottomColor: theme.backgrounds.border }}>
      <TextInput
        ref={searchInputRef}
        value={query}
        onChangeText={handleQueryChange}
        placeholder={searchPlaceholder}
        placeholderTextColor={theme.text.muted}
        autoCorrect={false}
        autoCapitalize="none"
        {...searchInputA11y}
        aria-label={searchPlaceholder}
        // react-native-web routes a TextInput's keydown through onKeyPress (its own
        // onKeyDown wins over a passed one), with the DOM key event.
        onKeyPress={handleSearchKeyDown}
        style={{
          minHeight: Math.max(32, metrics.height - 8),
          paddingHorizontal: metrics.paddingX,
          fontSize: metrics.fontSize,
          fontFamily: theme.fontFamily,
          color: theme.text.primary,
          borderRadius: metrics.radius,
          backgroundColor: theme.backgrounds.subtle,
        }}
      />
    </View>
  ) : null;

  const dropdownSurface = useMemo(() => getDropdownSurfaceStyle(theme), [theme]);
  const anchorWidth = floating.position?.finalWidth;
  const floatingProps = floating.getFloatingProps({
    style: [dropdownSurface, anchorWidth ? { width: anchorWidth } : null],
    testID: testID ? `${testID}-dropdown` : undefined,
  }) as ViewProps;

  const floatingElement = useSheet
    ? null
    : floating.renderFloating(
        <View {...floatingProps}>
          {searchInput}
          {listbox}
        </View>,
        { width: anchorWidth }
      );

  // --- trigger ------------------------------------------------------------------
  const displayValue = selectedOption?.label;
  const referenceAria = floating.getReferenceProps({}, { ref: false });

  const buildTriggerA11y = (controlProps: A11yProps) => {
    const nameFallback = !hasLabel && !accessibilityLabel ? placeholder : undefined;
    const state = a11yProps({
      role: isWeb ? 'combobox' : 'button',
      expanded: opened,
      hasPopup: 'listbox',
      controls: opened ? listId : undefined,
      activeDescendant: opened && !searchable ? activeId : undefined,
      disabled,
      // Native reads the value after the label ("Sport, Tennis, button");
      // web reads a select-only combobox's value from its text.
      value: !isWeb && displayValue ? { text: displayValue } : undefined,
    });
    return {
      ...controlProps,
      ...(nameFallback && !controlProps['aria-label'] ? { 'aria-label': nameFallback } : null),
      ...state,
      'aria-expanded': opened,
      // Only the web trigger may point at the popup (native gets aria-expanded only).
      ...(isWeb ? { 'aria-haspopup': referenceAria['aria-haspopup'] as A11yProps['aria-haspopup'] } : null),
    };
  };

  const endSection = (
    <Animated.View style={chevronStyle}>
      <Icon name="chevron-down" size={metrics.iconSize} color={disabled ? theme.text.disabled : theme.text.muted} decorative />
    </Animated.View>
  );

  const rootStyle: ViewStyle = fullWidth || w !== undefined ? {} : { width: 'auto', minWidth: 200 };
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
      testID={testID}
    >
      {({ controlProps, invalid }) => (
        <>
          <View style={ANCHOR_WRAPPER}>
            <PickerTrigger
              triggerRef={setTriggerNode}
              triggerProps={{
                ...buildTriggerA11y(controlProps),
                onKeyDown: handleTriggerKeyDown,
                onFocus,
                onBlur,
              }}
              onPress={handleTriggerPress}
              displayValue={displayValue}
              placeholder={placeholder}
              placeholderTextColor={placeholderTextColor}
              size={size}
              radius={radius}
              variant={variant}
              opened={opened}
              invalid={invalid}
              disabled={disabled}
              readOnly={readOnly}
              startSection={startSection}
              startSectionProps={startSectionProps}
              endSection={endSection}
              showClear={clearable && !!selectedOption && !disabled && !readOnly}
              onClear={handleClear}
              clearButtonLabel={clearButtonLabel}
              testID={testID ? `${testID}-trigger` : undefined}
            />
            {floatingElement}
          </View>
          {disclaimerNode}
          {useSheet ? (
            <DropdownSheet
              opened={opened}
              onClose={closeDropdown}
              title={typeof label === 'string' || typeof label === 'number' ? label : undefined}
              accessibilityLabel={accessibilityLabel ?? placeholder}
              withCloseButton
              initialFocusRef={searchable ? searchInputRef : undefined}
              testID={testID ? `${testID}-sheet` : undefined}
            >
              {searchInput}
              {listbox}
            </DropdownSheet>
          ) : null}
        </>
      )}
    </Field>
  );
}

const optionKey = <T,>(option: SelectOption<T>, index: number) => `${String(option.value)}-${index}`;

const ANCHOR_WRAPPER: ViewStyle = { position: 'relative', width: '100%' };
const LIST_WRAPPER: ViewStyle = { flexShrink: 1 };

function OptionDivider() {
  const theme = useTheme();
  return <View style={{ height: 1, backgroundColor: theme.backgrounds.border }} />;
}

const SelectBase = factory<{ props: SelectProps; ref: SelectHandle }>(SelectInner, { displayName: 'Select' });

/**
 * A select-only combobox: a field that opens a listbox of options.
 *
 * Generic over the option value — `<Select options={[{ label: 'One', value: 1 }]} />`
 * infers `number`, so `onChange` receives `number | null`.
 */
export const Select = SelectBase as unknown as (<T>(
  props: SelectProps<T> & React.RefAttributes<SelectHandle>
) => React.ReactElement | null) &
  Pick<typeof SelectBase, 'displayName' | 'extend' | 'withProps'>;
