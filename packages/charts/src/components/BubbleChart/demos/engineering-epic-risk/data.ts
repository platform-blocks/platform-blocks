export type Squad =
  | 'Platform Reliability'
  | 'Automation'
  | 'Security'
  | 'Mobile'
  | 'Monetization'
  | 'Enablement'
  | 'Observability'
  | 'FinOps';

export type Epic = {
  epic: string;
  storyPoints: number;
  defectDensity: number;
  riskMultiplier: number;
  criticalPaths: number;
  squad: Squad;
  phase: 'Design' | 'Build' | 'Stabilize';
};

export // Validated categorical palette slots (see charts colors.ts paletteDefaultLight).
const squadPalette: Record<Squad, string> = {
  'Platform Reliability': '#2a78d6',
  Automation: '#eb6834',
  Security: '#1baf7a',
  Mobile: '#eda100',
  Monetization: '#e87ba4',
  Enablement: '#008300',
  Observability: '#4a3aa7',
  FinOps: '#e34948',
};

export const epics: Epic[] = [
  { epic: 'Observability Agent v2', storyPoints: 210, defectDensity: 0.7, riskMultiplier: 3.1, criticalPaths: 4, squad: 'Platform Reliability', phase: 'Build' },
  { epic: 'Workflow Automation', storyPoints: 160, defectDensity: 0.5, riskMultiplier: 2.4, criticalPaths: 2, squad: 'Automation', phase: 'Design' },
  { epic: 'Data Residency Controls', storyPoints: 180, defectDensity: 0.9, riskMultiplier: 3.6, criticalPaths: 5, squad: 'Security', phase: 'Build' },
  { epic: 'Mobile Offline Sync', storyPoints: 120, defectDensity: 0.4, riskMultiplier: 2.1, criticalPaths: 1, squad: 'Mobile', phase: 'Build' },
  { epic: 'Billing Pipeline Rewrite', storyPoints: 240, defectDensity: 1.2, riskMultiplier: 4.4, criticalPaths: 6, squad: 'Monetization', phase: 'Stabilize' },
  { epic: 'Feature Flag Governance', storyPoints: 95, defectDensity: 0.3, riskMultiplier: 1.7, criticalPaths: 1, squad: 'Enablement', phase: 'Design' },
  { epic: 'Real-time Alerts', storyPoints: 140, defectDensity: 0.6, riskMultiplier: 2.5, criticalPaths: 3, squad: 'Observability', phase: 'Build' },
  { epic: 'Infra Cost Guardrails', storyPoints: 185, defectDensity: 0.8, riskMultiplier: 3.2, criticalPaths: 2, squad: 'FinOps', phase: 'Stabilize' },
];
