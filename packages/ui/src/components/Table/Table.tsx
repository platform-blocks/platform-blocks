import React from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';

import { useTheme } from '../../core';
import { useDirection } from '../../core/providers/DirectionProvider';
import { SpacingProps, getSpacingStyles, extractSpacingProps } from '../../core/utils';
import { Text } from '../Text';

export interface TableData {
  head?: React.ReactNode[];
  body?: React.ReactNode[][];
  foot?: React.ReactNode[];
  caption?: React.ReactNode;
}

export interface TableProps extends SpacingProps {
  children?: React.ReactNode;
  /** Table data for automatic generation of rows */
  data?: TableData;
  /** Horizontal spacing between cells */
  horizontalSpacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  /** Vertical spacing between cells */
  verticalSpacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  /** Add striped styling to rows */
  striped?: boolean;
  /** Highlight rows on hover/press */
  highlightOnHover?: boolean;
  /** Add borders around table */
  withTableBorder?: boolean;
  /** Add borders between columns */
  withColumnBorders?: boolean;
  /** Add borders between rows */
  withRowBorders?: boolean;
  /** Caption position */
  captionSide?: 'top' | 'bottom';
  /** Table layout mode */
  layout?: 'auto' | 'fixed';
  /** Variant of table layout */
  variant?: 'default' | 'vertical';
  /** Enable tabular numbers for better number alignment */
  tabularNums?: boolean;
  /** Make table take full width of container */
  fullWidth?: boolean;
  /** Column width configuration for auto-sizing */
  columns?: Array<{
    /** Column key for identification */
    key?: string;
    /** Column width strategy */
    width?: number | string | 'auto' | 'min-content' | 'max-content';
    /** Minimum column width */
    minWidth?: number;
    /** Maximum column width */
    maxWidth?: number;
    /** Flex grow factor */
    flex?: number;
  }>;
  /** Additional styles */
  style?: any;
}

export interface TableScrollContainerProps extends SpacingProps {
  children?: React.ReactNode;
  /** Minimum width before scrolling kicks in */
  minW?: number;
  /** Maximum height before vertical scrolling */
  maxH?: number;
  /** Scroll type for web */
  type?: 'native' | 'custom';
  style?: any;
  [key: string]: any;
}

export interface TableSectionProps extends SpacingProps {
  children?: React.ReactNode;
  style?: any;
  [key: string]: any;
}

export interface TableRowProps extends SpacingProps {
  children?: React.ReactNode;
  /** Background color override */
  bg?: string;
  /** Row selection state */
  selected?: boolean;
  /** Press handler */
  onPress?: () => void;
  style?: any;
  [key: string]: any;
}

export interface TableCellProps extends SpacingProps {
  children?: React.ReactNode;
  /** Cell width (useful for fixed layout) */
  w?: number | string;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Minimum width for auto-sizing */
  minW?: number;
  /** Maximum width for auto-sizing */
  maxW?: number;
  /** Flex grow factor for flexible sizing */
  flex?: number;
  /** Width strategy for responsive behavior */
  widthStrategy?: 'auto' | 'min-content' | 'max-content' | 'fixed';
  style?: any;
  [key: string]: any;
}

const getSpacingValue = (spacing: TableProps['horizontalSpacing'], theme: any): number => {
  if (typeof spacing === 'number') return spacing;

  const spacingMap = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20
  };

  return spacingMap[spacing as keyof typeof spacingMap] || 12;
};

