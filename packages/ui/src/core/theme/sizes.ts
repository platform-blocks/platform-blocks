// The size accepted by every `size` prop: xs | sm | md | lg | xl | 2xl | 3xl,
// or a number. Components resolve it against the current theme with
// `core/theme/tokens.ts` (`resolveFontSize`, `resolveSpacing`, `resolveRadius`,
// `resolveIconSize`, `getControlSize`).

import type { ComponentSizeValue } from './componentSize';

export type SizeValue = ComponentSizeValue;
