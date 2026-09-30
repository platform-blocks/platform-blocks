import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { TableOfContents } from '../TableOfContents';

// Real headings for the scroll spy to collect.
let article: HTMLElement;
beforeEach(() => {
  article = document.createElement('article');
  article.innerHTML = '<h2 id="intro">Intro</h2><h3 id="details">Details</h3><h2 id="outro">Outro</h2>';
  document.body.appendChild(article);
  // jsdom has no layout: scrollIntoView is missing.
  Element.prototype.scrollIntoView = jest.fn();
});
afterEach(() => {
  article.remove();
});

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 120));
  });
}

describe('TableOfContents (react-native-web DOM)', () => {
  it('is a labelled navigation of links; the current one has aria-current="location"', async () => {
    render(
      <PlocksProvider>
        <TableOfContents container="article" />
      </PlocksProvider>
    );
    await flush();

    expect(screen.getByRole('navigation', { name: 'Table of contents' })).toBeTruthy();
    const links = screen.getAllByRole('link');
    expect(links.map((l) => l.textContent)).toEqual(['Intro', 'Details', 'Outro']);

    fireEvent.click(screen.getByRole('link', { name: 'Details' }));
    expect(screen.getByRole('link', { name: 'Details' }).getAttribute('aria-current')).toBe('location');
    expect(screen.getByRole('link', { name: 'Intro' }).getAttribute('aria-current')).toBeNull();
  });

  it('reports active changes once per change, even with an inline callback', async () => {
    const calls: Array<string | null> = [];
    const { rerender } = render(
      <PlocksProvider>
        <TableOfContents container="article" onActiveChange={(id) => calls.push(id)} />
      </PlocksProvider>
    );
    await flush();
    expect(calls).toEqual([null]);

    // New callback identity on every render must not re-fire.
    rerender(
      <PlocksProvider>
        <TableOfContents container="article" onActiveChange={(id) => calls.push(id)} />
      </PlocksProvider>
    );
    rerender(
      <PlocksProvider>
        <TableOfContents container="article" onActiveChange={(id) => calls.push(id)} />
      </PlocksProvider>
    );
    expect(calls).toEqual([null]);

    fireEvent.click(screen.getByRole('link', { name: 'Outro' }));
    expect(calls).toEqual([null, 'outro']);
  });
});
