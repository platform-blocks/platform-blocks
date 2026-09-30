import React from 'react';
import { Pressable, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory';
import { createThemedStyles } from '../../core/hooks/useThemedStyles';
import { isWeb, webProps } from '../../core/platform';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize, resolveFontSize, stepDown } from '../../core/theme/tokens';
import type { PlocksTheme, SizeValue } from '../../core/theme/types';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { Icon } from '../Icon';
import { Text } from '../Text';
import type { BreadcrumbItem, BreadcrumbsProps } from './types';

/**
 * Metrics derive from the theme's font-size scale: the label renders at
 * `size`, icons match the label, separators sit half a font-size away, and each
 * item keeps a compact-control minimum height as its touch target.
 */
const getBreadcrumbStyles = createThemedStyles((theme: PlocksTheme, size: SizeValue) => {
  const fontSize = resolveFontSize(theme, size);
  const separatorSpacing = Math.max(4, Math.round(fontSize / 2));
  const minHeight =
    typeof size === 'number' ? Math.max(16, Math.round(size * 1.75)) : getControlSize(theme, stepDown(size)).height;
  return {
    fontSize,
    iconSize: fontSize,
    root: { flexDirection: 'row', alignItems: 'center', flexWrap: isWeb ? 'wrap' : undefined } as ViewStyle,
    listItem: { flexDirection: 'row', alignItems: 'center' } as ViewStyle,
    item: { flexDirection: 'row', alignItems: 'center', minHeight } as ViewStyle,
    disabled: { opacity: 0.5 } as ViewStyle,
    pressed: { opacity: 0.7 } as ViewStyle,
    icon: { marginEnd: Math.max(4, Math.round(separatorSpacing / 2)) } as ViewStyle,
    separator: { marginHorizontal: separatorSpacing, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
    separatorText: { fontSize: Math.max(10, fontSize - 2), color: theme.text.muted },
  };
});

/**
 * Collapses the middle of a long trail to `first … last` when `maxItems` is
 * exceeded.
 */
function getDisplayItems(items: BreadcrumbItem[], maxItems: number | undefined): BreadcrumbItem[] {
  if (!maxItems || items.length <= maxItems) return items;
  if (maxItems <= 2) return [items[0], items[items.length - 1]];
  return [items[0], { label: '...', disabled: true }, items[items.length - 1]];
}

/**
 * A breadcrumb trail: a labelled `navigation` landmark holding a list of links,
 * the last item marked `aria-current="page"`, separators hidden from assistive
 * technology. Items keep their reading order under RTL (the row flips).
 */
export const Breadcrumbs = factory<{
  props: BreadcrumbsProps;
  ref: View;
}>((props, ref) => {
  const {
    items,
    separator = '/',
    maxItems,
    size = 'md',
    showIcons = true,
    style,
    textStyle,
    separatorStyle,
    accessibilityLabel = 'Breadcrumb',
    labelProps,
    separatorProps,
    testID,
    ...rest
  } = props;

  const theme = useTheme();
  const { styleProps } = extractStyleProps(rest);
  const spacingStyle = useStyleProps(styleProps);
  const styles = getBreadcrumbStyles(theme, size);

  const displayItems = getDisplayItems(items, maxItems);

  const renderIcon = (icon: React.ReactNode, color: string) => {
    // An <Icon name="…" /> is re-rendered at the label's size and color;
    // anything else renders as given.
    if (React.isValidElement<{ name?: unknown }>(icon) && typeof icon.props.name === 'string') {
      return <Icon name={icon.props.name} size={styles.iconSize} color={color} />;
    }
    return icon;
  };

  const renderItem = (item: BreadcrumbItem, isLast: boolean) => {
    const isClickable = !item.disabled && !isLast && !!(item.href || item.onPress);

    // Trail items are de-emphasized against the current page, but only by one
    // step: `muted` at a light weight is under 3:1 on light backgrounds.
    const textColor = isLast ? theme.text.primary : theme.text.secondary;

    const content = (
      <>
        {showIcons && item.icon ? (
          <View style={styles.icon} {...a11yProps({ hidden: true })}>
            {renderIcon(item.icon, textColor)}
          </View>
        ) : null}
        <Text
          {...mergeSlotProps(
            {
              size: styles.fontSize,
              c: isLast ? ('primary' as const) : ('secondary' as const),
              fw: isLast ? ('600' as const) : ('500' as const),
              style: textStyle,
            },
            labelProps
          )}
        >
          {item.label}
        </Text>
      </>
    );

    if (isClickable) {
      return (
        <Pressable
          {...a11yProps({ role: 'link' })}
          // Web: an href-only item is a real link (new tab, copy address, …).
          {...webProps({ href: item.onPress ? undefined : item.href })}
          onPress={item.onPress}
          style={({ pressed }) => [styles.item, pressed && styles.pressed]}
        >
          {content}
        </Pressable>
      );
    }

    return (
      <View
        style={[styles.item, item.disabled && styles.disabled]}
        {...a11yProps({ current: isLast ? 'page' : undefined, accessible: isLast || undefined })}
      >
        {content}
      </View>
    );
  };

  const renderSeparator = () => (
    <View style={[styles.separator, separatorStyle]} {...a11yProps({ hidden: true })}>
      {typeof separator === 'string' ? (
        <Text {...mergeSlotProps({ style: styles.separatorText }, separatorProps)}>{separator}</Text>
      ) : (
        separator
      )}
    </View>
  );

  return (
    <View
      ref={ref}
      testID={testID}
      {...a11yProps({ role: 'navigation', label: accessibilityLabel })}
      style={[styles.root, spacingStyle, style]}
    >
      <View {...a11yProps({ role: 'list' })} style={styles.root}>
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          return (
            <View key={`${index}-${item.label}`} {...a11yProps({ role: 'listitem' })} style={styles.listItem}>
              {renderItem(item, isLast)}
              {!isLast && renderSeparator()}
            </View>
          );
        })}
      </View>
    </View>
  );
}, { displayName: 'Breadcrumbs' });
