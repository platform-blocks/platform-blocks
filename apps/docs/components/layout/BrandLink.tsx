import React from 'react';
import { RouteLink } from '../RouteLink';
import { PlocksLogo } from './PlocksLogo';

export interface BrandLinkProps {
  /** Logo size token. */
  size?: 'md' | 'lg';
  /** Called once the press has turned into a real in-app transition. */
  onNavigate?: () => void;
}

/** The mark's height; the wordmark follows it. */
const LOGO_SIZE: Record<NonNullable<BrandLinkProps['size']>, number> = {
  md: 28,
  lg: 32,
};

/**
 * The logo, linking home.
 *
 * Shared so the header and the drawer that covers it carry the same brand: the
 * drawer opens over the header and stands in for it, and a wordmark that
 * changed size or lost its mark on the way would read as a different app.
 *
 * It has to be a real anchor rather than a Pressable — the header is
 * prerendered on every route, so this is the one link home a crawler sees from
 * a deep page.
 */
export const BrandLink: React.FC<BrandLinkProps> = ({ size = 'lg', onNavigate }) => (
  <RouteLink
    href="/"
    accessibilityLabel="plocks home"
    onNavigate={onNavigate}
    style={{ flexDirection: 'row', alignItems: 'center' }}
  >
    <PlocksLogo size={LOGO_SIZE[size]} />
  </RouteLink>
);
