import React, { createContext, useContext, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveSpacing } from '../../core/theme/tokens';
import { resolveStyleProps, extractStyleProps } from '../../core/utils/spacing';
import { factory, withStatics } from '../../core/factory/factory';
import { isWeb } from '../../core/platform/flags';
import { webStyle } from '../../core/platform/webStyle';
import type { BaseProps } from '../../core/types/base';
import { useHover } from '../../hooks/useHover/useHover';
import { Text } from '../Text';

export interface TableData {
  head?: React.ReactNode[];
  body?: React.ReactNode[][];
  foot?: React.ReactNode[];
  caption?: React.ReactNode;
}

type TableSpacing = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

/**
 * Table-specific ARIA attributes. react-native-web forwards them to the DOM;
 * React Native ignores them. `aria-sort` belongs on column headers.
 */
export interface TableAriaProps {
  'aria-rowindex'?: number;
  'aria-colindex'?: number;
  'aria-rowcount'?: number;
  'aria-colcount'?: number;
  'aria-colspan'?: number;
  'aria-sort'?: 'ascending' | 'descending' | 'none' | 'other';
}

/** View props every table part forwards to its root element (role, aria-*, testID, layout events…). */
type TableHostProps = Omit<ViewProps, 'style' | 'children' | 'testID'> & TableAriaProps;

export interface TableColumnConfig {
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
}

export interface TableProps extends BaseProps, TableHostProps {
  children?: React.ReactNode;
  /** Table data for automatic generation of rows */
  data?: TableData;
  /** Horizontal spacing between cells (`data` mode) — a theme spacing token or px */
  horizontalSpacing?: TableSpacing;
  /** Vertical spacing between cells (`data` mode) — a theme spacing token or px */
  verticalSpacing?: TableSpacing;
  /** Add striped styling to rows (`data` mode) */
  striped?: boolean;
  /** Highlight rows on hover (web / pointer devices) — applies to every `Table.Tr` inside the table */
  highlightOnHover?: boolean;
  /** Add borders around table */
  withTableBorder?: boolean;
  /** Add borders between columns (`data` mode) */
  withColumnBorders?: boolean;
  /** Add borders between rows (`data` mode) */
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
  /** Column width configuration for auto-sizing (`data` mode) */
  columns?: TableColumnConfig[];
}

/** `mah` caps the container's height; taller content scrolls vertically. */
export interface TableScrollContainerProps extends BaseProps, TableHostProps {
  children?: React.ReactNode;
  /** Minimum width of the scrolled content — narrower viewports scroll horizontally. Defaults to `500`. */
  miw?: number;
}

export interface TableSectionProps extends BaseProps, TableHostProps {
  children?: React.ReactNode;
}

/** `bg` is the row background; `selected` and hover fills paint over it. */
export interface TableRowProps extends BaseProps, TableHostProps {
  children?: React.ReactNode;
  /** Row selection state (paints `theme.backgrounds.selected`) */
  selected?: boolean;
  /** Press handler — makes the row pressable */
  onPress?: () => void;
  /** Highlight the row on hover. Defaults to the table's `highlightOnHover`. */
  hoverable?: boolean;
  /** Hover fill. Defaults to `theme.backgrounds.hover`. */
  hoverColor?: string;
}

/**
 * `w` / `miw` / `maw` size the cell. `w` also takes a CSS width keyword
 * (`min-content`, …) on web; when set, `flex` / `widthStrategy` are ignored.
 */
export interface TableCellProps extends BaseProps, TableHostProps {
  children?: React.ReactNode;
  /**
   * Content alignment. `left` / `right` are the leading / trailing edges, so
   * they follow the layout direction (in RTL `left` content sits on the right).
   */
  align?: 'left' | 'center' | 'right';
  /** Flex grow factor for flexible sizing */
  flex?: number;
  /** Width strategy for responsive behavior */
  widthStrategy?: 'auto' | 'min-content' | 'max-content' | 'fixed';
  /** Number of columns the cell spans (exposed as `aria-colspan` on web) */
  colSpan?: number;
}

interface TableContextValue {
  highlightOnHover: boolean;
  tabularNums: boolean;
}

