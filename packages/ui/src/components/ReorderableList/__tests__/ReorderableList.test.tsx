import React from 'react';
import { Text, View } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { ReorderableList } from '../ReorderableList';

jest.mock('react-native-draggable-flatlist', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ data, renderItem }: { data: string[]; renderItem: (info: { item: string; drag: () => void; isActive: boolean; getIndex: () => number }) => React.ReactNode }) =>
      React.createElement(View, null, data.map((item, index) => React.createElement(View, { key: item }, renderItem({ item, drag: () => {}, isActive: false, getIndex: () => index })))),
  };
});

describe('ReorderableList native', () => {
  it('exposes screen reader move actions that emit an ordered copy', () => {
    const onReorder = jest.fn();
    const { getByLabelText } = render(
      <PlocksProvider>
        <ReorderableList
          data={['Alpha', 'Beta', 'Gamma']}
          keyExtractor={(item) => item}
          getItemLabel={(item) => item}
          renderItem={({ item }) => <View><Text>{item}</Text></View>}
          onReorder={onReorder}
        />
      </PlocksProvider>,
    );
    fireEvent(getByLabelText('Reorder Beta'), 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(onReorder).toHaveBeenCalledWith({ data: ['Alpha', 'Gamma', 'Beta'], from: 1, to: 2 });
  });
});
