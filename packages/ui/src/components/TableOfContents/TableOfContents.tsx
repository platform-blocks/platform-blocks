import React, { useEffect, useMemo, useRef } from 'react';
import { Pressable, View } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory';
import { createThemedStyles } from '../../core/hooks/useThemedStyles';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { isWeb } from '../../core/platform';
import { withAlpha } from '../../core/theme/colorUtils';
import { resolveAccentColor } from '../../core/theme/resolveColors';
import { useTheme } from '../../core/theme/ThemeProvider';
import { onColor, resolveFontSize, resolveRadius, resolveSpacing } from '../../core/theme/tokens';
import type { PlatformBlocksTheme, SizeValue } from '../../core/theme/types';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { Text } from '../Text';
import type { TableOfContentsProps, TocItem } from './types';

type TocVariant = NonNullable<TableOfContentsProps['variant']>;

const DEFAULT_CONTAINER = 'main, [role="main"], .main-content, #main-content, article, .content, #content';

/** Colors + container style for one (theme, variant, color, autoContrast, size, radius) combination. */
const getTocStyles = createThemedStyles(
  (
    theme: PlatformBlocksTheme,
    variant: TocVariant,
    color: string | undefined,
    autoContrast: boolean,
    size: SizeValue,
    radius: number
  ) => {
    const fill = resolveAccentColor(theme, color) ?? theme.colors.primary[5];
    const filled = variant === 'filled';
    // On a filled background the text must read against the fill: the theme's
    // on-accent color, or (autoContrast) whichever text color contrasts best.
    const onFill = autoContrast ? onColor(theme, fill) : theme.text.onPrimary ?? onColor(theme, fill);
    const textColor = filled ? onFill : theme.text.primary;

    return {
      container: {
        padding: resolveSpacing(theme, 'sm'),
        width: '100%',
        borderRadius: radius,
        ...(filled ? { backgroundColor: fill } : variant === 'ghost' ? { backgroundColor: 'transparent' } : null),
      } as ViewStyle,
      item: {
        paddingVertical: 4,
        paddingEnd: 6,
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 32,
        borderStartWidth: 2,
        borderStartColor: theme.backgrounds.border,
        backgroundColor: 'transparent',
      } as ViewStyle,
      activeItem: {
        backgroundColor: filled ? withAlpha(onFill, 0.15) : theme.backgrounds.selected,
        borderStartColor: filled ? onFill : fill,
      } as ViewStyle,
      ancestorItem: { opacity: 0.85 } as ViewStyle,
      text: { color: textColor, fontWeight: '400', fontSize: resolveFontSize(theme, size) } as TextStyle,
      activeText: { fontWeight: '600' } as TextStyle,
    };
  }
);

/**
 * An in-page table of contents that follows the scroll position (web: the
 * headings inside `container`). Renders a labelled `navigation` landmark of
 * links; the current section carries `aria-current="location"`.
 */
export const TableOfContents = factory<{ props: TableOfContentsProps; ref: View }>((props, ref) => {
  const {
    variant = 'none',
    color,
    size = 'sm',
    radius,
    scrollSpyOptions,
    getControlProps,
    initialData,
    minDepthToOffset = 1,
    depthOffset = 20,
    reinitializeRef,
    autoContrast = false,
    style,
    testID,
    onActiveChange,
    container,
    accessibilityLabel = 'Table of contents',
    ...rest
  } = props;

  const theme = useTheme();
  const { styleProps } = extractStyleProps(rest);
  const spacingStyles = useStyleProps(styleProps);
  const styles = getTocStyles(theme, variant, color, autoContrast, size, resolveRadius(theme, radius));

  const { items, activeId, setActiveId, reinitialize } = useScrollSpy(
    {
      container: container || DEFAULT_CONTAINER,
      ...scrollSpyOptions,
    },
    initialData || []
  );

  useEffect(() => {
    if (reinitializeRef) reinitializeRef.current = () => reinitialize();
  }, [reinitializeRef, reinitialize]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      reinitialize();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [container, reinitialize]);

  // Report the active section when it changes — not on every render (an inline
  // `onActiveChange` used to re-fire on each one) and not when only the item
  // list is rebuilt.
  const notifyActiveChange = useLatestCallback(onActiveChange);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const lastReportedRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const id = activeId ?? null;
    if (lastReportedRef.current === id) return;
    lastReportedRef.current = id;
    notifyActiveChange(id, id ? itemsRef.current.find((i) => i.id === id) : undefined);
  }, [activeId, notifyActiveChange]);

  const activeIndex = useMemo(() => items.findIndex((i) => i.id === activeId), [items, activeId]);
  const activeDepth = activeIndex >= 0 ? items[activeIndex].depth : null;

  const renderItem = (item: TocItem, index: number) => {
    const active = item.id === activeId;
    const isAncestor = !active && activeIndex > index && activeDepth != null && item.depth < activeDepth;
    // Deeper headings are indented from `minDepthToOffset` on.
    const indent = Math.max(0, item.depth - minDepthToOffset) * depthOffset;

    const handlePress = () => {
      setActiveId(item.id);

      if (isWeb) {
        const el = item.getNode?.();
        if (el) {
          el.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      }
    };

    const labelNode = <Text style={[styles.text, active && styles.activeText]}>{item.value}</Text>;

    const { children: customChildren, ...extra } = getControlProps
      ? getControlProps({ data: item, active, index })
      : { children: undefined };

    return (
      <Pressable
        key={`toc-item-${item.id}-${index}`}
        onPress={handlePress}
        {...a11yProps({
          role: 'link',
          current: active ? 'location' : undefined,
          hint: `Navigate to ${item.value}`,
        })}
        style={[
          styles.item,
          { paddingStart: 6 + indent },
          active && styles.activeItem,
          isAncestor && styles.ancestorItem,
        ]}
        {...extra}
      >
        {customChildren ?? labelNode}
      </Pressable>
    );
  };

  return (
    <View
      ref={ref}
      testID={testID}
      {...a11yProps({ role: 'navigation', label: accessibilityLabel })}
      style={[styles.container, spacingStyles, style]}
    >
      {items.map(renderItem)}
    </View>
  );
}, { displayName: 'TableOfContents' });
