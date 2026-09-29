import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Ref } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import type { LayoutChangeEvent, NativeSyntheticEvent, TextInputKeyPressEventData, ViewStyle } from 'react-native';

import { Dialog } from '../Dialog';
import { Icon } from '../Icon/Icon';
import { Text } from '../Text/Text';
import { Highlight } from '../Highlight';
import { Block } from '../Block';
import { factory, withStatics } from '../../core/factory';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveSurface, surfaceInteractionTint } from '../../core/theme/surfaces';
import { resolveShadow } from '../../core/theme/tokens';
import { resolveAccentColor } from '../../core/theme/resolveColors';
import { useViewport } from '../../core/responsive';
import { webStyle } from '../../core/platform';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { useStyleProps } from '../../core/utils/spacing';
import { useKeyboardManagerOptional } from '../../core/providers/KeyboardManagerProvider';
import { useListNavigation } from '../../core/accessibility/useListNavigation';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { useA11yId } from '../../core/accessibility/useA11yId';
import { consumeEvent, readKey } from '../../core/accessibility/keyboard';
import type { KeyboardEventLike } from '../../core/accessibility/keyboard';
import { isDebugLogging, debugLog, devWarn } from '../../core/utils/logger';
import { useGlobalHotkeys } from '../../hooks/useHotkeys';
import { useOverlayMode } from '../../hooks/useOverlayMode';
import { useHover } from '../../hooks/useHover';
import { useSpotlightStore, setDefaultSpotlightStore } from './SpotlightStore';
import { filterActions, isAction } from './SpotlightTypes';
import type { SpotlightActionData, SpotlightItem } from './SpotlightTypes';
import type {
  SpotlightProps,
  SpotlightRootProps,
  SpotlightSearchProps,
  SpotlightActionsListProps,
  SpotlightActionProps,
  SpotlightActionsGroupProps,
  SpotlightEmptyProps,
  SpotlightFactoryPayload,
} from './types';

// Layout constants for precise height calculation
const SPOTLIGHT_DIALOG_HEIGHT = 400;
const SEARCH_PADDING_VERTICAL = 32; // 16px top + 16px bottom (paddingVertical: 16)
// Search input: lineHeight 30 + vertical padding 16 = 46 → 48 for consistency.
const SEARCH_INPUT_HEIGHT = 48;
const ACTIONS_LIST_BORDER = 1; // Border top width
const ACTIONS_LIST_PADDING_BOTTOM = 8;
// 400 - 32 - 48 - 1 - 8 = 311px: the list exactly fills the dialog.
const ACTIONS_LIST_MAX_HEIGHT =
  SPOTLIGHT_DIALOG_HEIGHT - SEARCH_PADDING_VERTICAL - SEARCH_INPUT_HEIGHT - ACTIONS_LIST_BORDER - ACTIONS_LIST_PADDING_BOTTOM;
const MAX_DESCRIPTION_LENGTH = 80;
const SCROLL_PADDING = 8;

const SpotlightRoot = forwardRef<View, SpotlightRootProps>(function SpotlightRoot(
  {
    children,
    opened = false,
    onClose,
    style,
    initialFocusRef,
    accessibilityLabel = 'Search',
    testID,
  },
  ref
) {
  const theme = useTheme();
  const { width: screenWidth } = useViewport();
  const { shouldUseModal } = useOverlayMode();
  const targetWidth = Math.min(560, Math.max(280, screenWidth - 32));
  // (Hotkey registration lives in Spotlight, which has the store.)
  const fullscreen = shouldUseModal;
  const surface = resolveSurface(theme, 3);

  const modalStyle = useMemo<ViewStyle>(() => ({
    ...resolveShadow(theme, 'lg'),
    backgroundColor: surface.background,
    borderColor: surface.border,
  }), [theme, surface.background, surface.border]);

  return (
    <Dialog
      ref={ref}
      opened={opened}
      onClose={onClose}
      variant={fullscreen ? 'fullscreen' : 'modal'}
      backdrop
      backdropClosable
      w={fullscreen ? undefined : targetWidth}
      title={null}
      accessibilityLabel={accessibilityLabel}
      autoFocus={initialFocusRef ?? false}
      testID={testID}
      style={[
        styles.spotlightModal,
        modalStyle,
        fullscreen
          ? [styles.fullscreen, webStyle({ position: 'fixed', top: 0, left: 0 })]
          : { height: SPOTLIGHT_DIALOG_HEIGHT, maxHeight: SPOTLIGHT_DIALOG_HEIGHT, width: targetWidth },
      ]}
    >
      <View style={[styles.spotlightContainer, fullscreen && styles.fill, style]}>
        {children}
      </View>
    </Dialog>
  );
});

