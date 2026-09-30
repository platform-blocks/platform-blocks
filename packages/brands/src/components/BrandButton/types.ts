import type React from 'react';

import type { ButtonProps, ButtonVariant } from '@plocks/ui';
import { getBrandColors, type BrandColors, type BrandName } from '../../registry';

/**
 * Any brand the icon registry knows. Widened from a hand-kept list so
 * badge-only brands (`google-play`, `soundcloud`, …) are addressable from the
 * same component.
 */
export type BrandPlatform = BrandName;

export interface BrandConfig extends BrandColors {
  /** Canonical registry name of the mark to render */
  icon: BrandName;
}

/**
 * `plain` is the brand-neutral "Sign in with …" style: the raised surface, body
 * text and the full-color mark. The color-bearing Button variants fill with the
 * brand's own color.
 */
export type BrandButtonVariant = ButtonVariant | 'plain';

export interface BrandButtonProps
  extends Omit<ButtonProps, 'startSection' | 'endSection' | 'icon' | 'color' | 'variant'> {
  /** The brand/platform to style the button for */
  brand: BrandPlatform;
  /** Visual variant. @default 'plain' */
  variant?: BrandButtonVariant;
  /** Side of the label the brand icon sits on (`left`/`right` follow the reading direction). */
  iconPosition?: 'left' | 'right' | 'start' | 'end';
  /** Icon variant: 'full' for multi-color, 'mono' for single-color outline */
  iconVariant?: 'full' | 'mono';
  /** Override the default brand icon */
  icon?: React.ReactNode;
  /** Button text. Omit when rendering a store badge. */
  title?: string;
  /** Override icon color (overrides brand default colors) */
  color?: string;
  /**
   * Badge lead-in line, e.g. "Download on the" / "Listen on". Supplying this or
   * `secondaryText` switches the component to the two-line store-badge layout,
   * where `variant`, `loading` and `fullWidth` do not apply.
   */
  primaryText?: string;
  /** Badge headline, e.g. "App Store" / "Spotify" */
  secondaryText?: string;
  /** Badge shell border color (badge layout only) */
  borderColor?: string;
  /** Force the badge's dark-mode styling instead of following the theme */
  darkMode?: boolean;
}

/** Resolves a brand onto the mark to render and the colors that go with it. */
export const resolveBrandConfig = (brand: BrandPlatform): BrandConfig => ({
  icon: brand,
  ...getBrandColors(brand),
});
