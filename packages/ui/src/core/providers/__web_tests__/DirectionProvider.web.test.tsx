import React from 'react';
import { render, screen } from '@testing-library/react';
import { DirectionProvider, useDirection } from '../DirectionProvider';

function DirectionLabel({ name }: { name: string }) {
  return <span data-testid={name}>{useDirection().dir}</span>;
}

describe('nested DirectionProvider', () => {
  it('keeps the outer page direction and scopes its own DOM direction', () => {
    document.documentElement.dir = 'ltr';
    render(
      <DirectionProvider initialDirection="rtl">
        <DirectionLabel name="outer" />
        <DirectionProvider initialDirection="ltr">
          <DirectionLabel name="inner" />
        </DirectionProvider>
      </DirectionProvider>
    );

    expect(document.documentElement.dir).toBe('rtl');
    expect(screen.getByTestId('outer').textContent).toBe('rtl');
    expect(screen.getByTestId('inner').textContent).toBe('ltr');
    expect(screen.getByTestId('inner').closest('[dir]')?.getAttribute('dir')).toBe('ltr');
  });
});
