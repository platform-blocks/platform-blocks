import React from 'react';
import { Text } from '@platform-blocks/react-ui-library';
import { RouteLink } from '../RouteLink';

export interface BrandLinkProps {
  /** Wordmark size token. */
  size?: 'md' | 'lg';
  /** Called once the press has turned into a real in-app transition. */
  onNavigate?: () => void;
}

/**
 * Wordmark linking home.
 *
 * Shared so the header and the drawer that covers it carry the same wordmark.
 *
 * It has to be a real anchor rather than a Pressable — the header is
 * prerendered on every route, so this is the one link home a crawler sees from
 * a deep page.
 */
export const BrandLink: React.FC<BrandLinkProps> = ({ size = 'lg', onNavigate }) => (
  <RouteLink
    href="/"
    accessibilityLabel="react-ui-library home"
    onNavigate={onNavigate}
    style={{ flexDirection: 'row', alignItems: 'center' }}
  >
    <Text size={size} weight="semibold">
      react-ui-library
    </Text>
  </RouteLink>
);
