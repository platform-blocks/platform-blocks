export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

export const INVENTORY_SEGMENTS = [
  {
    id: 'north',
    name: 'North DC',
    values: [420, 432, 446, 438, 412, 398],
    smooth: true,
  },
  {
    id: 'central',
    name: 'Central Hub',
    values: [506, 498, 473, 452, 438, 421],
    smooth: false,
  },
  {
    id: 'south',
    name: 'South Cross-dock',
    values: [318, 332, 347, 352, 366, 371],
    smooth: true,
  },
];

export const formatMonth = (index: number) => MONTHS[index] ?? `M${index + 1}`;

export const INVENTORY_SERIES = INVENTORY_SEGMENTS.map(({ id, name, values, smooth }) => ({
  id,
  name,
  smooth,
  data: values.map((units, index) => ({
    x: index,
    y: units,
    data: { warehouse: name, month: formatMonth(index), units },
  })),
}));
