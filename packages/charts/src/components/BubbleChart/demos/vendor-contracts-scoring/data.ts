export type Category = 'Cloud' | 'Security' | 'Data' | 'Productivity';

export type VendorContract = {
  vendor: string;
  complianceScore: number;
  renewalProbability: number;
  annualSpendMillions: number;
  category: Category;
  owner: string;
  termEnds: string;
  riskLevel: 'Low' | 'Medium' | 'High';
};

export // Validated categorical palette slots (see charts colors.ts paletteDefaultLight).
const categoryPalette: Record<Category, string> = {
  Cloud: '#2a78d6',
  Security: '#eb6834',
  Data: '#1baf7a',
  Productivity: '#eda100',
};

export const contracts: VendorContract[] = [
  { vendor: 'Atlas Cloud', complianceScore: 94, renewalProbability: 88, annualSpendMillions: 4.8, category: 'Cloud', owner: 'Infra Ops', termEnds: 'FY26 Q2', riskLevel: 'Low' },
  { vendor: 'ShieldGuard', complianceScore: 82, renewalProbability: 64, annualSpendMillions: 3.1, category: 'Security', owner: 'Security', termEnds: 'FY25 Q4', riskLevel: 'Medium' },
  { vendor: 'InsightLake', complianceScore: 90, renewalProbability: 79, annualSpendMillions: 2.6, category: 'Data', owner: 'Analytics', termEnds: 'FY25 Q3', riskLevel: 'Low' },
  { vendor: 'FlowSuite', complianceScore: 76, renewalProbability: 72, annualSpendMillions: 1.9, category: 'Productivity', owner: 'Workplace', termEnds: 'FY25 Q1', riskLevel: 'Medium' },
  { vendor: 'SentinelOne', complianceScore: 88, renewalProbability: 54, annualSpendMillions: 3.8, category: 'Security', owner: 'Security', termEnds: 'FY26 Q1', riskLevel: 'High' },
  { vendor: 'Nimbus Edge', complianceScore: 70, renewalProbability: 48, annualSpendMillions: 2.4, category: 'Cloud', owner: 'Infra Ops', termEnds: 'FY24 Q4', riskLevel: 'High' },
  { vendor: 'DataForge', complianceScore: 86, renewalProbability: 83, annualSpendMillions: 2.9, category: 'Data', owner: 'Analytics', termEnds: 'FY26 Q4', riskLevel: 'Low' },
  { vendor: 'CollabSphere', complianceScore: 92, renewalProbability: 91, annualSpendMillions: 3.5, category: 'Productivity', owner: 'Workplace', termEnds: 'FY27 Q1', riskLevel: 'Low' },
];