function SpotlightSearch({
  value,
  onChangeText,
  startSection,
  placeholder = 'Search...',
  onNavigateUp,
  onNavigateDown,
  onSelectAction,
  onClose,
  autoFocus = true,
  inputRef: forwardedRef,
  withCloseButton,
  onKeyPress,
  onFocus,
  onBlur,
  ...props
}: SpotlightSearchProps) {
  const theme = useTheme();
  const inputRef = useRef<TextInput | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const { isMobileExperience } = useOverlayMode();
  // Mobile presents the spotlight fullscreen: there is no reachable backdrop and
  // no Escape key, so the search row carries the only way out.
  const showCloseButton = (withCloseButton ?? isMobileExperience) && !!onClose;
  let effectivePlaceholder = placeholder;
  if (isMobileExperience) {
    const verbosePattern = /components,\s*demos,\s*documentation/i;
    if (placeholder === 'Search...' || verbosePattern.test(placeholder) || placeholder.length > 32) {
      effectivePlaceholder = 'Search';
    }
  }

  const assignInputRef = useCallback((node: TextInput | null) => {
    inputRef.current = node;
    if (forwardedRef) {
      (forwardedRef as React.MutableRefObject<TextInput | null>).current = node;
    }
  }, [forwardedRef]);

  useEffect(() => {
    const node = inputRef.current;
    if (!node) return;
    if (autoFocus) node.focus();
    else node.blur?.();
  }, [autoFocus]);

  const handleKeyPress = (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    onKeyPress?.(event);
    const keyEvent = event as unknown as KeyboardEventLike;
    if (keyEvent.defaultPrevented) return;
    // Standalone use (a custom Spotlight.Root composition) wires these callbacks.
    const { key } = readKey(keyEvent);
    const handler = key === 'ArrowDown' ? onNavigateDown
      : key === 'ArrowUp' ? onNavigateUp
        : key === 'Enter' ? onSelectAction
          : key === 'Escape' ? onClose
            : undefined;
    if (!handler) return;
    consumeEvent(keyEvent);
    handler();
  };

  return (
    <View
      style={[
        styles.searchContainer,
        { borderColor: theme.backgrounds.border },
        isFocused && theme.states?.focusRing
          ? { borderColor: theme.states.focusRing, borderWidth: 2, margin: -1 }
          : null,
      ]}
    >
      <View style={styles.searchInputWrapper}>
        {startSection || <Icon name="search" size="md" color={theme.text.secondary} />}
        <TextInput
          ref={assignInputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={effectivePlaceholder}
          placeholderTextColor={theme.text.muted}
          style={[styles.searchInput, { color: theme.text.primary }]}
          // The row draws the focus ring; the raw input outline is suppressed.
          dataSet={{ pbInput: 'true' }}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          onKeyPress={handleKeyPress}
          {...props}
        />
        {showCloseButton && (
          <Pressable
            onPress={() => {
              inputRef.current?.blur?.();
              Keyboard.dismiss();
              onClose?.();
            }}
            role="button"
            aria-label="Close search"
            hitSlop={12}
            style={styles.searchCloseButton}
          >
            <Icon name="x" size="md" color={theme.text.secondary} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function SpotlightActionsList({
  children,
  maxHeight,
  style,
  scrollRef,
  onScrollChange,
  id,
}: SpotlightActionsListProps) {
  const theme = useTheme();
  const calculatedMaxHeight = maxHeight || ACTIONS_LIST_MAX_HEIGHT;

  if (isDebugLogging) {
    debugLog('Spotlight list height:', { calculatedMaxHeight, providedMaxHeight: maxHeight });
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.actionsList, { borderTopColor: theme.backgrounds.border }, style, { maxHeight: calculatedMaxHeight }]}
      showsVerticalScrollIndicator
      onScroll={onScrollChange ? (e) => onScrollChange(e.nativeEvent.contentOffset.y) : undefined}
      scrollEventThrottle={16}
      // role="listbox" (native: a list) — what the search field's aria-controls names.
      {...(id ? a11yProps({ role: 'listbox', id }) : null)}
    >
      {children}
    </ScrollView>
  );
}

function SpotlightAction({
  label,
  description,
  startSection,
  endSection,
  onPress,
  disabled = false,
  selected = false,
  children,
  style,
  testID,
  innerRef,
  onLayout,
  highlightQuery,
  optionProps,
}: SpotlightActionProps) {
  const theme = useTheme();
  const [isHovered, hoverHandlers] = useHover();
  const truncatedDescription = useMemo(() => {
    if (!description) return undefined;
    return description.length > MAX_DESCRIPTION_LENGTH
      ? description.slice(0, MAX_DESCRIPTION_LENGTH - 1).trimEnd() + '…'
      : description;
  }, [description]);

  // Match AutoComplete's highlighted-text treatment: link-colored bold text on a
  // transparent background (rather than the default highlight fill).
  const highlightColor = theme.text.link ?? resolveAccentColor(theme, 'primary');
  const labelHighlightProps = useMemo(() => ({
    color: highlightColor,
    style: [styles.actionLabel, styles.highlightText],
  }), [highlightColor]);
  const descriptionHighlightProps = useMemo(() => ({
    color: highlightColor,
    style: [styles.actionDescription, styles.highlightText],
  }), [highlightColor]);

  const selectedStyle: ViewStyle = {
    backgroundColor: surfaceInteractionTint(theme, 'selected'),
    borderStartWidth: 3,
    borderStartColor: resolveAccentColor(theme, 'primary'),
    paddingStart: 13, // original inner gap 16 - the 3px border
  };

  return (
    <Pressable
      ref={innerRef}
      testID={testID}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      onLayout={onLayout}
      onHoverIn={hoverHandlers.onHoverIn}
      onHoverOut={hoverHandlers.onHoverOut}
      // Options are reached with the arrow keys from the search field.
      tabIndex={-1}
      {...optionProps}
      style={({ pressed }) => [
        styles.action,
        disabled && styles.disabled,
        selected && selectedStyle,
        !selected && pressed && { backgroundColor: surfaceInteractionTint(theme, 'pressed') },
        !selected && !pressed && isHovered && { backgroundColor: surfaceInteractionTint(theme, 'hover') },
        style,
      ]}
    >
      <Block direction="row" align="center" style={styles.actionContent}>
        {startSection && <View style={styles.actionStartSection}>{startSection}</View>}
        <Block direction="column" style={styles.fill}>
          <Highlight highlight={highlightQuery} style={styles.actionLabel} highlightProps={labelHighlightProps}>
            {label}
          </Highlight>
          {truncatedDescription ? (
            <Highlight highlight={highlightQuery} style={styles.actionDescription} highlightProps={descriptionHighlightProps}>
              {truncatedDescription}
            </Highlight>
          ) : null}
          {children}
        </Block>
        {endSection ? <View style={styles.actionEndSection}>{endSection}</View> : null}
      </Block>
    </Pressable>
  );
}

function SpotlightActionsGroup({ label, children, style, labelProps }: SpotlightActionsGroupProps) {
  const theme = useTheme();

  return (
    <View style={[styles.actionsGroup, style]} role="group" aria-label={label}>
      <View
        style={[
          styles.groupHeader,
          {
            // A band on the spotlight surface, not a surface of its own.
            backgroundColor: surfaceInteractionTint(theme, 'band'),
            borderBottomColor: theme.backgrounds.border,
          },
        ]}
      >
        <Text {...mergeSlotProps({ textRole: 'sectionLabel', 'aria-hidden': true }, labelProps)}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

function SpotlightEmpty({ children, style }: SpotlightEmptyProps) {
  const theme = useTheme();

  return (
    <View style={[styles.empty, style]}>
      <Text size="md" c={theme.text.secondary} style={styles.emptyText} role="status">
        {children}
      </Text>
    </View>
  );
}

function renderIcon(icon: SpotlightActionData['icon'], color?: string) {
  return typeof icon === 'string' ? <Icon name={icon} size="md" color={color} /> : icon;
}

// Main Spotlight component
function SpotlightBase(
  {
    actions,
    nothingFound = 'Nothing found...',
    highlightQuery = true,
    limit,
    scrollable = false,
    maxHeight,
    shortcut = ['cmd+k', 'ctrl+k'],
    searchProps,
    groupLabelProps,
    store,
    accessibilityLabel,
    style,
    testID,
    ...spacingProps
  }: SpotlightProps,
  ref: Ref<View>
) {
  const spotlightStore = useSpotlightStore();
  const spacingStyles = useStyleProps(spacingProps);

  // Set as default store if no custom store provided
  useEffect(() => {
    if (!store) setDefaultSpotlightStore(spotlightStore);
  }, [spotlightStore, store]);

  const currentStore = store || spotlightStore;
  const { opened, query, selectedIndex } = currentStore.state;
  const { close: closeStore, toggle: toggleStore, setQuery, setSelectedIndex } = currentStore;

  // Global hotkey (Cmd/Ctrl+K) to toggle the spotlight.
  const normalized = useMemo(() => (Array.isArray(shortcut) ? shortcut : shortcut ? [shortcut] : []), [shortcut]);
  const shouldHandleToggleHotkey = useMemo(
    () => normalized.some((sc) => ['cmd+k', 'ctrl+k', 'mod+k'].includes(sc.toLowerCase())),
    [normalized]
  );
  const handleToggleHotkey = useCallback((event: KeyboardEvent) => {
    if (!shouldHandleToggleHotkey) return;
    event.preventDefault?.();
    toggleStore();
  }, [shouldHandleToggleHotkey, toggleStore]);
  useGlobalHotkeys('spotlight-toggle', ['mod+k', handleToggleHotkey]);

  const filteredActions = useMemo(() => filterActions(actions, query, limit), [actions, query, limit]);

  const highlightValue = useMemo(() => {
    if (!highlightQuery) return undefined;
    if (highlightQuery !== true) return highlightQuery;
    const parts = query.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return undefined;
    return parts.length === 1 ? parts[0] : parts;
  }, [highlightQuery, query]);

  // Flatten all actions for keyboard navigation
  const flatActions = useMemo(() => {
    const flat: SpotlightActionData[] = [];
    filteredActions.forEach((item: SpotlightItem) => {
      if (isAction(item)) flat.push(item);
      else flat.push(...item.actions);
    });
    return flat;
  }, [filteredActions]);

  const searchInputRef = useRef<TextInput | null>(null);
  const keyboardManager = useKeyboardManagerOptional();

  const dismissSearchInput = useCallback(() => {
    if (keyboardManager) keyboardManager.dismissKeyboard();
    else Keyboard.dismiss();
    searchInputRef.current?.blur?.();
  }, [keyboardManager]);

  const {
    autoFocus: providedAutoFocus,
    inputRef: providedInputRef,
    onKeyPress: userKeyPress,
    ...restSearchProps
  } = searchProps ?? {};
  const mergedAutoFocus = providedAutoFocus ?? opened;
  const mergedInputRef = providedInputRef ?? searchInputRef;

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query, setSelectedIndex]);

  const runAction = useCallback((action: SpotlightActionData | undefined) => {
    if (!action || action.disabled) return;
    dismissSearchInput();
    action.onPress?.();
    closeStore();
  }, [dismissSearchInput, closeStore]);

  // Combobox: real focus stays in the search field; the highlighted option is
  // announced through aria-activedescendant.
  const listId = useA11yId(undefined, 'spotlight-list');
  const getOptionId = useCallback((index: number) => `${listId}-option-${index}`, [listId]);
  const isOptionDisabled = useCallback((index: number) => !!flatActions[index]?.disabled, [flatActions]);
  const navigation = useListNavigation({
    count: flatActions.length,
    activeIndex: selectedIndex,
    onActiveChange: setSelectedIndex,
    onSelect: (index) => runAction(flatActions[index]),
    getId: getOptionId,
    isDisabled: isOptionDisabled,
    listId,
    loop: true,
  });
  const { onKeyDown: _navKeyDown, ...searchA11yProps } = navigation.inputProps;
  void _navKeyDown;

  const handleSearchKeyPress = (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    userKeyPress?.(event);
    const keyEvent = event as unknown as KeyboardEventLike;
    if (keyEvent.defaultPrevented) return;
    if (navigation.handleKeyDown(keyEvent)) return;
    // Enter with nothing highlighted runs the first result.
    if (readKey(keyEvent).key === 'Enter' && flatActions.length > 0) {
      consumeEvent(keyEvent);
      runAction(flatActions.find((action) => !action.disabled));
    }
  };

  const handleClose = useCallback(() => {
    dismissSearchInput();
    closeStore();
  }, [dismissSearchInput, closeStore]);

  // Auto-scroll the highlighted option into view
  const listRef = useRef<ScrollView | null>(null);
  const itemLayouts = useRef<{ y: number; height: number }[]>([]);
  const scrollOffsetRef = useRef(0);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const ensureVisible = useCallback((attempt = 0) => {
    if (selectedIndex < 0) return;
    const layout = itemLayouts.current[selectedIndex];
    if (!layout || !listRef.current) {
      if (attempt < 6) requestAnimationFrame(() => ensureVisible(attempt + 1));
      return;
    }
    const viewportTop = scrollOffsetRef.current;
    const viewportBottom = viewportTop + ACTIONS_LIST_MAX_HEIGHT;
    let target: number | null = null;
    if (layout.y < viewportTop + SCROLL_PADDING) target = layout.y - SCROLL_PADDING;
    else if (layout.y + layout.height > viewportBottom - SCROLL_PADDING) {
      target = layout.y + layout.height - ACTIONS_LIST_MAX_HEIGHT + SCROLL_PADDING;
    }
    if (target !== null) {
      try {
        listRef.current.scrollTo({ y: Math.max(target, 0), animated: true });
      } catch {
        devWarn('Spotlight: scrollTo failed, ref may be invalid');
      }
    }
  }, [selectedIndex]);
  useEffect(() => {
    ensureVisible();
  }, [selectedIndex, layoutVersion, ensureVisible]);

  const captureLayout = (index: number) => (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    itemLayouts.current[index] = { y, height };
    setLayoutVersion((v) => v + 1);
  };

  const renderActionRow = (action: SpotlightActionData, index: number, iconColor?: string) => (
    <SpotlightAction
      key={action.id}
      label={action.label}
      description={action.description}
      selected={index === selectedIndex}
      onLayout={captureLayout(index)}
      highlightQuery={highlightValue}
      startSection={renderIcon(action.icon, iconColor)}
      onPress={() => runAction(action)}
      disabled={action.disabled}
      optionProps={navigation.getOptionProps(index)}
    >
      {action.component}
    </SpotlightAction>
  );

  const renderActions = () => {
    if (filteredActions.length === 0) {
      return <SpotlightEmpty>{nothingFound}</SpotlightEmpty>;
    }
    let flatIndex = 0; // global index across groups
    return filteredActions.map((item, index) => {
      if (isAction(item)) {
        return renderActionRow(item, flatIndex++, 'pink');
      }
      return (
        <SpotlightActionsGroup key={`group-${index}`} label={item.group} labelProps={groupLabelProps}>
          {item.actions.map((action) => renderActionRow(action, flatIndex++))}
        </SpotlightActionsGroup>
      );
    });
  };

  return (
    <SpotlightRoot
      ref={ref}
      query={query}
      onQueryChange={setQuery}
      opened={opened}
      onClose={closeStore}
      shortcut={shortcut}
      initialFocusRef={mergedAutoFocus ? mergedInputRef : undefined}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={[spacingStyles, style]}
    >
      <SpotlightSearch
        value={query}
        onChangeText={setQuery}
        onClose={handleClose}
        autoFocus={mergedAutoFocus}
        inputRef={mergedInputRef}
        {...searchA11yProps}
        onKeyPress={handleSearchKeyPress}
        {...restSearchProps}
      />
      <SpotlightActionsList
        scrollable={scrollable}
        maxHeight={maxHeight}
        scrollRef={listRef}
        onScrollChange={(y) => {
          scrollOffsetRef.current = y;
        }}
        id={listId}
      >
        {renderActions()}
      </SpotlightActionsList>
    </SpotlightRoot>
  );
}

const SpotlightComponent = factory<SpotlightFactoryPayload>(SpotlightBase, { displayName: 'Spotlight', memo: false });

/** Command palette (Cmd/Ctrl+K). Compound parts: Root, Search, ActionsList, Action, ActionsGroup, Empty. */
export const Spotlight = withStatics(SpotlightComponent, {
  Root: SpotlightRoot,
  Search: SpotlightSearch,
  ActionsList: SpotlightActionsList,
  Action: SpotlightAction,
  ActionsGroup: SpotlightActionsGroup,
  Empty: SpotlightEmpty,
});

const styles = StyleSheet.create({
  action: {
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 1,
    backgroundColor: 'transparent',
  },
  actionContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 48,
  },
  actionDescription: {
    fontSize: 13,
    lineHeight: 16,
    marginTop: 2,
    opacity: 0.8,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  highlightText: {
    backgroundColor: 'transparent',
    fontWeight: '700',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  actionStartSection: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    marginEnd: 4,
    width: 32,
  },
  actionEndSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: 8,
  },
  actionsGroup: {
    marginVertical: 4,
  },
  actionsList: {
    borderTopWidth: 1, // Separator between search and results
    flex: 1, // Take remaining space
  },
  disabled: {
    opacity: 0.5,
  },
  empty: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    opacity: 0.6,
    textAlign: 'center',
  },
  fill: {
    flex: 1,
  },
  fullscreen: {
    width: '100%',
    height: '100%',
    maxHeight: '100%',
    borderRadius: 0,
  },
  groupHeader: {
    borderBottomWidth: 1,
    marginBottom: 4,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  searchContainer: {
    borderWidth: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 16,
    // Fixed at top - no flex growth
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 8,
    marginBottom: 0,
    fontSize: 18,
    lineHeight: 30,
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  searchInputWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  searchCloseButton: {
    alignItems: 'center',
    // ≥44pt touch target without growing the row.
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
  },
  spotlightContainer: {
    height: SPOTLIGHT_DIALOG_HEIGHT, // Fixed height
    display: 'flex',
    flexDirection: 'column',
  },
  spotlightModal: {
    padding: 0,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
});

export default Spotlight;
