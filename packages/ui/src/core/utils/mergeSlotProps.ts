/**
 * Merges a slot prop object on top of base props with correct ordering for the
 * slot-prop pattern used across the library (`labelProps`, `titleProps`,
 * `bodyProps`, `valueLabelProps`, `tickLabelProps`, `descriptionProps`, etc.).
 *
 * Rules:
 *   1. Non-style props from `slot` win over `base` (so `slot.weight = '700'`
 *      overrides a `base.weight = '500'` default).
 *   2. `style` becomes an array `[baseStyle, slotStyle]` where the slot style
 *      is applied last — RN flattens the array left-to-right with later entries
 *      overriding earlier ones, so user-passed style wins on conflicts.
 *
 * This helper exists because hand-rolling the merge is error-prone:
 * historically several components (Alert, Toast, Tabs) shipped subtle bugs
 * where a hardcoded `fontWeight` in the base style array silently overrode a
 * user's slot `fw` prop. Centralizing the merge order makes that mistake
 * impossible.
 *
 * @example
 * <Text {...mergeSlotProps(
 *   { size: 'sm', weight: '500', style: styles.label },
 *   labelProps
 * )}>
 *   {label}
 * </Text>
 */
export function mergeSlotProps<
  B extends object,
  S extends object | undefined,
>(base: B, slot?: S): B & (S extends undefined ? unknown : Partial<S>) {
  type Merged = B & (S extends undefined ? unknown : Partial<S>);
  if (!slot) return base as Merged;

  const merged = { ...base, ...slot } as Record<string, unknown>;
  const baseStyle = (base as { style?: unknown }).style;
  const slotStyle = (slot as { style?: unknown }).style;

  // Compose the style array unconditionally if either side has a style.
  if (baseStyle !== undefined || slotStyle !== undefined) {
    merged.style = [baseStyle, slotStyle];
  }

  return merged as Merged;
}
