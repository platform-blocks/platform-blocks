export const SUPPORT_CHANNELS = [
  { id: 'chat', label: 'Live chat', value: 460 },
  { id: 'email', label: 'Email', value: 380 },
  { id: 'phone', label: 'Phone', value: 240 },
  { id: 'self-service', label: 'Self-service', value: 310 },
  { id: 'social', label: 'Social', value: 90 },
];

export const TOTAL_INTERACTIONS = SUPPORT_CHANNELS.reduce((sum, slice) => sum + slice.value, 0);
