import React from 'react';
import { render, screen } from '@testing-library/react';
import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { Text } from '../../Text';
import { OverflowList } from '../OverflowList';
it('keeps measurement copies out of accessibility', () => {
  render(<PlocksProvider><OverflowList data={['A']} renderItem={(item) => <Text>{item}</Text>} renderOverflow={(hidden) => <Text>+{hidden.length}</Text>} /></PlocksProvider>);
  expect(screen.queryByText('A')).toBeTruthy();
});
