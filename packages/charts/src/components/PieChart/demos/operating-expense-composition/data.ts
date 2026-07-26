export const OPERATING_EXPENSES = [
  { id: 'rnd', label: 'R&D', value: 42 },
  { id: 'marketing', label: 'Sales & Marketing', value: 34 },
  { id: 'operations', label: 'Operations', value: 28 },
  { id: 'ga', label: 'General & Admin', value: 18 },
  { id: 'it', label: 'IT & Security', value: 14 },
  { id: 'facilities', label: 'Facilities', value: 11 },
];

export const TOTAL_EXPENSE = OPERATING_EXPENSES.reduce((sum, slice) => sum + slice.value, 0);
