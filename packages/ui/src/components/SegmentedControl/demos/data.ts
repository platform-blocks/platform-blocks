import type { SegmentedControlItem } from '@platform-blocks/react-ui-library';

export const frameworks: SegmentedControlItem[] = [
  { label: 'React', value: 'react' },
  { label: 'Angular', value: 'angular' },
  { label: 'Vue', value: 'vue' },
];

/** The same set as `frameworks`, for demos that pass plain strings as `data`. */
export const frameworkNames: string[] = frameworks.map((item) => item.label as string);

export const panes: SegmentedControlItem[] = [
  { label: 'Preview', value: 'preview' },
  { label: 'Code', value: 'code' },
  { label: 'Export', value: 'export' },
];

export const priorities: SegmentedControlItem[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

export const accountSections: SegmentedControlItem[] = [
  { label: 'Profile', value: 'profile' },
  { label: 'Settings', value: 'settings' },
  { label: 'Privacy', value: 'privacy' },
];

/** `Flow` is disabled so demos can show a single unavailable segment. */
export const languages: SegmentedControlItem[] = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Flow', value: 'flow', disabled: true },
];

export const cadences: SegmentedControlItem[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

export const publishStates: SegmentedControlItem[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'Published', value: 'published' },
];
