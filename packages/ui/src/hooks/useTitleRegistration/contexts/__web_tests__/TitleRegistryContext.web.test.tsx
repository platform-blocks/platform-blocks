import React from 'react';
import { render, screen } from '@testing-library/react';
import { TitleRegistryProvider, useTitleRegistry } from '../TitleRegistryContext';
import { useTitleRegistration } from '../../index';

function Heading({ text, order }: { text: string; order: number }) {
  const { elementRef, id } = useTitleRegistration<HTMLDivElement>({ text, order });
  return <div ref={elementRef} id={id}>{text}</div>;
}

function Order() {
  return <output data-testid="order">{useTitleRegistry().titles.map((title) => title.text).join(',')}</output>;
}

it('keeps headings in page order across heading levels', () => {
  render(
    <TitleRegistryProvider>
      <Heading text="Introduction" order={2} />
      <Heading text="Details" order={3} />
      <Heading text="Next section" order={2} />
      <Order />
    </TitleRegistryProvider>
  );
  expect(screen.getByTestId('order').textContent).toBe('Introduction,Details,Next section');
});
