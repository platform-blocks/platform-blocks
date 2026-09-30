import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { OverflowList } from '../OverflowList';
it('measures all entries before showing a collapsed list', () => {
  const renderOverflow = jest.fn((hidden: string[]) => <Text>+{hidden.length}</Text>);
  const view = render(<OverflowList data={['A', 'B']} renderItem={(item) => <Text>{item}</Text>} renderOverflow={renderOverflow} />);
  expect(renderOverflow).toHaveBeenCalledWith(['A', 'B']);
  expect(view.queryByText('A')).toBeNull();
});
