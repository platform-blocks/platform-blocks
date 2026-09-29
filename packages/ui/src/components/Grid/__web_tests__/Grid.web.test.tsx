import React from 'react';
import { render, screen } from '@testing-library/react';

import { Grid, GridItem } from '../Grid';

describe('Grid (web)', () => {
  it('emits one flat cell per child and forwards role props', () => {
    render(
      <Grid columns={{ base: 1, md: 3 }} gap="md" role="list" aria-label="Plans" testID="grid">
        <GridItem span={2} role="listitem">
          A
        </GridItem>
        <GridItem role="listitem">B</GridItem>
      </Grid>
    );
    const grid = screen.getByRole('list', { name: 'Plans' });
    expect(grid).toBe(screen.getByTestId('grid'));
    expect(grid.getAttribute('data-pb-grid')).toMatch(/^c/);
    expect(grid.querySelectorAll('[data-pb-grid-cell]')).toHaveLength(2);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
