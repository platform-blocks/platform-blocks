import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import type { ViewProps } from 'react-native';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { useA11yId } from '../../core/accessibility/useA11yId';
import { useListNavigation } from '../../core/accessibility/useListNavigation';
import { factory, withStatics } from '../../core/factory';
import { useFloating } from '../../core/overlay/useFloating';
import { webProps } from '../../core/platform';
import { useTheme } from '../../core/theme/ThemeProvider';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState';
import { useOverlayMode } from '../../hooks/useOverlayMode';
import { DropdownSheet } from '../_internal/DropdownSheet/DropdownSheet';
import { OptionRow } from '../Select/OptionRow';
import { getDropdownSurfaceStyle } from '../Select/fieldControlStyles';
import { Text } from '../Text';
import type { ComboboxPopoverData, ComboboxPopoverFactoryPayload, ComboboxPopoverGroup, ComboboxPopoverItem, ComboboxPopoverOption, ComboboxPopoverParsedItem, ComboboxPopoverProps, ComboboxPopoverTargetProps } from './types';

type ContextValue = { opened: boolean; toggle: () => void; setReference: (node: unknown) => void; keyDown: (event: { key: string; preventDefault(): void; defaultPrevented?: boolean }) => void; listId: string; activeId?: string };
const Context = createContext<ContextValue | null>(null);
function isGroup<T extends ComboboxPopoverItem>(entry: string | T | ComboboxPopoverGroup<T>): entry is ComboboxPopoverGroup<T> { return typeof entry !== 'string' && 'group' in entry; }
function parse<T extends ComboboxPopoverItem>(data: ComboboxPopoverData<T>): ComboboxPopoverParsedItem<T>[] { return data.map((entry) => isGroup(entry) ? { group: entry.group, items: entry.items.map((item) => typeof item === 'string' ? { value: item, label: item } as ComboboxPopoverOption<T> : { ...item, label: item.label ?? item.value } as ComboboxPopoverOption<T>) } : typeof entry === 'string' ? { value: entry, label: entry } as ComboboxPopoverOption<T> : { ...entry, label: entry.label ?? entry.value } as ComboboxPopoverOption<T>); }
export const ComboboxPopoverTarget = factory<{ props: ComboboxPopoverTargetProps; ref: View }>((props, ref) => {
  const context = useContext(Context);
  const child = React.Children.only(props.children) as React.ReactElement<Record<string, unknown>>;
  const original = child.props;
  return React.cloneElement(child, { ...original, ref: (node: unknown) => { context?.setReference(node); if (typeof ref === 'function') ref(node as View); else if (ref) ref.current = node as View; }, onPress: (...args: unknown[]) => { (original.onPress as ((...args: unknown[]) => void) | undefined)?.(...args); context?.toggle(); }, ...a11yProps({ expanded: context?.opened, hasPopup: 'listbox', controls: context?.listId, activeDescendant: context?.activeId }), ...webProps({ onKeyDown: (event) => { (original.onKeyDown as ((e: typeof event) => void) | undefined)?.(event); if (!event.defaultPrevented) context?.keyDown(event); } }) });
}, { displayName: 'ComboboxPopover.Target' });
const Root = factory<ComboboxPopoverFactoryPayload>((all, ref) => {
  const { styleProps, otherProps: props } = extractStyleProps(all);
  const { children, data, multiple = false, value: valueProp, defaultValue, onChange, searchable = false, searchValue, defaultSearchValue, onSearchChange, searchPlaceholder = 'Search…', filter, limit = Infinity, nothingFoundMessage, withCheckIcon = true, checkIconPosition = 'start', withAlignedLabels = false, renderOption, maxDropdownHeight = 260, selectFirstOptionOnDropdownOpen = false, onOptionSubmit, dropdownOpened, defaultDropdownOpened, onDropdownOpen, onDropdownClose, position = 'bottom-start', offset = 6, dropdownWidth = 'target', strategy, size = 'sm', disabled, 'aria-label': label = 'Options', style, testID } = props;
  const spacing = useStyleProps(styleProps); const theme = useTheme(); const { shouldUseModal } = useOverlayMode();
  const [opened, setOpened] = useControllableState({ value: dropdownOpened, defaultValue: defaultDropdownOpened, finalValue: false, onChange: (next) => next ? onDropdownOpen?.() : onDropdownClose?.() });
  const [value, setValue] = useControllableState<string | string[] | null>({ value: valueProp, defaultValue, finalValue: multiple ? [] : null });
  const [query, setQuery] = useControllableState({ value: searchValue, defaultValue: defaultSearchValue, finalValue: '', onChange: onSearchChange });
  const [activeIndex, setActiveIndex] = useState(-1);
  const listId = useA11yId(undefined, 'plocks-combobox-list');
  const parsed = useMemo(() => parse(data), [data]);
  const filtered = useMemo(() => { const result = searchable ? filter ? filter({ options: parsed, search: query, limit }) : parsed.map((entry) => 'group' in entry ? { group: entry.group, items: entry.items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())) } : entry).filter((entry) => 'group' in entry ? entry.items.length > 0 : entry.label.toLowerCase().includes(query.toLowerCase())) : parsed; let left = limit; return result.map((entry) => { if (left <= 0) return null; if ('group' in entry) { const items = entry.items.slice(0, left); left -= items.length; return { group: entry.group, items }; } left--; return entry; }).filter((entry): entry is ComboboxPopoverParsedItem => entry != null); }, [parsed, searchable, filter, query, limit]);
  const options = useMemo(() => filtered.flatMap((entry) => 'group' in entry ? entry.items : [entry]), [filtered]);
  const close = useCallback(() => { setOpened(false); setQuery(''); }, [setOpened, setQuery]);
  const open = useCallback(() => { if (disabled) return; setOpened(true); setActiveIndex(selectFirstOptionOnDropdownOpen ? options.findIndex((item) => !item.disabled) : Math.max(0, options.findIndex((item) => !item.disabled && (Array.isArray(value) ? value.includes(item.value) : value === item.value)))); }, [disabled, setOpened, selectFirstOptionOnDropdownOpen, options, value]);
  const select = useCallback((index: number) => { const option = options[index]; if (!option || option.disabled) return; onOptionSubmit?.(option.value); if (multiple) { const previous = Array.isArray(value) ? value : []; const next = previous.includes(option.value) ? previous.filter((item) => item !== option.value) : [...previous, option.value]; setValue(next); (onChange as unknown as ((v: string[], o: ComboboxPopoverOption[]) => void) | undefined)?.(next, next.map((item) => options.find((entry) => entry.value === item)!).filter(Boolean)); } else { const next = value === option.value && (!('allowDeselect' in props) || props.allowDeselect !== false) ? null : option.value; setValue(next); (onChange as ((v: string | null, o: ComboboxPopoverOption | null) => void) | undefined)?.(next, next ? option : null); close(); } }, [options, onOptionSubmit, multiple, value, setValue, onChange, props, close]);
  const nav = useListNavigation({ count: options.length, activeIndex, onActiveChange: setActiveIndex, onSelect: select, getId: (i) => `${listId}-option-${i}`, isDisabled: (i) => !!options[i]?.disabled, opened, onOpen: open, onClose: close, listId, homeEndKeys: !searchable });
  const floating = useFloating({ opened: opened && !shouldUseModal, onDismiss: close, placement: position, offset, matchWidth: dropdownWidth === 'target', strategy, role: null, popupType: 'listbox', layer: 'dropdown', autoFocus: searchable, desiredHeight: maxDropdownHeight });
  const row = (option: ComboboxPopoverOption, index: number) => { const checked = Array.isArray(value) ? value.includes(option.value) : value === option.value; return <OptionRow key={option.value} optionProps={nav.getOptionProps(index)} label={renderOption ? renderOption({ option, checked }) : option.label} selected={checked} active={activeIndex === index} disabled={option.disabled} index={index} onSelect={select} onHover={setActiveIndex} size={size} reserveCheckSpace={withAlignedLabels} showCheckIcon={withCheckIcon} checkIconPosition={checkIconPosition} />; };
  let rowIndex = 0;
  const list = <ScrollView style={{ maxHeight: maxDropdownHeight }} keyboardShouldPersistTaps="handled"><View {...a11yProps({ role: 'listbox', id: listId, label })}>{filtered.map((entry) => 'group' in entry ? <View key={entry.group}><Text c="muted" size="xs" p="xs">{entry.group}</Text>{entry.items.map((item) => row(item, rowIndex++))}</View> : row(entry, rowIndex++))}{options.length === 0 && nothingFoundMessage != null && <Text p="sm">{nothingFoundMessage}</Text>}</View></ScrollView>;
  const search = searchable && <TextInput value={query} onChangeText={setQuery} placeholder={searchPlaceholder} aria-label={searchPlaceholder} onKeyPress={nav.handleKeyDown} style={{ padding: 10, color: theme.text.primary }} />;
  const content = <View {...floating.getFloatingProps({ style: [getDropdownSurfaceStyle(theme), typeof dropdownWidth === 'number' ? { width: dropdownWidth } : null] }) as ViewProps}>{search}{list}</View>;
  const targetContext = { opened, toggle: () => opened ? close() : open(), setReference: floating.refs.setReference, keyDown: (event: { key: string; preventDefault(): void; defaultPrevented?: boolean }) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (!opened) open(); else if (activeIndex >= 0) select(activeIndex); } else nav.handleKeyDown(event); }, listId, activeId: nav.activeId };
  return <Context.Provider value={targetContext}><View ref={ref} testID={testID} style={[spacing, style]}>{children}{!shouldUseModal && floating.renderFloating(content)}{shouldUseModal && <DropdownSheet opened={opened} onClose={close} title={label} accessibilityLabel={label} placement="center" withCloseButton>{search}{list}</DropdownSheet>}</View></Context.Provider>;
}, { displayName: 'ComboboxPopover' });
export const ComboboxPopover = withStatics(Root, { Target: ComboboxPopoverTarget });
