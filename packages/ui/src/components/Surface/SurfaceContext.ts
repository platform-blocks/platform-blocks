import { createContext, useContext } from 'react';

import type { SurfaceLevel } from '../../core/theme/types';
import type { SurfaceContextValue } from './types';

/**
 * Nearest enclosing Surface level. Defaults to `0` — an un-nested Surface is
 * assumed to sit directly on the page.
 */
export const SurfaceContext = createContext<SurfaceContextValue>({ level: 0 });

/**
 * The elevation level of the surface the caller is rendered on.
 *
 * Useful for anything that needs to tint *against* its container rather than
 * paint its own: hover/pressed states, dividers, inputs on a dark card.
 */
export function useSurfaceLevel(): SurfaceLevel {
  return useContext(SurfaceContext).level;
}
