export const CAMPAIGN_SPEND = [
  {
    id: 'paid-search',
    category: 'Paid search',
    value: 820,
    data: { objective: 'Capture late-stage demand' },
  },
  {
    id: 'paid-social',
    category: 'Paid social',
    value: 540,
    data: { objective: 'Net new persona awareness' },
  },
  {
    id: 'field-events',
    category: 'Field events',
    value: 460,
    data: { objective: 'Pipeline acceleration' },
  },
  {
    id: 'webinars',
    category: 'Webinars & workshops',
    value: 380,
    data: { objective: 'Activation & nurture' },
  },
  {
    id: 'content',
    category: 'Content syndication',
    value: 295,
    data: { objective: 'Top-of-funnel scale' },
  },
  {
    id: 'partners',
    category: 'Partner marketing',
    value: 260,
    data: { objective: 'Co-sell influence' },
  },
];

export const TOTAL_SPEND = CAMPAIGN_SPEND.reduce((sum, item) => sum + item.value, 0);
