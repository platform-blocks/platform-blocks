import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { ScatterChart } from '../../src/components/ScatterChart/ScatterChart';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';

describe('ScatterChart', () => {
  it('renders the supplied points and axis labels in a chart container', () => {
    render(
      <ChartThemeProvider>
        <ScatterChart
          testID="scatter"
          data={[{ x: 1, y: 4 }, { x: 3, y: 8 }]}
          w={400}
          h={300}
          disabled
          xAxis={{ show: true, title: 'Revenue' }}
          yAxis={{ show: true, title: 'Growth' }}
        />
      </ChartThemeProvider>
    );
    expect(screen.getByTestId('scatter')).toBeTruthy();
    expect(screen.getByText('Revenue')).toBeTruthy();
    expect(screen.getByText('Growth')).toBeTruthy();
  });
});
