import React from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { a11yProps } from '../../../core/accessibility/a11yProps';
import { isWeb } from '../../../core/platform/flags';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { resolveRadius } from '../../../core/theme/tokens';
import { Icon } from '../../Icon';
import { TableTd, TableTh, TableTr } from '../../Table';
import { Text } from '../../Text';
import { computeAggregate, formatAggregate, getColumnAlign } from '../utils';
import type { DataTableColumn } from '../types';
import { AGGREGATE_ROW_MIN_HEIGHT, type DataTableColors, type Density } from './shared';

// Deterministic "random" skeleton widths (40–99%) so placeholders don't jump on re-render.
const skeletonWidth = (row: number, col: number): `${number}%` => `${40 + ((row * 37 + col * 17) % 60)}%`;

export interface DataTableSkeletonProps<T> {
  colors: DataTableColors;
  columns: DataTableColumn<T>[];
  columnWidths: Record<string, number | string>;
  selectable: boolean;
  expandable: boolean;
  rowCount: number;
  hoverHighlight: boolean;
  /** Skeleton placeholders (default) or a single "Loading…" row. */
  enhanced: boolean;
}

/** Loading placeholder rows (header + body) rendered while `loading`. */
export function DataTableSkeleton<T>({
  colors,
  columns,
  columnWidths,
  selectable,
  expandable,
  rowCount,
  hoverHighlight,
  enhanced,
}: DataTableSkeletonProps<T>) {
  const block = (style: ViewStyle, fill: string) => <View style={[styles.skeletonBlock, style, { backgroundColor: fill }]} />;

  if (!enhanced) {
    return (
      <TableTr>
        <TableTd style={styles.center}>
          <Text variant="p" c="muted">
            Loading…
          </Text>
        </TableTd>
      </TableTr>
    );
  }

  return (
    <>
      <TableTr style={{ backgroundColor: colors.headerBg }}>
        {selectable && <TableTh w={50}>{block(styles.skeletonSquare, colors.strongBorder)}</TableTh>}
        {expandable && <TableTh w={50}>{block(styles.skeletonSquare, colors.strongBorder)}</TableTh>}
        {columns.map((column) => (
          <TableTh key={column.key} w={column.width || columnWidths[column.key]} miw={column.minWidth}>
            {block(styles.skeletonHeader, colors.strongBorder)}
          </TableTh>
        ))}
      </TableTr>

      {Array.from({ length: rowCount }).map((_, index) => (
        <TableTr key={index} hoverable={hoverHighlight} hoverColor={colors.hoverBg}>
          {selectable && <TableTd>{block(styles.skeletonSquare, colors.stripeBg)}</TableTd>}
          {expandable && <TableTd>{block(styles.skeletonSquare, colors.stripeBg)}</TableTd>}
          {columns.map((column, colIdx) => (
            <TableTd key={column.key}>
              {block({ height: 16, width: skeletonWidth(index, colIdx), opacity: 0.8 - index * 0.1 }, colors.stripeBg)}
            </TableTd>
          ))}
        </TableTr>
      ))}
    </>
  );
}

export interface DataTableEmptyRowProps {
  colors: DataTableColors;
  emptyMessage: string;
  /** Illustrated empty state (default) or a plain message row. */
  enhanced: boolean;
}

/** The body shown when there are no rows to display. */
export function DataTableEmptyRow({ colors, emptyMessage, enhanced }: DataTableEmptyRowProps) {
  if (!enhanced) {
    return (
      <TableTr>
        <TableTd style={styles.center}>
          <Text variant="p" c="muted" style={styles.centerText}>
            {emptyMessage}
          </Text>
        </TableTd>
      </TableTr>
    );
  }

  return (
    <TableTr>
      <TableTd style={styles.center}>
        <View style={styles.center}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.stripeBg }]}>
            <Icon name="menu" size={24} color={colors.iconMuted} decorative />
          </View>
          <Text variant="h6" c="muted" style={styles.emptyTitle}>
            No Data Available
          </Text>
          <Text variant="p" c="muted" style={[styles.centerText, styles.emptyMessage]}>
            {emptyMessage || 'There are no items to display. Try adjusting your filters or add some data.'}
          </Text>
        </View>
      </TableTd>
    </TableTr>
  );
}

