export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const BUILDINGS = {
  'New York HQ': {
    smooth: true,
    values: [412, 405, 398, 384, 372, 367, 362, 358, 361, 369, 378, 389],
  },
  'Amsterdam Campus': {
    smooth: true,
    values: [308, 302, 296, 288, 281, 277, 274, 272, 275, 279, 284, 290],
  },
  'Singapore Hub': {
    smooth: false,
    values: [352, 348, 345, 341, 338, 336, 334, 331, 333, 336, 340, 343],
  },
} as const;

export const SERIES = Object.entries(BUILDINGS).map(([name, meta]) => ({
  id: name,
  name,
  smooth: meta.smooth,
  lineThickness: meta.smooth ? 3 : 2,
  data: meta.values.map((value, index) => ({
    x: index,
    y: value,
    data: { building: name, month: MONTHS[index], value },
  })),
}));

export const COOLING_SEASON = { start: 5.5, end: 8.5 };

export const PORTFOLIO_TARGET = 360;
