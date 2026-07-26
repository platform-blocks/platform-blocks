/**
 * The scenes the knob selects between, one per detent around the dial. Icons are named
 * rather than built here so this stays plain data; the demo turns each name into an
 * `<Icon>` tinted with the same accent.
 */
export type StatusScene = {
  /** Position on the 0–360 dial. */
  value: number;
  label: string;
  accentColor: string;
  iconName: string;
};

export const STATUS_SCENES: StatusScene[] = [
  { value: 0, label: 'Sleep', accentColor: '#64748b', iconName: 'moon' },
  { value: 90, label: 'Focus', accentColor: '#0ea5e9', iconName: 'target' },
  { value: 180, label: 'Charge', accentColor: '#22c55e', iconName: 'bolt' },
  { value: 270, label: 'Party', accentColor: '#f97316', iconName: 'sparkles' },
];

