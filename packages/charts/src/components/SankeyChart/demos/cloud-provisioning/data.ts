export const NODES = [
  { id: 'request', name: 'Service Request' },
  { id: 'security-review', name: 'Security Review' },
  { id: 'infra-approval', name: 'Infra Approval' },
  { id: 'dev-env', name: 'Dev Cluster' },
  { id: 'staging-env', name: 'Staging Cluster' },
  { id: 'prod-env', name: 'Prod Cluster' },
  { id: 'kubernetes', name: 'Kubernetes Workloads' },
  { id: 'serverless', name: 'Serverless Jobs' },
  { id: 'databases', name: 'Managed Databases' },
];

export const LINKS = [
  { source: 'request', target: 'security-review', value: 60 },
  { source: 'request', target: 'infra-approval', value: 20 },
  { source: 'security-review', target: 'infra-approval', value: 55 },
  { source: 'infra-approval', target: 'dev-env', value: 28 },
  { source: 'infra-approval', target: 'staging-env', value: 20 },
  { source: 'infra-approval', target: 'prod-env', value: 27 },
  { source: 'dev-env', target: 'kubernetes', value: 16 },
  { source: 'dev-env', target: 'serverless', value: 6 },
  { source: 'dev-env', target: 'databases', value: 6 },
  { source: 'staging-env', target: 'kubernetes', value: 10 },
  { source: 'staging-env', target: 'serverless', value: 4 },
  { source: 'staging-env', target: 'databases', value: 6 },
  { source: 'prod-env', target: 'kubernetes', value: 12 },
  { source: 'prod-env', target: 'serverless', value: 7 },
  { source: 'prod-env', target: 'databases', value: 8 },
];
