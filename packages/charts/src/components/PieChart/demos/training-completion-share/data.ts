export const TRAINING_COMPLETIONS = [
  { id: 'engineering', label: 'Engineering', value: 320 },
  { id: 'product', label: 'Product', value: 180 },
  { id: 'success', label: 'Customer Success', value: 150 },
  { id: 'sales', label: 'Sales', value: 210 },
  { id: 'operations', label: 'Operations', value: 140 },
  { id: 'people', label: 'People', value: 90 },
];

export const TOTAL_COMPLETIONS = TRAINING_COMPLETIONS.reduce((sum, slice) => sum + slice.value, 0);
