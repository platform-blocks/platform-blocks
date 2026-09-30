import React from 'react';
import { render, screen } from '@testing-library/react';
import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { Splitter } from '../Splitter';

it('exposes an adjustable separator', () => {
  render(
    <PlocksProvider>
      <Splitter>
        <Splitter.Pane defaultSize={50}>One</Splitter.Pane>
        <Splitter.Pane defaultSize={50}>Two</Splitter.Pane>
      </Splitter>
    </PlocksProvider>,
  );
  expect(screen.getByRole('separator')).toBeTruthy();
});
