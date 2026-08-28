import React from 'react';
import { render } from '@testing-library/react-native';
import { Text as RNText } from 'react-native';

jest.mock('../../../core/theme/breakpoints', () => {
  const actual = jest.requireActual('../../../core/theme/breakpoints');
  return {
    ...actual,
    resolveResponsiveProp: jest.fn(actual.resolveResponsiveProp),
  };
});

import { Grid, GridItem } from '../Grid';
import { resolveResponsiveProp } from '../../../core/theme/breakpoints';

const resolveResponsivePropMock = resolveResponsiveProp as jest.Mock;

const flattenStyle = (style: any): Record<string, any> => {
  if (!style) return {};
  if (Array.isArray(style)) {
    return style.reduce((acc, item) => ({ ...acc, ...flattenStyle(item) }), {});
  }
  return typeof style === 'object' ? style : {};
};

/** Rows are the grid's direct children; cells are the rows' children. */
const getRows = (tree: any) => (Array.isArray(tree?.children) ? tree.children : []);
const getCells = (row: any) => (Array.isArray(row?.children) ? row.children : []);

afterEach(() => {
  resolveResponsivePropMock.mockClear();
});

describe('Grid - behavior', () => {
  it('sizes cells from their span and lets the row gap carry the gutter', () => {
    const view = render(
      <Grid gap="md">
        <GridItem span={6}>
          <RNText>First</RNText>
        </GridItem>
        <GridItem span={3}>
          <RNText>Second</RNText>
        </GridItem>
      </Grid>
    );

    const rows = getRows(view.toJSON());
    expect(rows).toHaveLength(1);
    expect(flattenStyle(rows[0]?.props?.style).columnGap).toBe(12);

    const cells = getCells(rows[0]);
    const firstCellStyle = flattenStyle(cells[0]?.props?.style);
    const secondCellStyle = flattenStyle(cells[1]?.props?.style);

    // flexBasis holds the gaps the cell spans over; grow splits the tracks.
    expect(firstCellStyle.flexGrow).toBe(6);
    expect(firstCellStyle.flexBasis).toBe(60); // (6 - 1) * 12
    expect(secondCellStyle.flexGrow).toBe(3);
    expect(secondCellStyle.flexBasis).toBe(24); // (3 - 1) * 12

    // No padding or margin on the cells — the row's columnGap is the gutter.
    expect(firstCellStyle.paddingHorizontal).toBeUndefined();
    expect(firstCellStyle.marginBottom).toBeUndefined();
  });

  it('holds the unused tracks of a short row open with a spacer', () => {
    const view = render(
      <Grid gap="md" columns={12}>
        <GridItem span={4}>
          <RNText>Alone</RNText>
        </GridItem>
      </Grid>
    );

    const cells = getCells(getRows(view.toJSON())[0]);
    expect(cells).toHaveLength(2);
    expect(flattenStyle(cells[1]?.props?.style).flexGrow).toBe(8); // 12 - 4
  });

  it('wraps onto a new row once the columns are used up', () => {
    const view = render(
      <Grid gap="sm" columns={4}>
        <GridItem span={3}>
          <RNText>First</RNText>
        </GridItem>
        <GridItem span={2}>
          <RNText>Second</RNText>
        </GridItem>
        <GridItem span={2}>
          <RNText>Third</RNText>
        </GridItem>
      </Grid>
    );

    const rows = getRows(view.toJSON());
    expect(rows).toHaveLength(2);
    expect(getCells(rows[0])).toHaveLength(2); // span 3 + spacer
    expect(getCells(rows[1])).toHaveLength(2); // span 2 + span 2
  });

  it('applies fullWidth flag and spacing props to the container', () => {
    const { getByTestId } = render(
      <Grid fullWidth p="lg" testID="grid-root">
        <GridItem testID="child">
          <RNText>Only Child</RNText>
        </GridItem>
      </Grid>
    );

    const containerStyle = flattenStyle(getByTestId('grid-root').props.style);

    expect(containerStyle.width).toBe('100%');
    expect(containerStyle.paddingLeft).toBe(16);
    expect(containerStyle.paddingRight).toBe(16);
    // The container no longer cancels a cell gutter with a negative margin.
    expect(containerStyle.marginHorizontal).toBeUndefined();
  });

  it('respects breakpoint resolver outputs when computing spans', () => {
    resolveResponsivePropMock
      .mockImplementationOnce(() => 4) // resolvedColumns (render 1)
      .mockImplementationOnce(() => 4) // span (render 1)
      .mockImplementationOnce(() => 8) // resolvedColumns (render 2)
      .mockImplementationOnce(() => 2); // span (render 2)

    const utils = render(
      <Grid columns={{ base: 4, md: 8 }}>
        <GridItem span={{ base: 4, md: 2 }}>
          <RNText>Responsive</RNText>
        </GridItem>
      </Grid>
    );

    const getCellStyle = () => flattenStyle(getCells(getRows(utils.toJSON())[0])[0]?.props?.style);

    expect(getCellStyle().flexGrow).toBe(4);

    utils.rerender(
      <Grid columns={{ base: 4, md: 8 }}>
        <GridItem span={{ base: 4, md: 2 }}>
          <RNText>Responsive</RNText>
        </GridItem>
      </Grid>
    );

    expect(getCellStyle().flexGrow).toBe(2);
  });

  it('supports custom row and column gaps independent from the shared gap', () => {
    const view = render(
      <Grid gap="sm" rowGap="xl" columnGap="lg">
        <GridItem span={6}>
          <RNText>With row gap</RNText>
        </GridItem>
      </Grid>
    );

    const tree = view.toJSON() as any;
    expect(flattenStyle(tree?.props?.style).rowGap).toBe(20); // "xl"
    expect(flattenStyle(getRows(tree)[0]?.props?.style).columnGap).toBe(16); // "lg"
  });
});
