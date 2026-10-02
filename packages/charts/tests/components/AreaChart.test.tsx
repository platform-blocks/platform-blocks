import React from 'react';
import { render } from '@testing-library/react-native';

import { AreaChart } from '../../src/components/AreaChart/AreaChart';
import { LineChart } from '../../src/components/LineChart';
import { StackedAreaChart } from '../../src/components/StackedAreaChart';

jest.mock('../../src/components/LineChart', () => ({ LineChart: jest.fn(() => null) }));
jest.mock('../../src/components/StackedAreaChart', () => ({ StackedAreaChart: jest.fn(() => null) }));

const series = [{ id: 'north', data: [{ x: 1, y: 2 }] }, { id: 'south', data: [{ x: 1, y: 3 }] }];

describe('AreaChart layout', () => {
  beforeEach(() => jest.clearAllMocks());

  it('draws overlapping series as filled areas by default', () => {
    render(<AreaChart series={series} />);
    expect(LineChart).toHaveBeenCalledWith(expect.objectContaining({
      series,
      fill: true,
      smooth: true,
      fillOpacity: 0.35,
      areaFillMode: 'series',
    }), undefined);
    expect(StackedAreaChart).not.toHaveBeenCalled();
  });

  it('routes percentage stacking to the stacked chart with the requested opacity', () => {
    render(<AreaChart series={series} layout="stackedPercentage" areaOpacity={0.6} stackOrder="reverse" />);
    expect(StackedAreaChart).toHaveBeenCalledWith(expect.objectContaining({
      series,
      stackMode: 'percentage',
      stackOrder: 'reverse',
      opacity: 0.6,
    }), undefined);
    expect(LineChart).not.toHaveBeenCalled();
  });
});
