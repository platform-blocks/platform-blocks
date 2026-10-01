import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { LinkBox } from '../LinkBox';

describe('LinkBox', () => {
  it('renders a block anchor and preserves modified-click navigation', () => {
    const onNavigate = jest.fn();
    render(<LinkBox href="/components" onNavigate={onNavigate}><span>Component card</span></LinkBox>);
    const link = screen.getByRole('link', { name: 'Component card' });
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/components');

    const modified = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });
    fireEvent(link, modified);
    expect(modified.defaultPrevented).toBe(false);
    expect(onNavigate).not.toHaveBeenCalled();

    const ordinary = new MouseEvent('click', { bubbles: true, cancelable: true });
    fireEvent(link, ordinary);
    expect(ordinary.defaultPrevented).toBe(true);
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});
