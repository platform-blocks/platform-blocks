import React from 'react';
import { render as rtlRender, screen, within } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { DataList } from '../DataList';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

describe('DataList (react-native-web DOM)', () => {
  it('marks up label/value pairs as a list of terms and definitions', () => {
    render(
      <DataList
        data={[
          { label: 'Email', value: 'ada@example.com' },
          { label: 'Role', value: 'Engineer' },
        ]}
      />
    );
    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByRole('term').textContent).toBe('Email');
    expect(within(items[0]).getByRole('definition').textContent).toBe('ada@example.com');
  });
});
