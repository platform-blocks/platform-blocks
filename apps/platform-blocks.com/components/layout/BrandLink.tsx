import React from 'react';
import { Image, Text } from '@platform-blocks/ui';
import { RouteLink } from '../RouteLink';

export interface BrandLinkProps {
  /** Wordmark size token; the mark scales with it. */
  size?: 'md' | 'lg';
  /** Called once the press has turned into a real in-app transition. */
  onNavigate?: () => void;
}

const MARK_SIZE: Record<NonNullable<BrandLinkProps['size']>, number> = {
  md: 22,
  lg: 24,
};

/**
 * Mark plus wordmark, linking home.
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
    accessibilityLabel="Platform Blocks home"
    onNavigate={onNavigate}
    style={{ flexDirection: 'row', alignItems: 'center' }}
  >
    <Image
      source={require('../../assets/favicon.png')}
      alt=""
      w={MARK_SIZE[size]}
      h={MARK_SIZE[size]}
      resizeMode="contain"
      style={{ marginRight: 8 }}
    />
    <Text size={size} weight="semibold">
      Platform Blocks
    </Text>
  </RouteLink>
);
