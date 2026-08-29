import React, { createContext, useContext, forwardRef } from 'react';
import { View, ViewStyle } from 'react-native';

import type {
  DataListProps,
  DataListItemProps,
  DataListItemLabelProps,
  DataListItemValueProps,
  DataListContextValue,
  DataListSizeMetrics,
} from './types';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getSpacing } from '../../core/theme/sizes';
import {
  clampComponentSize,
  resolveComponentSize,
  type ComponentSize,
  type ComponentSizeValue,
} from '../../core/theme/componentSize';
import { getSpacingStyles, extractSpacingProps } from '../../core/utils';
import { Text } from '../Text';

// Context
const DataListContext = createContext<DataListContextValue | null>(null);
const useDataListContext = () => {
  const ctx = useContext(DataListContext);
  if (!ctx) throw new Error('DataList.Item components must be used within a DataList');
  return ctx;
};

const DATALIST_ALLOWED_SIZES: ComponentSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

const DATALIST_SIZE_SCALE: Record<ComponentSize, DataListSizeMetrics> = {
  xs: { fontSize: 12, gap: 6, labelGap: 2, columnGap: 12 },
  sm: { fontSize: 13, gap: 8, labelGap: 2, columnGap: 12 },
  md: { fontSize: 14, gap: 12, labelGap: 4, columnGap: 16 },
  lg: { fontSize: 16, gap: 16, labelGap: 4, columnGap: 20 },
  xl: { fontSize: 18, gap: 20, labelGap: 6, columnGap: 24 },
  '2xl': { fontSize: 20, gap: 24, labelGap: 6, columnGap: 28 },
  '3xl': { fontSize: 24, gap: 28, labelGap: 8, columnGap: 32 },
};

const BASE_DATALIST_METRICS = DATALIST_SIZE_SCALE.md;

const resolveDataListMetrics = (value: ComponentSizeValue): DataListSizeMetrics => {
  if (typeof value === 'number') {
    const ratio = value / BASE_DATALIST_METRICS.fontSize;
    return {
      fontSize: value,
      gap: Math.max(4, Math.round(BASE_DATALIST_METRICS.gap * ratio)),
      labelGap: Math.max(2, Math.round(BASE_DATALIST_METRICS.labelGap * ratio)),
      columnGap: Math.max(8, Math.round(BASE_DATALIST_METRICS.columnGap * ratio)),
    };
  }

  const resolved = resolveComponentSize(value, DATALIST_SIZE_SCALE, {
    allowedSizes: DATALIST_ALLOWED_SIZES,
    fallback: 'md',
  });

  if (typeof resolved === 'number') {
    return resolveDataListMetrics(resolved);
  }

  return resolved;
};

// Label
const DataListItemLabel = forwardRef<View, DataListItemLabelProps>(({ children, color, style, ...rest }, ref) => {
  const { metrics, labelColor } = useDataListContext();
  const resolvedColor = color ?? labelColor;
  return (
    <View ref={ref} style={style} {...rest}>
      <Text
        size={metrics.fontSize}
        weight="medium"
        color={resolvedColor ?? 'secondary'}
      >
        {children}
      </Text>
    </View>
  );
});

// Value
const DataListItemValue = forwardRef<View, DataListItemValueProps>(({ children, color, style, ...rest }, ref) => {
  const { metrics, valueColor } = useDataListContext();
  const resolvedColor = color ?? valueColor;
  return (
    <View ref={ref} style={style} {...rest}>
      <Text
        size={metrics.fontSize}
        color={resolvedColor ?? 'primary'}
      >
        {children}
      </Text>
    </View>
  );
});

