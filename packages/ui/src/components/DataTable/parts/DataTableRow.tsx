import React, { memo } from 'react';
import { Pressable, TextInput, View, StyleSheet, type ViewStyle } from 'react-native';

import { a11yProps } from '../../../core/accessibility/a11yProps';
import { isWeb } from '../../../core/platform/flags';
import { webStyle } from '../../../core/platform/webStyle';
import type { WebKeyboardEvent } from '../../../core/platform/webProps';
import { mergeSlotProps } from '../../../core/utils/mergeSlotProps';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { resolveFontSize } from '../../../core/theme/tokens';
import { Checkbox } from '../../Checkbox';
import { Collapse } from '../../Collapse';
import { Icon } from '../../Icon';
import { TableTd, TableTr } from '../../Table';
import { Text, type TextProps } from '../../Text';
import { Tooltip, getTooltipText, resolveTooltipProps } from '../../Tooltip';
import { formatValue, getColumnAlign, getValue, isNumericType } from '../utils';
import type {
  DataTableColumn,
  DataTableProps,
  DataTableRowFeatures,
  DataTableRowId,
  DataTableValue,
} from '../types';
import type { ColumnWidths } from '../hooks/useColumnLayout';
import { ROW_MIN_HEIGHT, sideBorderStyle, type BorderLineStyle, type DataTableColors, type Density } from './shared';

/**
 * Everything a body row needs that is shared by all rows. DataTable memoizes
 * it on layout / config only — never on selection, expansion, focus or edit
 * state, which are per-row props — so toggling one row re-renders one row.
 */
export interface RowSharedProps<T> {
  columns: DataTableColumn<T>[];
  columnWidths: ColumnWidths;
  colors: DataTableColors;
  density: Density;
  striped: boolean;
  hoverHighlight: boolean;
  enhancedSelection: boolean;
  rowDividerWidth: number;
  rowBorderStyle: BorderLineStyle;
  selectable: boolean;
  rowFeatureToggle?: DataTableProps<T>['rowFeatureToggle'];
  expandableRowRender?: DataTableProps<T>['expandableRowRender'];
  expandIcon?: React.ReactNode;
  collapseIcon?: React.ReactNode;
  rowActions?: DataTableProps<T>['rowActions'];
  actionsColumnWidth: number;
  cellTextProps?: Omit<TextProps, 'children'>;
  columnDividerStyle: (colIdx: number) => ViewStyle | null;
  getStickyCellStyle: (column: DataTableColumn<T>, bg: string) => ViewStyle | null;
  /** Grid semantics (interactive table): gridcell cells, aria-selected rows. */
  grid: boolean;
  /** Cells are pressable (row click / edit mode). */
  interactiveCells: boolean;
  /** Helper columns before the data columns (select / expand), for aria-colindex. */
  helperColsBefore: number;
  totalColCount: number;
  /** aria-rowindex of the first body row. */
  firstRowAriaIndex: number;
  reportRowIndex: boolean;
  /** Row number offset for "Select row n" labels (rows on previous pages). */
  rowNumberOffset: number;
  navEnabled: boolean;
  getCellRef: (index: number) => (node: unknown) => void;
  onCellKeyDown: (event: WebKeyboardEvent, index: number) => void;
  onCellFocus: (index: number) => void;
  onToggleRow: (rowId: DataTableRowId) => void;
  onToggleExpand: (rowId: DataTableRowId) => void;
  onActivateCell: (rowIndex: number, columnKey: string) => void;
  onEditChange: (value: string) => void;
  onEditCommit: () => void;
  onEditCancel: () => void;
}

export interface DataTableRowProps<T> {
  shared: RowSharedProps<T>;
  row: T;
  rowIndex: number;
  rowId: DataTableRowId;
  selected: boolean;
  expanded: boolean;
  /** Column index holding the roving tab stop in this row, or -1. */
  activeCol: number;
  /** Key of the column being edited in this row, or null. */
  editingColumn: string | null;
  /** Editor value (only meaningful while `editingColumn` is set). */
  editValue?: DataTableValue;
}

const EMPTY_FEATURES: DataTableRowFeatures = {};

// `left` keeps the natural (start) alignment so it follows the layout direction.
const TEXT_ALIGN = { left: undefined, center: 'center', right: 'right' } as const;

