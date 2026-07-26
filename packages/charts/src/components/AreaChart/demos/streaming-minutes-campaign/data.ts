export const CAMPAIGN_WEEKS = ['Teaser Week', 'Launch Week', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];

export const CONTENT_SEGMENTS = [
  {
    id: 'originals',
    name: 'Original Series',
    values: [62, 88, 112, 131, 126, 118],
  },
  {
    id: 'licensed',
    name: 'Licensed TV',
    values: [78, 96, 108, 114, 109, 104],
  },
  {
    id: 'films',
    name: 'Films',
    values: [54, 63, 82, 91, 87, 84],
  },
  {
    id: 'sports',
    name: 'Live Sports',
    values: [18, 22, 34, 47, 52, 48],
  },
];

export const formatWeek = (index: number) => CAMPAIGN_WEEKS[index] ?? `Week ${index + 1}`;

export const STREAMING_SERIES = CONTENT_SEGMENTS.map(({ id, name, values }) => ({
  id,
  name,
  data: values.map((minutes, index) => ({
    x: index,
    y: minutes,
    data: { category: name, week: formatWeek(index), minutes },
  })),
}));

export const WEEK_TOTALS = CAMPAIGN_WEEKS.map((_, index) =>
  STREAMING_SERIES.reduce((sum, series) => sum + (series.data[index]?.y ?? 0), 0)
);
