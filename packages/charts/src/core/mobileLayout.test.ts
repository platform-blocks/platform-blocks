import { measureChartLegendBand, measureChartTitleBand, resolveChartLegendPosition } from '../ChartBase';
import { resolveCartesianPadding } from './axisLayout';

describe('narrow chart layout', () => {
  it('moves side legends below a phone-width plot', () => {
    expect(resolveChartLegendPosition('right', 325)).toBe('bottom');
    expect(resolveChartLegendPosition('left', 325)).toBe('bottom');
    expect(resolveChartLegendPosition('right', 600)).toBe('right');
    const band = measureChartLegendBand({
      items: [{ label: 'North America' }, { label: 'Europe' }],
      containerWidth: 325,
      position: 'right',
    });
    expect(band.right).toBe(0);
    expect(band.bottom).toBeGreaterThan(0);
  });

  it('sizes short tick boxes to their text instead of a whole plot slot', () => {
    const padding = resolveCartesianPadding({
      xTickLabels: ['M1', 'M6', 'M12'],
      yTickLabels: ['0', '100'],
      containerWidth: 325,
      containerHeight: 320,
    });
    expect(padding.xTickLabelWidth).toBeLessThan(40);
    expect(padding.xTickLabelLines).toBe(1);
    expect(padding.right).toBeGreaterThanOrEqual(Math.ceil(padding.xTickLabelWidth / 2));
  });

  it('reserves a second subtitle line in a narrow container', () => {
    const subtitle = 'Compliance versus renewal probability and annual spend';
    expect(measureChartTitleBand('Vendor health', subtitle, { containerWidth: 270 }))
      .toBeGreaterThan(measureChartTitleBand('Vendor health', subtitle, { containerWidth: 600 }));
  });
});