/** The error panel that replaces the table body while `error` is set. */
export function DataTableError({ message }: { message: string }) {
  const theme = useTheme();
  return (
    <View
      role="alert"
      style={[
        styles.center,
        styles.errorPanel,
        {
          backgroundColor: theme.colors.error[0],
          borderColor: theme.colors.error[2],
          borderRadius: resolveRadius(theme, 'lg'),
        },
      ]}
    >
      <Icon name="error" size={32} color={theme.colors.error[5]} decorative style={styles.errorIcon} />
      <Text variant="h6" c={theme.colors.error[7]} style={styles.errorTitle}>
        Error Loading Data
      </Text>
      <Text variant="p" c="muted" style={styles.centerText}>
        {message}
      </Text>
    </View>
  );
}

export interface DataTableAggregateRowProps<T> {
  colors: DataTableColors;
  density: Density;
  columns: DataTableColumn<T>[];
  rows: T[];
  label: React.ReactNode;
  selectable: boolean;
  expandable: boolean;
  hasActions: boolean;
  actionsColumnWidth: number;
  columnDividerStyle: (colIdx: number) => ViewStyle | null;
  /** Grid semantics (interactive table). */
  grid: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  isFooter?: boolean;
}

/**
 * A group-header or footer-totals row: helper-cell placeholders, then the label
 * (with the group toggle) in the first data column and each aggregate column's
 * value in its own cell, so totals line up under their columns.
 */
export function DataTableAggregateRow<T>({
  colors,
  density,
  columns,
  rows,
  label,
  selectable,
  expandable,
  hasActions,
  actionsColumnWidth,
  columnDividerStyle,
  grid,
  expanded,
  onToggle,
  isFooter,
}: DataTableAggregateRowProps<T>) {
  const bg = isFooter ? colors.headerBg : colors.stripeBg;
  const cellRole = a11yProps({ role: grid ? 'gridcell' : 'cell' });
  const helperStyle = [styles.noBottomBorder, columnDividerStyle(-1)];

  return (
    <TableTr
      style={{
        backgroundColor: bg,
        borderTopWidth: isFooter ? 2 : 0,
        borderTopColor: colors.strongBorder,
        borderBottomWidth: 1,
        borderBottomColor: colors.hairline,
        minHeight: AGGREGATE_ROW_MIN_HEIGHT[density],
      }}
    >
      {selectable && <TableTd {...cellRole} style={helperStyle} />}
      {expandable && <TableTd {...cellRole} style={helperStyle} />}
      {columns.map((column, colIdx) => {
        const aggregate =
          column.aggregate !== undefined ? formatAggregate(column, computeAggregate(column.aggregate, rows, column)) : null;
        return (
          <TableTd
            key={column.key}
            {...cellRole}
            align={getColumnAlign(column)}
            style={[styles.noBottomBorder, columnDividerStyle(colIdx), { backgroundColor: bg }]}
          >
            {colIdx === 0 ? (
              <Pressable
                onPress={onToggle}
                disabled={!onToggle}
                {...(onToggle ? a11yProps({ role: 'button', expanded: !!expanded }) : null)}
                {...(isWeb && !onToggle ? { tabIndex: -1 as const } : null)}
                style={styles.groupToggle}
              >
                {onToggle && (
                  <Icon name={expanded ? 'chevron-down' : 'chevron-right'} size={14} color={colors.icon} decorative />
                )}
                {typeof label === 'string' || typeof label === 'number' ? (
                  <Text fw="semibold" style={{ color: colors.text }}>
                    {label}
                  </Text>
                ) : (
                  label
                )}
              </Pressable>
            ) : aggregate != null ? (
              <Text fw={isFooter ? 'semibold' : 'medium'} style={{ color: colors.text }}>
                {aggregate}
              </Text>
            ) : null}
          </TableTd>
        );
      })}
      {hasActions && <TableTd {...cellRole} style={[styles.noBottomBorder, { width: actionsColumnWidth }]} />}
    </TableTr>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  emptyIcon: {
    alignItems: 'center',
    borderRadius: 32,
    justifyContent: 'center',
    width: 64,
  },
  emptyMessage: {
    maxWidth: 280,
  },
  emptyTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  errorIcon: {
    marginBottom: 12,
  },
  errorPanel: {
    borderWidth: 1,
  },
  errorTitle: {
    marginBottom: 8,
  },
  groupToggle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  noBottomBorder: {
    borderBottomWidth: 0,
  },
  skeletonBlock: {
    borderRadius: 4,
  },
  skeletonHeader: {
    height: 20,
    width: '70%',
  },
  skeletonSquare: {
    height: 20,
    width: 20,
  },
});
