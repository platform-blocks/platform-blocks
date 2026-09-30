import React from 'react';
import { Linking } from 'react-native';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '@plocks/ui';
import { Markdown } from '../Markdown';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

describe('Markdown (react-native-web DOM)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders headings as heading elements with their level', () => {
    render(<Markdown>{'# Title\n\nIntro text.\n\n### Details'}</Markdown>);

    const title = screen.getByRole('heading', { level: 1, name: 'Title' });
    expect(title.tagName).toBe('H1');
    expect(screen.getByRole('heading', { level: 3, name: 'Details' }).tagName).toBe('H3');
  });

  it('clamps deeper headings to maxHeadingLevel', () => {
    render(<Markdown maxHeadingLevel={2}>{'#### Deep'}</Markdown>);
    expect(screen.getByRole('heading', { level: 2, name: 'Deep' })).toBeTruthy();
  });

  it('renders links as named links with their href and opens them via Linking', () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never);
    render(<Markdown>{'Read [the docs](https://example.com/docs) first.'}</Markdown>);

    const link = screen.getByRole('link', { name: 'the docs' });
    expect(link.getAttribute('href')).toBe('https://example.com/docs');

    fireEvent.click(link);
    expect(openURL).toHaveBeenCalledWith('https://example.com/docs');
  });

  it('hands link activation to onLinkPress, but leaves modified clicks to the browser', () => {
    const onLinkPress = jest.fn();
    render(<Markdown onLinkPress={onLinkPress}>{'See [TimePicker](/components/TimePicker).'}</Markdown>);
    const link = screen.getByRole('link', { name: 'TimePicker' });

    fireEvent.click(link);
    expect(onLinkPress).toHaveBeenCalledWith('/components/TimePicker');

    onLinkPress.mockClear();
    fireEvent.click(link, { metaKey: true });
    expect(onLinkPress).not.toHaveBeenCalled();
  });

  it('exposes lists and tables with their roles', () => {
    render(<Markdown>{'- One\n- Two\n\n| A | B |\n|---|---|\n| 1 | 2 |'}</Markdown>);

    expect(screen.getByRole('list')).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('table')).toBeTruthy();
    expect(screen.getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual(['A', 'B']);
    expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['1', '2']);
  });

  it('renders inline code in the monospace font', () => {
    render(<Markdown>{'Call `render()` once.'}</Markdown>);
    const code = screen.getByText('render()');
    expect(code.tagName).toBe('CODE');
    expect(code.style.fontFamily).toMatch(/monospace/);
  });
});
