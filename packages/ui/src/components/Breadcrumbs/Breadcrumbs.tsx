import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { Text } from '../Text';
import { BreadcrumbsProps, BreadcrumbItem } from './types';
import { factory } from '../../core/factory';
import { useTheme } from '../../core/theme';
import { getSpacingStyles, extractSpacingProps, mergeSlotProps } from '../../core/utils';
import { Icon } from '../Icon';
import { useDirection } from '../../core/providers/DirectionProvider';
import { clampComponentSize, resolveComponentSize, type ComponentSize, type ComponentSizeValue } from '../../core/theme/componentSize';

type BreadcrumbSizeMetrics = {
  fontSize: number;
  iconSize: number;
  height: number;
  separatorSpacing: number;
};

const BREADCRUMB_ALLOWED_SIZES: ComponentSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

const BREADCRUMB_SIZE_SCALE: Record<ComponentSize, BreadcrumbSizeMetrics> = {
  xs: { fontSize: 12, iconSize: 12, height: 20, separatorSpacing: 6 },
  sm: { fontSize: 14, iconSize: 14, height: 24, separatorSpacing: 8 },
  md: { fontSize: 16, iconSize: 16, height: 28, separatorSpacing: 8 },
  lg: { fontSize: 18, iconSize: 18, height: 32, separatorSpacing: 10 },
  xl: { fontSize: 20, iconSize: 20, height: 36, separatorSpacing: 12 },
  '2xl': { fontSize: 22, iconSize: 22, height: 40, separatorSpacing: 14 },
  '3xl': { fontSize: 24, iconSize: 24, height: 44, separatorSpacing: 16 },
};

const BASE_BREADCRUMB_METRICS = BREADCRUMB_SIZE_SCALE.md;

const resolveBreadcrumbSize = (value: ComponentSizeValue): BreadcrumbSizeMetrics => {
  if (typeof value === 'number') {
    const ratio = value / BASE_BREADCRUMB_METRICS.fontSize;
    return {
      fontSize: value,
      iconSize: Math.max(8, Math.round(BASE_BREADCRUMB_METRICS.iconSize * ratio)),
      height: Math.max(16, Math.round(BASE_BREADCRUMB_METRICS.height * ratio)),
      separatorSpacing: Math.max(4, Math.round(BASE_BREADCRUMB_METRICS.separatorSpacing * ratio)),
    };
  }

  const resolved = resolveComponentSize(value, BREADCRUMB_SIZE_SCALE, {
    allowedSizes: BREADCRUMB_ALLOWED_SIZES,
    fallback: 'md',
  });

  if (typeof resolved === 'number') {
    return resolveBreadcrumbSize(resolved);
  }

  return resolved;
};

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
    accessibilityLabel = 'Breadcrumb navigation',
    labelProps,
    separatorProps,
    ...rest
  } = props;

  const theme = useTheme();
  const { isRTL } = useDirection();
  const { spacingProps, otherProps } = extractSpacingProps(rest);
  const spacingStyle = getSpacingStyles(spacingProps);

  // Handle collapsing items if maxItems is specified
  const getDisplayItems = (): BreadcrumbItem[] => {
    if (!maxItems || items.length <= maxItems) {
      return items;
    }

    if (maxItems <= 2) {
      return [items[0], items[items.length - 1]];
    }

    const firstItems = items.slice(0, 1);
    const lastItems = items.slice(-1);
    const ellipsisItem: BreadcrumbItem = {
      label: '...',
      disabled: true,
    };

    return [...firstItems, ellipsisItem, ...lastItems];
  };

  const displayItems = getDisplayItems();
  
  // Reverse items in RTL to read right-to-left
  const orderedItems = isRTL ? [...displayItems].reverse() : displayItems;

  const clampedSize = clampComponentSize(size, BREADCRUMB_ALLOWED_SIZES);
  const sizeMetrics = resolveBreadcrumbSize(clampedSize);
  const iconGap = Math.max(4, Math.round(sizeMetrics.separatorSpacing / 2));

  const renderBreadcrumbItem = (item: BreadcrumbItem, index: number, isLast: boolean) => {
    const isClickable = !item.disabled && (item.href || item.onPress);
    
    const itemStyle = {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      minHeight: sizeMetrics.height,
      opacity: item.disabled ? 0.5 : 1,
    };

    // Trail items are de-emphasized against the current page, but only by one
    // step: `muted` at a light weight is under 3:1 on light backgrounds.
    const textColor = isLast ? theme.text.primary : theme.text.secondary;

    const content = (
      <View style={itemStyle}>
        {showIcons && item.icon && (
          <View style={isRTL ? { marginLeft: iconGap } : { marginRight: iconGap }}>
            <Icon
              name={item.icon ? (item.icon as any).props.name : 'chevron-right'}
              size={sizeMetrics.iconSize}
              color={textColor}
            />
          </View>
        )}
        <Text
          {...mergeSlotProps(
            {
              size: sizeMetrics.fontSize,
              colorVariant: isLast ? 'primary' as const : 'secondary' as const,
              weight: isLast ? ('600' as const) : ('500' as const),
              style: textStyle,
            },
            labelProps
          )}
        >
          {item.label}
        </Text>
      </View>
    );

    if (isClickable && !isLast) {
      return (
        <TouchableOpacity
          key={index}
          onPress={item.onPress}
          disabled={item.disabled}
          style={{
            opacity: item.disabled ? 0.5 : 1,
          }}
          accessibilityRole="link"
          accessibilityLabel={`Navigate to ${item.label}`}
        >
          {content}
        </TouchableOpacity>
      );
    }

    return (
      <View key={index} accessibilityRole={isLast ? 'text' : 'link'}>
        {content}
      </View>
    );
  };

  const renderSeparator = (index: number) => {
    return (
      <View
        key={`separator-${index}`}
        style={[
          {
            marginHorizontal: sizeMetrics.separatorSpacing,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
          },
          separatorStyle,
        ]}
      >
        {typeof separator === 'string' ? (
          <Text
            {...mergeSlotProps(
              {
                style: {
                  fontSize: Math.max(10, sizeMetrics.fontSize - 2),
                  color: theme.text.muted,
                },
              },
              separatorProps
            )}
          >
            {separator}
          </Text>
        ) : (
          separator
        )}
      </View>
    );
  };

  return (
    <View
      ref={ref}
      style={[
        {
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
          flexWrap: Platform.OS === 'web' ? 'wrap' : undefined,
        },
        spacingStyle,
        style,
      ]}
      accessibilityLabel={accessibilityLabel}
      {...otherProps}
    >
      {orderedItems.map((item, index) => {
        const isLast = index === orderedItems.length - 1;
        return (
          <React.Fragment key={index}>
            {renderBreadcrumbItem(item, index, isLast)}
            {!isLast && renderSeparator(index)}
          </React.Fragment>
        );
      })}
    </View>
  );
});

Breadcrumbs.displayName = 'Breadcrumbs';