// Table Cell Components
export const TableTh = React.forwardRef<any, TableCellProps>((allProps, ref) => {
  const { spacingProps, otherProps } = extractSpacingProps(allProps);
  // `rest` forwards passthrough props (role, aria-*, accessibility*, id, key
  // handlers) onto the underlying View so consumers like DataTable can attach
  // grid semantics. Known layout props are destructured out first.
  const { children, w, align = 'left', minW, maxW, flex, widthStrategy = 'auto', style, ...rest } = otherProps;
  const theme = useTheme();
  const { isRTL } = useDirection();

  // Swap alignment in RTL
  const effectiveAlign = (() => {
    if (align === 'center') return 'center';
    if (align === 'left') return isRTL ? 'right' : 'left';
    if (align === 'right') return isRTL ? 'left' : 'right';
    return align;
  })();

  // Calculate cell style based on width strategy and props
  const getCellWidth = () => {
    if (w) return { width: w };
    
    const widthStyle: any = {};
    
    if (flex !== undefined) {
      widthStyle.flex = flex;
    } else if (widthStrategy === 'min-content') {
      widthStyle.flex = 0;
      widthStyle.flexShrink = 0;
    } else if (widthStrategy === 'max-content') {
      widthStyle.flex = 1;
    } else if (widthStrategy === 'auto') {
      widthStyle.flex = 1;
    }
    
    if (minW) widthStyle.minWidth = minW;
    if (maxW) widthStyle.maxWidth = maxW;
    
    return widthStyle;
  };

  const cellStyle = [
    styles.th,
    {
      backgroundColor: theme.colors.gray[0],
      borderColor: theme.colors.gray[2],
      ...getCellWidth()
    },
    effectiveAlign !== 'left' && { alignItems: effectiveAlign === 'center' ? 'center' : 'flex-end' },
    getSpacingStyles(spacingProps),
    style
  ];

  return (
    <View ref={ref} style={cellStyle} {...rest}>
      <Text
        variant="p"
        weight="semibold"
        style={{
          textAlign: effectiveAlign,
          color: theme.text.primary
        }}
      >
        {children}
      </Text>
    </View>
  );
});
TableTh.displayName = 'TableTh';

