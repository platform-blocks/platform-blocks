import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';

import { Column } from '../../Layout';
import { Flex } from '../Flex';

const rootStyle = (element: React.ReactElement) =>
  StyleSheet.flatten(render(element).getByTestId('flex').props.style);

describe('Flex box props', () => {
  it('applies the box props to the root view', () => {
    expect(rootStyle(<Flex testID="flex" w={240} h={80} maw="full" />)).toMatchObject({
      width: 240,
      height: 80,
      maxWidth: '100%',
    });
  });

  it('lets an explicit `w` win over `fullWidth`', () => {
    expect(rootStyle(<Flex testID="flex" fullWidth />).width).toBe('100%');
    expect(rootStyle(<Flex testID="flex" fullWidth w={240} />).width).toBe(240);
    // Column is full width by default.
    expect(rootStyle(<Column testID="flex" w={240} />).width).toBe(240);
  });
});
