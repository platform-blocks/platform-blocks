export const PHASE_LABELS = ['Pre-Launch', 'Launch Week', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];

export const SESSION_SERIES = [
  {
    id: 'ios',
    name: 'iOS',
    data: [42, 78, 92, 88, 96, 101].map((value, index) => ({ x: index, y: value, data: { label: 'iOS' } })),
  },
  {
    id: 'android',
    name: 'Android',
    data: [58, 94, 103, 108, 112, 118].map((value, index) => ({ x: index, y: value, data: { label: 'Android' } })),
  },
  {
    id: 'web',
    name: 'Web',
    data: [64, 71, 69, 75, 82, 87].map((value, index) => ({ x: index, y: value, data: { label: 'Web' } })),
  },
];
