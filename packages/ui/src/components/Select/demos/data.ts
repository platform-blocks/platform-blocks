import type { SelectOption } from '@platform-blocks/ui';

export const sports: SelectOption<string>[] = [
  { label: 'Soccer', value: 'soccer' },
  { label: 'Basketball', value: 'basketball' },
  { label: 'Tennis', value: 'tennis' },
  { label: 'Football', value: 'football' },
]

/** Emoji and blurb are only needed by the custom rendering demo. */
export const detailedSports = [
  { name: 'Soccer', emoji: '⚽', value: 'soccer', description: 'Continuous play across two 45-minute halves.' },
  { name: 'Basketball', emoji: '🏀', value: 'basketball', description: 'Fast breaks balanced with half-court sets.' },
  { name: 'Tennis', emoji: '🎾', value: 'tennis', description: 'Sets decided by holding and breaking serve.' },
  { name: 'Football', emoji: '🏈', value: 'football', description: 'Down-by-down strategy on a 100-yard field.' },
].map((sport) => ({ ...sport, label: `${sport.emoji} ${sport.name}` }))

export type DetailedSport = (typeof detailedSports)[number]
