/**
 * Shared fixtures for the DataTable demos.
 *
 * `Person` is deliberately wider than any single demo needs: each demo picks the
 * columns that illustrate its feature, so one directory of people can stand in
 * for a team roster, an access-control list, and a payroll table at once.
 */

export type Person = {
  id: number;
  name: string;
  email: string;
  /** Job title — what the person does. */
  title: string;
  /** Access level — what the person may do. Drives the select-filter demos. */
  role: 'Admin' | 'Editor' | 'Viewer';
  department: 'Engineering' | 'Design' | 'Marketing' | 'Sales';
  team: string;
  location: string;
  phone: string;
  startDate: string;
  lastLogin: string;
  status: 'active' | 'inactive' | 'pending';
  remote: boolean;
  salary: number;
  /** 1–5 review score, for demos that render a numeric cell. */
  performance: number;
};

export const people: Person[] = [
  { id: 1, name: 'Dana Moss', email: 'dana@example.com', title: 'Staff Engineer', role: 'Admin', department: 'Engineering', team: 'Platform', location: 'Berlin', phone: '+49 30 1234567', startDate: '2019-04-02', lastLogin: '2025-03-04', status: 'active', remote: true, salary: 148_000, performance: 4.7 },
  { id: 2, name: 'Noah Reed', email: 'noah@example.com', title: 'Product Designer', role: 'Editor', department: 'Design', team: 'Design', location: 'Austin', phone: '+1 512 555 0198', startDate: '2021-09-13', lastLogin: '2025-03-03', status: 'active', remote: false, salary: 122_000, performance: 4.5 },
  { id: 3, name: 'Priya Singh', email: 'priya@example.com', title: 'Engineering Manager', role: 'Admin', department: 'Engineering', team: 'Payments', location: 'Bangalore', phone: '+91 80 4000 1234', startDate: '2018-01-22', lastLogin: '2025-03-05', status: 'active', remote: true, salary: 165_000, performance: 4.9 },
  { id: 4, name: 'Marco Bianchi', email: 'marco@example.com', title: 'Data Scientist', role: 'Editor', department: 'Marketing', team: 'Insights', location: 'Milan', phone: '+39 02 9876543', startDate: '2022-06-01', lastLogin: '2025-02-16', status: 'pending', remote: true, salary: 118_000, performance: 4.2 },
  { id: 5, name: 'Aisha Khan', email: 'aisha@example.com', title: 'Frontend Engineer', role: 'Editor', department: 'Engineering', team: 'Growth', location: 'Toronto', phone: '+1 416 555 0142', startDate: '2020-11-30', lastLogin: '2025-03-01', status: 'active', remote: false, salary: 134_000, performance: 4.4 },
  { id: 6, name: 'Avery Knight', email: 'avery@example.com', title: 'Product Manager', role: 'Admin', department: 'Marketing', team: 'Growth', location: 'Seattle', phone: '+1 206 555 0111', startDate: '2019-08-19', lastLogin: '2025-02-27', status: 'active', remote: true, salary: 125_000, performance: 4.6 },
  { id: 7, name: 'Bianca Hall', email: 'bianca@example.com', title: 'Brand Designer', role: 'Viewer', department: 'Design', team: 'Design', location: 'Lisbon', phone: '+351 21 123 4567', startDate: '2023-02-06', lastLogin: '2025-02-23', status: 'active', remote: false, salary: 98_500, performance: 4.1 },
  { id: 8, name: 'Caleb Fox', email: 'caleb@example.com', title: 'Content Strategist', role: 'Viewer', department: 'Marketing', team: 'Growth', location: 'Chicago', phone: '+1 312 555 0177', startDate: '2021-05-17', lastLogin: '2025-01-28', status: 'inactive', remote: true, salary: 72_400, performance: 3.8 },
  { id: 9, name: 'Enzo Reed', email: 'enzo@example.com', title: 'QA Lead', role: 'Editor', department: 'Engineering', team: 'Quality', location: 'São Paulo', phone: '+55 11 91234 5678', startDate: '2020-03-09', lastLogin: '2025-01-19', status: 'inactive', remote: true, salary: 112_900, performance: 3.9 },
  { id: 10, name: 'Farah Li', email: 'farah@example.com', title: 'Account Executive', role: 'Viewer', department: 'Sales', team: 'Revenue', location: 'Singapore', phone: '+65 6123 4567', startDate: '2022-10-24', lastLogin: '2025-03-02', status: 'pending', remote: true, salary: 94_300, performance: 4.3 },
];

/** Filter options that match the values actually present in `people`. */
export const departmentFilterOptions = [
  { label: 'Engineering', value: 'Engineering' },
  { label: 'Design', value: 'Design' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Sales', value: 'Sales' },
];

export const roleFilterOptions = [
  { label: 'Admin', value: 'Admin' },
  { label: 'Editor', value: 'Editor' },
  { label: 'Viewer', value: 'Viewer' },
];

export const statusFilterOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Pending', value: 'pending' },
];

export type Sale = {
  id: number;
  region: string;
  rep: string;
  product: string;
  units: number;
  revenue: number;
  date: string;
};

export const sales: Sale[] = [
  { id: 1, region: 'North', rep: 'Dana', product: 'Widget A', units: 320, revenue: 15_840, date: '2026-01-12' },
  { id: 2, region: 'North', rep: 'Dana', product: 'Widget C', units: 410, revenue: 20_090, date: '2026-03-01' },
  { id: 3, region: 'North', rep: 'Priya', product: 'Gadget X', units: 540, revenue: 32_400, date: '2026-02-03' },
  { id: 4, region: 'South', rep: 'Noah', product: 'Widget B', units: 210, revenue: 9_870, date: '2026-01-15' },
  { id: 5, region: 'South', rep: 'Noah', product: 'Gadget Z', units: 275, revenue: 16_500, date: '2026-03-08' },
  { id: 6, region: 'East', rep: 'Marco', product: 'Gadget Y', units: 130, revenue: 7_150, date: '2026-02-19' },
  { id: 7, region: 'East', rep: 'Aisha', product: 'Widget A', units: 260, revenue: 12_870, date: '2026-02-24' },
  { id: 8, region: 'West', rep: 'Sam', product: 'Gadget X', units: 480, revenue: 28_800, date: '2026-03-15' },
];

export type Project = {
  id: number;
  name: string;
  owner: string;
  status: 'active' | 'planning' | 'completed';
  budget: number;
  summary: string;
};

export const projects: Project[] = [
  {
    id: 1,
    name: 'Observability Refresh',
    owner: 'Dana Moss',
    status: 'active',
    budget: 180_000,
    summary: 'Rolling out unified logging, tracing, and metrics across services.',
  },
  {
    id: 2,
    name: 'Mobile Onboarding',
    owner: 'Noah Reed',
    status: 'planning',
    budget: 120_000,
    summary: 'Designing a guided onboarding experience for new mobile users.',
  },
  {
    id: 3,
    name: 'Billing Automation',
    owner: 'Priya Singh',
    status: 'completed',
    budget: 95_000,
    summary: 'Automated invoicing and dunning flows to reduce manual effort.',
  },
  {
    id: 4,
    name: 'Analytics Rewrite',
    owner: 'Aisha Khan',
    status: 'active',
    budget: 140_000,
    summary: 'Replacing the legacy reporting pipeline with an event-driven model.',
  },
];
