import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Scroller } from '../Scroller';
it('renders scroll content', () => {
  const view = render(<Scroller><Text>One</Text><Text>Two</Text></Scroller>);
  expect(view.getByText('One')).toBeTruthy();
  expect(view.getByText('Two')).toBeTruthy();
});
