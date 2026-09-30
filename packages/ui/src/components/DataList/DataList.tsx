import React, { createContext, useContext, useMemo } from 'react';
import { View, type DimensionValue, type ViewStyle } from 'react-native';

import type {
  DataListProps,
  DataListItemProps,
  DataListItemLabelProps,
  DataListItemValueProps,
  DataListContextValue,
  DataListSizeMetrics,
} from './types';
import { factory, withStatics } from '../../core/factory/factory';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveFontSize, resolveSpacing } from '../../core/theme/tokens';
import type { PlocksTheme } from '../../core/theme/types';
import { clampComponentSize, type ComponentSize, type ComponentSizeValue } from '../../core/theme/componentSize';
import { resolveStyleProps, extractStyleProps } from '../../core/utils/spacing';
import { Text } from '../Text';

// Context
const DataListContext = createContext<DataListContextValue | null>(null);
const useDataListContext = () => {
  const ctx = useContext(DataListContext);
  if (!ctx) throw new Error('DataList.Item components must be used within a DataList');
  return ctx;
};

const DATALIST_ALLOWED_SIZES: ComponentSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

const toNumber = (value: number | 'auto'): number => (typeof value === 'number' ? value : 0);

/** Label gap / column gap derived from the item gap (md: 12 → 4 / 16). */
const metricsFor = (fontSize: number, gap: number): DataListSizeMetrics => ({
  fontSize,
  gap,
  labelGap: Math.max(2, Math.round(gap / 3)),
  columnGap: Math.max(8, gap + 4),
});

/**
 * Size → metrics from the theme: the font size is the theme's font-size token
 * and the item gap its spacing token of the same name. A numeric size is a font
 * size; its gaps scale from the `md` ratio.
 */
const resolveDataListMetrics = (theme: PlocksTheme, value: ComponentSizeValue): DataListSizeMetrics => {
  if (typeof value === 'number') {
    const base = metricsFor(resolveFontSize(theme, 'md'), toNumber(resolveSpacing(theme, 'md')));
    const ratio = value / base.fontSize;
    return {
      fontSize: value,
      gap: Math.max(4, Math.round(base.gap * ratio)),
      labelGap: Math.max(2, Math.round(base.labelGap * ratio)),
      columnGap: Math.max(8, Math.round(base.columnGap * ratio)),
    };
  }
  return metricsFor(resolveFontSize(theme, value), toNumber(resolveSpacing(theme, value)));
};

// Label
const DataListItemLabel = factory<{ props: DataListItemLabelProps; ref: View }>(
  ({ children, c: color, style, ...rest }, ref) => {
    const { metrics, labelColor } = useDataListContext();
    return (
      <View ref={ref} role="term" {...rest} style={style}>
        <Text size={metrics.fontSize} fw="medium" c={color ?? labelColor ?? 'secondary'}>
          {children}
        </Text>
      </View>
    );
  },
  { displayName: 'DataList.ItemLabel' }
);

// Value
const DataListItemValue = factory<{ props: DataListItemValueProps; ref: View }>(
  ({ children, c: color, style, ...rest }, ref) => {
    const { metrics, valueColor } = useDataListContext();
    return (
      <View ref={ref} role="definition" {...rest} style={style}>
        <Text size={metrics.fontSize} c={color ?? valueColor ?? 'primary'}>
          {children}
        </Text>
      </View>
    );
  },
  { displayName: 'DataList.ItemValue' }
);

