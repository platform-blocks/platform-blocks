import React from 'react';
import { render, screen } from '@testing-library/react';

import { Block } from '../Block';

describe('Block (web)', () => {
  it('forwards role and aria props to the element', () => {
    render(
      <Block role="list" aria-label="Recent files" testID="files">
        <Block role="listitem">a.txt</Block>
      </Block>
    );
    const list = screen.getByRole('list', { name: 'Recent files' });
    expect(list).toBe(screen.getByTestId('files'));
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('maps a legacy accessibilityRole to the ARIA role', () => {
    render(<Block accessibilityRole="header">Header</Block>);
    expect(screen.getByRole('heading')).toBeTruthy();
  });

  it('renders a custom component with the resolved style', () => {
    const Custom = React.forwardRef<HTMLElement, { style?: unknown; children?: React.ReactNode }>(
      ({ children }, ref) => (
        <section ref={ref} data-testid="custom">
          {children}
        </section>
      )
    );
    const ref = React.createRef<unknown>();
    render(
      <Block component={Custom} ref={ref as React.Ref<never>}>
        inside
      </Block>
    );
    expect(screen.getByTestId('custom').textContent).toBe('inside');
    expect(ref.current).toBe(screen.getByTestId('custom'));
  });
});
