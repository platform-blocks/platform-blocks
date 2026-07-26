import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { View, TextInput, Modal, Pressable, ScrollView, FlatList, Platform, DimensionValue, Keyboard, InteractionManager, StyleSheet, Animated } from 'react-native';
import { Text } from '../Text';
import { Loader } from '../Loader';
import { ListGroup, ListGroupDivider } from '../ListGroup';
import { FieldHeader } from '../_internal/FieldHeader';
import { factory } from '../../core/factory';
import { useTheme } from '../../core/theme';
import { createInputStyles } from '../Input/styles';
import { createRadiusStyles } from '../../core/theme/radius';
import type { SizeValue } from '../../core/theme/types';
import { extractSpacingProps, getSpacingStyles } from '../../core/utils/spacing';
import { extractLayoutProps, getLayoutStyles } from '../../core/utils/layout';
import { mergeSlotProps } from '../../core/utils';
import { useOverlayApi } from '../../core/providers/OverlayProvider';
import { usePopoverPositioning } from '../../core/hooks/usePopoverPositioning';
import type { PlacementType } from '../../core/utils/positioning-enhanced';
import type { AutoCompleteProps, AutoCompleteOption } from './types';
import { MenuItemButton } from '../MenuItemButton';
import { Icon } from '../Icon';
import { Chip } from '../Chip';
import type { ChipProps } from '../Chip/types';
import { ClearButton } from '../../core/components/ClearButton';
import { getIconSize } from '../../core/theme/unified-sizing';
import { getFontSize } from '../../core/theme/sizes';
import { Highlight } from '../Highlight';
import { useKeyboardManagerOptional } from '../../core/providers/KeyboardManagerProvider';
import { handleSelectionComplete } from '../../core/keyboard/selection';
import { resolveOptionalModule } from '../../utils/optionalModule';
import { useOverlayMode, useDebouncedCallback } from '../../hooks';
import { useIsMobile } from '../../core/responsive';

/** Tallest the scrolling suggestion list is allowed to get. */
const SUGGESTIONS_MAX_HEIGHT = 250;

/** Padding and border the popover adds around that list. */
const SUGGESTIONS_CHROME_HEIGHT = 8;

type SimpleDebounced<F extends (...args: any[]) => void> = ((...args: Parameters<F>) => void) & {
  cancel: () => void;
  flush: () => void;
  pending?: () => boolean;
};

type DebounceFn = <F extends (...args: any[]) => void>(func: F, wait?: number) => SimpleDebounced<F>;

const createFallbackDebounce = (): DebounceFn => {
  return <F extends (...args: any[]) => void>(func: F, wait = 0) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let lastArgs: Parameters<F> | null = null;

    const invoke = () => {
      const args = lastArgs;
      timeout = null;
      lastArgs = null;
      if (args) {
        func(...args);
      }
    };

    const debounced = ((...args: Parameters<F>) => {
      lastArgs = args;

      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(invoke, wait);
    }) as SimpleDebounced<F>;

    debounced.cancel = () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastArgs = null;
    };

    debounced.flush = () => {
      if (timeout) {
        clearTimeout(timeout);
        invoke();
      }
    };

    debounced.pending = () => timeout != null;

    return debounced;
  };
};

const debounce = resolveOptionalModule<DebounceFn>('lodash.debounce', {
  devWarning: 'lodash.debounce not found, using basic debounce implementation',
}) ?? createFallbackDebounce();

const DEFAULT_FALLBACK_PLACEMENTS: PlacementType[] = ['top-start', 'top-end', 'top', 'bottom-start', 'bottom-end', 'bottom'];

type SuggestionRow =
  | { type: 'header'; key: string; label: string }
  | { type: 'item'; key: string; option: AutoCompleteOption; index: number };

// Selected-option checkmark that springs in / eases out, matching the Checkbox
// mark motion. The 16px slot is always reserved so toggling never shifts the
// row layout. The glyph stays mounted while animating out so "deselect"
// reverses the "select" motion instead of just vanishing.
const AnimatedCheck = React.memo(({ selected, color }: { selected: boolean; color: string }) => {
  const mark = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const [mounted, setMounted] = useState(selected);

  useEffect(() => {
    const native = Platform.OS !== 'web';
    if (selected) {
      setMounted(true);
      Animated.spring(mark, { toValue: 1, friction: 5, tension: 200, useNativeDriver: native }).start();
    } else {
      Animated.timing(mark, { toValue: 0, duration: 100, useNativeDriver: native }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [selected, mark]);

  return (
    <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
      {mounted && (
        <Animated.View
          style={{
            transform: [{ scale: mark.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.15] }) }],
            opacity: mark,
          }}
        >
          <Icon name="check" size={16} stroke={3} color={color} />
        </Animated.View>
      )}
    </View>
  );
});
AnimatedCheck.displayName = 'AutoCompleteAnimatedCheck';

// A single suggestion row. Keeps its own hover state so pointer hover paints the
// same `menuActiveBg` highlight the keyboard (arrow-key) navigation uses — the
// two are visually indistinguishable. Local state also keeps hover re-renders
// scoped to the row, avoiding churn on the portal/overlay content.
const SuggestionItem = React.memo(({
  item,
  isActive,
  isSelected,
  highlightQuery,
  menuHighlightColor,
  highlightTextColor,
  highlightBackgroundColor,
  menuActiveBg,
  baseTextColor,
  menuItemButtonStyle,
  suggestionItemStyle,
  size,
  labelFontSize,
  onSelect,
}: {
  item: AutoCompleteOption;
  isActive: boolean;
  isSelected: boolean;
  highlightQuery?: string;
  /** Tint for the selected-row check icon. Always theme-derived. */
  menuHighlightColor: string;
  /** Text color for the matched substring — `highlightColor` or the theme default. */
  highlightTextColor: string;
  highlightBackgroundColor: string;
  menuActiveBg: string;
  baseTextColor: string;
  menuItemButtonStyle: any;
  suggestionItemStyle: any;
  /** Row metrics (padding, height) follow the field's size. */
  size: SizeValue;
  /**
   * Resolved label size. The label is a `Highlight`, not MenuItemButton's own
   * `<Text>`, so it never saw the row's font size — pass the field's directly.
   */
  labelFontSize: number;
  onSelect: (item: AutoCompleteOption) => void;
}) => {
  const [hovered, setHovered] = useState(false);
  // Keyboard highlight or pointer hover both paint the active background.
  const highlighted = isActive || (hovered && !item.disabled);

  return (
    <MenuItemButton
      onPress={() => onSelect(item)}
      disabled={item.disabled}
      // `active` renders the keyboard-highlighted ("virtual focus") row. Its
      // background is overridden below to the neutral `secondary` tint rather
      // than the tone's default primary active color.
      active={isActive}
      tone="default"
      hoverTone="default"
      activeTone="default"
      textColor={baseTextColor}
      hoverTextColor={baseTextColor}
      activeTextColor={baseTextColor}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      startIcon={<AnimatedCheck selected={isSelected} color={menuHighlightColor} />}
      compact
      rounded={false}
      size={size}
      style={[menuItemButtonStyle, highlighted && { backgroundColor: menuActiveBg }, suggestionItemStyle]}
      {...(Platform.OS === 'web' ? {
        onMouseDown: (event: any) => {
          if (event?.preventDefault) {
            event.preventDefault();
          }
          if (event?.stopPropagation) {
            event.stopPropagation();
          }
        },
      } : {})}
    >
      <Highlight
        highlight={highlightQuery}
        size={labelFontSize}
        highlightProps={{
          color: item.disabled ? baseTextColor : highlightTextColor,
          style: {
            backgroundColor: item.disabled ? 'transparent' : highlightBackgroundColor,
            fontWeight: '700',
            paddingHorizontal: 0,
            paddingVertical: 0,
          },
        }}
      >
        {item.label}
      </Highlight>
    </MenuItemButton>
  );
});
SuggestionItem.displayName = 'AutoCompleteSuggestionItem';

