import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { Column, Row } from '../Layout';

describe('Row and Column', () => {
  it('lay out children in the requested directions', () => {
    render(<>
      <Row testID="row" direction="row-reverse"><Text>A</Text><Text>B</Text></Row>
      <Column testID="column" direction="column-reverse"><Text>C</Text><Text>D</Text></Column>
    </>);
    expect(StyleSheet.flatten(screen.getByTestId('row').props.style).flexDirection).toBe('row-reverse');
    expect(StyleSheet.flatten(screen.getByTestId('column').props.style)).toMatchObject({ flexDirection: 'column-reverse', width: '100%' });
  });
});
