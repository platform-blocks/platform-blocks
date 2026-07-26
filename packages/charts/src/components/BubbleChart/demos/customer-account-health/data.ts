export type Account = {
  account: string;
  healthScore: number;
  expansionPotential: number;
  arr: number;
  segment: 'Enterprise' | 'Mid-market' | 'Growth';
  csOwner: string;
  lastTouch: string;
};

export const accounts: Account[] = [
  { account: 'Acme Robotics', healthScore: 86, expansionPotential: 78, arr: 1.82, segment: 'Enterprise', csOwner: 'L. Howard', lastTouch: '4 days' },
  { account: 'Bluefin Media', healthScore: 63, expansionPotential: 72, arr: 0.96, segment: 'Mid-market', csOwner: 'A. Patel', lastTouch: '1 day' },
  { account: 'Cloudburst Analytics', healthScore: 92, expansionPotential: 88, arr: 2.35, segment: 'Enterprise', csOwner: 'C. Roman', lastTouch: '2 days' },
  { account: 'Driftwell', healthScore: 57, expansionPotential: 41, arr: 0.54, segment: 'Growth', csOwner: 'B. Ortiz', lastTouch: '6 days' },
  { account: 'Element Labs', healthScore: 74, expansionPotential: 67, arr: 1.22, segment: 'Mid-market', csOwner: 'T. Nguyen', lastTouch: 'Today' },
  { account: 'Fleetbase', healthScore: 48, expansionPotential: 83, arr: 0.81, segment: 'Growth', csOwner: 'D. Blake', lastTouch: '8 days' },
  { account: 'Horizon Capital', healthScore: 88, expansionPotential: 53, arr: 1.58, segment: 'Enterprise', csOwner: 'R. Chen', lastTouch: '3 days' },
  { account: 'Northwind Freight', healthScore: 69, expansionPotential: 91, arr: 1.44, segment: 'Mid-market', csOwner: 'S. Kim', lastTouch: '5 days' },
];
