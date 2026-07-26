export const ERROR_LEVELS = [
  { label: 'Level L (~7%)', value: 'L' as const },
  { label: 'Level M (~15%)', value: 'M' as const },
  { label: 'Level Q (~25%)', value: 'Q' as const },
  { label: 'Level H (~30%)', value: 'H' as const }
] as const;

export const QUIET_ZONES = [0, 2, 4, 8] as const;
