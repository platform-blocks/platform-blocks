import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import type { LayoutChangeEvent, LayoutRectangle, TextStyle, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { a11yProps } from '../../core/accessibility/a11yProps';
import type { KeyboardEventLike } from '../../core/accessibility/keyboard';
import { getNodeText, useA11yId } from '../../core/accessibility/useA11yId';
import { useRovingFocus } from '../../core/accessibility/useRovingFocus';
import { factory } from '../../core/factory';
import { createThemedStyles } from '../../core/hooks/useThemedStyles';
import { useTransitionDuration } from '../../core/motion/useTransitionDuration';
import { webProps } from '../../core/platform';
import { resolveAccentColor, resolveColorProp } from '../../core/theme/resolveColors';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveFontSize, resolveRadius, resolveSpacing } from '../../core/theme/tokens';
import type { PlocksTheme, SizeValue } from '../../core/theme/types';
import { fastHash } from '../../core/utils/hash';
import { isDev, warnOnce } from '../../core/utils/logger';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState';
import { Flex } from '../Flex';
import { Sup, Text } from '../Text';

import type { TabItem, TabsProps } from './types';
import { useElementSize } from '../../hooks/useElementSize';

type TabsVariant = NonNullable<TabsProps['variant']>;
type TabsOrientation = NonNullable<TabsProps['orientation']>;
type TabsLocation = NonNullable<TabsProps['location']>;

/** Tabs keep a comfortable touch target regardless of `size`. */
const TAB_MIN_HEIGHT = 40;

/**
 * Slot color overrides name a `theme.text` role or a palette shade. Bare palette
 * names stay unresolved on purpose — the tint comes from `color`, so a bare name
 * here is more likely a mistake than a request for a particular shade.
 */
const resolveThemeColor = (theme: PlocksTheme, token?: string): string | undefined =>
  resolveColorProp(theme, token, { scopes: ['text'], shades: [] });

/**
 * The style table for one (theme, variant, size, color, orientation, location,
 * radius, …) combination — built once and cached per theme.
 *
 * Sides are logical (start/end): React Native and react-native-web flip them
 * under RTL, so nothing here reads the layout direction.
 */
