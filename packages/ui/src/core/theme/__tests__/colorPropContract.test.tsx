/**
 * The `color` prop contract, enforced across components rather than per file.
 *
 * There is exactly one color prop — `color`, with `c` as its shorthand on
 * text-bearing components — and one vocabulary behind it. Two guarantees:
 *
 *  1. **The spellings agree.** `color` and `c` resolve through one helper. The
 *     bug this guards against shipped for a while: `c="error"` and
 *     `color="error"` landed on different palette shades.
 *  2. **The vocabulary is the same everywhere.** Every component accepts a
 *     palette token, `primary.6` shade syntax, and a raw CSS color. Several used
 *     to accept only bare tokens and silently swallow the rest, falling back to
 *     the primary palette.
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { Text } from '../../../components/Text';
import { Divider } from '../../../components/Divider';
import { Link } from '../../../components/Link';
import { useSwitchStyles } from '../../../components/Switch/styles';
import { useWaveformStyles } from '../../../components/Waveform/styles';
import { PlatformBlocksThemeProvider } from '../ThemeProvider';
import { DEFAULT_THEME } from '../defaultTheme';

const wrap = (ui: React.ReactElement) =>
  render(<PlatformBlocksThemeProvider>{ui}</PlatformBlocksThemeProvider>);

const colorOf = (el: any): string | undefined =>
  (StyleSheet.flatten(el.props.style) as any)?.color;

describe('Text: color and its `c` shorthand', () => {
  it.each(['error', 'success', 'warning', 'primary', 'secondary', 'muted', 'link'])(
    '`%s` resolves identically through both spellings',
    (value) => {
      const viaColor = colorOf(wrap(<Text color={value}>x</Text>).getByText('x'));
      const viaC = colorOf(wrap(<Text c={value}>x</Text>).getByText('x'));

      expect(viaColor).toBeTruthy();
      expect(viaC).toBe(viaColor);
    },
  );

  it('lands a status palette on the readable shade rather than the fill base', () => {
    // The regression: `c` used shade 6 while `color` used shade 5, so the two
    // spellings of the same token rendered as different colors.
    expect(colorOf(wrap(<Text color="error">x</Text>).getByText('x')))
      .toBe(DEFAULT_THEME.colors.error[6]);
  });

  it('resolves `dimmed` to the muted text token', () => {
    expect(colorOf(wrap(<Text c="dimmed">x</Text>).getByText('x'))).toBe(DEFAULT_THEME.text.muted);
  });

  it('lets the full name win over the shorthand', () => {
    expect(colorOf(wrap(<Text color="#00FF00" c="#FF0000">x</Text>).getByText('x'))).toBe('#00FF00');
  });
});

describe('Divider: the line vocabulary', () => {
  /** The rule is the container's single child; the color lands on its border. */
  const lineColorOf = (node: any): string | undefined => {
    const [line] = node.children.filter((c: any) => typeof c !== 'string' && c !== null);
    return (StyleSheet.flatten(line.props.style) as any)?.borderTopColor;
  };

  it.each([
    ['border', DEFAULT_THEME.backgrounds.border],
    ['subtle', DEFAULT_THEME.backgrounds.subtle],
    ['muted', DEFAULT_THEME.text.muted],
  ])('resolves the named token `%s`', (value, expected) => {
    expect(lineColorOf(wrap(<Divider color={value} testID="d" />).getByTestId('d'))).toBe(expected);
  });

  it('keeps a tinted rule below the accent so it still reads as chrome', () => {
    expect(lineColorOf(wrap(<Divider color="primary" testID="d" />).getByTestId('d')))
      .toBe(DEFAULT_THEME.colors.primary[3]);
  });
});

describe('the vocabulary reaches every component that takes a color', () => {
  // Each entry renders the component with a color and reports the color it
  // actually applied, so one table covers the whole surface.
  const CASES: { name: string; shade: number; render: (color: string) => string | undefined }[] = [
    {
      name: 'Switch',
      shade: 6,
      render: (color) =>
        (useSwitchStyles({
          checked: true, disabled: false, error: false, size: 'md', color, theme: DEFAULT_THEME,
        } as any) as any).stateLabelActive?.color,
    },
    {
      name: 'Link',
      shade: 6,
      render: (color) => colorOf(wrap(<Link href="#" color={color}>x</Link>).getByText('x')),
    },
    {
      name: 'Waveform',
      shade: 5,
      render: (color) =>
        (useWaveformStyles({ color, theme: DEFAULT_THEME, height: 40 } as any) as any)
          .bar?.backgroundColor,
    },
  ];

  it.each(CASES)('$name honors a raw CSS color', ({ render: run }) => {
    // The regression: a palette-key lookup returns undefined for `#FF0000` and
    // these components fell back to primary, silently ignoring the request.
    expect(run('#FF0000')).toBe('#FF0000');
  });

  it.each(CASES)('$name honors `palette.shade` syntax', ({ render: run }) => {
    expect(run('success.2')).toBe(DEFAULT_THEME.colors.success[2]);
  });

  it.each(CASES)('$name keeps its established shade for a bare token', ({ render: run, shade }) => {
    expect(run('success')).toBe(DEFAULT_THEME.colors.success[shade]);
  });

  it.each(CASES)('$name reads a bare palette name as the palette, not body text', ({ render: run }) => {
    expect(run('primary')).not.toBe(DEFAULT_THEME.text.primary);
  });
});
