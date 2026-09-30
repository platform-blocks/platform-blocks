import {
  calculateChartDimensions,
  generateTicks,
  generateLogTicks,
  scaleLinear,
  scaleLog,
  chartToDataCoordinates,
  dataToChartCoordinates,
  findClosestDataPoint,
  getColorFromScheme,
  formatNumber,
  formatPercentage,
  formatCompactNumber,
  resolveNumberFormatter,
  createTickFormatter,
} from '../../src/utils';

describe('calculateChartDimensions', () => {
  it('computes plot area based on padding', () => {
    const result = calculateChartDimensions(400, 300, { top: 10, right: 20, bottom: 30, left: 40 });
    expect(result.plotArea).toEqual({
      x: 40,
      y: 10,
      width: 340,
      height: 260,
    });
    expect(result.total).toEqual({ width: 400, height: 300 });
  });
});

describe('generateTicks', () => {
  it('returns evenly spaced ticks for a simple range', () => {
    const ticks = generateTicks(0, 4, 5);
    expect(ticks).toEqual([0, 1, 2, 3, 4]);
  });

  it('handles identical min and max', () => {
    expect(generateTicks(5, 5, 5)).toEqual([5]);
  });
});

describe('generateLogTicks', () => {
  it('produces sorted ticks within the domain', () => {
    const ticks = generateLogTicks([1, 1000]);
    expect(ticks[0]).toBeGreaterThanOrEqual(1);
    expect(ticks[ticks.length - 1]).toBeLessThanOrEqual(1000);
    expect([...ticks].sort((a, b) => a - b)).toEqual(ticks);
  });
});

describe('scales and coordinate helpers', () => {
  const plot = { x: 10, y: 20, width: 200, height: 100 };
  const xDomain: [number, number] = [0, 10];
  const yDomain: [number, number] = [0, 100];

  it('maps values linearly', () => {
    expect(scaleLinear(5, xDomain, [0, 100])).toBe(50);
  });

  it('maps values logarithmically', () => {
    expect(scaleLog(10, [1, 100], [0, 1])).toBeCloseTo(0.5, 1);
  });

  it('converts between data and chart coordinates', () => {
    const chartPoint = dataToChartCoordinates(5, 50, plot, xDomain, yDomain);
    expect(chartPoint.x).toBeCloseTo(plot.x + plot.width / 2);
    expect(chartPoint.y).toBeCloseTo(plot.y + plot.height / 2);

    const dataPoint = chartToDataCoordinates(chartPoint.x, chartPoint.y, plot, xDomain, yDomain);
    expect(dataPoint.x).toBeCloseTo(5);
    expect(dataPoint.y).toBeCloseTo(50);
  });

  it('finds the closest data point in range', () => {
    const data = [
      { x: 0, y: 0 },
      { x: 5, y: 50 },
      { x: 9, y: 90 },
    ];
    const result = findClosestDataPoint(
      plot.x + plot.width / 2,
      plot.y + plot.height / 2,
      data,
      plot,
      xDomain,
      yDomain,
      500
    );
    expect(result?.dataPoint).toEqual({ x: 5, y: 50 });
  });
});

describe('getColorFromScheme', () => {
  it('wraps past the end of the palette', () => {
    expect(getColorFromScheme(3, ['#111111', '#222222'])).toBe('#222222');
  });
});

describe('formatters', () => {
  it('formats numbers with locale grouping', () => {
    expect(formatNumber(1234.567, 1)).toBe('1,234.6');
  });

  it('formats percentages', () => {
    expect(formatPercentage(5, 20, 0)).toBe('25%');
  });
});

describe('formatCompactNumber', () => {
  it('abbreviates thousands and up', () => {
    expect(formatCompactNumber(9000)).toBe('9K');
    expect(formatCompactNumber(9500)).toBe('9.5K');
    expect(formatCompactNumber(1_250_000)).toBe('1.3M');
    expect(formatCompactNumber(3_400_000_000)).toBe('3.4B');
    expect(formatCompactNumber(2e12)).toBe('2T');
  });

  it('leaves values under 1,000 as formatNumber renders them', () => {
    expect(formatCompactNumber(999)).toBe('999');
    expect(formatCompactNumber(12.345)).toBe('12.35');
    expect(formatCompactNumber(0)).toBe('0');
  });

  it('rolls over into the next unit instead of rendering 1000K', () => {
    expect(formatCompactNumber(999_950)).toBe('1M');
    expect(formatCompactNumber(999_999_999)).toBe('1B');
  });

  it('handles negatives and non-finite values', () => {
    expect(formatCompactNumber(-9000)).toBe('-9K');
    expect(formatCompactNumber(-1_500_000)).toBe('-1.5M');
    expect(formatCompactNumber(NaN)).toBe('NaN');
    expect(formatCompactNumber(Infinity)).toBe('Infinity');
  });

  it('respects the decimals argument', () => {
    expect(formatCompactNumber(1_234_567, 2)).toBe('1.23M');
    expect(formatCompactNumber(1_234_567, 0)).toBe('1M');
  });
});

describe('resolveNumberFormatter', () => {
  it('defaults to compact', () => {
    expect(resolveNumberFormatter()(9000)).toBe('9K');
  });

  it('renders grouped digits under full', () => {
    expect(resolveNumberFormatter('full')(9000)).toBe('9,000');
  });

  it('uses a custom function as-is', () => {
    expect(resolveNumberFormatter((v) => `#${v}`)(9000)).toBe('#9000');
  });

  it('uses the fallback for anything it does not abbreviate', () => {
    const fallback = (v: number) => v.toFixed(2);
    expect(resolveNumberFormatter('compact', fallback)(150)).toBe('150.00');
    expect(resolveNumberFormatter('compact', fallback)(9000)).toBe('9K');
    expect(resolveNumberFormatter('full', fallback)(9000)).toBe('9000.00');
  });
});

describe('createTickFormatter', () => {
  const labels = (ticks: number[], ...rest: any[]) => {
    const format = createTickFormatter(ticks, ...rest);
    return ticks.map((t) => format(t));
  };

  it('abbreviates ticks that stay exact at one decimal', () => {
    expect(labels([0, 2500, 5000, 7500, 10000])).toEqual(['0', '2.5K', '5K', '7.5K', '10K']);
    expect(labels([0, 250, 500, 750, 1000])).toEqual(['0', '250', '500', '750', '1K']);
  });

  it('allows a second decimal once ticks are at least 1,000 apart', () => {
    expect(labels([1_000_000, 1_050_000, 1_100_000])).toEqual(['1M', '1.05M', '1.1M']);
  });

  it('falls back to full numbers when abbreviating would round ticks together', () => {
    expect(labels([1200, 1210, 1220])).toEqual(['1,200', '1,210', '1,220']);
    expect(labels([2000, 2010, 2020])).toEqual(['2,000', '2,010', '2,020']);
  });

  it('renders unabbreviated ticks with the fallback', () => {
    expect(labels([2019, 2020, 2021], 'compact', String)).toEqual(['2019', '2020', '2021']);
    expect(labels([0, 500, 1000], 'compact', (v: number) => v.toFixed(2))).toEqual(['0.00', '500.00', '1K']);
  });

  it('follows full and custom formats', () => {
    expect(labels([0, 5000, 10000], 'full')).toEqual(['0', '5,000', '10,000']);
    expect(labels([0, 5000], (v: number) => `$${v}`)).toEqual(['$0', '$5000']);
  });
});