const defaultFilter = (item: AutoCompleteOption, query: string): boolean => {
  return item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.value.toLowerCase().includes(query.toLowerCase());
};

export const AutoComplete = factory<{
  props: AutoCompleteProps;
  ref: View;
}>((props, ref) => {
  // Extract spacing and layout props but keep custom width props intact
  const { spacingProps, otherProps: propsAfterSpacing } = extractSpacingProps(props);
  const { layoutProps, otherProps } = extractLayoutProps(propsAfterSpacing);

  const {
    label,
    description,
    helperText,
    required = false,
    error,
    data = [],
    onSearch,
    minSearchLength = 2,
    searchDelay = 300,
    renderItem,
    renderValue,
    onSelect,
    allowCustomValue = false,
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
    value,
    onChangeText,
    placeholder,
    style,
    disabled,
    size = 'md',
    // Left undefined so `createRadiusStyles(…, 'input')` applies the shared input
    // radius token; hardcoding 'md' here silently pinned it.
    radius,
    multiSelect = false,
    selectedValues = [],
  renderSelectedValue,
  selectedValuesContainerStyle,
  selectedValueChipProps,
  refocusAfterSelect,
    freeSolo = false,
    displayProperty = 'value',
    // Use overlay mode helper for presentation defaults
    useModal: useModalOverride,
    usePortal: usePortalOverride,
    inputWidth,
    minWidth = Platform.OS === 'android' ? 240 : undefined,
    // Enhanced positioning props
    placement = 'bottom-start',
    flip = true,
    shift = false,
    boundary = 12,
    offset = 4,
    autoReposition = true,
    fallbackPlacements = DEFAULT_FALLBACK_PLACEMENTS,
    clearable,
    clearButtonLabel,
    onClear,
    labelProps,
    descriptionProps,
    placeholderTextColor,
    startSectionProps,
    endSectionProps,
    ...inputProps
  } = otherProps as any; // cast to allow new props (inputWidth, minWidth, usePortal, positioning props)

  const autoFocusProp = (inputProps as any)?.autoFocus as boolean | undefined;
  const restInputProps = useMemo(() => {
    if (!inputProps) {
      return {} as Record<string, any>;
    }

    const { autoFocus: _autoFocus, ...rest } = inputProps as Record<string, any>;
    return rest;
  }, [inputProps]);

  const { shouldUseModal, shouldUsePortal } = useOverlayMode({
    forceModal: useModalOverride,
    forceOverlay: usePortalOverride,
  });

  const useModal = shouldUseModal;
  const usePortal = shouldUsePortal;

  const baseTextInputProps = useMemo(() => ({
    ...restInputProps,
    autoFocus: useModal ? false : autoFocusProp,
  }), [restInputProps, useModal, autoFocusProp]);

  const modalTextInputProps = useMemo(() => ({
    ...restInputProps,
    autoFocus: autoFocusProp ?? true,
  }), [restInputProps, autoFocusProp]);

  const resolvedRefocusAfterSelect = useMemo(() => {
    if (useModal) {
      return false;
    }

    if (typeof refocusAfterSelect === 'boolean') {
      return refocusAfterSelect;
    }

    return usePortal;
  }, [refocusAfterSelect, useModal, usePortal]);

  const theme = useTheme();
  const isMobile = useIsMobile();
  const radiusStyles = useMemo(() => createRadiusStyles(radius, undefined, 'input'), [radius]);
  const inputStyleFactory = useMemo(() => createInputStyles(theme, false, isMobile), [theme, isMobile]);
  const { openOverlay, closeOverlay, updateOverlay } = useOverlayApi();
  const keyboardManager = useKeyboardManagerOptional();
  const [suggestions, setSuggestions] = useState<AutoCompleteOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(value || '');
  const [focused, setFocused] = useState(false);
  // The option chosen in single-select mode, kept so `renderValue` can paint a
  // rich representation of it inside the input. Cleared once the query text no
  // longer matches the option's display value (i.e. the user edited it).
  const [selectedOption, setSelectedOption] = useState<AutoCompleteOption | null>(null);
  // Index into `suggestionRows` of the keyboard-highlighted option (-1 = none).
  const [highlightedRow, setHighlightedRow] = useState(-1);
  const inputRef = useRef<TextInput>(null);
  const modalInputRef = useRef<TextInput>(null);
  const suggestionsRef = useRef<ScrollView>(null);
  // Shared across the portal/modal/inline lists — only one is mounted at a time.
  const listRef = useRef<FlatList<SuggestionRow>>(null);
  // Bridges for values used by `handleKeyPress` (declared above the list/nav
  // helpers) — kept current each render so the key handler stays stable.
  const suggestionRowsRef = useRef<SuggestionRow[]>([]);
  const highlightedRowRef = useRef(-1);
  const handleSelectSuggestionRef = useRef<((item: AutoCompleteOption) => void) | null>(null);
  const moveHighlightRef = useRef<((direction: 1 | -1) => void) | null>(null);
  const overlayIdRef = useRef<string | null>(null);
  const containerRef = useRef<View>(null);
  const prevPushedPositionRef = useRef<null | {
    x: number; y: number; w: number; h: number; mw?: number; mh?: number;
    /** Pinned edge and its offset, so a pin-only change still pushes an update. */
    pe?: 'top' | 'bottom'; po?: number;
  }>(null);

  const dismissKeyboardFn = keyboardManager?.dismissKeyboard;
  const dismissKeyboard = useCallback(() => {
    if (dismissKeyboardFn) {
      dismissKeyboardFn();
      return;
    }
    Keyboard.dismiss();
  }, [dismissKeyboardFn]);

  // Enhanced positioning system - only use when usePortal is true
  const {
    position,
    anchorRef,
    popoverRef,
    updatePosition,
  } = usePopoverPositioning(
    showSuggestions && usePortal && !useModal,
    {
      placement,
      flip,
      shift,
      boundary,
      offset,
      autoUpdate: autoReposition,
      fallbackPlacements,
      matchAnchorWidth: true,
      // Deliberately the popover's *maximum* height rather than its current
      // content height. The side is then chosen once, from a value that doesn't
      // change as the user types and the result list filters down — so the
      // popover can't decide to flip mid-keystroke. A short list simply doesn't
      // fill the reserved space; because the popover is edge-pinned it doesn't
      // move either.
      desiredHeight: SUGGESTIONS_MAX_HEIGHT + SUGGESTIONS_CHROME_HEIGHT,
    }
  );

  // Guard: remember last popover size to avoid re-triggering updatePosition on position-only changes
  const lastPopoverSizeRef = useRef<{ w: number; h: number } | null>(null);
  const [inputHeight, setInputHeight] = useState(0);
  const [measuredWidth, setMeasuredWidth] = useState<number | undefined>(
    Platform.OS === 'web' ? undefined : 300 // Default fallback for mobile
  );
  const showClearButton = useMemo(() => {
    if (!clearable || disabled) return false;
    // In multi-select the field can be "dirty" via chips even with an empty
    // query, so allow clearing when either the text or a selection is present.
    if (multiSelect) return query.length > 0 || (selectedValues?.length ?? 0) > 0;
    return query.length > 0;
  }, [clearable, disabled, query, multiSelect, selectedValues]);

  // The right section always carries the dropdown chevron (and, while an async
  // search runs, a spinner), so the text should always reserve room for it.
  const hasRightSection = true;

  const inputStyles = useMemo(() => inputStyleFactory.getInputStyles({
    size: size as SizeValue,
    focused,
    error: !!error,
    disabled: !!disabled,
    hasLeftSection: false,
    hasRightSection,
  }, radiusStyles), [inputStyleFactory, size, focused, error, disabled, hasRightSection, radiusStyles]);

  // Suggestions read at the input's font size — the same scale
  // `createInputStyles` resolves — so the popover matches the field it belongs
  // to instead of sitting at a fixed `sm`. Group headers stay one step down.
  const fieldFontSize = getFontSize(size as SizeValue);
  const groupHeaderFontSize = Math.max(10, fieldFontSize - 2);

  // While the center-screen picker (modal) is open it owns focus, so the base
  // input behind the dimmed overlay should not render its focus ring.
  const modalPickerOpen = useModal && showSuggestions;
  const baseInputContainerStyle = useMemo(() => {
    if (!modalPickerOpen) return inputStyles.inputContainer;
    return inputStyleFactory.getInputStyles({
      size: size as SizeValue,
      focused: false,
      error: !!error,
      disabled: !!disabled,
      hasLeftSection: false,
      hasRightSection,
    }, radiusStyles).inputContainer;
  }, [modalPickerOpen, inputStyles.inputContainer, inputStyleFactory, size, error, disabled, hasRightSection, radiusStyles]);

  const clearLabel = clearButtonLabel || 'Clear input';

  const menuHighlightColor = useMemo(() => {
    const primaryPalette = theme.colors.primary || [];
    if (theme.colorScheme === 'dark') {
      return primaryPalette[5] || primaryPalette[4] || '#60A5FA';
    }
    return primaryPalette[6] || primaryPalette[5] || '#3B82F6';
  }, [theme.colors.primary, theme.colorScheme]);

  // The matched substring can be tinted independently of the check icon, so a
  // consumer can point `highlightColor` at e.g. `theme.colors.highlight` without
  // recoloring the selection affordance.
  const highlightTextColor = highlightColor ?? menuHighlightColor;

  // Background for the keyboard-highlighted row — a neutral `secondary` tint
  // (not the primary active color), mirroring the default tone's active shade
  // indices but on the secondary ramp.
  const menuActiveBg = useMemo(() => {
    const secondaryPalette = (theme.colors as any).secondary || [];
    if (theme.colorScheme === 'dark') {
      return secondaryPalette[3] || secondaryPalette[4] || 'rgba(255,255,255,0.08)';
    }
    return secondaryPalette[1] || secondaryPalette[0] || 'rgba(0,0,0,0.06)';
  }, [theme.colors, theme.colorScheme]);

  const selectedCount = selectedValues?.length ?? 0;
  const hasSelectedValues = multiSelect && selectedCount > 0;

  // Single-select rich value: paint `renderValue` over the text field while it
  // is unfocused. Focusing reveals the editable text so the query can change.
  const showValueOverlay = !multiSelect && !!renderValue && !!selectedOption && !focused;

  const currentQueryRef = useRef(query);
  const currentSelectedValuesRef = useRef(selectedValues);
  const suppressNextFocusOpenRef = useRef(false);

  currentQueryRef.current = query;
  currentSelectedValuesRef.current = selectedValues;

  /**
   * A layout pass no longer implies a reposition.
   *
   * This used to carry a whole compensation scheme: when the popover sat above
   * the input and its content shrank, it manually pushed the overlay's anchor
   * down by the height delta, then scheduled a re-measure on an 8ms/16ms timer.
   * All of that existed because a `top` placement was positioned by its *top*
   * edge (`anchorTop - popoverHeight - offset`), so every filtered keystroke
   * moved the popover and had to be chased.
   *
   * The popover is now pinned by the edge that touches the input, so its height
   * has no bearing on where it sits and there is nothing to compensate for. Only
   * a width change can still affect layout (cross-axis alignment), so that is
   * the only thing that triggers a refresh.
   */
  const handlePopoverLayout = useCallback((e: any) => {
    const { width, height } = e?.nativeEvent?.layout || {};
    if (!width || !height) return;

    const prev = lastPopoverSizeRef.current;
    const widthChanged = !prev || Math.abs(prev.w - width) > 0.5;
    lastPopoverSizeRef.current = { w: width, h: height };

    if (widthChanged) {
      updatePosition({ silent: true });
    }
  }, [updatePosition]);

  const spacingStyles = getSpacingStyles(spacingProps);
  const layoutStyles = getLayoutStyles(layoutProps);

  // Debounced search via the shared `useDebouncedCallback` hook. The wrapper's
  // identity is stable across renders, so it's safe to reference from useEffect
  // and from the input handlers below — we no longer need a `useMemo`.
  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    if (searchQuery.length < minSearchLength) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      let results: AutoCompleteOption[] = [];

      if (onSearch) {
        // Use async search
        results = await onSearch(searchQuery);
      } else {
        // Use local data filtering
        results = data.filter((item: AutoCompleteOption) => filter(item, searchQuery));
      }

      // Apply max suggestions limit
      if (maxSuggestions > 0) {
        results = results.slice(0, maxSuggestions);
      }

      setSuggestions(results);
    } catch (error) {
      console.error('AutoComplete search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, searchDelay);

  const handleClearInput = useCallback(() => {
    if (disabled) return;

    setQuery('');
    setSelectedOption(null);
    onChangeText?.('');
    onClear?.();

    inputRef.current?.clear?.();
    modalInputRef.current?.clear?.();

    debouncedSearch.cancel?.();

    if (showSuggestionsOnFocus && data.length > 0) {
      const initial = data.slice(0, maxSuggestions);
      setSuggestions(initial);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
  setShowSuggestions(false);
    }

    if (overlayIdRef.current) {
      closeOverlay(overlayIdRef.current);
      overlayIdRef.current = null;
    }

    requestAnimationFrame(() => {
      if (useModal) {
        modalInputRef.current?.focus?.();
        inputRef.current?.blur?.();
        return;
      }

      inputRef.current?.focus?.();
    });
  }, [disabled, onChangeText, onClear, debouncedSearch, showSuggestionsOnFocus, data, maxSuggestions, closeOverlay, useModal, showSuggestions]);

  // Handle text input changes
  const handleChangeText = useCallback((text: string) => {
    setQuery(text);
    onChangeText?.(text);

    // A single-select value overlay is only valid while the text still matches
    // the chosen option; once the user edits it, drop the stored option so the
    // rich overlay stops rendering.
    setSelectedOption((prev) => {
      if (!prev) return prev;
      const displayValue = displayProperty === 'label' ? prev.label : prev.value;
      return text === displayValue ? prev : null;
    });

    if (text.length >= minSearchLength) {
      debouncedSearch(text);
      setShowSuggestions(true);
    } else if (text.length === 0 && showSuggestionsOnFocus && data.length > 0) {
      // If input is cleared and showSuggestionsOnFocus is enabled, show all options
      setSuggestions(data.slice(0, maxSuggestions));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      // Keep suggestions visible if showSuggestionsOnFocus is true and we have data
      if (showSuggestionsOnFocus && data.length > 0) {
        setSuggestions(data.slice(0, maxSuggestions));
        setShowSuggestions(true);
      } else if (useModal) {
        // The modal picker opens on focus and shows its own "type N or more
        // characters" hint. Don't close it here on a sub-threshold keystroke —
        // doing so slams the just-opened modal shut on the first letter and
        // fires a blur/keyboard-dismiss that jumps the page scroll. Keep it open
        // so the hint stays visible. (In anchored/portal mode no menu is open at
        // this point, so closing below is a harmless no-op.)
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }
  }, [onChangeText, debouncedSearch, minSearchLength, showSuggestionsOnFocus, data, maxSuggestions, useModal, displayProperty]);

  const handleRemoveSelectedValue = useCallback((item: AutoCompleteOption) => {
    if (disabled) return;

    onSelect?.(item);

    requestAnimationFrame(() => {
      if (useModal) {
        modalInputRef.current?.focus?.();
        inputRef.current?.blur?.();
        return;
      }

      inputRef.current?.focus?.();
    });
  }, [disabled, onSelect, useModal, showSuggestions]);

  // Handle key press: list navigation, freeSolo commit, multi-select backspace.
  const handleKeyPress = useCallback((e: any) => {
    const key = e?.nativeEvent?.key;

    // Arrow-key navigation / Enter / Escape while the suggestion list is open.
    if (showSuggestions && suggestionRowsRef.current.length > 0) {
      if (key === 'ArrowDown') {
        e.preventDefault?.();
        moveHighlightRef.current?.(1);
        return;
      }
      if (key === 'ArrowUp') {
        e.preventDefault?.();
        moveHighlightRef.current?.(-1);
        return;
      }
      if (key === 'Escape') {
        e.preventDefault?.();
        setShowSuggestions(false);
        setHighlightedRow(-1);
        return;
      }
      if (key === 'Enter') {
        const idx = highlightedRowRef.current;
        const row = idx >= 0 ? suggestionRowsRef.current[idx] : undefined;
        if (row && row.type === 'item') {
          // A highlighted option takes precedence over freeSolo commit.
          e.preventDefault?.();
          handleSelectSuggestionRef.current?.(row.option);
          return;
        }
      }
    }

    if (multiSelect && query.length === 0 && key === 'Backspace') {
      const selectedItems = currentSelectedValuesRef.current;
      if (selectedItems && selectedItems.length > 0) {
        const lastItem = selectedItems[selectedItems.length - 1];
        if (lastItem) {
          handleRemoveSelectedValue(lastItem);
        }
      }
    }

    if (freeSolo && e.nativeEvent.key === 'Enter' && query.trim()) {
      // Prevent the default submit behavior. On RN Web a single-line input blurs
      // itself on Enter (and may submit a surrounding form) unless the event's
      // default is prevented — we want to keep focus so the user can immediately
      // type the next tag.
      e.preventDefault?.();

      // Create custom option from user input
      const customOption: AutoCompleteOption = {
        label: query.trim(),
        value: query.trim().toLowerCase().replace(/\s+/g, '-')
      };

      // Check if this option already exists
      const existsInData = data.some((item: AutoCompleteOption) =>
        item.value === customOption.value || item.label === customOption.label
      );

      if (!existsInData) {
        onSelect?.(customOption);
      }

      if (multiSelect) {
        // Commit the tag and clear the input so the user can type the next one.
        // Keep the picker/suggestions open so multiple tags can be added — the
        // user dismisses it by pressing outside (or the clear button).
        setQuery('');
        onChangeText?.('');
        setShowSuggestions(true);
        if (useModal) {
          requestAnimationFrame(() => {
            inputRef.current?.blur?.();
            modalInputRef.current?.focus?.();
          });
        } else {
          // Non-modal: keep the base input focused so the next tag can be typed
          // right away (guards against any focus loss from the re-render).
          requestAnimationFrame(() => inputRef.current?.focus?.());
        }
      } else {
        // Single-select: keep the submitted text in the field (clearing it here
        // would blank the value) and close the suggestions.
        setShowSuggestions(false);
      }
    }
  }, [freeSolo, query, data, onSelect, multiSelect, onChangeText, useModal, handleRemoveSelectedValue, showSuggestions]);

  // Populate + reveal the suggestion list (non-modal). Shared by focus and by
  // the tap-to-reopen handler so both behave identically.
  const openSuggestions = useCallback(() => {
    if (showSuggestionsOnFocus && data.length > 0 && (!query || query.length < minSearchLength)) {
      // Empty/short query → show all options (like a select dropdown). The list
      // renders the current selection(s) as checked automatically.
      setSuggestions(data.slice(0, maxSuggestions));
      setShowSuggestions(true);
      return;
    }
    if (query.length >= minSearchLength) {
      setShowSuggestions(true);
      debouncedSearch(query);
    }
  }, [showSuggestionsOnFocus, data, query, maxSuggestions, minSearchLength, debouncedSearch]);

  // Handle input focus
  const handleFocus = useCallback(() => {
    setFocused(true);
    // Show suggestions on focus if enabled and there's data available
    if (useModal) {
      setShowSuggestions(true);
      requestAnimationFrame(() => {
        inputRef.current?.blur?.();
        modalInputRef.current?.focus?.();
      });
      return;
    }

    if (suppressNextFocusOpenRef.current) {
      suppressNextFocusOpenRef.current = false;
      return;
    }

    openSuggestions();
  }, [openSuggestions, useModal, suppressNextFocusOpenRef]);

  // Tapping the input while the list is closed re-opens it (focus alone won't
  // fire again when the input already holds focus, e.g. after Escape or select).
  const handleInputPress = useCallback(() => {
    if (disabled || showSuggestions) return;
    // An explicit tap should open even if a prior selection armed the suppress.
    suppressNextFocusOpenRef.current = false;
    setFocused(true);

    if (useModal) {
      setShowSuggestions(true);
      requestAnimationFrame(() => {
        inputRef.current?.blur?.();
        modalInputRef.current?.focus?.();
      });
      return;
    }

    openSuggestions();
  }, [disabled, showSuggestions, useModal, openSuggestions, suppressNextFocusOpenRef]);

  // Handle input blur
  const handleBlur = useCallback(() => {
    if (!useModal) {
      setFocused(false);

      setTimeout(() => {
        setShowSuggestions(false);
        dismissKeyboard();
        if (overlayIdRef.current) {
          closeOverlay(overlayIdRef.current);
          overlayIdRef.current = null;
        }
      }, 150);
    }
  }, [closeOverlay, dismissKeyboard, useModal]);

  // Toggle the suggestions dropdown from the chevron affordance. Opening focuses
  // the input (which loads suggestions via handleFocus); closing blurs it.
  const handleToggleDropdown = useCallback(() => {
    if (disabled) return;
    if (showSuggestions) {
      setShowSuggestions(false);
      inputRef.current?.blur?.();
      modalInputRef.current?.blur?.();
      return;
    }
    if (useModal) {
      setShowSuggestions(true);
      requestAnimationFrame(() => modalInputRef.current?.focus?.());
      return;
    }
    // Open the list directly rather than relying on focus → handleFocus. A
    // non-editable (select-like) input won't fire focus on native, so opening
    // here keeps the chevron working; focusing an editable input is still a
    // useful no-op-if-already-open.
    setFocused(true);
    openSuggestions();
    inputRef.current?.focus?.();
  }, [disabled, showSuggestions, useModal, openSuggestions]);

  // Handle suggestion selection
  const handleSelectSuggestion = useCallback((item: AutoCompleteOption) => {
    if (multiSelect) {
      onSelect?.(item);

      // In modal (center-screen picker) mode, keep the picker open after a
      // selection so the user can add multiple tags. It stays open until they
      // press outside (which triggers the Modal's onPress/onRequestClose).
      if (useModal) {
        setShowSuggestions(true);
        setFocused(true);
        requestAnimationFrame(() => {
          inputRef.current?.blur?.();
          modalInputRef.current?.focus?.();
        });
        return;
      }

      const result = handleSelectionComplete({
        mode: 'multiple',
        preferRefocus: resolvedRefocusAfterSelect,
        useModal,
        keyboardManager,
        focusCallbacks: {
          focusPrimary: () => inputRef.current?.focus?.(),
          focusModal: () => modalInputRef.current?.focus?.(),
          blurPrimary: () => inputRef.current?.blur?.(),
          blurModal: () => modalInputRef.current?.blur?.(),
        },
        onRefocus: () => setFocused(true),
        onBlur: () => setFocused(false),
      });

      setShowSuggestions(result.refocused);
      return;
    }

    const displayValue = displayProperty === 'label' ? item.label : item.value;
    setQuery(displayValue);
    setSelectedOption(item);
    onChangeText?.(displayValue);
    onSelect?.(item);
    suppressNextFocusOpenRef.current = true;
    setShowSuggestions(false);

    const result = handleSelectionComplete({
      mode: 'single',
      preferRefocus: resolvedRefocusAfterSelect,
      useModal,
      keyboardManager,
      focusCallbacks: {
        focusPrimary: () => inputRef.current?.focus?.(),
        focusModal: () => modalInputRef.current?.focus?.(),
        blurPrimary: () => inputRef.current?.blur?.(),
        blurModal: () => modalInputRef.current?.blur?.(),
      },
      onRefocus: () => setFocused(true),
      onBlur: () => setFocused(false),
      interactionScheduler: (cb) => InteractionManager.runAfterInteractions(cb),
    });

    if (useModal) {
      setFocused(false);
      modalInputRef.current?.blur?.();
      inputRef.current?.blur?.();
      dismissKeyboard();
    }

    if (!result.refocused) {
      suppressNextFocusOpenRef.current = false;
    }
  }, [multiSelect, onSelect, resolvedRefocusAfterSelect, useModal, keyboardManager, displayProperty, onChangeText, dismissKeyboard, suppressNextFocusOpenRef]);

  // Default item renderer - use stable reference to prevent loops. Delegates to
  // `SuggestionItem`, which owns per-row hover state so pointer hover highlights
  // exactly like arrow-key navigation.
  const defaultRenderItem = useCallback((item: AutoCompleteOption, index: number, isSelected = false, isActive = false) => {
    const highlightQuery = highlightMatches ? currentQueryRef.current : undefined;
    const baseTextColor = item.disabled ? theme.text.disabled : theme.text.primary;

    return (
      <SuggestionItem
        item={item}
        isActive={isActive}
        isSelected={isSelected}
        highlightQuery={highlightQuery}
        menuHighlightColor={menuHighlightColor}
        highlightTextColor={highlightTextColor}
        highlightBackgroundColor={highlightBackgroundColor}
        menuActiveBg={menuActiveBg}
        baseTextColor={baseTextColor}
        menuItemButtonStyle={styles.menuItemButton}
        suggestionItemStyle={suggestionItemStyle}
        size={size as SizeValue}
        labelFontSize={fieldFontSize}
        onSelect={handleSelectSuggestion}
      />
    );
  }, [handleSelectSuggestion, highlightMatches, suggestionItemStyle, theme.text.disabled, theme.text.primary, menuHighlightColor, highlightTextColor, highlightBackgroundColor, menuActiveBg, size, fieldFontSize]);

  // Render item with enhanced parameters - use refs to prevent infinite loops
  const renderSuggestionItem = useCallback((item: AutoCompleteOption, index: number, isActive = false) => {
    // In multi-select the chosen options are tracked explicitly. In single-select
    // there's no stored option, so an item counts as selected when the current
    // input text equals its display value (value or label) — this marks the
    // active choice with a check, matching Select behavior.
    const currentText = currentQueryRef.current;
    const isSelected = multiSelect
      ? currentSelectedValuesRef.current.some((selected: AutoCompleteOption) => selected.value === item.value)
      : currentText.length > 0 && (currentText === item.value || currentText === item.label);

    if (renderItem) {
      return renderItem(item, index, {
        query: currentQueryRef.current,
        onSelect: handleSelectSuggestion,
        isHighlighted: isActive,
        isSelected,
      });
    }
    return defaultRenderItem(item, index, isSelected, isActive);
  }, [renderItem, handleSelectSuggestion, multiSelect, defaultRenderItem]);

  const styles = useMemo(() => {
    const surfaceColor = theme.backgrounds?.elevated ?? theme.backgrounds?.surface ?? (theme.colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF');

    return {
      container: {
        position: 'relative' as const,
        width: inputWidth != null ? (inputWidth as DimensionValue) : ('100%' as DimensionValue),
        // An explicit `inputWidth` outranks the shared desktop width floor from
        // `createInputStyles`, which would otherwise win over `width`.
        ...(minWidth ? { minWidth } : inputWidth != null ? { minWidth: 0 } : {}),
      },
      inputContainer: {
        // `center` in both modes: once chips wrap past the field's minHeight there
        // is no slack left to distribute, so this only matters for the short case —
        // where it keeps a single row of chips off the top edge.
        alignItems: 'center' as const,
        // No vertical padding override: multiSelect keeps the shared input padding
        // so an empty (or single-row) field is exactly as tall as a plain Input.
        // A `sm` chip is shorter than the field's content box, so the first chip
        // doesn't grow it either — height only changes when chips wrap to a new row.
        ...(Platform.OS === 'web' && {
          transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        }),
      },
      selectionArea: {
        flex: 1,
        flexDirection: 'row' as const,
        flexWrap: multiSelect ? 'wrap' as const : 'nowrap' as const,
        alignItems: 'center' as const,
        // Gaps rather than per-chip margins: spacing lands *between* chips and rows
        // only, so a single row adds no height of its own.
        ...(multiSelect ? { rowGap: 4, columnGap: 6 } : null),
      },
      // Spacing comes from the selectionArea gaps above; kept as a slot so
      // `selectedValueChipProps.style` still has something to merge onto.
      chip: {},
      input: {
        flexGrow: 1,
        flexShrink: 1,
        paddingRight: showClearButton ? 12 : 0,
        minWidth: multiSelect ? 80 : undefined,
      },
      suggestions: {
        position: 'absolute' as const,
        top: inputHeight,
        left: 0,
        width: measuredWidth || '100%',
        maxHeight: 300,
        backgroundColor: surfaceColor,
        borderRadius: (radiusStyles?.borderRadius ?? 12),
        marginTop: 4,
        overflow: 'hidden',
        minWidth: 260,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.backgrounds?.border ?? (theme.colorScheme === 'dark' ? '#2C2C2E' : '#E5E7EB'),
        ...(Platform.OS === 'ios' && {
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          elevation: 12,
        }),
        ...(Platform.OS === 'android' && {
          elevation: 12,
        }),
        ...(Platform.OS === 'web' && {
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)',
        }),
        ...suggestionsStyle,
        zIndex: 9999,
      },
      suggestionsList: {
        flex: 1,
      },
      suggestionItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.backgrounds?.border ?? (theme.colorScheme === 'dark' ? '#2C2C2E' : '#E5E7EB'),
      },
      menuItemButton: {
        borderRadius: 0,
        paddingHorizontal: 12,
      },
      groupHeader: {
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 4,
        backgroundColor: surfaceColor,
      },
      groupHeaderText: {
        textTransform: 'uppercase' as const,
        fontWeight: '600' as const,
        letterSpacing: 0.5,
      },
      suggestionContent: {
        flex: 1,
      },
      loadingContainer: {
        padding: 20,
        alignItems: 'center' as const,
      },
      emptyContainer: {
        padding: 20,
        alignItems: 'center' as const,
      },
    };
  }, [theme, inputWidth, minWidth, multiSelect, hasSelectedValues, showClearButton, inputHeight, measuredWidth, suggestionsStyle, radiusStyles]);

  // Flatten suggestions into rows, inserting a group header before each group
  // when any option carries a `group`. Groups preserve first-appearance order,
  // and items keep their order within each group.
  const suggestionRows = useMemo<SuggestionRow[]>(() => {
    const hasGroups = suggestions.some((option) => !!option.group);
    if (!hasGroups) {
      return suggestions.map((option, index) => ({
        type: 'item' as const,
        key: `${option.value}-${index}`,
        option,
        index,
      }));
    }

    const order: string[] = [];
    const byGroup = new Map<string, AutoCompleteOption[]>();
    suggestions.forEach((option) => {
      const group = option.group ?? '';
      if (!byGroup.has(group)) {
        byGroup.set(group, []);
        order.push(group);
      }
      byGroup.get(group)!.push(option);
    });

    const rows: SuggestionRow[] = [];
    let itemIndex = 0;
    order.forEach((group) => {
      if (group) {
        rows.push({ type: 'header', key: `group-${group}`, label: group });
      }
      byGroup.get(group)!.forEach((option) => {
        rows.push({
          type: 'item',
          key: `${option.value}-${itemIndex}`,
          option,
          index: itemIndex,
        });
        itemIndex += 1;
      });
    });
    return rows;
  }, [suggestions]);

  const renderSuggestionRow = useCallback((row: SuggestionRow, rowIndex: number) => {
    if (row.type === 'header') {
      return (
        <View style={styles.groupHeader}>
          <Text size={groupHeaderFontSize} colorVariant="secondary" style={styles.groupHeaderText}>
            {row.label}
          </Text>
        </View>
      );
    }
    return renderSuggestionItem(row.option, row.index, rowIndex === highlightedRow);
  }, [renderSuggestionItem, styles.groupHeader, styles.groupHeaderText, highlightedRow, groupHeaderFontSize]);

  const suggestionRowKeyExtractor = useCallback((row: SuggestionRow) => row.key, []);

  // Re-render rows when either the keyboard highlight or the input text changes.
  // The text is included because single-select "selected" state (the check mark)
  // is derived from it, so rows must refresh even when the suggestion array
  // reference is unchanged.
  const listExtraData = useMemo(() => `${highlightedRow}|${query}`, [highlightedRow, query]);

  // Row indices that keyboard navigation can land on — items only, skipping
  // group headers and disabled options.
  const navigableRowIndices = useMemo(
    () => suggestionRows.reduce<number[]>((acc, row, i) => {
      if (row.type === 'item' && !row.option.disabled) acc.push(i);
      return acc;
    }, []),
    [suggestionRows]
  );

  const moveHighlight = useCallback((direction: 1 | -1) => {
    setHighlightedRow((prev) => {
      const indices = navigableRowIndices;
      if (indices.length === 0) return -1;
      const pos = indices.indexOf(prev);
      if (pos === -1) {
        return direction === 1 ? indices[0] : indices[indices.length - 1];
      }
      const nextPos = (pos + direction + indices.length) % indices.length;
      return indices[nextPos];
    });
  }, [navigableRowIndices]);

  // Reset the highlight whenever the list content or open state changes so a
  // stale index can't point at the wrong (or a now-missing) row.
  useEffect(() => {
    setHighlightedRow(-1);
  }, [suggestions, showSuggestions]);

  // Keep the highlighted row scrolled into view.
  useEffect(() => {
    if (highlightedRow < 0) return;
    try {
      listRef.current?.scrollToIndex({ index: highlightedRow, viewPosition: 0.5, animated: true });
    } catch {
      // scrollToIndex can throw before the list has measured; ignore.
    }
  }, [highlightedRow]);

  // Keep the key-handler bridges pointing at the latest values.
  suggestionRowsRef.current = suggestionRows;
  highlightedRowRef.current = highlightedRow;
  handleSelectSuggestionRef.current = handleSelectSuggestion;
  moveHighlightRef.current = moveHighlight;

  // Divider between rows, except adjacent to a group header.
  const SuggestionSeparator = useCallback((separatorProps: any) => {
    if (separatorProps?.leadingItem?.type === 'header') return null;
    return <ListGroupDivider />;
  }, []);

  const renderSelectedValueItem = useCallback((item: AutoCompleteOption, index: number, source: 'input' | 'modal') => {
    const onRemove = () => handleRemoveSelectedValue(item);

    if (renderSelectedValue) {
      const node = renderSelectedValue(item, index, {
        onRemove,
        disabled: !!disabled,
        isFocused: focused,
        inputValue: query,
        source,
      });

      if (node == null) {
        return null;
      }

      return (
        <React.Fragment key={`${source}-${item.value}`}>
          {node}
        </React.Fragment>
      );
    }

    const {
      style: chipStyleOverride,
      onRemove: chipOnRemove,
      children: chipChildren,
      disabled: chipDisabledOverride,
      ...restChipProps
    } = selectedValueChipProps ?? {};

    const mergedChipStyle = chipStyleOverride
      ? { ...styles.chip, ...chipStyleOverride }
      : styles.chip;

    const chipDisabled = chipDisabledOverride ?? disabled;

    const handleChipRemove = () => {
      chipOnRemove?.();
      onRemove();
    };

    return (
      <Chip
        key={`${source}-${item.value}`}
        size="sm"
        variant="light"
        color="primary"
        {...restChipProps}
        disabled={chipDisabled}
        onRemove={handleChipRemove}
        style={mergedChipStyle}
      >
        {chipChildren ?? item.label}
      </Chip>
    );
  }, [handleRemoveSelectedValue, renderSelectedValue, disabled, focused, query, selectedValueChipProps, styles.chip]);



  // Create suggestion content that updates when data changes
  // Use a ref to prevent infinite loops by memoizing the render function separately
  const stableSuggestionStyles = useMemo(() => ({
    suggestions: [styles.suggestions, { position: 'relative' as const, top: 'auto' as const, left: 'auto' as const }],
    loadingContainer: styles.loadingContainer,
    emptyContainer: styles.emptyContainer,
    suggestionsList: styles.suggestionsList,
  }), [styles.suggestions, styles.loadingContainer, styles.emptyContainer, styles.suggestionsList]);

  const suggestionContent = useMemo(() => (
    <View style={stableSuggestionStyles.suggestions}>

      {/* Keep the existing results visible while a new query loads (the input's
          spinner signals the refetch); only fall back to the in-popover spinner
          on the very first load when there's nothing to show yet. */}
      {suggestions.length > 0 ? (
        <ListGroup variant="default" size={size as SizeValue}
          style={{ maxHeight: SUGGESTIONS_MAX_HEIGHT }}
        >
          {/* FlatList self-sizes to its content up to `maxHeight`, so the popover
              grows and shrinks with the number of matching results instead of
              always filling a fixed height. */}
          <FlatList
            ref={listRef}
            data={suggestionRows}
            extraData={listExtraData}
            keyboardShouldPersistTaps="always"
            renderItem={({ item, index }: { item: SuggestionRow; index: number }) => renderSuggestionRow(item, index)}
            keyExtractor={suggestionRowKeyExtractor}
            ItemSeparatorComponent={renderItem ? undefined : SuggestionSeparator}
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: SUGGESTIONS_MAX_HEIGHT }}
          />
        </ListGroup>
      ) : loading ? (
        <View style={stableSuggestionStyles.loadingContainer}>
          {renderLoadingState ? renderLoadingState() : (
            <>
              <Loader size="sm" />
              <Text size="sm" colorVariant="secondary" style={{ marginTop: 8 }}>
                Searching...
              </Text>
            </>
          )}
        </View>
      ) : query.length >= minSearchLength ? (
        <View style={stableSuggestionStyles.emptyContainer}>
          {renderEmptyState ? renderEmptyState() : (
            <Text size="sm" colorVariant="secondary">
              No suggestions found
            </Text>
          )}
        </View>
      ) : null}
    </View>
  ), [loading, suggestions, query, minSearchLength, renderLoadingState, renderEmptyState, renderItem, suggestionRows, highlightedRow, listExtraData, renderSuggestionRow, suggestionRowKeyExtractor, SuggestionSeparator, stableSuggestionStyles, size]);

  // Keep overlay content in sync with latest suggestions/loading states when using portal strategy
  // Use a ref to prevent infinite loops from content updates
  const lastContentUpdateRef = useRef<any>(null);
  useEffect(() => {
    if (overlayIdRef.current && usePortal && !useModal && suggestionContent !== lastContentUpdateRef.current) {
      lastContentUpdateRef.current = suggestionContent;
      updateOverlay(overlayIdRef.current, { content: suggestionContent });
    }
  }, [suggestionContent, usePortal, useModal, updateOverlay]);

  // Result-count and loading changes used to schedule a deferred reposition here,
  // because they changed the popover's height and a `top` placement was
  // positioned from its own height. The popover is edge-pinned now, so a content
  // change is purely a resize and needs no repositioning at all.

  // Track input width changes to update popover width
  const prevMeasuredWidthRef = useRef<number | undefined>(undefined);

  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (showSuggestions) {
      return;
    }

    const handle = InteractionManager.runAfterInteractions(() => {
      const dismiss = () => {
        modalInputRef.current?.blur?.();
        inputRef.current?.blur?.();
        dismissKeyboard();
      };

      if (useModal) {
        setTimeout(dismiss, 120);
      } else {
        dismiss();
      }
    });

    return () => handle.cancel();
  }, [showSuggestions, useModal, dismissKeyboard]);

  useEffect(() => {
    // If width changed, update the overlay width immediately
    if (overlayIdRef.current && usePortal && !useModal &&
      prevMeasuredWidthRef.current !== measuredWidth &&
      measuredWidth !== undefined) {

      prevMeasuredWidthRef.current = measuredWidth;

      // Update overlay width immediately for better UX
      updateOverlay(overlayIdRef.current, {
        width: measuredWidth,
      });
    }
  }, [measuredWidth, usePortal, useModal, updateOverlay]);

  // Handle overlay opening with enhanced positioning
  // Add a flag to prevent rapid overlay recreations
  const overlayCreationInProgressRef = useRef(false);

  useEffect(() => {
    // Wait for measured width to avoid initial positioning jumps
    if (showSuggestions && usePortal && !useModal && position && !overlayIdRef.current &&
      !overlayCreationInProgressRef.current && measuredWidth !== undefined) {
      overlayCreationInProgressRef.current = true;
      // Create suggestions content with popover ref for measurement and guard onLayout

      const enhancedSuggestionContent = (
        <View
          ref={popoverRef}
          onLayout={handlePopoverLayout}
          style={{
            backgroundColor: theme.colorScheme === 'dark' ? '#1C1C1E' : 'white',
            borderRadius: 12,
            overflow: 'hidden',
            // Set exact width to match input, with fallback to minWidth for safety
            width: measuredWidth || 260,
            maxHeight: position.maxHeight || 300,
            ...(Platform.OS === 'ios' && {
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
              elevation: 12,
            }),
            ...(Platform.OS === 'android' && {
              elevation: 12,
            }),
            ...(Platform.OS === 'web' && {
              boxShadow: '0 6px 28px rgba(0, 0, 0, 0.12)',
            }),
          }}
        >
          {suggestionContent}
          {/* Debug positioning info */}
          {__DEV__ && (position.flipped || position.shifted) && (
            <View style={{ padding: 4, borderTopWidth: 1, borderTopColor: '#eee' }}>
              {position.flipped && (
                <Text style={{ fontSize: 10, color: 'orange' }}>Flipped: {position.placement}</Text>
              )}
              {position.shifted && (
                <Text style={{ fontSize: 10, color: 'blue' }}>Shifted to stay in bounds</Text>
              )}
            </View>
          )}
        </View>
      );

      const overlayId = openOverlay({
        content: enhancedSuggestionContent,
        anchor: {
          x: position.x,
          y: position.y,
          width: position.finalWidth,
          height: position.finalHeight,
        },
        pinEdge: position.anchorEdge,
        pinOffset: position.anchorOffset,
        strategy: Platform.OS === 'web' ? 'fixed' : 'portal',
        closeOnClickOutside: true,
        closeOnEscape: true,
        // Use exact width from input measurement, with fallback for positioning system
        width: measuredWidth || 260,
        maxHeight: position.maxHeight,
        onClose: () => {
          overlayIdRef.current = null;
          overlayCreationInProgressRef.current = false;
          setShowSuggestions(false);
          lastPopoverSizeRef.current = null;
        }
      });

      overlayIdRef.current = overlayId;
      overlayCreationInProgressRef.current = false;
    }
  }, [showSuggestions, usePortal, useModal, position, suggestionContent, openOverlay, theme.colorScheme, popoverRef, handlePopoverLayout, measuredWidth]);

  // Handle overlay closing - close when showSuggestions becomes false
  useEffect(() => {
    if (!showSuggestions && overlayIdRef.current) {
      closeOverlay(overlayIdRef.current);
      overlayIdRef.current = null;
    }
  }, [showSuggestions, closeOverlay]);

  useEffect(() => {
    if (!useModal || showSuggestions) {
      return;
    }

    modalInputRef.current?.blur();
    inputRef.current?.blur();
    dismissKeyboard();
    setFocused(false);
  }, [useModal, showSuggestions, dismissKeyboard]);

  // Update overlay position when positioning changes (for real-time repositioning)
  // Deduplicate overlay updates: only push changes when something actually changed
  useEffect(() => {
    if (overlayIdRef.current && position && usePortal && !useModal) {
      const current = {
        x: position.x,
        y: position.y,
        w: position.finalWidth,
        h: position.finalHeight,
        mh: position.maxHeight,
        pe: position.anchorEdge,
        po: position.anchorOffset,
      };
      const prev = prevPushedPositionRef.current;
      const changed = !prev
        || Math.abs(prev.x - current.x) > 0.5
        || Math.abs(prev.y - current.y) > 0.5
        || Math.abs((prev.w || 0) - (current.w || 0)) > 0.5
        || Math.abs((prev.h || 0) - (current.h || 0)) > 0.5
        || prev.mh !== current.mh
        || prev.pe !== current.pe
        || Math.abs((prev.po ?? 0) - (current.po ?? 0)) > 0.5;

      if (changed) {
        prevPushedPositionRef.current = current;

        // Pushed synchronously. The 8ms debounce this replaces was guarding
        // against a feedback loop where repositioning changed the layout, which
        // triggered another reposition; the popover's position no longer depends
        // on its own size, so that loop can't form.
        updateOverlay(overlayIdRef.current, {
          anchor: {
            x: position.x,
            y: position.y,
            width: position.finalWidth,
            height: position.finalHeight,
          },
          pinEdge: position.anchorEdge,
          pinOffset: position.anchorOffset,
          width: measuredWidth || 260,
          maxHeight: position.maxHeight,
        });
      }
    }
  }, [position, updateOverlay, usePortal, useModal, measuredWidth]);

  // Sync internal query state with external value prop
  useEffect(() => {
    if (value !== undefined && value !== query) {
      setQuery(value);
    }
  }, [value]);

  // Show initial suggestions on focus if enabled
  useEffect(() => {
    if (showSuggestionsOnFocus && data.length > 0 && !query) {
      setSuggestions(data.slice(0, maxSuggestions));
    }
  }, [showSuggestionsOnFocus, data, maxSuggestions, query]);

  // Cleanup on unmount to prevent memory leaks and potential crashes
  useEffect(() => {
    return () => {
      // Clean up overlay reference
      if (overlayIdRef.current) {
        closeOverlay(overlayIdRef.current);
        overlayIdRef.current = null;
      }
      overlayCreationInProgressRef.current = false;
    };
  }, [closeOverlay]);

  return (
    <View
      ref={(node) => {
        if (ref && typeof ref === 'function') ref(node);
        else if (ref && 'current' in ref) ref.current = node;
        containerRef.current = node;
      }}
      style={[inputStyles.container, styles.container, spacingStyles, layoutStyles, style]}
    >
      <FieldHeader
        label={label}
        description={description}
        required={required}
        disabled={disabled}
        error={!!error}
        size={size as SizeValue}
        withAsterisk={required}
        labelProps={labelProps}
        descriptionProps={descriptionProps}
      />

      {/* Input Container */}
      <View
        ref={anchorRef}
        onLayout={(e) => {

          const { height, width } = e.nativeEvent.layout;
          if (height && height !== inputHeight) setInputHeight(height);
          if (width && width !== measuredWidth) setMeasuredWidth(width);
        }}
        style={[baseInputContainerStyle, styles.inputContainer]}
      >
        <View
          {...mergeSlotProps(
            { style: [styles.selectionArea, selectedValuesContainerStyle] },
            startSectionProps
          )}
        >
          {multiSelect && selectedValues.map((selected: AutoCompleteOption, index: number) =>
            renderSelectedValueItem(selected, index, 'input')
          )}
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            // Reopen on tap when already focused. RN Web forwards `onClick` on
            // TextInput (but not `onPressIn`); native uses `onPressIn`.
            {...(Platform.OS === 'web' ? { onClick: handleInputPress } : { onPressIn: handleInputPress })}
            // freeSolo keeps the placeholder as a live "type to add another" hint
            // even after chips exist; fixed-list multi-select hides it as clutter.
            placeholder={hasSelectedValues && !freeSolo ? '' : placeholder}
            placeholderTextColor={placeholderTextColor ?? theme.text.muted}
            // Hide the underlying text (but keep the field focusable) while the
            // rich value overlay covers it.
            style={[inputStyles.input, styles.input, showValueOverlay && { color: 'transparent' }]}
            editable={!disabled}
            // freeSolo commits on Enter and must retain focus for the next tag,
            // so opt out of the default blur-on-submit for that mode.
            blurOnSubmit={freeSolo ? false : undefined}
            {...baseTextInputProps}
          />
          {showValueOverlay && selectedOption && (
            <Pressable
              // Tap the overlay to edit: focus the field, which unmounts the
              // overlay and shows the underlying text.
              onPress={() => {
                if (disabled) return;
                setFocused(true);
                inputRef.current?.focus?.();
              }}
              style={[StyleSheet.absoluteFill, { justifyContent: 'center' }]}
              {...(Platform.OS === 'web' ? { onMouseDown: (e: any) => e?.preventDefault?.() } : {})}
            >
              {renderValue!(selectedOption, { focused, clear: handleClearInput })}
            </Pressable>
          )}
        </View>
        <View
          {...mergeSlotProps(
            { style: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 2 } },
            endSectionProps
          )}
        >
          {/* Optional clear button — only when `clearable` and the field is dirty. */}
          {showClearButton && (
            <ClearButton
              onPress={handleClearInput}
              size={size}
              accessibilityLabel={clearLabel}
              iconSize={getIconSize(size, 'large')}
              stroke={2.5}
            />
          )}
          {/* Dropdown indicator: spinner while an async search runs, otherwise a
              stacked up/down chevron (selector) that toggles the open state. */}
          {loading ? (
            <Loader size="sm" />
          ) : (
            <Pressable
              onPress={handleToggleDropdown}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={showSuggestions ? 'Collapse suggestions' : 'Expand suggestions'}
              hitSlop={6}
              {...(Platform.OS === 'web' ? { onMouseDown: (e: any) => e?.preventDefault?.() } : {})}
              style={{
                paddingHorizontal: 2,
                alignItems: 'center',
                justifyContent: 'center',
                ...(Platform.OS === 'web' ? { cursor: disabled ? 'not-allowed' : 'pointer' } as any : {}),
              }}
            >
              <Icon
                name="selector-vertical"
                size={24}
                stroke={2}
                color={disabled ? theme.text.disabled : theme.text.muted}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* Error & Helper Text */}
      {error ? (
        <Text style={inputStyles.error}>
          {error}
        </Text>
      ) : null}
      {!error && helperText ? (
        <Text style={inputStyles.helperText}>
          {helperText}
        </Text>
      ) : null}

      {showSuggestions && useModal ? (
        <Modal
          visible={showSuggestions}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setShowSuggestions(false);
            setFocused(false);
            InteractionManager.runAfterInteractions(() => {
              modalInputRef.current?.blur?.();
              inputRef.current?.blur?.();
              dismissKeyboard();
            });
          }}
          onDismiss={() => {
            InteractionManager.runAfterInteractions(() => {
              modalInputRef.current?.blur?.();
              inputRef.current?.blur?.();
              dismissKeyboard();
            });
          }}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 20,
            }}
            onPress={() => {
              setShowSuggestions(false);
              setFocused(false);
              InteractionManager.runAfterInteractions(() => {
                modalInputRef.current?.blur?.();
                inputRef.current?.blur?.();
                dismissKeyboard();
              });
            }}
          >
            <Pressable
              style={[styles.suggestions, {
                position: 'relative',
                top: 'auto',
                left: 'auto',
                right: 'auto',
                maxWidth: 400,
                width: '100%',
                height: 400, // Increased height to accommodate input
                paddingTop: 0,
              }]}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Input field in modal */}
              <View
                style={[inputStyles.inputContainer, styles.inputContainer, { marginBottom: 8 }]}
              >
                <View style={[styles.selectionArea, selectedValuesContainerStyle]}>
                  {multiSelect && selectedValues.map((selected: AutoCompleteOption, index: number) =>
                    renderSelectedValueItem(selected, index, 'modal')
                  )}
                  <TextInput
                    ref={modalInputRef}
                    value={query}
                    onChangeText={handleChangeText}
                    onKeyPress={handleKeyPress}
                    placeholder={hasSelectedValues && !freeSolo ? '' : placeholder}
                    placeholderTextColor={placeholderTextColor ?? theme.text.muted}
                    style={[inputStyles.input, styles.input]}
                    editable={!disabled}
                    {...modalTextInputProps}
                  />
                </View>
                {loading ? (
                  <Loader size="sm" />
                ) : showClearButton ? (
                  <ClearButton
                    onPress={handleClearInput}
                    size={size}
                    accessibilityLabel={clearLabel}
                    iconSize={getIconSize(size, 'large')}
                    stroke={2.5}
                  />
                ) : null}
              </View>

              {/* Suggestions content — keep the existing results visible while a
                  new query loads; the input's spinner signals the refetch. */}
              <View style={{ flex: 1 }}>
                {suggestions.length > 0 ? (
                  <FlatList
                    ref={listRef}
                    data={suggestionRows}
                    extraData={listExtraData}
                    keyboardShouldPersistTaps="always"
                    renderItem={({ item, index }: { item: SuggestionRow; index: number }) => renderSuggestionRow(item, index)}
                    keyExtractor={suggestionRowKeyExtractor}
                    ItemSeparatorComponent={renderItem ? undefined : SuggestionSeparator}
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                  />
                ) : loading ? (
                  <View style={styles.loadingContainer}>
                    {renderLoadingState ? renderLoadingState() : (
                      <>
                        <Loader size="sm" />
                        <Text size="sm" colorVariant="secondary" style={{ marginTop: 8 }}>
                          Searching...
                        </Text>
                      </>
                    )}
                  </View>
                ) : query.length >= minSearchLength ? (
                  <View style={styles.emptyContainer}>
                    {renderEmptyState ? renderEmptyState() : (
                      <Text size="sm" colorVariant="secondary">
                        No suggestions found
                      </Text>
                    )}
                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text size="sm" colorVariant="secondary">
                      Type {minSearchLength} or more characters to search
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      ) : showSuggestions && !usePortal ? (
        <Pressable
          style={[styles.suggestions, radiusStyles]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.suggestionContent}>
            {/* Keep existing results visible while a new query loads; the input's
                spinner signals the refetch. Fall back to the in-popover spinner
                only on the first load when there's nothing to show yet. */}
            {suggestions.length > 0 ? (
              <>
                <FlatList
                  ref={listRef}
                  data={suggestionRows}
                  extraData={listExtraData}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item, index }: { item: SuggestionRow; index: number }) => renderSuggestionRow(item, index)}
                  keyExtractor={suggestionRowKeyExtractor}
                  ItemSeparatorComponent={renderItem ? undefined : SuggestionSeparator}
                  showsVerticalScrollIndicator={false}
                  style={{ maxHeight: 300 }}
                  contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 20 : 0 }} // Add safe area padding
                />
              </>
            ) : loading ? (
              <View style={styles.loadingContainer}>
                {renderLoadingState ? renderLoadingState() : (
                  <>
                    <Loader size="sm" />
                    <Text size="sm" colorVariant="secondary" style={{ marginTop: 8 }}>
                      Searching...
                    </Text>
                  </>
                )}
              </View>
            ) : query.length >= minSearchLength ? (
              <View style={styles.emptyContainer}>
                {renderEmptyState ? renderEmptyState() : (
                  <Text size="sm" colorVariant="secondary">
                    No suggestions found
                  </Text>
                )}
              </View>
            ) : null}
          </View>
        </Pressable>
      ) : null}
    </View>
  );
});

AutoComplete.displayName = 'AutoComplete';
