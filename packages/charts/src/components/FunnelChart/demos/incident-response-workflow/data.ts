export type IncidentMeta = {
  medianDuration?: string;
  automationWin?: string;
};

export const INCIDENT_RESPONSE = {
  id: 'incident-response',
  name: 'Incident response workflow',
  steps: [
    { label: 'Detection', value: 264, meta: { medianDuration: '4 min to detect' } as IncidentMeta },
    { label: 'Triage', value: 228, meta: { medianDuration: '16 min to triage', automationWin: 'Pager triage rules auto-close 32 low-signal alerts' } as IncidentMeta },
    { label: 'Containment', value: 182, meta: { medianDuration: '38 min to contain', automationWin: 'Runbooks auto-isolate hosts for 41% of cases' } as IncidentMeta },
    { label: 'Eradication', value: 164, meta: { medianDuration: '1.4 hr to resolve root cause' } as IncidentMeta },
    { label: 'Recovery', value: 158, meta: { medianDuration: '2.3 hr to restore services' } as IncidentMeta },
    { label: 'Review', value: 151, meta: { medianDuration: 'Completed within 48 hr SLA' } as IncidentMeta },
  ],
};
