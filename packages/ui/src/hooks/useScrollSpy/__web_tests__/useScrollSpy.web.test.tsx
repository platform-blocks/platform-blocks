import { act, renderHook } from '@testing-library/react';

import { useScrollSpy } from '../index';

describe('useScrollSpy (web)', () => {
  let article: HTMLElement;

  beforeEach(() => {
    article = document.createElement('article');
    article.innerHTML = '<h2 id="intro">Intro</h2><h3>Getting started</h3><h2>Intro</h2>';
    document.body.appendChild(article);
  });
  afterEach(() => {
    article.remove();
  });

  it('collects DOM headings from the container, dedupes ids and assigns missing ones', () => {
    const { result } = renderHook(() => useScrollSpy({ container: 'nav, article' }));

    expect(result.current.items.map(({ id, value, depth }) => ({ id, value, depth }))).toEqual([
      { id: 'intro', value: 'Intro', depth: 2 },
      { id: 'getting-started', value: 'Getting started', depth: 3 },
    ]);
    // Headings without an id get the generated one so links can target them.
    expect(article.querySelector('h3')?.id).toBe('getting-started');
    expect(result.current.items[1].getNode?.()).toBe(article.querySelector('h3'));
  });

  it('uses the latest accessor without re-collecting on every render', () => {
    const { result, rerender } = renderHook(
      ({ suffix }: { suffix: string }) =>
        useScrollSpy({ container: 'article', getValue: (el) => `${el.textContent}${suffix}` }),
      { initialProps: { suffix: '!' } }
    );
    const firstItems = result.current.items;
    expect(firstItems[0].value).toBe('Intro!');

    // A new inline accessor alone keeps the collected items.
    rerender({ suffix: '?' });
    expect(result.current.items).toBe(firstItems);

    act(() => result.current.reinitialize());
    expect(result.current.items[0].value).toBe('Intro?');
  });
});
