// Default configuration values for AppShell sections.
// Keeping this isolated allows tooling and docs generators to consume stable defaults.
// z-index values are the default theme's layers (`theme.zIndices`); at runtime a
// section without an explicit `zIndex` reads the current theme's layer instead.
import { DEFAULT_Z_INDICES } from '../../core/theme/zIndices';
import type { HeaderConfig, NavbarConfig, AsideConfig, FooterConfig, BottomNavConfig } from './types';

export const DEFAULT_HEADER: HeaderConfig = {
  height: { base: 56, md: 64 },
  collapsed: false,
  zIndex: DEFAULT_Z_INDICES.header,
};

export const DEFAULT_NAVBAR: NavbarConfig = {
  width: { base: 280, lg: 300 },
  breakpoint: 'md',
  collapsed: { mobile: true, desktop: false },
  zIndex: DEFAULT_Z_INDICES.sticky,
  collapsedWidth: 72,
  expandOnHover: true,
  startCollapsedDesktop: false,
};

export const DEFAULT_ASIDE: AsideConfig = {
  width: { base: 260, lg: 300 },
  breakpoint: 'lg',
  collapsed: { mobile: true, desktop: true },
  zIndex: DEFAULT_Z_INDICES.sticky,
};

export const DEFAULT_FOOTER: FooterConfig = {
  height: { base: 48, md: 56 },
  collapsed: false,
  zIndex: DEFAULT_Z_INDICES.sticky,
};

export const DEFAULT_BOTTOM_NAV: BottomNavConfig = {
  height: { base: 56 },
  showOnlyMobile: true,
  collapsed: false,
  zIndex: DEFAULT_Z_INDICES.sticky,
};
