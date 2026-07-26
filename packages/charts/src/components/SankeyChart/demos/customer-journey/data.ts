export const NODES = [
  { id: 'paid-social', name: 'Paid Social' },
  { id: 'organic-search', name: 'Organic Search' },
  { id: 'email', name: 'Email Nurture' },
  { id: 'events', name: 'Field Events' },
  { id: 'signup', name: 'Sign Up' },
  { id: 'trial', name: 'Trial Activation' },
  { id: 'purchase', name: 'Purchase', color: '#10B981' },
  { id: 'churn', name: 'Churn', color: '#EF4444' },
  { id: 'retain', name: 'Retained' },
];

export const LINKS = [
  { source: 'paid-social', target: 'signup', value: 320 },
  { source: 'organic-search', target: 'signup', value: 420 },
  { source: 'email', target: 'signup', value: 180 },
  { source: 'events', target: 'signup', value: 140 },
  { source: 'signup', target: 'trial', value: 760 },
  { source: 'trial', target: 'purchase', value: 410 },
  { source: 'trial', target: 'churn', value: 350 },
  { source: 'purchase', target: 'retain', value: 290 },
  { source: 'purchase', target: 'churn', value: 120 },
];
