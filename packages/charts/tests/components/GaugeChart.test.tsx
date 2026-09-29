import React from 'react';
import { render } from '@testing-library/react-native';
import { ChartThemeProvider } from '../../src/theme/ChartThemeContext';
import { GaugeChart } from '../../src/components/GaugeChart/GaugeChart';

describe('GaugeChart range gradients', () => {
  const stops = [{ offset: 0, color: '#00ff00' }, { offset: 1, color: '#ff0000' }];
  // react-native-svg is mocked to one component, so find the def by its props.
  const gradientPoints = (gradient: { angle?: number; stops: typeof stops }) => {
    const { UNSAFE_queryAllByProps } = render(
      <ChartThemeProvider>
        <GaugeChart value={50} w={300} h={200} ranges={[{ from: 0, to: 100, gradient }]} />
      </ChartThemeProvider>
    );
    const [def] = UNSAFE_queryAllByProps({ gradientUnits: 'objectBoundingBox' });
    return [def.props.x1, def.props.y1, def.props.x2, def.props.y2];
  };

  it('runs left to right when no angle is given', () => {
    expect(gradientPoints({ stops })).toEqual(['0', '0.5', '1', '0.5']);
  });

  it('honors an explicit angle', () => {
    expect(gradientPoints({ angle: 90, stops }).map(Number)).toEqual([
      expect.closeTo(0.5), 0, expect.closeTo(0.5), 1,
    ]);
  });
});
