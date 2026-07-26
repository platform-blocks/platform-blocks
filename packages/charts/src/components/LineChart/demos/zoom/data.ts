export // A denser series so zooming reveals detail. Two years of weekly-ish points.
const makeSeries = (id: string, name: string, color: string, base: number, amp: number, phase: number) => ({
  id,
  name,
  color,
  data: Array.from({ length: 104 }, (_, i) => ({
    x: i,
    y: Math.round(
      base +
        amp * Math.sin(i / 6 + phase) +
        (i / 104) * amp * 1.5 +
        Math.sin(i / 2.3) * amp * 0.25
    ),
  })),
});

export const SERIES = [
  makeSeries('sessions', 'Sessions', '#4C6EF5', 420, 90, 0),
  makeSeries('signups', 'Signups', '#20C997', 180, 55, 1.2),
];
