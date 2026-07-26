export type TrialMeta = {
  dropReason?: string;
};

export const TRIAL_CONVERSION = {
  id: 'trial-to-paid',
  name: 'Trial to paid conversion',
  steps: [
    { label: 'Sign-ups', value: 12800 },
    { label: 'Onboarded', value: 9100, meta: { dropReason: 'Setup friction and confusing success criteria' } as TrialMeta },
    { label: 'Week-1 active', value: 6200, meta: { dropReason: 'No team invites or connected data sources' } as TrialMeta },
    { label: 'Contracts', value: 2900, meta: { dropReason: 'Security review backlog and pricing clarity' } as TrialMeta },
    { label: 'Paid', value: 1850, meta: { dropReason: 'Budget timing & procurement approvals' } as TrialMeta },
  ],
};
