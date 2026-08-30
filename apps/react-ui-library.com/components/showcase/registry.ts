import type { ComponentType } from 'react';

import { InputShowcase } from './InputShowcase';
import { TypographyShowcase } from './TypographyShowcase';
import { MediaShowcase } from './MediaShowcase';
import { ChartShowcase } from './ChartShowcase';
import TogglePlayground from './ToggleShowcase';
import ButtonPlayground from './ButtonShowcase';
import SwitchPlayground from './SwitchShowcase';
import CheckboxPlayground from './CheckboxShowcase';
import SkeletonPlayground from './SkeletonShowcase';
import DataPlayground from './DataShowcase';
import LayoutPlayground from './LayoutShowcase';
import DatesPlayground from './DatesShowcase';
import { SliderPlayground } from './SliderShowcase';
import { EverythingPlayground } from './EverythingShowcase';

export type PlaygroundComponent = ComponentType;

/**
 * Registry maps the `playground.id` emitted by generate-demos to a concrete React component.
 * Not every component defines a playground yet, but this allows us to selectively enable the tab.
 */
const REGISTRY: Record<string, PlaygroundComponent> = {
  Button: ButtonPlayground,
  Input: InputShowcase,
  Switch: SwitchPlayground,
  Checkbox: CheckboxPlayground,
  Toggle: TogglePlayground,
  Slider: SliderPlayground,
  Skeleton: SkeletonPlayground,
  Data: DataPlayground,
  Layout: LayoutPlayground,
  Typography: TypographyShowcase,
  Media: MediaShowcase,
  Dates: DatesPlayground,
  Charts: ChartShowcase,
  Showcase: EverythingPlayground,
};

export function resolveComponentPlayground(id: string): PlaygroundComponent | null {
  return REGISTRY[id] || null;
}

export function listRegisteredPlaygrounds(): string[] {
  return Object.keys(REGISTRY);
}

export function hasPlayground(id: string): boolean {
  return id in REGISTRY;
}
