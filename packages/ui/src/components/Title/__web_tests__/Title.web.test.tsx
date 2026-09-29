import React from 'react';
import { render, screen } from '@testing-library/react';

import { Heading4, Title } from '../Title';

describe('Title (web)', () => {
  it('exposes a heading whose level follows `order`', () => {
    render(
      <>
        <Title order={1}>Dashboard</Title>
        <Title>Default level</Title>
        <Heading4 text="Details" />
      </>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' }).tagName).toBe('H1');
    expect(screen.getByRole('heading', { level: 2, name: 'Default level' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 4, name: 'Details' })).toBeTruthy();
  });

  it('keeps the level from `order` when `variant` restyles the text', () => {
    render(
      <Title order={3} variant="small">
        Small but h3
      </Title>
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Small but h3' })).toBeTruthy();
  });

  it('puts an explicit id on the heading and forwards aria props', () => {
    render(
      <Title order={2} id="pricing" aria-describedby="pricing-note">
        Pricing
      </Title>
    );
    const heading = screen.getByRole('heading', { level: 2, name: 'Pricing' });
    expect(heading.id).toBe('pricing');
    expect(heading.getAttribute('aria-describedby')).toBe('pricing-note');
  });

  it('forwards its ref to the root element', () => {
    const ref = React.createRef<unknown>();
    render(<Title ref={ref as React.Ref<never>} text="Ref" />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});
