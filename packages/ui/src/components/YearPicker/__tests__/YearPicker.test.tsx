import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';

import { YearPicker } from '../YearPicker';

const mockTheme = {
  colors: {
    gray: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5f5', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a'],
    primary: ['#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5'],
  },
  text: { primary: '#0f172a', secondary: '#475569', disabled: '#94a3b8' },
};

jest.mock('../../../core/theme', () => {
  const actual = jest.requireActual('../../../core/theme');
  return {
    ...actual,
    useTheme: () => mockTheme,
  };
});

const thisYear = new Date().getFullYear();

const styleOf = (utils: ReturnType<typeof render>, year: number) => {
  const node = utils.getByLabelText(String(year));
  const style = node.props.style;
  return StyleSheet.flatten(typeof style === 'function' ? style({ pressed: false }) : style) as any;
};

describe('YearPicker - current period', () => {
  it('rings the current year', () => {
    const utils = render(<YearPicker decade={Math.floor(thisYear / 10) * 10} />);

    const styles = styleOf(utils, thisYear);
    expect(styles.borderWidth).toBe(1);
    expect(styles.borderColor).toBe(mockTheme.colors.primary[4]);
    // The ring is the marker — the current year is never filled.
    expect(styles.backgroundColor).toBe('transparent');
  });

  it('leaves other years unringed', () => {
    const utils = render(<YearPicker decade={Math.floor(thisYear / 10) * 10} />);

    const styles = styleOf(utils, thisYear + 1);
    expect(styles.borderWidth).toBe(0);
  });

  it('drops the ring when the current year is also selected', () => {
    const utils = render(
      <YearPicker decade={Math.floor(thisYear / 10) * 10} value={new Date(thisYear, 0, 1)} />
    );

    const styles = styleOf(utils, thisYear);
    expect(styles.borderWidth).toBe(0);
    expect(styles.backgroundColor).toBe(mockTheme.colors.primary[5]);
  });
});
