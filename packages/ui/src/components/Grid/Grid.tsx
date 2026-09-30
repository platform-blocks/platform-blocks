import React, { useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { factory } from '../../core/factory/factory';
import { isWeb } from '../../core/platform/flags';
import { useViewport } from '../../core/responsive';
import { breakpointsFromTheme, resolveResponsiveProp } from '../../core/theme/breakpoints';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveSpacing } from '../../core/theme/tokens';
import type { PlocksTheme, SizeValue } from '../../core/theme/types';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { gridCellCss, gridColumnsCss } from './gridCss';
import type { GridProps, GridItemProps } from './types';
export type { GridProps, GridItemProps } from './types';

/**
 * A rule for one grid or one cell shape.
 *
 * React hoists these into the document head and keeps one copy per `href`, on
 * the server and in the browser alike — so a page full of identical grids emits
 * its tracks once, and the prerender and the hydration agree on the result
 * without either of them having to know the viewport.
 */
const GridRule = ({ name, css }: { name: string; css: string }) => (
  <style href={`plocks-grid-${name}`} precedence="default" dangerouslySetInnerHTML={{ __html: css }} />
);

/**
 * The viewport width, for native only: on web the browser packs the rows from
 * CSS, so the grid doesn't re-render on resize. (`isWeb` is a module constant,
 * so every render calls the same hooks.)
 */
const useNativeViewportWidth: () => number = isWeb ? () => 0 : () => useViewport().width;

const spacingValue = (theme: PlocksTheme, value: SizeValue): number => {
  const resolved = resolveSpacing(theme, value);
  return typeof resolved === 'number' ? resolved : 0;
};

const styles = StyleSheet.create({
  webGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  // Only what does not vary by viewport: the basis itself comes from the rule,
  // which is the one thing that may.
  webCell: { flexGrow: 0, flexShrink: 0, minWidth: 0 },
  fullWidth: { width: '100%' },
  row: { flexDirection: 'row' },
  item: { flex: 1 },
});

interface GridCell {
  key: React.Key;
  span: number;
  child: React.ReactNode;
}

/**
 * Sizing for one cell in a row laid out with `columnGap`.
 *
 * `flexBasis` carries the gaps a multi-track cell swallows, so the grow ratio
 * only ever splits bare track width. A cell then measures exactly
 * `span * track + (span - 1) * gap` — the same tracks in every row, whatever
 * mix of spans a row happens to hold.
 */
const cellStyle = (span: number, columnGap: number): ViewStyle => ({
  flexGrow: span,
  flexShrink: 1,
  flexBasis: Math.max(span - 1, 0) * columnGap,
  minWidth: 0,
});

export const Grid = factory<{ props: GridProps; ref: View }>(
  (props, ref) => {
    const width = useNativeViewportWidth();
    const theme = useTheme();
    const breakpoints = breakpointsFromTheme(theme);
    const { styleProps, otherProps } = extractStyleProps(props);
    const {
      columns = 12,
      gap = 0,
      rowGap,
      columnGap,
      fullWidth = false,
      children,
      style,
      testID,
      ...rest
    } = otherProps;

    const resolvedGap = spacingValue(theme, gap);
    const resolvedRowGap = rowGap !== undefined ? spacingValue(theme, rowGap) : resolvedGap;
    const resolvedColumnGap = columnGap !== undefined ? spacingValue(theme, columnGap) : resolvedGap;
    const gapStyle = useMemo(
      () => ({ rowGap: resolvedRowGap, columnGap: resolvedColumnGap }),
      [resolvedRowGap, resolvedColumnGap]
    );

    const spacingStyle = useStyleProps(styleProps);

    // WEB — the browser packs the rows.
    //
    // Every child is a cell in one flat list, and where the rows break follows
    // from the track width the cells inherit. Nothing here reads the viewport,
    // so this markup is what a prerender emits *and* what the client hydrates,
    // at every width. The JavaScript path below still runs on native, which has
    // a viewport from its first render and no CSS to defer to.
    if (isWeb) {
      const track = gridColumnsCss(columns, breakpoints);
      const cells = React.Children.toArray(children).map((child, index) => {
        const cell = gridCellCss(
          React.isValidElement<GridItemProps>(child) ? child.props.span : 1,
          resolvedColumnGap,
          breakpoints
        );
        return {
          key: React.isValidElement(child) && child.key !== null ? child.key : index,
          cell,
          child,
        };
      });
      // Deduped by name so a grid of twenty identical cells emits one rule.
      const rules = new Map<string, string>([[track.name, track.css]]);
      cells.forEach(({ cell }) => rules.set(cell.name, cell.css));

      return (
        <View
          {...rest}
          ref={ref}
          testID={testID}
          dataSet={{ plocksGrid: track.name }}
          style={[styles.webGrid, gapStyle, fullWidth && styles.fullWidth, spacingStyle, style]}
        >
          {Array.from(rules, ([name, css]) => (
            <GridRule key={name} name={name} css={css} />
          ))}
          {cells.map(({ key, cell, child }) => (
            <View key={key} dataSet={{ plocksGridCell: cell.name }} style={styles.webCell}>
              {child}
            </View>
          ))}
        </View>
      );
    }

    const resolvedColumns = resolveResponsiveProp(columns, width, breakpoints) ?? 12;

    // Pack children into rows up front so gutters can be plain `rowGap` /
    // `columnGap` on the containers. Letting a single wrapping row handle it
    // would mean percentage widths that no longer fit once a gap sits between
    // them — which is what the padding-per-cell gutter used to work around.
    const rows: GridCell[][] = [];
    let filled = resolvedColumns; // Forces the first cell to open a row.

    React.Children.toArray(children).forEach((child, index) => {
      const declaredSpan = React.isValidElement<GridItemProps>(child)
        ? resolveResponsiveProp(child.props.span, width, breakpoints)
        : 1;
      const span = Math.min(Math.max(declaredSpan || 1, 1), resolvedColumns);

      if (filled + span > resolvedColumns) {
        rows.push([]);
        filled = 0;
      }

      rows[rows.length - 1].push({
        key: React.isValidElement(child) && child.key !== null ? child.key : index,
        span,
        child,
      });
      filled += span;
    });

    const rowStyle = [styles.row, { columnGap: resolvedColumnGap }];

    return (
      <View
        {...rest}
        ref={ref}
        style={[{ rowGap: resolvedRowGap }, fullWidth && styles.fullWidth, spacingStyle, style]}
        testID={testID}
      >
        {rows.map((row, rowIndex) => {
          const remainder = resolvedColumns - row.reduce((total, cell) => total + cell.span, 0);

          return (
            <View key={rowIndex} style={rowStyle}>
              {row.map(({ key, span, child }) => (
                <View key={key} style={cellStyle(span, resolvedColumnGap)}>
                  {child}
                </View>
              ))}
              {/* Holds the unused tracks open so a short last row keeps its
                  cells on the same tracks as the rows above it. */}
              {remainder > 0 && <View style={cellStyle(remainder, resolvedColumnGap)} />}
            </View>
          );
        })}
      </View>
    );
  },
  { displayName: 'Grid' }
);

export const GridItem = factory<{ props: GridItemProps; ref: View }>(
  (props, ref) => {
    const { styleProps, otherProps } = extractStyleProps(props);
    // `span` is read by the parent Grid from this element's props.
    const { children, style, testID, span: _span, ...rest } = otherProps;

    const spacingStyle = useStyleProps(styleProps);

    return (
      <View {...rest} ref={ref} style={[spacingStyle, style, styles.item]} testID={testID}>
        {children}
      </View>
    );
  },
  { displayName: 'GridItem' }
);
