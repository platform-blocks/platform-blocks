export const date = (month: number, value: number) => ({ x: Date.UTC(2024, month, 1), y: value });

export const SERIES = [
  {
    id: 'sessions',
    name: 'Sessions',
    data: [
      date(0, 4200),
      date(1, 4680),
      date(2, 5120),
      date(3, 5560),
      date(4, 6025),
      date(5, 6480),
      date(6, 7020),
      date(7, 7385),
      date(8, 7810),
      date(9, 8050),
      date(10, 8320),
      date(11, 8585),
    ],
  },
  {
    id: 'goal-completions',
    name: 'Goal completions',
    data: [
      date(0, 520),
      date(1, 560),
      date(2, 595),
      date(3, 640),
      date(4, 705),
      date(5, 760),
      date(6, 812),
      date(7, 860),
      date(8, 905),
      date(9, 948),
      date(10, 980),
      date(11, 1015),
    ],
  },
];

export const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' });
