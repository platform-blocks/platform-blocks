import type { ComponentType } from 'react';

import { DashboardExample } from './DashboardExample';
import { LoginExample } from './LoginExample';
import { SettingsExample } from './SettingsExample';

/** Maps config/examples.ts slugs to the live example screens. */
export const EXAMPLE_REGISTRY: Record<string, ComponentType> = {
  login: LoginExample,
  settings: SettingsExample,
  dashboard: DashboardExample,
};
