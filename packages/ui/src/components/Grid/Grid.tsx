import React from 'react';
import { Platform, View, ViewStyle, useWindowDimensions } from 'react-native';

import { factory, Factory } from '../../core/factory';
import { SpacingProps, getSpacingStyles } from '../../core/utils/spacing';
import { getSpacing } from '../../core/theme/sizes';
import { resolveResponsiveProp } from '../../core/theme/breakpoints';
import { gridCellCss, gridColumnsCss } from './gridCss';
import type { GridProps, GridItemProps } from './types';
export type { GridProps, GridItemProps } from './types';

const web = Platform.OS === 'web';

/**
 * A rule for one grid or one cell shape.
 *
 * React hoists these into the document head and keeps one copy per `href`, on
 * the server and in the browser alike — so a page full of identical grids emits
 * its tracks once, and the prerender and the hydration agree on the result
 * without either of them having to know the viewport.
 */
const GridRule: React.FC<{ name: string; css: string }> = ({ name, css }) =>
  React.createElement('style', {
    href: `pb-grid-${name}`,
    precedence: 'default',
    dangerouslySetInnerHTML: { __html: css },
  } as any);

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

export const Grid = factory<Factory<{ props: GridProps; ref: View }>>(
  (props, ref) => {
    const { width } = useWindowDimensions();
    const {
      columns = 12,
      gap = 0,
      rowGap,
      columnGap,
      fullWidth = false,
      children,
      style,
      testID,
      ...spacingProps
    } = props;

    const resolvedColumns = resolveResponsiveProp(columns, width) ?? 12;
    const resolvedGap = getSpacing(gap);
    const resolvedRowGap = rowGap !== undefined ? getSpacing(rowGap) : resolvedGap;
    const resolvedColumnGap = columnGap !== undefined ? getSpacing(columnGap) : resolvedGap;

    const spacingStyle = getSpacingStyles(spacingProps);

    // WEB — the browser packs the rows.
    //
    // Every child is a cell in one flat list, and where the rows break follows
    // from the track width the cells inherit. Nothing here reads the viewport,
    // so this markup is what a prerender emits *and* what the client hydrates,
    // at every width. The JavaScript path below still runs on native, which has
    // a viewport from its first render and no CSS to defer to.
    if (web) {
      const track = gridColumnsCss(columns);
      const cells = React.Children.toArray(children).map((child, index) => {
        const cell = gridCellCss(
          React.isValidElement<GridItemProps>(child) ? child.props.span : 1,
          resolvedColumnGap
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
          ref={ref}
          testID={testID}
          {...({ dataSet: { pbGrid: track.name } } as any)}
          style={[
            {
              flexDirection: 'row',
              flexWrap: 'wrap',
              rowGap: resolvedRowGap,
              columnGap: resolvedColumnGap,
              ...(fullWidth && { width: '100%' as const }),
            },
            spacingStyle,
            style,
          ]}
        >
          {Array.from(rules, ([name, css]) => (
            <GridRule key={name} name={name} css={css} />
          ))}
          {cells.map(({ key, cell, child }) => (
            <View
              key={key}
              {...({ dataSet: { pbGridCell: cell.name } } as any)}
              // Only what does not vary by viewport: the basis itself comes
              // from the rule, which is the one thing that may.
              style={{ flexGrow: 0, flexShrink: 0, minWidth: 0 }}
            >
              {child}
            </View>
          ))}
        </View>
      );
    }

    // Pack children into rows up front so gutters can be plain `rowGap` /
    // `columnGap` on the containers. Letting a single wrapping row handle it
    // would mean percentage widths that no longer fit once a gap sits between
    // them — which is what the padding-per-cell gutter used to work around.
    const rows: GridCell[][] = [];
    let filled = resolvedColumns; // Forces the first cell to open a row.

    React.Children.toArray(children).forEach((child, index) => {
      const declaredSpan = React.isValidElement<GridItemProps>(child)
        ? resolveResponsiveProp(child.props.span, width)
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

    const containerStyle: ViewStyle = {
      rowGap: resolvedRowGap,
      ...(fullWidth && { width: '100%' }),
    };

    return (
      <View
        ref={ref}
        style={[containerStyle, spacingStyle, style]}
        testID={testID}
      >
        {rows.map((row, rowIndex) => {
          const remainder = resolvedColumns - row.reduce((total, cell) => total + cell.span, 0);

          return (
            <View key={rowIndex} style={{ flexDirection: 'row', columnGap: resolvedColumnGap }}>
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
  }
);

export const GridItem = factory<Factory<{ props: GridItemProps; ref: View }>>(
  (props, ref) => {
    const {
      children,
      style,
      testID,
      ...spacingProps
    } = props;

    const spacingStyle = getSpacingStyles(spacingProps);

    return (
      <View
        ref={ref}
        style={[spacingStyle, style, {flex: 1}]}
        testID={testID}
      >
        {children}
      </View>
    );
  }
);
