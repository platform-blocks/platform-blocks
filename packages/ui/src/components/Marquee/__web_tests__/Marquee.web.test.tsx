import React from 'react';
import { render, screen } from '@testing-library/react';
import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { Marquee } from '../Marquee';
it('keeps visual repeats out of accessibility', () => {
  render(<PlocksProvider><Marquee fadeEdges={false} repeat={3}><span>Alpha</span></Marquee></PlocksProvider>);
  expect(screen.getAllByText('Alpha')).toHaveLength(3);
});
