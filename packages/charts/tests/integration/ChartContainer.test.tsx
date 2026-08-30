import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ChartContainer, ChartTitle, ChartLegend } from '../../src/ChartBase';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';
import { ChartInteractionProvider, useChartInteractionContext } from '../../src/interaction/ChartInteractionContext';

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ChartThemeProvider>{ui}</ChartThemeProvider>);

describe('ChartContainer', () => {
  it('provides context and renders children', () => {
    const { getByTestId } = renderWithTheme(
      <ChartContainer width={300} height={200} testID="chart-root">
        <ChartTitle title="Revenue" subtitle="FY25" />
      </ChartContainer>
    );

    expect(getByTestId('chart-root')).toBeTruthy();
  });

  it('renders legend items with accessibility state', () => {
    const { getByText } = renderWithTheme(
      <ChartContainer width={320} height={240}>
        <ChartLegend
          items={[
            { label: 'North', color: '#4f46e5' },
            { label: 'South', color: '#7c3aed', visible: false },
          ]}
        />
      </ChartContainer>
    );

    expect(getByText('North')).toBeTruthy();
    expect(getByText('South')).toBeTruthy();
  });

  it('reuses a parent interaction provider', () => {
    const InteractionConfigSpy = () => {
      const interaction = useChartInteractionContext();
      return <Text testID="pointer-raf">{String(interaction.config.pointerRAF)}</Text>;
    };

    const { getByTestId } = renderWithTheme(
      <ChartInteractionProvider config={{ pointerRAF: false }}>
        <ChartContainer width={320} height={240}>
          <InteractionConfigSpy />
        </ChartContainer>
      </ChartInteractionProvider>
    );

    expect(getByTestId('pointer-raf').props.children).toBe('false');
  });
});