// Item
const DataListItem = factory<{ props: DataListItemProps; ref: View }>(
  ({ children, label, value, isLastItem = false, itemIndex: _itemIndex, style, ...rest }, ref) => {
    const { orientation, withDivider, metrics, labelWidth, dividerColor } = useDataListContext();
    const theme = useTheme();
    const { styleProps, otherProps } = extractStyleProps(rest);

    const content = children ?? (
      <>
        {label != null && <DataListItemLabel>{label}</DataListItemLabel>}
        {value != null && <DataListItemValue>{value}</DataListItemValue>}
      </>
    );

    const itemStyle: ViewStyle =
      orientation === 'horizontal'
        ? { flexDirection: 'row', alignItems: 'flex-start', columnGap: metrics.columnGap }
        : { flexDirection: 'column', rowGap: metrics.labelGap };

    const dividerStyle: ViewStyle | null =
      withDivider && !isLastItem
        ? {
            paddingBottom: metrics.gap,
            marginBottom: metrics.gap,
            borderBottomWidth: 1,
            borderBottomColor: dividerColor,
          }
        : null;

    // In horizontal orientation give the label column a stable width so values align.
    const decorated =
      orientation === 'horizontal'
        ? React.Children.map(content, (child) => {
            if (!React.isValidElement<DataListItemLabelProps>(child)) return child;
            if (child.type === DataListItemLabel) {
              const labelColumn: ViewStyle = { width: labelWidth as DimensionValue | undefined, flexShrink: 0 };
              return React.cloneElement(child, { style: [labelColumn, child.props.style] });
            }
            if (child.type === DataListItemValue) {
              return React.cloneElement(child, { style: [VALUE_COLUMN, child.props.style] });
            }
            return child;
          })
        : content;

    return (
      <View
        ref={ref}
        role="listitem"
        {...otherProps}
        style={[itemStyle, dividerStyle, resolveStyleProps(styleProps, theme), style]}
      >
        {decorated}
      </View>
    );
  },
  { displayName: 'DataList.Item' }
);

const VALUE_COLUMN: ViewStyle = { flex: 1, flexShrink: 1 };

// Root
const DataListRoot = factory<{ props: DataListProps; ref: View }>(
  (
    {
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
    },
    ref
  ) => {
    const theme = useTheme();
    const { styleProps, otherProps } = extractStyleProps(rest);

    const clampedSize = clampComponentSize(size, DATALIST_ALLOWED_SIZES);
    const baseMetrics = useMemo(() => resolveDataListMetrics(theme, clampedSize), [theme, clampedSize]);
    const gap = spacing != null ? toNumber(resolveSpacing(theme, spacing)) : baseMetrics.gap;
    const metrics = useMemo(() => ({ ...baseMetrics, gap }), [baseMetrics, gap]);

    const resolvedDividerColor = dividerColor ?? theme.backgrounds.border;

    const contextValue = useMemo<DataListContextValue>(
      () => ({
        orientation,
        withDivider,
        metrics,
        labelWidth,
        labelColor,
        valueColor,
        dividerColor: resolvedDividerColor,
      }),
      [orientation, withDivider, metrics, labelWidth, labelColor, valueColor, resolvedDividerColor]
    );

    // Build items from the `data` shorthand or from children.
    const rawItems: React.ReactElement<DataListItemProps>[] = [];
    if (data && data.length > 0) {
      data.forEach((item, index) => {
        rawItems.push(<DataListItem key={index} label={item.label} value={item.value} />);
      });
    } else {
      React.Children.forEach(children, (child) => {
        if (React.isValidElement<DataListItemProps>(child) && child.type === DataListItem) {
          rawItems.push(child);
        }
      });
    }

    const items = rawItems.map((item, index) =>
      React.cloneElement(item, {
        itemIndex: index,
        isLastItem: index === rawItems.length - 1,
        key: item.key ?? index,
      })
    );

    // When dividers are enabled, per-item margins handle spacing; otherwise use gap.
    const containerStyle: ViewStyle = withDivider ? { width: '100%' } : { width: '100%', rowGap: metrics.gap };

    return (
      <DataListContext.Provider value={contextValue}>
        <View
          ref={ref}
          role="list"
          {...otherProps}
          style={[containerStyle, resolveStyleProps(styleProps, theme), style]}
        >
          {items}
        </View>
      </DataListContext.Provider>
    );
  },
  { displayName: 'DataList' }
);

// Attach compound members
const DataList = withStatics(DataListRoot, {
  Item: DataListItem,
  ItemLabel: DataListItemLabel,
  ItemValue: DataListItemValue,
});

export { DataList };
export type {
  DataListProps,
  DataListItemProps,
  DataListItemLabelProps,
  DataListItemValueProps,
} from './types';
