import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithPlocks } from '../../../__web_tests__/renderWithPlocks';
import { Masonry } from '../Masonry';

test('renders each item in the web fallback and exposes an empty state', () => {
  const data = [
    { id: 'a', content: <span>Alpha</span> },
    { id: 'b', content: <span>Beta</span> },
    { id: 'c', content: <span>Gamma</span> },
  ];
  renderWithPlocks(<Masonry data={data} numColumns={2} />);
  for (const label of ['Alpha', 'Beta', 'Gamma']) expect(screen.getByText(label)).toBeTruthy();
  renderWithPlocks(<Masonry data={[]} />);
  expect(screen.getByText('No items to display')).toBeTruthy();
});
