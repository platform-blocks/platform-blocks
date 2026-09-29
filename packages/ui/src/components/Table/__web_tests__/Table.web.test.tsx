import React from 'react';
import { fireEvent, render as rtlRender, screen, within } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { Table } from '../Table';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

describe('Table (react-native-web DOM)', () => {
  it('renders table semantics from `data`, named by its caption', () => {
    render(
      <Table
        data={{
          head: ['Name', 'Plan'],
          body: [
            ['Ada', 'Pro'],
            ['Grace', 'Free'],
          ],
          caption: 'Accounts',
        }}
      />
    );

    const table = screen.getByRole('table', { name: 'Accounts' });
    expect(within(table).getAllByRole('rowgroup')).toHaveLength(2);
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(3);
    expect(within(rows[0]).getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Name', 'Plan']);
    expect(within(rows[1]).getAllByRole('cell').map((c) => c.textContent)).toEqual(['Ada', 'Pro']);
  });

  it('highlights a hovered row through state, not DOM style mutation', () => {
    render(
      <Table highlightOnHover aria-label="People">
        <Table.Tbody>
          <Table.Tr testID="row">
            <Table.Td>Ada</Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    );
    const row = screen.getByTestId('row');
    const before = row.getAttribute('style') ?? '';
    fireEvent.mouseEnter(row);
    const hovered = screen.getByTestId('row').getAttribute('style') ?? '';
    expect(hovered).not.toBe(before);
    expect(hovered).toContain('background-color');
    fireEvent.mouseLeave(screen.getByTestId('row'));
    expect(screen.getByTestId('row').getAttribute('style') ?? '').toBe(before);
  });

  it('makes rows with onPress keyboard-reachable and clickable', () => {
    const onPress = jest.fn();
    render(
      <Table aria-label="People">
        <Table.Tbody>
          <Table.Tr onPress={onPress}>
            <Table.Td>Ada</Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    );
    const row = screen.getByRole('row');
    expect(row.getAttribute('tabindex')).toBe('0');
    fireEvent.click(row);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
