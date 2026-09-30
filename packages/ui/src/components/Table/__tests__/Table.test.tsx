import React from 'react';
import { ScrollView, Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { Table, TableTd, TableTh, TableTr } from '../Table';
import { ThemeScope } from '../../../core/theme/ThemeProvider';
import { DEFAULT_THEME } from '../../../core/theme/defaultTheme';

const wrap = (ui: React.ReactElement) => render(<ThemeScope>{ui}</ThemeScope>);

const flat = (style: unknown): Record<string, unknown> =>
  [style].flat(Infinity).reduce<Record<string, unknown>>((acc, s) => ({ ...acc, ...((s as object) || {}) }), {});

describe('Table', () => {
  it('renders head, body, foot and caption from `data`', () => {
    wrap(
      <Table
        testID="table"
        data={{
          head: ['Name', 'Plan'],
          body: [
            ['Ada', 'Pro'],
            ['Grace', 'Free'],
          ],
          foot: ['Total', '2'],
          caption: 'Accounts',
        }}
      />
    );
    ['Name', 'Plan', 'Ada', 'Pro', 'Grace', 'Free', 'Total', 'Accounts'].forEach((text) =>
      expect(screen.getByText(text)).toBeTruthy()
    );
    const table = screen.getByTestId('table');
    expect(table.props.role).toBe('table');
    // A string caption names the table.
    expect(table.props['aria-label']).toBe('Accounts');
  });

  it('gives each part its table role', () => {
    wrap(
      <Table>
        <Table.Thead testID="thead">
          <Table.Tr testID="tr">
            <Table.Th testID="th">Name</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td testID="td">Ada</Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    );
    expect(screen.getByTestId('thead').props.role).toBe('rowgroup');
    expect(screen.getByTestId('tr').props.role).toBe('row');
    expect(screen.getByTestId('th').props.role).toBe('columnheader');
    expect(screen.getByTestId('td').props.role).toBe('cell');
  });

  it('applies miw / maw to a cell', () => {
    wrap(
      <Table.Tr>
        <TableTh testID="a" miw={140} maw={300}>
          A
        </TableTh>
        <TableTd testID="b" miw={90}>
          B
        </TableTd>
      </Table.Tr>
    );
    expect(flat(screen.getByTestId('a').props.style)).toMatchObject({ minWidth: 140, maxWidth: 300 });
    expect(flat(screen.getByTestId('b').props.style)).toMatchObject({ minWidth: 90 });
  });

  it('sizes a cell with w and drops its flex sizing', () => {
    wrap(
      <Table.Tr>
        <TableTd testID="fixed" w={120} flex={2}>
          A
        </TableTd>
        <TableTd testID="flex" flex={2}>
          B
        </TableTd>
      </Table.Tr>
    );
    const fixed = flat(screen.getByTestId('fixed').props.style);
    expect(fixed.width).toBe(120);
    expect(fixed.flex).not.toBe(2);
    expect(flat(screen.getByTestId('flex').props.style).flex).toBe(2);
  });

  it('paints the row bg under the selected fill', () => {
    wrap(
      <>
        <TableTr testID="plain" bg="#ff0000">
          <TableTd>A</TableTd>
        </TableTr>
        <TableTr testID="selected" bg="#ff0000" selected>
          <TableTd>B</TableTd>
        </TableTr>
      </>
    );
    expect(flat(screen.getByTestId('plain').props.style).backgroundColor).toBe('#ff0000');
    expect(flat(screen.getByTestId('selected').props.style).backgroundColor).toBe(DEFAULT_THEME.backgrounds.selected);
  });

  it('applies ScrollContainer miw to the scrolled content and mah to the container', () => {
    const { UNSAFE_getAllByType } = wrap(
      <Table.ScrollContainer testID="scroll" miw={900} mah={300}>
        <Table />
      </Table.ScrollContainer>
    );
    const root = flat(screen.getByTestId('scroll').props.style);
    expect(root.maxHeight).toBe(300);
    expect(root.minWidth).toBeUndefined();
    const [horizontal] = UNSAFE_getAllByType(ScrollView);
    expect(flat(horizontal.props.contentContainerStyle).minWidth).toBe(900);
  });

  it('wraps only text children of a header cell in Text', () => {
    wrap(
      <Table.Tr>
        <TableTh testID="custom">
          <Text testID="inner">Custom</Text>
        </TableTh>
      </Table.Tr>
    );
    // The element child is rendered as-is (no Text wrapper around a layout node).
    expect(screen.getByTestId('inner').parent?.parent?.props.testID).toBe('custom');
  });

  it('highlights hovered rows with the theme hover fill when highlightOnHover is set', () => {
    wrap(
      <Table highlightOnHover>
        <Table.Tbody>
          <TableTr testID="row">
            <TableTd>Ada</TableTd>
          </TableTr>
        </Table.Tbody>
      </Table>
    );
    const row = screen.getByTestId('row');
    expect(flat(row.props.style).backgroundColor).toBeUndefined();
    act(() => {
      fireEvent(row, 'hoverIn');
    });
    expect(flat(screen.getByTestId('row').props.style).backgroundColor).toBe(DEFAULT_THEME.backgrounds.hover);
    act(() => {
      fireEvent(screen.getByTestId('row'), 'hoverOut');
    });
    expect(flat(screen.getByTestId('row').props.style).backgroundColor).toBeUndefined();
  });

  it('paints selected rows with the selected role and makes onPress rows pressable', () => {
    const onPress = jest.fn();
    wrap(
      <TableTr testID="row" selected onPress={onPress}>
        <TableTd>Ada</TableTd>
      </TableTr>
    );
    expect(flat(screen.getByTestId('row').props.style).backgroundColor).toBe(DEFAULT_THEME.backgrounds.selected);
    fireEvent.press(screen.getByText('Ada'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('forwards refs to the root view', () => {
    const ref = React.createRef<React.ElementRef<typeof Table>>();
    wrap(<Table ref={ref} data={{ head: ['A'] }} />);
    expect(ref.current).toBeTruthy();
  });
});
