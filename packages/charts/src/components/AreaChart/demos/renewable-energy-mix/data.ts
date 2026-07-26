export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

export const RENEWABLE_SERIES = [
  {
    id: 'solar',
    name: 'Solar',
    data: [32, 38, 44, 52, 57, 61].map((value, index) => ({ x: index, y: value })),
  },
  {
    id: 'wind',
    name: 'Wind',
    data: [48, 42, 50, 47, 53, 58].map((value, index) => ({ x: index, y: value })),
  },
  {
    id: 'hydro',
    name: 'Hydro',
    data: [36, 34, 31, 28, 30, 33].map((value, index) => ({ x: index, y: value })),
  },
];