const getTabStyles = createThemedStyles(
  (
    theme: PlocksTheme,
    variant: TabsVariant,
    size: SizeValue,
    color: string,
    orientation: TabsOrientation,
    location: TabsLocation,
    radius: number | undefined,
    contentCornerRadius: number | undefined,
    indicatorThicknessProp: number | undefined
  ) => {
    const fontSize = resolveFontSize(theme, size);
    const padding = resolveSpacing(theme, size);
    const paddingX = typeof padding === 'number' ? padding : 0;
    // Two resolutions rather than a palette array, so a raw CSS color works at
    // both sites: the indicator/chip fill takes the base shade, the active label
    // the readable one. A raw color has no ramp, so it comes back as itself for
    // both — which is what the caller asked for.
    const accentFill = resolveAccentColor(theme, color) ?? theme.colors.primary[5];
    const accentText = resolveColorProp(theme, color, { shades: [6, 5] }) ?? theme.colors.primary[6];
    const border = theme.backgrounds.border;
    const isVertical = orientation === 'vertical';
    const isEnd = location === 'end';
    const radiusStyle: ViewStyle | undefined = radius !== undefined ? { borderRadius: radius } : undefined;
    const indicatorThickness =
      indicatorThicknessProp !== undefined ? indicatorThicknessProp : isVertical ? 4 : isEnd ? 2 : 4;

    // The edge of the tab list that faces the content.
    const contentEdge: ViewStyle = isVertical
      ? isEnd
        ? { borderStartWidth: 1, borderStartColor: border }
        : { borderEndWidth: 1, borderEndColor: border }
      : isEnd
        ? { borderTopWidth: 1, borderTopColor: border }
        : { borderBottomWidth: 1, borderBottomColor: border };

    const baseTab: ViewStyle = {
      paddingHorizontal: paddingX,
      paddingVertical: paddingX * 0.75,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: isVertical ? 'flex-start' : 'center',
      minHeight: TAB_MIN_HEIGHT,
      ...(isVertical ? { minWidth: 120 } : null),
    };

    let tab: ViewStyle;
    let activeTab: ViewStyle = {};
    let container: ViewStyle = {};
    let indicator: ViewStyle | undefined;

    switch (variant) {
      case 'chip':
        tab = { ...baseTab, ...(radiusStyle ?? { borderRadius: 24 }), zIndex: 1 };
        container = { padding: 4, position: 'relative' };
        indicator = {
          position: 'absolute',
          backgroundColor: accentFill,
          borderRadius: 9999,
          top: 4,
          left: 4,
          // width/height & position animated
        };
        break;
      case 'card': {
        // The side facing the content is open; the other corners are rounded.
        const cardSides: ViewStyle = isVertical
          ? isEnd
            ? { borderStartWidth: 0, ...(radiusStyle ?? { borderTopEndRadius: 8, borderBottomEndRadius: 8 }) }
            : { borderEndWidth: 0, ...(radiusStyle ?? { borderTopStartRadius: 8, borderBottomStartRadius: 8 }) }
          : isEnd
            ? { borderTopWidth: 0, ...(radiusStyle ?? { borderBottomStartRadius: 8, borderBottomEndRadius: 8 }) }
            : { borderBottomWidth: 0, ...(radiusStyle ?? { borderTopStartRadius: 8, borderTopEndRadius: 8 }) };
        tab = { ...baseTab, backgroundColor: 'transparent', borderWidth: 1, borderColor: border, ...cardSides };
        // The active tab merges into the content: its content-facing edge takes
        // the surface color, hiding the list's divider line.
        const surface = theme.backgrounds.surface;
        activeTab = {
          backgroundColor: surface,
          ...(isVertical
            ? isEnd
              ? { borderStartWidth: 1, borderStartColor: surface }
              : { borderEndWidth: 1, borderEndColor: surface }
            : isEnd
              ? { borderTopWidth: 1, borderTopColor: surface }
              : { borderBottomWidth: 1, borderBottomColor: surface }),
        };
        container = { backgroundColor: theme.backgrounds.subtle, ...contentEdge };
        break;
      }
      case 'folder': {
        const folderSides: ViewStyle = isVertical
          ? isEnd
            ? { borderStartWidth: 0, marginBottom: 2, ...(radiusStyle ?? { borderTopEndRadius: 12, borderBottomEndRadius: 12 }) }
            : { borderEndWidth: 0, marginBottom: 2, ...(radiusStyle ?? { borderTopStartRadius: 12, borderBottomStartRadius: 12 }) }
          : isEnd
            ? { borderTopWidth: 0, marginEnd: 2, ...(radiusStyle ?? { borderBottomStartRadius: 12, borderBottomEndRadius: 12 }) }
            : { borderBottomWidth: 0, marginEnd: 2, ...(radiusStyle ?? { borderTopStartRadius: 12, borderTopEndRadius: 12 }) };
        tab = {
          ...baseTab,
          backgroundColor: theme.backgrounds.subtle,
          borderColor: border,
          position: 'relative',
          ...folderSides,
        };
        activeTab = {
          backgroundColor: theme.backgrounds.surface,
          zIndex: 1,
          ...(isVertical ? (isEnd ? { marginEnd: -2 } : { marginStart: -2 }) : isEnd ? { marginBottom: -2 } : { marginTop: -2 }),
        };
        container = isVertical
          ? isEnd
            ? { paddingEnd: 4 }
            : { paddingStart: 4 }
          : isEnd
            ? { paddingBottom: 4 }
            : { paddingTop: 4 };
        break;
      }
      case 'line':
      default:
        tab = { ...baseTab, backgroundColor: 'transparent' };
        container = { backgroundColor: theme.backgrounds.subtle, ...contentEdge };
        indicator = {
          position: 'absolute',
          backgroundColor: accentFill,
          // Centered on the divider line: shifted out by half its thickness.
          ...(isVertical
            ? { width: indicatorThickness, ...(isEnd ? { start: -indicatorThickness / 2 } : { end: -indicatorThickness / 2 }) }
            : { height: indicatorThickness, ...(isEnd ? { top: -indicatorThickness / 2 } : { bottom: -indicatorThickness / 2 }) }),
        };
        break;
    }

    const corner = contentCornerRadius ?? 8;
    const folderCorner = variant === 'folder' ? 8 : undefined;
    const content: ViewStyle = {
      flex: 1,
      padding: resolveSpacing(theme, 'md'),
      ...(isVertical
        ? isEnd
          ? { borderTopStartRadius: corner, borderBottomStartRadius: corner, borderTopEndRadius: folderCorner }
          : { borderTopEndRadius: corner, borderBottomEndRadius: corner, borderTopStartRadius: folderCorner }
        : isEnd
          ? { borderTopStartRadius: corner, borderTopEndRadius: corner, borderBottomStartRadius: folderCorner }
          : { borderBottomStartRadius: corner, borderBottomEndRadius: corner, borderTopEndRadius: folderCorner }),
    };

    return {
      container: {
        flexDirection: isVertical ? 'row' : 'column',
        alignItems: 'stretch',
      } as ViewStyle,
      tabsHeader: {
        flexDirection: isVertical ? 'column' : 'row',
        ...(isVertical ? { minWidth: 120 } : null),
        position: 'relative',
        ...container,
      } as ViewStyle,
      tabsHeaderScroll: { flexGrow: 0, flexShrink: 0 } as ViewStyle,
      tab,
      activeTab,
      indicator,
      tabText: {
        fontSize,
        color: theme.text.primary,
        // Counter-skew the text for folder tabs
        ...(variant === 'folder' ? { transform: [{ skewX: '10deg' }] } : null),
      } as TextStyle,
      activeTabText: {
        color: variant === 'chip' ? theme.text.onPrimary : accentText,
        ...(variant === 'folder' ? { transform: [{ skewX: '8deg' }] } : null),
      } as TextStyle,
      disabledTab: { opacity: 0.5 } as ViewStyle,
      icon: { marginEnd: isVertical ? 8 : 4 } as ViewStyle,
      iconNavigation: { marginEnd: 4 } as ViewStyle,
      content,
    };
  }
);

