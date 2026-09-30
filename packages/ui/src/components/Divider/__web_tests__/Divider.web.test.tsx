import React from 'react';
import { render, screen } from '@testing-library/react';

import { Divider } from '../Divider';

describe('Divider (web)', () => {
  it('is a horizontal separator by default', () => {
    render(<Divider testID="rule" />);
    const separator = screen.getByRole('separator');
    expect(separator).toBe(screen.getByTestId('rule'));
    expect(separator.getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('reports vertical orientation', () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole('separator').getAttribute('aria-orientation')).toBe('vertical');
  });

  it('uses a string label as its accessible name', () => {
    render(<Divider label="or continue with" />);
    expect(screen.getByRole('separator', { name: 'or continue with' })).toBeTruthy();
  });
});