export const TableTd = React.forwardRef<View, TableCellProps>((allProps, ref) => {
  const { spacingProps, otherProps } = extractSpacingProps(allProps);
  const { children, w, align = 'left', minW, maxW, flex, widthStrategy = 'auto', style, ...rest } = otherProps;
  const theme = useTheme();
  const { isRTL } = useDirection();

  // Swap alignment in RTL
  const effectiveAlign = (() => {
    if (align === 'center') return 'center';
    if (align === 'left') return isRTL ? 'right' : 'left';
    if (align === 'right') return isRTL ? 'left' : 'right';
    return align;
  })();

  // Calculate cell style based on width strategy and props
  const getCellWidth = () => {
    if (w) return { width: w };
    
    const widthStyle: any = {};
    
    if (flex !== undefined) {
      widthStyle.flex = flex;
    } else if (widthStrategy === 'min-content') {
      widthStyle.flex = 0;
      widthStyle.flexShrink = 0;
    } else if (widthStrategy === 'max-content') {
      widthStyle.flex = 1;
    } else if (widthStrategy === 'auto') {
      widthStyle.flex = 1;
    }
    
    if (minW) widthStyle.minWidth = minW;
    if (maxW) widthStyle.maxWidth = maxW;
    
    return widthStyle;
  };

  const cellStyle = [
    styles.td,
    {
      borderColor: theme.colors.gray[2],
      ...getCellWidth()
    },
    effectiveAlign !== 'left' && { alignItems: effectiveAlign === 'center' ? 'center' : 'flex-end' },
    getSpacingStyles(spacingProps),
    style
  ];

  return (
    <View ref={ref} style={cellStyle} {...rest}>
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text
          variant="p"
          style={{
            textAlign: effectiveAlign,
            color: theme.text.primary
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
});
TableTd.displayName = 'TableTd';

// Table Row Component
export const TableTr = React.forwardRef<View, TableRowProps>((allProps, ref) => {
  const { spacingProps, otherProps } = extractSpacingProps(allProps);
  const { children, bg, selected, onPress, style, hoverable, ...rest } = otherProps as any;
  const theme = useTheme();

  const rowStyle = [
    styles.tr,
    bg && { backgroundColor: bg },
    selected && {
      backgroundColor: theme.colors.primary[1]
    },
    hoverable && Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'background-color 120ms ease',
    },
    getSpacingStyles(spacingProps),
    style
  ];

  // For web, emulate hover by setting the background on mouse enter/leave.
  const hoverHandlers =
    Platform.OS === 'web' && hoverable
      ? {
          onMouseEnter: (e: any) => {
            (e.currentTarget as any).style.backgroundColor = selected
              ? theme.colors.primary[2]
              : theme.colors.gray[1];
          },
          onMouseLeave: (e: any) => {
            (e.currentTarget as any).style.backgroundColor = selected
              ? theme.colors.primary[1]
              : bg || 'transparent';
          }
        }
      : {};

  return (
    <View ref={ref} style={rowStyle} {...hoverHandlers} {...rest}>
      {children}
    </View>
  );
});
TableTr.displayName = 'TableTr';

// Table Section Components
export const TableThead = React.forwardRef<View, TableSectionProps>((allProps, ref) => {
  const { spacingProps, otherProps } = extractSpacingProps(allProps);
  const { children, style } = otherProps;

  return (
    <View ref={ref} style={[styles.thead, getSpacingStyles(spacingProps), style]}>
      {children}
    </View>
  );
});
TableThead.displayName = 'TableThead';

export const TableTbody = React.forwardRef<View, TableSectionProps>((allProps, ref) => {
  const { spacingProps, otherProps } = extractSpacingProps(allProps);
  const { children, style } = otherProps;

  return (
    <View ref={ref} style={[styles.tbody, getSpacingStyles(spacingProps), style]}>
      {children}
    </View>
  );
});
TableTbody.displayName = 'TableTbody';

export const TableTfoot = React.forwardRef<View, TableSectionProps>((allProps, ref) => {
  const { spacingProps, otherProps } = extractSpacingProps(allProps);
  const { children, style } = otherProps;

  return (
    <View ref={ref} style={[styles.tfoot, getSpacingStyles(spacingProps), style]}>
      {children}
    </View>
  );
});
TableTfoot.displayName = 'TableTfoot';

export const TableCaption = React.forwardRef<View, TableSectionProps>((allProps, ref) => {
  const { spacingProps, otherProps } = extractSpacingProps(allProps);
  const { children, style } = otherProps;
  const theme = useTheme();

  return (
    <View ref={ref} style={[styles.caption, getSpacingStyles(spacingProps), style]}>
      <Text
        variant="small"
        color="secondary"
        style={{ textAlign: 'center' }}
      >
        {children}
      </Text>
    </View>
  );
});
TableCaption.displayName = 'TableCaption';

// Scroll Container Component
export const TableScrollContainer = React.forwardRef<View, TableScrollContainerProps>((allProps, ref) => {
  const { spacingProps, otherProps } = extractSpacingProps(allProps);
  const { children, minW = 500, maxH, type = 'native', style } = otherProps;

  const containerStyle = [
    {
      width: '100%',
      maxHeight: maxH
    },
    getSpacingStyles(spacingProps),
    style
  ];

  const scrollViewStyle = minW ? { minWidth: minW } : undefined;

  return (
    <View ref={ref} style={containerStyle}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={Platform.OS === 'web'}
        contentContainerStyle={scrollViewStyle}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={Platform.OS === 'web'}
        >
          {children}
        </ScrollView>
      </ScrollView>
    </View>
  );
});
TableScrollContainer.displayName = 'TableScrollContainer';

// Main Table Component
export const Table: React.ForwardRefExoticComponent<TableProps & React.RefAttributes<View>> & {
  Th: typeof TableTh;
  Td: typeof TableTd;
  Tr: typeof TableTr;
  Thead: typeof TableThead;
  Tbody: typeof TableTbody;
  Tfoot: typeof TableTfoot;
  Caption: typeof TableCaption;
  ScrollContainer: typeof TableScrollContainer;
} = React.forwardRef<View, TableProps>((allProps, ref) => {
  const { spacingProps, otherProps } = extractSpacingProps(allProps);
  const {
    children,
    data,
    horizontalSpacing = 'md',
    verticalSpacing = 'sm',
    striped = false,
    highlightOnHover = false,
    withTableBorder = false,
    withColumnBorders = false,
    withRowBorders = false,
    captionSide = 'bottom',
    layout = 'auto',
    variant = 'default',
    tabularNums = false,
    fullWidth = false,
    columns = [],
    style,
    ...rest
  } = otherProps;

  const theme = useTheme();
  const hSpacing = getSpacingValue(horizontalSpacing, theme);
  const vSpacing = getSpacingValue(verticalSpacing, theme);

  const tableStyle = [
    styles.table,
    {
      borderColor: theme.colors.gray[2]
    },
    fullWidth && { width: '100%' },
    withTableBorder && styles.withTableBorder,
    layout === 'fixed' && styles.fixedLayout,
    variant === 'vertical' && styles.verticalVariant,
    tabularNums && styles.tabularNums,
    getSpacingStyles(spacingProps),
    style
  ];

  // Auto-generate table from data prop
  if (data) {
    const { head, body, foot, caption } = data;

    return (
      <View ref={ref} style={tableStyle} {...rest}>
        {caption && captionSide === 'top' && (
          <TableCaption>{caption}</TableCaption>
        )}

        {head && (
          <TableThead>
            <TableTr>
              {head.map((cell, index) => {
                const columnConfig = columns[index] || {};
                return (
                  <TableTh 
                    key={index} 
                    w={columnConfig.width}
                    minWidth={columnConfig.minWidth}
                    maxWidth={columnConfig.maxWidth}
                    flex={columnConfig.flex}
                    style={{
                      paddingHorizontal: hSpacing,
                      paddingVertical: vSpacing,
                      borderRightWidth: withColumnBorders && index < head.length - 1 ? 1 : 0
                    }}
                  >
                    {cell}
                  </TableTh>
                );
              })}
            </TableTr>
          </TableThead>
        )}

        {body && (
          <TableTbody>
            {body.map((row, rowIndex) => (
              <TableTr
                key={rowIndex}
                style={{
                  backgroundColor: striped && rowIndex % 2 === 1
                    ? theme.colors.gray[1]
                    : 'transparent',
                  borderBottomWidth: withRowBorders ? 1 : 0,
                  borderColor: theme.colors.gray[2]
                }}
              >
                {row.map((cell, cellIndex) => {
                  const columnConfig = columns[cellIndex] || {};
                  return (
                    <TableTd 
                      key={cellIndex} 
                      w={columnConfig.width}
                      minWidth={columnConfig.minWidth}
                      maxWidth={columnConfig.maxWidth}
                      flex={columnConfig.flex}
                      style={{
                        paddingHorizontal: hSpacing,
                        paddingVertical: vSpacing,
                        borderRightWidth: withColumnBorders && cellIndex < row.length - 1 ? 1 : 0
                      }}
                    >
                      {cell}
                    </TableTd>
                  );
                })}
              </TableTr>
            ))}
          </TableTbody>
        )}

        {foot && (
          <TableTfoot>
            <TableTr>
              {foot.map((cell, index) => {
                const columnConfig = columns[index] || {};
                return (
                  <TableTh 
                    key={index} 
                    w={columnConfig.width}
                    minWidth={columnConfig.minWidth}
                    maxWidth={columnConfig.maxWidth}
                    flex={columnConfig.flex}
                    style={{
                      paddingHorizontal: hSpacing,
                      paddingVertical: vSpacing,
                      borderRightWidth: withColumnBorders && index < foot.length - 1 ? 1 : 0
                    }}
                  >
                    {cell}
                  </TableTh>
                );
              })}
            </TableTr>
          </TableTfoot>
        )}

        {caption && captionSide === 'bottom' && (
          <TableCaption>{caption}</TableCaption>
        )}
      </View>
    );
  }

  // Render with children
  return (
    <View ref={ref} style={tableStyle} {...rest}>
      {children}
    </View>
  );
}) as typeof Table;

Table.displayName = 'Table';

// Attach sub-components
Table.Th = TableTh;
Table.Td = TableTd;
Table.Tr = TableTr;
Table.Thead = TableThead;
Table.Tbody = TableTbody;
Table.Tfoot = TableTfoot;
Table.Caption = TableCaption;
Table.ScrollContainer = TableScrollContainer;

const styles = StyleSheet.create({
  caption: {
    padding: 8
  },
  fixedLayout: {
    // React Native doesn't support table-layout, but we can simulate with flex
  },
  table: {
    width: '100%'
  },
  tabularNums: {
    fontVariant: Platform.OS === 'web' ? ['tabular-nums' as any] : undefined
  },
  tbody: {
    // Body section styles
  },
  td: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  tfoot: {
    // Footer section styles
  },
  th: {
    borderBottomWidth: 1,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  thead: {
    // Header section styles
  },
  tr: {
    flexDirection: 'row',
    // minHeight: 40
    paddingVertical: 4
  },
  verticalVariant: {
    // Custom styles for vertical layout
  },
  withTableBorder: {
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden'
  }
});

export default Table;