// Item
const DataListItem = forwardRef<View, DataListItemProps>(({
  children,
  label,
  value,
  isLastItem = false,
  itemIndex,
  style,
  ...rest
}, ref) => {
  const { orientation, withDivider, metrics, labelWidth, dividerColor } = useDataListContext();

  const content = children ?? (
    <>
      {label != null && <DataListItemLabel>{label}</DataListItemLabel>}
      {value != null && <DataListItemValue>{value}</DataListItemValue>}
    </>
  );

  const itemStyle: ViewStyle = orientation === 'horizontal'
    ? { flexDirection: 'row', alignItems: 'flex-start', columnGap: metrics.columnGap }
    : { flexDirection: 'column', rowGap: metrics.labelGap };

  const dividerStyle: ViewStyle = withDivider && !isLastItem
    ? {
        paddingBottom: metrics.gap,
        marginBottom: metrics.gap,
        borderBottomWidth: 1,
        borderBottomColor: dividerColor,
      }
    : {};

  // In horizontal orientation give the label column a stable width so values align.
  const labelColumnStyle: ViewStyle | undefined = orientation === 'horizontal'
    ? { width: labelWidth as any, flexShrink: 0 }
    : undefined;
  const valueColumnStyle: ViewStyle | undefined = orientation === 'horizontal'
    ? { flex: 1, flexShrink: 1 }
    : undefined;

  // Wrap label/value children with column styling in horizontal orientation.
  const decorated = orientation === 'horizontal'
    ? React.Children.map(content, (child) => {
        if (!React.isValidElement(child)) return child;
        if (child.type === DataListItemLabel) {
          return React.cloneElement(child as any, {
            style: [labelColumnStyle, (child.props as any).style],
          });
        }
        if (child.type === DataListItemValue) {
          return React.cloneElement(child as any, {
            style: [valueColumnStyle, (child.props as any).style],
          });
        }
        return child;
      })
    : content;

  return (
    <View ref={ref} style={[itemStyle, dividerStyle, style]} {...rest}>
      {decorated}
    </View>
  );
});

// Root
const DataList = forwardRef<View, DataListProps>(({
  children,
  data,
  orientation = 'horizontal',
  withDivider = false,
  size = 'md',
  spacing,
  labelWidth,
  labelColor,
  valueColor,
  dividerColor,
  style,
  ...rest
}, ref) => {
  const theme = useTheme();

  const { spacingProps, otherProps } = extractSpacingProps(rest);
  const spacingStyles = getSpacingStyles(spacingProps);

  const clampedSize = clampComponentSize(size, DATALIST_ALLOWED_SIZES);
  const baseMetrics = resolveDataListMetrics(clampedSize);

  const resolvedGap = spacing != null
    ? (typeof spacing === 'number' ? spacing : getSpacing(spacing))
    : baseMetrics.gap;

  const metrics: DataListSizeMetrics = { ...baseMetrics, gap: resolvedGap };

  const resolvedDividerColor = dividerColor
    ?? theme.backgrounds?.border
    ?? theme.colors?.gray?.[3]
    ?? '#E5E5EA';

  const contextValue: DataListContextValue = {
    orientation,
    withDivider,
    metrics,
    labelWidth,
    labelColor,
    valueColor,
    dividerColor: resolvedDividerColor,
  };

  // Build items from the `data` shorthand or from children.
  const rawItems: React.ReactElement[] = [];
  if (data && data.length > 0) {
    data.forEach((item, index) => {
      rawItems.push(
        <DataListItem key={index} label={item.label} value={item.value} />
      );
    });
  } else {
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === (DataListItem as any)) {
        rawItems.push(child);
      }
    });
  }

  const items = rawItems.map((item, index) =>
    React.cloneElement(item, {
      itemIndex: index,
      isLastItem: index === rawItems.length - 1,
      key: item.key ?? index,
    } as any)
  );

  // When dividers are enabled, per-item margins handle spacing; otherwise use gap.
  const containerStyle: ViewStyle = {
    width: '100%',
    ...(withDivider ? {} : { rowGap: metrics.gap }),
  };

  return (
    <DataListContext.Provider value={contextValue}>
      <View ref={ref} style={[containerStyle, spacingStyles, style]} {...otherProps}>
        {items}
      </View>
    </DataListContext.Provider>
  );
});

// Attach compound members
const DataListWithItems = DataList as typeof DataList & {
  Item: typeof DataListItem;
  ItemLabel: typeof DataListItemLabel;
  ItemValue: typeof DataListItemValue;
};
DataListWithItems.Item = DataListItem;
DataListWithItems.ItemLabel = DataListItemLabel;
DataListWithItems.ItemValue = DataListItemValue;

DataList.displayName = 'DataList';
DataListItem.displayName = 'DataList.Item';
DataListItemLabel.displayName = 'DataList.ItemLabel';
DataListItemValue.displayName = 'DataList.ItemValue';

export { DataListWithItems as DataList };
export type {
  DataListProps,
  DataListItemProps,
  DataListItemLabelProps,
  DataListItemValueProps,
} from './types';
