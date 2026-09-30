import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Splitter } from '../Splitter';

it('renders adjacent panes', () => {
  const view = render(
    <Splitter>
      <Splitter.Pane defaultSize={50}>
        <Text>One</Text>
      </Splitter.Pane>
      <Splitter.Pane defaultSize={50}>
        <Text>Two</Text>
      </Splitter.Pane>
    </Splitter>,
  );
  expect(view.getByText('One')).toBeTruthy();
  expect(view.getByText('Two')).toBeTruthy();
});