const DEFAULT_TABLE_CONTEXT: TableContextValue = { highlightOnHover: false, tabularNums: false };
const TableContext = createContext<TableContextValue>(DEFAULT_TABLE_CONTEXT);

type CellAlign = NonNullable<TableCellProps['align']>;

// Flex alignment is direction-aware on both platforms, so `left`/`right` map to
// the logical start/end without reading the layout direction.
const ALIGN_ITEMS: Record<CellAlign, ViewStyle['alignItems'] | undefined> = {
  left: undefined,
  center: 'center',
  right: 'flex-end',
};

// `left` leaves the natural (start) alignment, which follows the direction.
const TEXT_ALIGN: Record<CellAlign, TextStyle['textAlign'] | undefined> = {
  left: undefined,
  center: 'center',
  right: 'right',
};

const TABULAR_NUMS: TextStyle = { fontVariant: ['tabular-nums'] };

/** Flex sizing for a cell without an explicit `w` (the width itself comes from the style props). */
function cellFlexStyle({ w, flex, widthStrategy = 'auto' }: Pick<TableCellProps, 'w' | 'flex' | 'widthStrategy'>): ViewStyle | null {
  if (w !== undefined && w !== null && w !== '') return null;
  if (flex !== undefined) return { flex };
  if (widthStrategy === 'min-content') return { flex: 0, flexShrink: 0 };
  return { flex: 1 };
}

/** True when `children` holds text that must be wrapped in a `<Text>`. */
function hasTextChild(children: React.ReactNode): boolean {
  return React.Children.toArray(children).some((child) => typeof child === 'string' || typeof child === 'number');
}

const resolveTableSpacing = (theme: Parameters<typeof resolveSpacing>[0], value: TableSpacing): number => {
  const resolved = resolveSpacing(theme, value);
  return typeof resolved === 'number' ? resolved : 0;
};

