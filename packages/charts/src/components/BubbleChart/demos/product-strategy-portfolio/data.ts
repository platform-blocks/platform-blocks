export type Initiative = {
  initiative: string;
  strategicValue: number;
  executionEffort: number;
  projectedRevenue: number;
  confidence: number;
  horizon: 'Now' | 'Next' | 'Later';
  owner: string;
};

export const initiatives: Initiative[] = [
  { initiative: 'Unified onboarding flow', strategicValue: 9.4, executionEffort: 3.2, projectedRevenue: 8.8, confidence: 76, horizon: 'Now', owner: 'Growth' },
  { initiative: 'Usage-based pricing', strategicValue: 8.6, executionEffort: 5.1, projectedRevenue: 9.7, confidence: 68, horizon: 'Next', owner: 'Monetization' },
  { initiative: 'AI-driven support', strategicValue: 7.9, executionEffort: 6.3, projectedRevenue: 6.9, confidence: 64, horizon: 'Next', owner: 'Support Ops' },
  { initiative: 'Insights dashboard revamp', strategicValue: 7.1, executionEffort: 4.5, projectedRevenue: 5.6, confidence: 72, horizon: 'Now', owner: 'Product Intelligence' },
  { initiative: 'Partner ecosystem API', strategicValue: 6.4, executionEffort: 7.8, projectedRevenue: 7.5, confidence: 54, horizon: 'Later', owner: 'Platform' },
  { initiative: 'In-app experimentation', strategicValue: 8.1, executionEffort: 3.9, projectedRevenue: 6.1, confidence: 82, horizon: 'Now', owner: 'Growth' },
  { initiative: 'Self-healing infrastructure', strategicValue: 9.1, executionEffort: 7.2, projectedRevenue: 5.4, confidence: 58, horizon: 'Later', owner: 'Core Engineering' },
  { initiative: 'Community templates marketplace', strategicValue: 6.8, executionEffort: 4.4, projectedRevenue: 4.9, confidence: 71, horizon: 'Next', owner: 'Ecosystem' },
];
