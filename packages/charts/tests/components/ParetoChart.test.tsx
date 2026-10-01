import React from 'react';
import { render } from '@testing-library/react-native';

import { ParetoChart } from '../../src/components/ParetoChart/ParetoChart';
import { ComboChart } from '../../src/components/ComboChart';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';

jest.mock('../../src/components/ComboChart', () => ({ ComboChart: jest.fn(() => null) }));

const data = [
  { label: 'Small', value: 10 },
  { label: 'Large', value: 30 },
  { label: 'Medium', value: 20 },
];

describe('ParetoChart', () => {
  it('sorts categories and computes a cumulative percentage series', () => {
    render(<ChartThemeProvider><ParetoChart data={data} /></ChartThemeProvider>);
    const props = jest.mocked(ComboChart).mock.calls[0][0];
    expect(props.xAxis?.labelFormatter?.(1)).toBe('Large');
    expect(props.xAxis?.labelFormatter?.(3)).toBe('Small');
    expect(props.layers?.[0].data.map((point) => point.y)).toEqual([30, 20, 10]);
    expect(props.layers?.[1].data.map((point) => point.y)).toEqual([50, 83.33333333333334, 100]);
  });

  it('preserves input order when sortDirection is none', () => {
    jest.mocked(ComboChart).mockClear();
    render(<ChartThemeProvider><ParetoChart data={data} sortDirection="none" /></ChartThemeProvider>);
    const props = jest.mocked(ComboChart).mock.calls[0][0];
    expect(props.xAxis?.labelFormatter?.(1)).toBe('Small');
    expect(props.layers?.[0].data.map((point) => point.y)).toEqual([10, 30, 20]);
  });
});
