export const MILESTONES = ['Signup', 'Day 7', 'Day 30', 'Day 60', 'Day 90', 'Day 120'];

export const COHORT_VALUES = {
  '2024 Q1 Cohort': [100, 64, 51, 44, 39, 36],
  '2024 Q2 Cohort': [100, 68, 55, 48, 43, 40],
  '2024 Q3 Cohort': [100, 72, 59, 52, 47, 44],
  '2024 Q4 Cohort': [100, 75, 63, 57, 54, 50],
} as const;

export const SERIES = Object.entries(COHORT_VALUES).map(([name, values]) => ({
  id: name,
  name,
  data: values.map((value, index) => ({
    x: index,
    y: value,
    data: { milestone: MILESTONES[index], cohort: name },
  })),
  pointSize: 5,
}));

export const TARGET_RETENTION = 45;
