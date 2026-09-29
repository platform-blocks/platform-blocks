import React from 'react';
import { render } from '@testing-library/react-native';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';
import { LineChart } from '../../src/components/LineChart/LineChart';
import { paletteDefaultLight } from '../../src/colors';
import { colorSchemes, setDefaultColorScheme } from '../../src/utils';

// LineChart used to color unstyled series from the global default palette; the
// line's stroke shows which palette it reads now.
const SERIES = [{ id: 'a', name: 'A', data: [{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 2 }] }];
const strokes = (tree: React.ReactElement) => {
  const { UNSAFE_queryAllByProps } = render(tree);
  return (color: string) => UNSAFE_queryAllByProps({ stroke: color }).length;
};

describe('charts read the theme palette, not the global default', () => {
  let original: string[];
  beforeEach(() => { original = [...colorSchemes.default]; });
  afterEach(() => { setDefaultColorScheme(original); });

  it('a nested provider re-themes a chart inside it', () => {
    const count = strokes(
      <ChartThemeProvider hostThemeBridge={{ accentPalette: ['#777777'] }}>
        <ChartThemeProvider value={{ colors: { accentPalette: ['#aa0000', '#00aa00'] } }}>
          <LineChart series={SERIES} w={400} h={300} disableAnimations />
        </ChartThemeProvider>
      </ChartThemeProvider>
    );
    expect(count('#aa0000')).toBeGreaterThan(0);
    expect(count('#777777')).toBe(0);
  });

  it('ignores a global palette set outside any provider', () => {
    setDefaultColorScheme(['#010101']);
    const count = strokes(<LineChart series={SERIES} w={400} h={300} disableAnimations />);
    expect(count(paletteDefaultLight[0])).toBeGreaterThan(0);
    expect(count('#010101')).toBe(0);
  });
});
