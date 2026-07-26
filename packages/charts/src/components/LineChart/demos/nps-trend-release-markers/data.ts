export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

export const NPS_VALUES = [43, 45, 47, 52, 54, 58, 61, 64];

export const SERIES = [
  {
    id: 'nps-score',
    name: 'NPS',
    areaFill: true,
    fillOpacity: 0.25,
    data: NPS_VALUES.map((value, index) => ({
      x: index,
      y: value,
      data: { month: MONTHS[index], value },
    })),
  },
];

export const RELEASE_MARKERS = [
  { id: 'apr-release', x: 3, label: 'Onboarding revamp' },
  { id: 'jun-release', x: 5, label: 'Mobile UI refresh' },
  { id: 'jul-release', x: 6.5, label: 'Insights launch' },
];