/**
 * A tab list with an animated indicator and an optional content panel.
 *
 * Implements the WAI-ARIA tabs pattern: `tablist` / `tab` / `tabpanel` roles,
 * `aria-selected`, `aria-controls` / `aria-labelledby` wiring, one tab stop with
 * arrow-key (RTL-aware) / Home / End navigation. By default a tab activates as
 * soon as it receives focus; `activationMode="manual"` waits for Enter/Space.
 */
export const Tabs = factory<{ props: TabsProps; ref: View }>((props, ref) => {
  const {
    items,
    value,
    defaultValue,
    onChange,
    activationMode = 'automatic',
    variant = 'line',
    size = 'sm',
    color = 'primary',
    orientation = 'horizontal',
    location = 'start',
    scrollable = false,
    animated = true,
    animationDuration = 250,
    transitionDuration,
    style,
    tabStyle,
    contentStyle,
    textStyle,
    labelProps,
    radius,
    tabCornerRadius,
    contentCornerRadius,
    indicatorThickness,
    tabGap,
    activeTabBackgroundColor,
    inactiveTabBackgroundColor,
    activeTabTextColor,
    navigationOnly = false,
    children,
    disabledKeys,
    onDisabledTabPress,
    persistKey,
    autoPersist: autoPersistProp,
    testID,
    ...rest
  } = props;

  const { styleProps } = extractStyleProps(rest);
  const spacingStyles = useStyleProps(styleProps);

  const theme = useTheme();
  const resolvedRadius = radius !== undefined ? resolveRadius(theme, radius) : undefined;
  const isVertical = orientation === 'vertical';
  const baseId = useA11yId(undefined, 'plocks-tabs');
  const panelId = `${baseId}-panel`;
  const tabId = (index: number) => `${baseId}-tab-${index}`;

  // ---------- Persistence (mirrors Accordion approach) ----------
  const autoPersist = autoPersistProp !== false; // default true
  // Lazy init global store
  const persistStoreRef = useRef<Map<string, string> | undefined>(undefined);
  if (!persistStoreRef.current) {
    const globalWithStore = globalThis as typeof globalThis & {
      __PLOCKS_TABS_PERSIST__?: Map<string, string>;
    };
    if (!globalWithStore.__PLOCKS_TABS_PERSIST__) {
      globalWithStore.__PLOCKS_TABS_PERSIST__ = new Map<string, string>();
    }
    persistStoreRef.current = globalWithStore.__PLOCKS_TABS_PERSIST__;
  }
  // Auto key only when uncontrolled + autoPersist
  const autoKeyRef = useRef<string | null>(null);
  if (autoKeyRef.current === null && !persistKey && autoPersist && value === undefined) {
    const sig = items.map((i) => i.key).join('|') + '|' + variant + '|' + orientation + '|' + location;
    autoKeyRef.current = 'tabs-' + fastHash(sig);
  }
  const effectivePersistKey = persistKey || autoKeyRef.current || undefined;

  const [storedValue, setValue, isControlled] = useControllableState<string>({
    value,
    // Restores the persisted tab on first mount, else `defaultValue`, else the first item.
    defaultValue: () => {
      if (effectivePersistKey && persistStoreRef.current?.has(effectivePersistKey)) {
        return persistStoreRef.current.get(effectivePersistKey)!;
      }
      return defaultValue ?? items[0]?.key ?? '';
    },
    finalValue: '',
    onChange,
  });

  // A value whose tab no longer exists renders as the first tab (the effect
  // below reports the fallback through onChange).
  const activeKeyExists = items.some((item) => item.key === storedValue);
  const activeKey = activeKeyExists ? storedValue : items[0]?.key ?? '';
  const selectedIndex = items.findIndex((item) => item.key === activeKey);

  useEffect(() => {
    if (!activeKeyExists && items.length > 0) setValue(items[0].key);
  }, [activeKeyExists, items, setValue]);

  // Persist when the uncontrolled active tab changes
  useEffect(() => {
    if (!isControlled && effectivePersistKey) {
      persistStoreRef.current?.set(effectivePersistKey, activeKey);
    }
  }, [activeKey, isControlled, effectivePersistKey]);

  const disabledKeySet = useMemo(() => new Set(disabledKeys ?? []), [disabledKeys]);
  const isIndexDisabled = useCallback(
    (index: number) => {
      const item = items[index];
      return !item || !!item.disabled || disabledKeySet.has(item.key);
    },
    [items, disabledKeySet]
  );

  // ---------- Keyboard: roving tab stop ----------
  // Manual activation lets focus wander ahead of the selection; it snaps back
  // to the selected tab whenever the selection changes.
  const [manualFocusIndex, setManualFocusIndex] = useState<number | null>(null);
  const selectKey = useCallback(
    (key: string) => {
      setManualFocusIndex(null);
      if (key !== activeKey) setValue(key);
    },
    [activeKey, setValue]
  );

  const roving = useRovingFocus({
    count: items.length,
    orientation: isVertical ? 'vertical' : 'horizontal',
    activeIndex: activationMode === 'manual' ? manualFocusIndex ?? selectedIndex : selectedIndex,
    onActiveChange: (index) => {
      if (activationMode === 'manual') {
        setManualFocusIndex(index);
      } else if (items[index]) {
        selectKey(items[index].key);
      }
    },
    isDisabled: isIndexDisabled,
  });

  // ---------- Styles ----------
  const styles = getTabStyles(
    theme,
    variant,
    size,
    color,
    orientation,
    location,
    resolvedRadius,
    contentCornerRadius,
    indicatorThickness
  );

  // Reanimated shared values
  const indicatorPosition = useSharedValue(0); // primary axis (x for horizontal, y for vertical)
  const indicatorSize = useSharedValue(0); // primary axis size (width or height)
  const indicatorCrossSize = useSharedValue(0); // cross axis size (height or width)
  const indicatorSecondaryPosition = useSharedValue(0); // cross axis position (top or left)

  // Tab layout measurements
  const [tabLayouts, setTabLayouts] = useState<Record<string, LayoutRectangle>>({});
  const containerSize = useElementSize();
  const [contentVersions, setContentVersions] = useState<Record<string, number>>({});
  const [layoutVersion, setLayoutVersion] = useState(0);
  const labelCacheRef = useRef<Record<string, { label: TabItem['label']; subLabel?: TabItem['subLabel'] }>>({});
  const itemsSignatureRef = useRef<string>('');

  const handleTabLayout = useCallback((tabKey: string, event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setTabLayouts((prev) => ({
      ...prev,
      [tabKey]: { x, y, width, height },
    }));
  }, []);

  // Detect runtime label/subLabel or ordering changes and invalidate layouts when needed
  useEffect(() => {
    const cache = labelCacheRef.current;
    const currentKeys = new Set(items.map((item) => item.key));
    const nextSignature = items.map((item) => item.key).join('|');
    const orderChanged = itemsSignatureRef.current !== nextSignature;
    itemsSignatureRef.current = nextSignature;

    const removedKeys: string[] = [];
    Object.keys(cache).forEach((key) => {
      if (!currentKeys.has(key)) {
        removedKeys.push(key);
        delete cache[key];
      }
    });

    const dirtyKeys: string[] = [];
    items.forEach((item) => {
      const cached = cache[item.key];
      if (!cached) {
        cache[item.key] = { label: item.label, subLabel: item.subLabel };
        return;
      }

      if (cached.label !== item.label || cached.subLabel !== item.subLabel) {
        cache[item.key] = { label: item.label, subLabel: item.subLabel };
        dirtyKeys.push(item.key);
      }
    });

    if (!dirtyKeys.length && !removedKeys.length && !orderChanged) {
      return;
    }

    setContentVersions((prev) => {
      let changed = false;
      const next = { ...prev };

      removedKeys.forEach((key) => {
        if (next[key] !== undefined) {
          delete next[key];
          changed = true;
        }
      });

      dirtyKeys.forEach((key) => {
        next[key] = (next[key] ?? 0) + 1;
        changed = true;
      });

      return changed ? next : prev;
    });

    setLayoutVersion((prev) => prev + 1);
    setTabLayouts((prev) => (Object.keys(prev).length ? {} : prev));
  }, [items]);

  // `transitionDuration` is the cross-component name; `animationDuration` stays
  // supported as the original Tabs-specific spelling. Reduced motion → 0.
  const resolvedDuration = useTransitionDuration(transitionDuration ?? animationDuration, 250);
  const lastLayoutSigRef = useRef<string | null>(null);
  const lastActiveTabRef = useRef<string | null>(null);
  const mountedRef = useRef(false);

  // Update indicator when active tab or layout changes meaningfully
  useEffect(() => {
    const layout = tabLayouts[activeKey];
    if (!layout) return;

    // Build compact layout signature (only needed metrics)
    const layoutSig = Object.keys(tabLayouts)
      .sort()
      .map((k) => {
        const l = tabLayouts[k];
        return k + ':' + l.x + ',' + l.y + ',' + l.width + 'x' + l.height;
      })
      .join('|');

    const activeUnchanged = lastActiveTabRef.current === activeKey;
    const layoutUnchanged = lastLayoutSigRef.current === layoutSig;
    const firstMount = !mountedRef.current;

    // A 0ms duration (explicit, or reduced motion) means "no transition", so
    // skip the timing entirely rather than running a zero-length one.
    const shouldAnimate = animated && resolvedDuration > 0 && !firstMount && !(activeUnchanged && layoutUnchanged);

    const primaryPos = isVertical ? layout.y : layout.x;
    const primarySize = isVertical ? layout.height : layout.width;
    const crossSize = isVertical ? layout.width : layout.height;
    const secondaryPos = isVertical ? layout.x : layout.y;
    const timing = (val: number) => withTiming(val, { duration: resolvedDuration });

    if (variant === 'line' || variant === 'chip') {
      if (shouldAnimate) {
        indicatorPosition.value = timing(primaryPos);
        indicatorSize.value = timing(primarySize);
        if (variant === 'chip') {
          indicatorCrossSize.value = timing(crossSize);
          indicatorSecondaryPosition.value = timing(secondaryPos);
        }
      } else {
        indicatorPosition.value = primaryPos;
        indicatorSize.value = primarySize;
        if (variant === 'chip') {
          indicatorCrossSize.value = crossSize;
          indicatorSecondaryPosition.value = secondaryPos;
        }
      }
    }

    lastLayoutSigRef.current = layoutSig;
    lastActiveTabRef.current = activeKey;
    mountedRef.current = true;
  }, [
    activeKey,
    tabLayouts,
    variant,
    animated,
    resolvedDuration,
    isVertical,
    indicatorPosition,
    indicatorSize,
    indicatorCrossSize,
    indicatorSecondaryPosition,
  ]);

  // Animated indicator style. Positions are the measured (physical) layout
  // offsets, so `left`/`top` are correct in both directions.
  const animatedIndicatorStyle = useAnimatedStyle(() => {
    // Before the first tab layout lands the shared values are still 0, which for
    // the chip variant would render a zero-size shadowed dot in the top-left
    // corner for one frame. Keep the indicator hidden until it has real size.
    const opacity = indicatorSize.value === 0 ? 0 : 1;
    if (variant === 'line') {
      return isVertical
        ? { opacity, top: indicatorPosition.value, height: indicatorSize.value }
        : { opacity, left: indicatorPosition.value, width: indicatorSize.value };
    }
    if (variant === 'chip') {
      return isVertical
        ? {
            opacity,
            top: indicatorPosition.value,
            height: indicatorSize.value,
            left: indicatorSecondaryPosition.value,
            width: indicatorCrossSize.value,
          }
        : {
            opacity,
            left: indicatorPosition.value,
            width: indicatorSize.value,
            top: indicatorSecondaryPosition.value,
            height: indicatorCrossSize.value,
          };
    }
    return {};
  }, [isVertical, variant]);

  const activeTabItem = selectedIndex >= 0 ? items[selectedIndex] : undefined;

  const totalTabsPrimarySize = useMemo(() => {
    if (!items.length) return 0;
    const baseSize = items.reduce((sum, item) => {
      const layout = tabLayouts[item.key];
      if (!layout) return sum;
      return sum + (isVertical ? layout.height : layout.width);
    }, 0);

    const gapSize = tabGap ? tabGap * Math.max(0, items.length - 1) : 0;
    return baseSize + gapSize;
  }, [items, tabLayouts, isVertical, tabGap]);

  const availablePrimarySize = isVertical ? containerSize.height || 0 : containerSize.width || 0;

  const hasOverflow =
    !!totalTabsPrimarySize && !!availablePrimarySize && totalTabsPrimarySize > availablePrimarySize + 1; // slight buffer for rounding

  const enableScroll = scrollable || hasOverflow;

  const resolvedInactiveBg = useMemo(
    () => resolveThemeColor(theme, inactiveTabBackgroundColor),
    [theme, inactiveTabBackgroundColor]
  );
  const resolvedActiveBg = useMemo(
    () => resolveThemeColor(theme, activeTabBackgroundColor),
    [theme, activeTabBackgroundColor]
  );
  const resolvedActiveTextColor = useMemo(() => {
    const explicit = resolveThemeColor(theme, activeTabTextColor);
    if (explicit) return explicit;
    if (variant === 'chip') return theme.text.onPrimary;
    return undefined;
  }, [theme, activeTabTextColor, variant]);

  const getCornerStyles = (index: number, count: number): ViewStyle | undefined => {
    if (!tabCornerRadius || variant === 'folder') return undefined;
    if (variant === 'chip') return { borderRadius: tabCornerRadius };

    const corners: ViewStyle = {};
    const isFirst = index === 0;
    const isLast = index === count - 1;

    if (isVertical) {
      if (location === 'start') {
        if (isFirst) corners.borderTopStartRadius = tabCornerRadius;
        if (isLast) corners.borderBottomStartRadius = tabCornerRadius;
      } else {
        if (isFirst) corners.borderTopEndRadius = tabCornerRadius;
        if (isLast) corners.borderBottomEndRadius = tabCornerRadius;
      }
    } else if (location === 'start') {
      if (isFirst) corners.borderTopStartRadius = tabCornerRadius;
      if (isLast) corners.borderTopEndRadius = tabCornerRadius;
    } else {
      if (isFirst) corners.borderBottomStartRadius = tabCornerRadius;
      if (isLast) corners.borderBottomEndRadius = tabCornerRadius;
    }

    return corners;
  };

  const getGapStyle = (index: number, count: number): ViewStyle | undefined => {
    if (!tabGap || variant === 'folder' || index === count - 1) return undefined;
    return isVertical ? { marginBottom: tabGap } : { marginEnd: tabGap };
  };

  const hasPanel = !navigationOnly;

  const renderTab = (item: TabItem, index: number) => {
    const renderKey = `${item.key}-${layoutVersion}-${contentVersions[item.key] ?? 0}`;
    const isActive = index === selectedIndex;
    const isDisabled = isIndexDisabled(index);
    const activeTextColor = resolvedActiveTextColor;
    const itemProps = roving.getItemProps(index);

    if (isDev && !item.accessibilityLabel && !getNodeText(item.label as React.ReactNode)) {
      // An icon-only label: nothing to derive the tab's accessible name from.
      warnOnce(
        `Tabs.label.${item.key}`,
        `[plocks] Tabs: tab "${item.key}" has no text label; pass \`accessibilityLabel\` so screen readers can name it.`
      );
    }

    const handleKeyDown = (event: KeyboardEventLike) => {
      if (roving.handleKeyDown(event, index)) return;
      // react-native-web's Pressable only activates non-buttons on Enter; tabs
      // also activate on Space (manual activation mode relies on it).
      const key = event.key ?? (event.nativeEvent as { key?: string } | undefined)?.key;
      if (key === ' ' || key === 'Spacebar') {
        event.preventDefault?.();
        if (isDisabled) onDisabledTabPress?.(item.key, item);
        else selectKey(item.key);
      }
    };

    return (
      <Pressable
        key={renderKey}
        {...a11yProps({
          role: 'tab',
          id: tabId(index),
          selected: isActive,
          disabled: isDisabled,
          controls: hasPanel && isActive ? panelId : undefined,
          label: item.accessibilityLabel,
        })}
        // react-native-web's Pressable derives aria-disabled from `disabled` only.
        // A tab stays pressable while `onDisabledTabPress` wants the press.
        disabled={isDisabled && !onDisabledTabPress}
        ref={itemProps.ref}
        onFocus={itemProps.onFocus}
        {...webProps({ tabIndex: itemProps.tabIndex, onKeyDown: handleKeyDown })}
        onLayout={(event) => handleTabLayout(item.key, event)}
        style={[
          styles.tab,
          isActive && styles.activeTab,
          tabStyle,
          getCornerStyles(index, items.length),
          getGapStyle(index, items.length),
          !isActive && resolvedInactiveBg ? { backgroundColor: resolvedInactiveBg } : null,
          isActive && resolvedActiveBg ? { backgroundColor: resolvedActiveBg } : null,
          isDisabled && styles.disabledTab,
        ]}
        onPress={() => {
          if (isDisabled) {
            onDisabledTabPress?.(item.key, item);
            return;
          }
          selectKey(item.key);
        }}
      >
        {item.icon ? (
          <View style={navigationOnly ? styles.iconNavigation : styles.icon} {...a11yProps({ hidden: true })}>
            {item.icon}
          </View>
        ) : null}
        {navigationOnly ? (
          <Flex gap={6} align="center" direction="row">
            <Text
              {...mergeSlotProps(
                {
                  fw: isActive ? '600' : '500',
                  c: isActive ? activeTextColor : undefined,
                  style: [
                    styles.tabText,
                    isActive && styles.activeTabText,
                    textStyle,
                    activeTextColor && isActive ? { color: activeTextColor } : null,
                  ],
                },
                labelProps
              )}
            >
              {item.label}
            </Text>
            {!item.subLabel ? null : typeof item.subLabel === 'string' || typeof item.subLabel === 'number' ? (
              <Sup c={isActive ? activeTextColor : undefined}>{item.subLabel}</Sup>
            ) : (
              item.subLabel
            )}
          </Flex>
        ) : (
          <Flex gap={6} align="center" direction={isVertical ? 'column' : 'row'}>
            <Text
              {...mergeSlotProps(
                {
                  fw: isActive ? '600' : '500',
                  c: isActive ? activeTextColor : undefined,
                  style: [
                    styles.tabText,
                    isActive && styles.activeTabText,
                    textStyle,
                    activeTextColor && isActive ? { color: activeTextColor } : null,
                  ],
                },
                labelProps
              )}
            >
              {item.label}
            </Text>
            {/* Text goes in a superscript; a node (a Badge, say) is laid out as
                given, since a View nested in Text breaks native layout. */}
            {!item.subLabel ? null : typeof item.subLabel === 'string' || typeof item.subLabel === 'number' ? (
              <Sup c={isActive ? activeTextColor : undefined}>{item.subLabel}</Sup>
            ) : (
              item.subLabel
            )}
          </Flex>
        )}
      </Pressable>
    );
  };

  const tablistA11y = a11yProps({ role: 'tablist', orientation: isVertical ? 'vertical' : 'horizontal' });
  const tabNodes = items.map(renderTab);
  const indicatorNode =
    variant === 'line' || variant === 'chip' ? (
      <Animated.View
        testID="tabs-indicator"
        style={[styles.indicator, animatedIndicatorStyle]}
        {...a11yProps({ hidden: true })}
      />
    ) : null;

  const header = enableScroll ? (
    <ScrollView
      {...tablistA11y}
      horizontal={!isVertical}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.tabsHeader}
      style={styles.tabsHeaderScroll}
    >
      {tabNodes}
      {indicatorNode}
    </ScrollView>
  ) : (
    <View {...tablistA11y} style={styles.tabsHeader}>
      {tabNodes}
      {indicatorNode}
    </View>
  );

  const panel = hasPanel ? (
    <View
      {...a11yProps({
        role: 'tabpanel',
        id: panelId,
        labelledBy: selectedIndex >= 0 ? tabId(selectedIndex) : undefined,
      })}
      // The panel is a tab stop of its own, so keyboard users can reach
      // content that has no focusable element.
      {...webProps({ tabIndex: 0 })}
      style={[styles.content, contentStyle]}
    >
      {activeTabItem?.content}
    </View>
  ) : null;

  // `location="end"` puts the tab list after the content — in the render order
  // too, so the reading order matches what's on screen.
  const isEnd = location === 'end';

  // navigationOnly renders the caller's children where the panel would go.
  const body = navigationOnly ? children : panel;

  return (
    <View ref={ref} testID={testID} style={[styles.container, spacingStyles, style]} onLayout={containerSize.onLayout}>
      {isEnd ? body : null}
      {header}
      {isEnd ? null : body}
    </View>
  );
}, { displayName: 'Tabs' });
