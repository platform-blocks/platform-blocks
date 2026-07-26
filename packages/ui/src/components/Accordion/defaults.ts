export const ACCORDION_DEFAULTS = {
  type: 'single',
  defaultExpanded: [] as string[],
  variant: 'default',
  size: 'md',
  showChevron: true,
  autoPersist: true,
  animated: true,
  transitionDuration: 220,
  chevronPosition: 'end',
  density: 'comfortable'
} as const;

export type AccordionDefaultProps = typeof ACCORDION_DEFAULTS;
