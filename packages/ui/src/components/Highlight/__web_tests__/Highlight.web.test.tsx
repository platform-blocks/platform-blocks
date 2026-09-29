import React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';

import { DEFAULT_THEME } from '../../../core/theme/defaultTheme';
import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { Highlight } from '../Highlight';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

/** jsdom normalizes colors to `rgb(r, g, b)`. */
const hexToRgb = (hex: string) => {
  const value = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
};

describe('Highlight (react-native-web DOM)', () => {
  it('wraps each match in <mark> with the theme mark background and keeps the text intact', () => {
    const { container } = render(
      <Highlight highlight="this" testID="hl">
        Highlight This, definitely THIS and also this!
      </Highlight>
    );

    const root = screen.getByTestId('hl');
    expect(root.textContent).toBe('Highlight This, definitely THIS and also this!');

    const marks = Array.from(container.querySelectorAll('mark'));
    expect(marks.map((mark) => mark.textContent)).toEqual(['This', 'THIS', 'this']);
    expect(marks[0].style.backgroundColor).toBe(hexToRgb(DEFAULT_THEME.backgrounds.mark));
  });

  it('matches case-sensitively and several values, longest first', () => {
    const { container } = render(
      <Highlight highlight={['block', 'blocks']} caseSensitive>
        Platform Blocks ships blocks and a block.
      </Highlight>
    );
    const marks = Array.from(container.querySelectorAll('mark')).map((mark) => mark.textContent);
    expect(marks).toEqual(['blocks', 'block']);
  });

  it('resolves a palette highlightColor and keeps the marked text readable', () => {
    const { container } = render(
      <Highlight highlight="teal" highlightColor="teal">
        A teal marker
      </Highlight>
    );
    const mark = container.querySelector('mark') as HTMLElement;
    expect(mark.style.backgroundColor).toBe(hexToRgb(DEFAULT_THEME.colors.teal?.[2] ?? ''));
    expect(mark.style.color).toBe(hexToRgb(DEFAULT_THEME.text.primary));
  });

  it('renders plain text with no mark when nothing matches', () => {
    const { container } = render(<Highlight highlight="absent">Nothing to see</Highlight>);
    expect(container.querySelector('mark')).toBeNull();
    expect(container.textContent).toBe('Nothing to see');
  });
});
