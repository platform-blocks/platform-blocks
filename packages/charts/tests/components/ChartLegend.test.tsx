import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChartContainer, ChartLegend } from '../../src/ChartBase';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';

describe('ChartLegend', () => {
  const renderLegend = (props?: Partial<React.ComponentProps<typeof ChartLegend>>) => {
    const items = [
      { label: 'North', color: '#4f46e5' },
      { label: 'South', color: '#7c3aed', visible: false },
    ];

    return render(
      <ChartThemeProvider>
        <ChartContainer w={320} h={240} useOwnInteractionProvider={false} suppressPopover>
          <ChartLegend items={items} {...props} />
        </ChartContainer>
      </ChartThemeProvider>
    );
  };

  it('renders all legend items', () => {
    const { getByText } = renderLegend();

    expect(getByText('North')).toBeTruthy();
    expect(getByText('South')).toBeTruthy();
  });

  it('invokes onItemPress with item and index', () => {
    const handlePress = jest.fn();
    const { getByText } = renderLegend({ onItemPress: handlePress });

    fireEvent.press(getByText('North'));

    expect(handlePress).toHaveBeenCalledWith(
      { label: 'North', color: '#4f46e5' },
      0,
      expect.objectContaining({ altKey: false, metaKey: false, shiftKey: false, ctrlKey: false })
    );
  });
});
