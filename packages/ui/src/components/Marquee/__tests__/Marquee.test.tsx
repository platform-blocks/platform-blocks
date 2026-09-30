import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Marquee } from '../Marquee';
it('renders repeated content', () => {
  const view = render(<Marquee fadeEdges={false} repeat={3}><Text>Alpha</Text></Marquee>);
  expect(view.getAllByText('Alpha')).toHaveLength(1);
});