// Table Cell Components
export const TableTh = factory<{ props: TableCellProps; ref: View }>((allProps, ref) => {
  const { styleProps, otherProps } = extractStyleProps(allProps);
  const { children, align = 'left', flex, widthStrategy, colSpan, style, role, ...rest } = otherProps;
  const theme = useTheme();
  const { tabularNums } = useContext(TableContext);

  const cellStyle: StyleProp<ViewStyle> = [
    styles.th,
    { borderColor: theme.backgrounds.border, backgroundColor: theme.backgrounds.subtle },
    cellFlexStyle({ w: styleProps.w, flex, widthStrategy }),
    ALIGN_ITEMS[align] ? { alignItems: ALIGN_ITEMS[align] } : null,
    resolveStyleProps(styleProps, theme),
    style,
  ];

  return (
    <View
      ref={ref}
      role={role ?? 'columnheader'}
      {...(isWeb && colSpan ? { 'aria-colspan': colSpan } : null)}
      {...rest}
      style={cellStyle}
    >
      {hasTextChild(children) ? (
        <Text
          variant="p"
          fw="semibold"
          style={[{ textAlign: TEXT_ALIGN[align], color: theme.text.primary }, tabularNums && TABULAR_NUMS]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}, { displayName: 'TableTh' });

export const TableTd = factory<{ props: TableCellProps; ref: View }>((allProps, ref) => {
  const { styleProps, otherProps } = extractStyleProps(allProps);
  const { children, align = 'left', flex, widthStrategy, colSpan, style, role, ...rest } = otherProps;
  const theme = useTheme();
  const { tabularNums } = useContext(TableContext);

  const cellStyle: StyleProp<ViewStyle> = [
    styles.td,
    { borderColor: theme.backgrounds.border },
    cellFlexStyle({ w: styleProps.w, flex, widthStrategy }),
    ALIGN_ITEMS[align] ? { alignItems: ALIGN_ITEMS[align] } : null,
    resolveStyleProps(styleProps, theme),
    style,
  ];

  return (
    <View
      ref={ref}
      role={role ?? 'cell'}
      {...(isWeb && colSpan ? { 'aria-colspan': colSpan } : null)}
      {...rest}
      style={cellStyle}
    >
      {hasTextChild(children) ? (
        <Text
          variant="p"
          style={[{ textAlign: TEXT_ALIGN[align], color: theme.text.primary }, tabularNums && TABULAR_NUMS]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}, { displayName: 'TableTd' });

// Table Row Component
export const TableTr = factory<{ props: TableRowProps; ref: View }>((allProps, ref) => {
  const { styleProps, otherProps } = extractStyleProps(allProps);
  const { children, selected, onPress, hoverable: hoverableProp, hoverColor, style, role, ...rest } = otherProps;
  const theme = useTheme();
  const table = useContext(TableContext);
  const hoverable = hoverableProp ?? table.highlightOnHover;
  const [hovered, hoverHandlers] = useHover();

  const rowStyle: StyleProp<ViewStyle> = [
    styles.tr,
    // Before the selected / hover fills so they paint over `bg`.
    resolveStyleProps(styleProps, theme),
    selected ? { backgroundColor: theme.backgrounds.selected } : null,
    hoverable && hovered && !selected ? { backgroundColor: hoverColor ?? theme.backgrounds.hover } : null,
    hoverable ? webStyle({ transition: 'background-color 120ms ease' }) : null,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        ref={ref}
        role={role ?? 'row'}
        onPress={onPress}
        onHoverIn={hoverable ? hoverHandlers.onHoverIn : undefined}
        onHoverOut={hoverable ? hoverHandlers.onHoverOut : undefined}
        {...rest}
        style={rowStyle}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View ref={ref} role={role ?? 'row'} {...(hoverable ? hoverHandlers : null)} {...rest} style={rowStyle}>
      {children}
    </View>
  );
}, { displayName: 'TableTr' });

// Table Section Components
const createSection = (displayName: string, sectionStyle: ViewStyle) =>
  factory<{ props: TableSectionProps; ref: View }>((allProps, ref) => {
    const { styleProps, otherProps } = extractStyleProps(allProps);
    const { children, style, role, ...rest } = otherProps;
    const theme = useTheme();
    return (
      <View
        ref={ref}
        role={role ?? 'rowgroup'}
        {...rest}
        style={[sectionStyle, resolveStyleProps(styleProps, theme), style]}
      >
        {children}
      </View>
    );
  }, { displayName });

export const TableThead = createSection('TableThead', {});
export const TableTbody = createSection('TableTbody', {});
export const TableTfoot = createSection('TableTfoot', {});

export const TableCaption = factory<{ props: TableSectionProps; ref: View }>((allProps, ref) => {
  const { styleProps, otherProps } = extractStyleProps(allProps);
  const { children, style, ...rest } = otherProps;
  const theme = useTheme();

  return (
    <View ref={ref} {...rest} style={[styles.caption, resolveStyleProps(styleProps, theme), style]}>
      <Text variant="small" c="secondary" style={styles.captionText}>
        {children}
      </Text>
    </View>
  );
}, { displayName: 'TableCaption' });

// Scroll Container Component
export const TableScrollContainer = factory<{ props: TableScrollContainerProps; ref: View }>((allProps, ref) => {
  // `miw` sizes the scrolled content, not the container.
  const { miw = 500, ...props } = allProps;
  const { styleProps, otherProps } = extractStyleProps(props);
  const { children, style, ...rest } = otherProps;
  const theme = useTheme();

  return (
    <View ref={ref} {...rest} style={[styles.scrollContainer, resolveStyleProps(styleProps, theme), style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={isWeb}
        contentContainerStyle={miw ? { minWidth: miw } : undefined}
      >
        <ScrollView style={styles.fill} showsVerticalScrollIndicator={isWeb}>
          {children}
        </ScrollView>
      </ScrollView>
    </View>
  );
}, { displayName: 'TableScrollContainer' });

// Main Table Component
const TableRoot = factory<{ props: TableProps; ref: View }>((allProps, ref) => {
  const { styleProps, otherProps } = extractStyleProps(allProps);
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
    layout: _layout = 'auto',
    variant: _variant = 'default',
    tabularNums = false,
    fullWidth = false,
    columns,
    style,
    role,
    ...rest
  } = otherProps;

  const theme = useTheme();
  const hSpacing = resolveTableSpacing(theme, horizontalSpacing);
  const vSpacing = resolveTableSpacing(theme, verticalSpacing);

  const contextValue = useMemo<TableContextValue>(
    () => ({ highlightOnHover, tabularNums }),
    [highlightOnHover, tabularNums]
  );

  const tableStyle: StyleProp<ViewStyle> = [
    styles.table,
    { borderColor: theme.backgrounds.border },
    fullWidth ? styles.fullWidth : null,
    withTableBorder ? styles.withTableBorder : null,
    resolveStyleProps(styleProps, theme),
    style,
  ];

  // Auto-generate table from data prop
  if (data) {
    const { head, body, foot, caption } = data;
    const columnConfig = (index: number): TableColumnConfig => columns?.[index] ?? {};
    const cellPadding = { paddingHorizontal: hSpacing, paddingVertical: vSpacing };
    const columnBorder = (index: number, count: number): ViewStyle | null =>
      withColumnBorders && index < count - 1 ? { borderEndWidth: 1, borderEndColor: theme.backgrounds.border } : null;
    const ariaLabel = rest['aria-label'] ?? (typeof caption === 'string' ? caption : undefined);

    const headerCells = (cells: React.ReactNode[], cellRole: 'columnheader' | 'cell') =>
      cells.map((cell, index) => {
        const config = columnConfig(index);
        return (
          <TableTh
            key={index}
            role={cellRole}
            w={config.width}
            miw={config.minWidth}
            maw={config.maxWidth}
            flex={config.flex}
            style={[cellPadding, columnBorder(index, cells.length)]}
          >
            {cell}
          </TableTh>
        );
      });

    return (
      <TableContext.Provider value={contextValue}>
        <View ref={ref} role={role ?? 'table'} {...rest} aria-label={ariaLabel} style={tableStyle}>
          {caption && captionSide === 'top' && <TableCaption>{caption}</TableCaption>}

          {head && (
            <TableThead>
              <TableTr>{headerCells(head, 'columnheader')}</TableTr>
            </TableThead>
          )}

          {body && (
            <TableTbody>
              {body.map((row, rowIndex) => (
                <TableTr
                  key={rowIndex}
                  style={{
                    backgroundColor: striped && rowIndex % 2 === 1 ? theme.backgrounds.subtle : 'transparent',
                    borderBottomWidth: withRowBorders ? 1 : 0,
                    borderColor: theme.backgrounds.border,
                  }}
                >
                  {row.map((cell, cellIndex) => {
                    const config = columnConfig(cellIndex);
                    return (
                      <TableTd
                        key={cellIndex}
                        w={config.width}
                        miw={config.minWidth}
                        maw={config.maxWidth}
                        flex={config.flex}
                        style={[cellPadding, columnBorder(cellIndex, row.length)]}
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
              <TableTr>{headerCells(foot, 'cell')}</TableTr>
            </TableTfoot>
          )}

          {caption && captionSide === 'bottom' && <TableCaption>{caption}</TableCaption>}
        </View>
      </TableContext.Provider>
    );
  }

  // Render with children
  return (
    <TableContext.Provider value={contextValue}>
      <View ref={ref} role={role ?? 'table'} {...rest} style={tableStyle}>
        {children}
      </View>
    </TableContext.Provider>
  );
}, { displayName: 'Table' });

export const Table = withStatics(TableRoot, {
  Th: TableTh,
  Td: TableTd,
  Tr: TableTr,
  Thead: TableThead,
  Tbody: TableTbody,
  Tfoot: TableTfoot,
  Caption: TableCaption,
  ScrollContainer: TableScrollContainer,
});

const styles = StyleSheet.create({
  caption: {
    padding: 8,
  },
  captionText: {
    textAlign: 'center',
  },
  fill: {
    flex: 1,
  },
  fullWidth: {
    width: '100%',
  },
  scrollContainer: {
    width: '100%',
  },
  table: {
    width: '100%',
  },
  td: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  th: {
    borderBottomWidth: 1,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  tr: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  withTableBorder: {
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
});

export default Table;
