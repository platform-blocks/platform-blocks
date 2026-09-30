import React from 'react';
import { render, screen } from '@testing-library/react';

import { Blockquote } from '../Blockquote';

describe('Blockquote (web)', () => {
  it('renders a <blockquote> with the quote text and hides the glyph', () => {
    const { container } = render(<Blockquote testID="q">Simplicity is the ultimate sophistication.</Blockquote>);
    const quote = screen.getByTestId('q');
    expect(quote.tagName).toBe('BLOCKQUOTE');
    expect(quote.textContent).toContain('Simplicity is the ultimate sophistication.');
    // The decorative quote glyph is hidden from assistive technology.
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('labels the rating for screen readers', () => {
    render(
      <Blockquote rating={{ value: 4, max: 5 }} author={{ name: 'Ada' }}>
        Great
      </Blockquote>
    );
    expect(screen.getByRole('img', { name: 'Rated 4 out of 5' })).toBeTruthy();
  });

  it('exposes a source url as a link', () => {
    render(
      <Blockquote source={{ name: 'The Book', url: 'https://example.com' }} author={{ name: 'Ada' }}>
        Quote
      </Blockquote>
    );
    expect(screen.getByRole('link', { name: 'The Book' })).toBeTruthy();
  });

  it('is a button with onPress and forwards its ref', () => {
    const ref = React.createRef<unknown>();
    render(
      <Blockquote ref={ref as React.Ref<never>} onPress={() => {}}>
        Pressable quote
      </Blockquote>
    );
    const button = screen.getByRole('button');
    expect(ref.current).toBe(button);
  });
});