function DataTableRowInner<T>({
  shared,
  row,
  rowIndex,
  rowId,
  selected,
  expanded,
  activeCol,
  editingColumn,
  editValue,
}: DataTableRowProps<T>) {
  const theme = useTheme();
  const {
    columns,
    columnWidths,
    colors,
    density,
    striped,
    selectable,
    expandableRowRender,
    rowActions,
    grid,
    interactiveCells,
    helperColsBefore,
    navEnabled,
  } = shared;

  const features = shared.rowFeatureToggle?.(row, rowIndex) || EMPTY_FEATURES;
  const rowSelectable = selectable && features.selectable !== false;
  const isStripe = striped && rowIndex % 2 === 1;
  const totalColumns = (selectable ? 1 : 0) + (expandableRowRender ? 1 : 0) + columns.length + (rowActions ? 1 : 0);
  const cellRole = grid ? 'gridcell' : 'cell';

  // Opaque background for pinned cells so scrolled columns don't show through
  // the frozen region. Mirrors the row's own background (selected / striped /
  // base surface). Hover tint is intentionally not mirrored here.
  const stickyRowBg = selected ? colors.selectedBg : isStripe ? colors.stripeBg : colors.surfaceBg;

  const renderContent = (column: DataTableColumn<T>) => {
    const value = getValue(row, column.accessor);

    if (editingColumn === column.key && column.editable) {
      return (
        <TextInput
          value={String(editValue ?? '')}
          onChangeText={shared.onEditChange}
          onBlur={shared.onEditCommit}
          onSubmitEditing={shared.onEditCommit}
          onKeyPress={(event) => {
            if (event.nativeEvent.key === 'Escape') shared.onEditCancel();
          }}
          autoFocus
          aria-label={typeof column.header === 'string' ? `Edit ${column.header}` : undefined}
          dataSet={{ plocksInput: 'true' }}
          style={[
            styles.editor,
            {
              borderColor: colors.accent,
              backgroundColor: colors.surfaceBg,
              color: colors.text,
              fontSize: resolveFontSize(theme, 'md'),
            },
          ]}
        />
      );
    }

    if (column.cell) return column.cell(value, row, rowIndex);

    const numeric = isNumericType(column.dataType);
    return (
      <Text
        {...mergeSlotProps(
          {
            variant: 'p' as const,
            style: [
              { textAlign: TEXT_ALIGN[getColumnAlign(column)], color: colors.text },
              // Let long unbroken tokens (emails, urls, ids) wrap instead of
              // overflowing into the neighbouring cell. Native already breaks them.
              webStyle({ wordBreak: 'break-word', overflowWrap: 'anywhere' }),
              numeric && isWeb ? styles.tabularNums : null,
            ],
          },
          shared.cellTextProps
        )}
      >
        {formatValue(value, column.dataType)}
      </Text>
    );
  };

  return (
    <>
      <TableTr
        selected={selected}
        hoverable={shared.hoverHighlight}
        hoverColor={colors.hoverBg}
        bg={selected ? undefined : isStripe ? colors.stripeBg : 'transparent'}
        {...a11yProps({ role: 'row', selected: grid && rowSelectable ? selected : undefined })}
        {...(isWeb && shared.reportRowIndex ? { 'aria-rowindex': shared.firstRowAriaIndex + rowIndex } : null)}
        style={[
          {
            borderStartWidth: shared.enhancedSelection ? 2 : 0,
            borderStartColor: selected ? colors.accent : 'transparent',
            borderBottomWidth: shared.rowDividerWidth,
            borderBottomColor: colors.rowBorder,
            minHeight: ROW_MIN_HEIGHT[density],
          },
          sideBorderStyle('bottom', shared.rowBorderStyle),
        ]}
      >
        {selectable && (
          <TableTd
            {...a11yProps({ role: cellRole })}
            {...(isWeb ? { 'aria-colindex': 1 } : null)}
            style={[styles.noBottomBorder, shared.columnDividerStyle(-1)]}
          >
            <Checkbox
              size="sm"
              checked={selected}
              disabled={!rowSelectable}
              onChange={() => {
                if (rowSelectable) shared.onToggleRow(rowId);
              }}
              accessibilityLabel={`Select row ${shared.rowNumberOffset + rowIndex + 1}`}
            />
          </TableTd>
        )}

        {expandableRowRender && (
          <TableTd
            {...a11yProps({ role: cellRole })}
            {...(isWeb ? { 'aria-colindex': selectable ? 2 : 1 } : null)}
            style={[styles.noBottomBorder, shared.columnDividerStyle(-1)]}
          >
            <Pressable
              onPress={() => shared.onToggleExpand(rowId)}
              {...a11yProps({ role: 'button', label: expanded ? 'Collapse row' : 'Expand row', expanded })}
              hitSlop={10}
              style={styles.expandButton}
            >
              {expanded
                ? collapseIconOr(shared.collapseIcon, colors.icon)
                : expandIconOr(shared.expandIcon, colors.icon)}
            </Pressable>
          </TableTd>
        )}

        {columns.map((column, colIdx) => {
          const width = columnWidths[column.key];
          const cellStyle: Array<ViewStyle | null> = [
            styles.bodyCell,
            {
              // Honor the column's min/max width so the body cell stays aligned
              // with its header (which applies the same bounds); overflow is
              // clipped so wide content never overlaps the adjacent column.
              minWidth: column.minWidth ?? 0,
              maxWidth: column.maxWidth,
              width: typeof width === 'number' ? width : undefined,
            },
            shared.getStickyCellStyle(column, stickyRowBg),
          ];
          const cellA11y = {
            ...a11yProps({ role: cellRole }),
            ...(isWeb ? { 'aria-colindex': helperColsBefore + colIdx + 1 } : null),
          };
          const content = (
            <TableTd
              role="none"
              align={getColumnAlign(column)}
              // Row separation is owned by the row border logic; suppress the
              // cell's default hairline so it doesn't draw an extra divider.
              style={[styles.noBottomBorder, shared.columnDividerStyle(colIdx)]}
            >
              {renderContent(column)}
            </TableTd>
          );

          if (!interactiveCells) {
            return (
              <View key={column.key} {...cellA11y} style={cellStyle}>
                {content}
              </View>
            );
          }

          if (!grid) {
            return (
              <View key={column.key} {...cellA11y} style={cellStyle}>
                <Pressable
                  onPress={() => shared.onActivateCell(rowIndex, column.key)}
                  {...a11yProps({
                    role: 'button',
                    label: `${typeof column.header === 'string' ? column.header : 'Cell'}, row ${shared.rowNumberOffset + rowIndex + 1}: ${formatValue(getValue(row, column.accessor), column.dataType)}`,
                  })}
                  style={styles.pressableCell}
                >
                  {content}
                </Pressable>
              </View>
            );
          }

          const index = rowIndex * columns.length + colIdx;
          return (
            <Pressable
              key={column.key}
              onPress={() => shared.onActivateCell(rowIndex, column.key)}
              {...cellA11y}
              {...(navEnabled
                ? {
                    ref: shared.getCellRef(index),
                    tabIndex: activeCol === colIdx ? 0 : -1,
                    onKeyDown: (event: WebKeyboardEvent) => shared.onCellKeyDown(event, index),
                    onFocus: () => shared.onCellFocus(index),
                  }
                : null)}
              style={cellStyle}
            >
              {content}
            </Pressable>
          );
        })}

        {rowActions && (
          <TableTd
            align="center"
            {...a11yProps({ role: cellRole })}
            {...(isWeb ? { 'aria-colindex': shared.totalColCount } : null)}
            style={[styles.noBottomBorder, { width: shared.actionsColumnWidth }]}
          >
            <View style={styles.actions}>
              {rowActions(row, rowIndex)
                ?.filter((action) => !action.hidden)
                .map((action) => {
                  const button = (
                    <Pressable
                      onPress={() => action.onPress?.(row, rowIndex)}
                      disabled={action.disabled}
                      {...a11yProps({
                        role: 'button',
                        label: action.label || getTooltipText(action.tooltip) || action.key,
                        disabled: action.disabled,
                      })}
                      style={({ pressed }) => [
                        styles.actionButton,
                        {
                          opacity: action.disabled ? 0.4 : pressed ? 0.6 : 1,
                          backgroundColor: pressed ? colors.pressedBg : 'transparent',
                        },
                      ]}
                    >
                      {action.icon || <Icon name="menu" size={16} color={colors.iconMuted} decorative />}
                    </Pressable>
                  );
                  const actionTooltip = resolveTooltipProps(action.tooltip);
                  return actionTooltip ? (
                    <Tooltip key={action.key} {...actionTooltip}>
                      {button}
                    </Tooltip>
                  ) : (
                    <React.Fragment key={action.key}>{button}</React.Fragment>
                  );
                })}
            </View>
          </TableTd>
        )}
      </TableTr>

      {expandableRowRender && (
        <TableTr style={styles.noBottomBorder}>
          <TableTd
            colSpan={totalColumns}
            {...a11yProps({ role: cellRole })}
            style={[styles.expandedPanel, { backgroundColor: colors.stripeBg }]}
          >
            <Collapse isCollapsed={!expanded} duration={250}>
              <View style={styles.expandedContent}>{expandableRowRender(row, rowIndex)}</View>
            </Collapse>
          </TableTd>
        </TableTr>
      )}
    </>
  );
}

function expandIconOr(icon: React.ReactNode, color: string) {
  return icon || <Icon name="chevron-right" size={16} color={color} decorative />;
}

function collapseIconOr(icon: React.ReactNode, color: string) {
  return icon || <Icon name="chevron-down" size={16} color={color} decorative />;
}

/**
 * One body row (plus its expandable detail row). Memoized: rows re-render only
 * when their own row / selection / expansion / focus / edit props, or the
 * shared layout, change.
 */
export const DataTableRow = memo(DataTableRowInner) as <T>(props: DataTableRowProps<T>) => React.ReactElement;

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 8,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'flex-end',
  },
  bodyCell: {
    flex: 1,
    overflow: 'hidden',
  },
  editor: {
    borderRadius: 4,
    borderWidth: 1,
  },
  expandButton: {
    alignItems: 'center',
    borderRadius: 4,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  expandedContent: {
    padding: 16,
  },
  expandedPanel: {
    borderBottomWidth: 0,
    padding: 0,
  },
  noBottomBorder: {
    borderBottomWidth: 0,
  },
  pressableCell: {
    flex: 1,
  },
  tabularNums: {
    fontVariant: ['tabular-nums'],
  },
});
