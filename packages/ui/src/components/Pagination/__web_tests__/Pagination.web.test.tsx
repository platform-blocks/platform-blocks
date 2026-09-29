import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { Pagination } from '../Pagination';
import type { PaginationProps } from '../types';

function renderPagination(props: Partial<PaginationProps> = {}) {
  return render(
    <PlatformBlocksProvider>
      <Pagination total={10} defaultValue={3} {...props} />
    </PlatformBlocksProvider>
  );
}

describe('Pagination (react-native-web DOM)', () => {
  it('is a labelled navigation landmark with named controls and aria-current', () => {
    renderPagination();
    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    expect(nav).toBeTruthy();

    expect(screen.getByRole('button', { name: 'First page' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Last page' })).toBeTruthy();

    const current = screen.getByRole('button', { name: 'Page 3' });
    expect(current.getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('button', { name: 'Page 4' }).getAttribute('aria-current')).toBeNull();
  });

  it('marks unavailable controls aria-disabled', () => {
    renderPagination({ defaultValue: 1 });
    expect(screen.getByRole('button', { name: 'Previous page' }).getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByRole('button', { name: 'Next page' }).getAttribute('aria-disabled')).toBeNull();
  });

  it('changes page on click and moves aria-current', () => {
    const onChange = jest.fn();
    renderPagination({ onChange });
    fireEvent.click(screen.getByRole('button', { name: 'Page 4' }));
    expect(onChange).toHaveBeenCalledWith(4);
    expect(screen.getByRole('button', { name: 'Page 4' }).getAttribute('aria-current')).toBe('page');
  });

  it('shares one tab stop (the current page) and moves with the arrow keys', () => {
    renderPagination();
    const buttons = screen.getAllByRole('button');
    const stops = buttons.filter((b) => b.getAttribute('tabindex') === '0');
    expect(stops).toHaveLength(1);
    expect(stops[0].getAttribute('aria-label')).toBe('Page 3');

    act(() => stops[0].focus());
    fireEvent.keyDown(stops[0], { key: 'ArrowRight' });
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Page 4');
    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    expect(document.activeElement?.getAttribute('aria-label')).toBe('First page');
  });

  it('accepts translated accessible names', () => {
    renderPagination({
      accessibilityLabels: { root: 'Seiten', next: 'Nächste Seite', page: (p) => `Seite ${p}` },
    });
    expect(screen.getByRole('navigation', { name: 'Seiten' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Nächste Seite' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Seite 3' })).toBeTruthy();
  });
});
