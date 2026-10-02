# AppShell

AppShell arranges an app’s header, navigation, aside, footer, and mobile navigation in a responsive frame.

## Metadata

- Import: `import { AppShell } from '@plocks/ui';`
- Docs: https://plocks.dev/components/AppShell
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/AppShell

## Props

- `layout`: 'default' | 'alt' = 'default' — `'default'`: the header spans the full width and the navbar/aside sit below it. `'alt'`: the navbar and aside span the full height and the header sits between them. @default 'default'
- `header`: HeaderConfig
- `navbar`: NavbarConfig
- `aside`: AsideConfig
- `footer`: FooterConfig
- `bottomNav`: BottomNavConfig
- `showHeader`: boolean = true
- `layoutSections`: LayoutVisibilityConfig — Toggle rendering of individual autoLayout sections
- `autoLayout`: boolean — Enable AppShell auto-composition. When true, AppShell will render its own Header/Navbar/Main/Footer/BottomBar using the provided content props instead of relying on children.
- `headerContent`: React.ReactNode | (() => React.ReactNode) — Content to render inside AppShell.Header when autoLayout is enabled
- `navbarContent`: React.ReactNode | (() => React.ReactNode) — Content to render inside AppShell.Navbar when autoLayout is enabled
- `asideContent`: React.ReactNode | (() => React.ReactNode) — Content to render inside AppShell.Aside when autoLayout is enabled
- `footerContent`: React.ReactNode | (() => React.ReactNode) — Content to render inside AppShell.Footer when autoLayout is enabled
- `bottomNavItems`: BottomAppBarItem[] — Items for a mobile bottom navigation bar when autoLayout is enabled
- `bottomNavProps`: Partial<BottomAppBarProps> — Additional props forwarded to BottomAppBar in autoLayout mode (items overridden by bottomNavItems)
- `mobileMenu`: MobileMenuConfig
- `cssGeometry`: boolean = false — Take the shell's geometry from CSS custom properties rather than from the breakpoint the JavaScript resolved. Web only, and a contract: the app must inline the stylesheet `createAppShellCss` builds from the same config. It exists for statically rendered apps, where the prerender has no viewport to measure and every guess it makes lands as a layout shift and a hydration mismatch on first paint. See `shellCssVars.ts`.
- `statusBar`: StatusBarConfig
- `padding`: ResponsiveSize = no padding — Padding inside the main content area: a spacing token (`'md'`), px number, or a per-breakpoint object. @default no padding
- `withBorder`: boolean = true — Default `withBorder` for every section. @default true
- `zIndex`: number = each section's `theme.zIndices` layer — Stacking order for every section that doesn't set its own. @default each section's `theme.zIndices` layer
- `transitionDuration`: number = 200 — Navbar/content transition length in ms (`0` = instant). Reduced motion forces `0`. @default 200
- `transitionTimingFunction`: string = a cubic ease-in-out — CSS timing function for the navbar/content transitions: `'linear'`, `'ease'`, `'ease-in'`, `'ease-out'`, `'ease-in-out'` or `'cubic-bezier(…)'`.
- `disabled`: boolean = false
- `children` (required): React.ReactNode
- `withSafeArea`: boolean = true
- `maxContentWidth`: number | string — Maximum width for main content area to prevent stretching on wide screens
- `centerContent`: boolean — Center content when maxContentWidth is set
- `tableOfContents`: React.ReactNode — Optional table of contents rendered at the end side of the main content
- `hideTableOfContentsOnMobile`: boolean = true — Hide the table of contents automatically on mobile breakpoints
- `tableOfContentsWidth`: number | string = 280 — Custom width for the table of contents column
- `tableOfContentsWithBorder`: boolean = true — Toggle border between content and table of contents
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { AppShellHeader, AppShellNavbar, AppShellAside, AppShellFooter, AppShellBottomNav, AppShellMain, AppShellSection, BottomAppBar, StatusBarManager, AppLayoutProvider, AppLayoutRenderer, MobileMenu } from '@plocks/ui';`

### AppShellHeader

- `children` (required): React.ReactNode
- `withBorder`: boolean = AppShell `withBorder` — Draw the hairline between this section and the content. @default AppShell `withBorder`
- `zIndex`: number — Stacking order; wins over the section config and the theme layer.
- `accessibilityLabel`: string — Accessible name of the section's landmark.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### AppShellNavbar

- `drawerMode`: boolean — Force the overlay drawer (`true`) or the inline rail (`false`). Defaults to the drawer below `navbar.breakpoint`.
- `accessibilityLabel`: string = 'Main' — Accessible name of the navigation landmark. @default 'Main'
- `children` (required): React.ReactNode
- `withBorder`: boolean = AppShell `withBorder` — Draw the hairline between this section and the content. @default AppShell `withBorder`
- `zIndex`: number — Stacking order; wins over the section config and the theme layer.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### AppShellAside

- `children` (required): React.ReactNode
- `withBorder`: boolean = AppShell `withBorder` — Draw the hairline between this section and the content. @default AppShell `withBorder`
- `zIndex`: number — Stacking order; wins over the section config and the theme layer.
- `accessibilityLabel`: string — Accessible name of the section's landmark.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### AppShellFooter

- `children` (required): React.ReactNode
- `withBorder`: boolean = AppShell `withBorder` — Draw the hairline between this section and the content. @default AppShell `withBorder`
- `zIndex`: number — Stacking order; wins over the section config and the theme layer.
- `accessibilityLabel`: string — Accessible name of the section's landmark.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### AppShellBottomNav

- `children`: React.ReactNode — Content pinned to the bottom edge of the shell.
- `withBorder`: boolean
- `zIndex`: number
- `accessibilityLabel`: string — Accessible name of the navigation landmark.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### AppShellMain

- `children` (required): React.ReactNode
- `id`: string — Element id (DOM `id` on web, `nativeID` on native).
- `role`: Role = 'main' — Landmark role. @default 'main'
- `maw`: number | string — Maximum width of the content column inside the main area (the area itself still fills the space between the chrome), to prevent stretching on wide screens.
- `centerContent`: boolean — Center content when `maw` is set
- `tableOfContents`: React.ReactNode — Table of contents content to show at the end side of the content
- `hideTocOnMobile`: boolean — Hide table of contents on mobile
- `tocWidth`: number | string — Width of the table of contents sidebar
- `tocWithBorder`: boolean — Add border to table of contents
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### AppShellSection

- `children` (required): React.ReactNode
- `grow`: boolean — Take the remaining space of the navbar/aside.
- `withScrollArea`: boolean — Scroll the section's content when it overflows.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### BottomAppBar

- `items`: BottomAppBarItem[] — Structured items definition for standard navigation bar
- `activeKey`: string — Currently active item key
- `onItemPress`: (key: string) => void — Callback when an item is pressed (fires after per-item onPress)
- `showLabels`: boolean — Show labels under icons (default true). Items are still named for screen readers when hidden.
- `variant`: 'solid' | 'surface' | 'elevated' | 'translucent' — Visual variant
- `elevation`: number = 4 — Shadow strength for the `elevated` variant (Android-style elevation, 0–24). @default 4
- `fab`: React.ReactNode — Optional floating action button rendered centered & elevated
- `children`: React.ReactNode — Content pinned to the bottom edge of the shell.
- `withBorder`: boolean
- `zIndex`: number
- `accessibilityLabel`: string — Accessible name of the navigation landmark.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### StatusBarManager

- `children`: React.ReactNode
- `style`: 'auto' | 'light' | 'dark'
- `backgroundColor`: string
- `translucent`: boolean
- `hidden`: boolean

### AppLayoutProvider

- `blueprint` (required): AppLayoutBlueprint
- `value`: AppLayoutRuntimeOverrides
- `children` (required): React.ReactNode

### AppLayoutRenderer

- `children` (required): React.ReactNode

### MobileMenu

- `opened`: boolean — Whether the menu is open.
- `onClose` (required): () => void — Called when the menu asks to close (backdrop press, Escape, Android back).
- `children`: React.ReactNode
- `config`: MobileMenuConfig
- `accessibilityLabel`: string = 'Menu' — Accessible name of the menu dialog. @default 'Menu'
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Related hooks

- `useAppShell(): AppShellContextValue` — Returns the full state of the enclosing `AppShell` — resolved section sizes, navbar open/collapsed/rail flags, the current `breakpoint` and `isMobile`, and the `openNavbar` / `closeNavbar` / `toggleNavbar` controls — and throws when called outside an `AppShell`.
- `useAppShellApi(): AppShellApi` — Returns just the enclosing `AppShell`'s navbar controls (`openNavbar`, `closeNavbar`, `toggleNavbar`) — for menu buttons and links that drive the navbar without re-rendering on layout changes — and throws when called outside an `AppShell`.
- `useAppShellLayout(): AppShellLayoutValue` — Returns just the enclosing `AppShell`'s resolved section sizes (`headerHeight`, `navbarWidth`, `asideWidth`, `footerHeight`, `bottomNavHeight`) — for content that has to position itself around the shell chrome — and throws when called outside an `AppShell`.
- `useBreakpoint(): Breakpoint` — Returns the current breakpoint name, from the theme's breakpoint table (`theme.breakpoints`, or a `BreakpointProvider` override): `base` below `xs` (480), then `xs`, `sm` (576), `md` (768), `lg` (992), `xl` (1200).
- `useNavbarHover(): boolean` — Returns `true` while the pointer is over the `AppShell` navbar rail (web, with `navbar.expandOnHover` on) and `false` otherwise, including outside an `AppShell` — for navbar content that should show its labels only while the collapsed rail is hover-expanded.
- `useAppLayoutContext(): AppLayoutProviderValue` — Returns the enclosing `AppLayoutProvider`'s value — the `defineAppLayout` `blueprint` plus the resolved `runtime` (`query`, `pathname`, `navigation`, `platform`, `meta`) — for custom renderers that read the layout the way `AppLayoutRenderer` does, and throws when called outside an `AppLayoutProvider`.

## Types

```ts
export interface HeaderConfig {
  height: ResponsiveSize;
  /** Hide the header: `AppShell.Header` renders nothing and reserves no height. @default false */
  collapsed?: boolean;
  /**
   * Whether the main content starts below the header. `false` lets content run
   * underneath it (e.g. a translucent header over a hero image). @default true
   */
  offset?: boolean;
  /** Stacking order of `AppShell.Header`. @default theme.zIndices.header */
  zIndex?: number;
}

export interface NavbarConfig {
  width: ResponsiveSize;
  /**
   * Narrowest viewport at which the navbar is an inline rail (web). Below it the
   * navbar is an overlay drawer. Native apps always use the drawer. @default 'md'
   */
  breakpoint?: Breakpoint;
  /**
   * Initial state. `mobile: false` starts the drawer open; `desktop: true`
   * starts the desktop navbar collapsed to its rail (`startCollapsedDesktop`
   * takes precedence). The state resets when the viewport crosses `breakpoint`.
   */
  collapsed?: {
    mobile?: boolean;
    desktop?: boolean;
  };
  /**
   * Stacking order of the inline rail. @default theme.zIndices.sticky
   * (The drawer uses `theme.zIndices.overlay`, above the header; set
   * `AppShell.Navbar zIndex` to override both.)
   */
  zIndex?: number;
  collapsedWidth?: number;
  expandOnHover?: boolean;
  /**
   * When paired with `expandOnHover`, hovering the collapsed rail pushes the
   * main content aside (flexing the page) instead of overlaying it.
   * Defaults to `false` (overlay) to preserve existing behavior.
   */
  expandOnHoverPush?: boolean;
  /**
   * Auto-expand the navbar (start open, not a collapsed rail) once the viewport
   * reaches this breakpoint or wider, e.g. `'xl'`. Overrides
   * `startCollapsedDesktop` at/above the breakpoint; smaller desktops keep the
   * collapsed-with-hover behavior.
   */
  autoExpandBreakpoint?: Breakpoint;
  startCollapsedDesktop?: boolean;
}

export interface AsideConfig {
  width: ResponsiveSize;
  /** Narrowest viewport at which `collapsed.desktop` applies; below it `collapsed.mobile` does. @default 'md' */
  breakpoint?: Breakpoint;
  collapsed?: {
    /** @default true */
    mobile?: boolean;
    /** @default false */
    desktop?: boolean;
  };
  /** Stacking order of `AppShell.Aside`. @default theme.zIndices.sticky */
  zIndex?: number;
}

export interface FooterConfig {
  height: ResponsiveSize;
  /** Hide the footer: `AppShell.Footer` renders nothing and reserves no height. @default false */
  collapsed?: boolean;
  /** Whether the main content ends above the footer. `false` lets content run underneath it. @default true */
  offset?: boolean;
  /** Stacking order of `AppShell.Footer`. @default theme.zIndices.sticky */
  zIndex?: number;
}

export interface BottomNavConfig {
  height: ResponsiveSize;
  /** Only show the bottom navigation at mobile widths (and on native). @default true */
  showOnlyMobile?: boolean;
  /** Hide the bottom navigation. @default false */
  collapsed?: boolean;
  /** Stacking order of `AppShell.BottomNav`. @default theme.zIndices.sticky */
  zIndex?: number;
}

export interface LayoutVisibilityConfig {
  header?: boolean;
  navbar?: boolean;
  aside?: boolean;
  footer?: boolean;
  bottomNav?: boolean;
}

export interface BottomAppBarItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  badgeCount?: number;
  onPress?: () => void; // per-item override
}

export interface BottomAppBarProps extends AppShellBottomNavProps {
  /** Structured items definition for standard navigation bar */
  items?: BottomAppBarItem[];
  /** Currently active item key */
  activeKey?: string;
  /** Callback when an item is pressed (fires after per-item onPress) */
  onItemPress?: (key: string) => void;
  /** Show labels under icons (default true). Items are still named for screen readers when hidden. */
  showLabels?: boolean;
  /** Visual variant */
  variant?: 'solid' | 'surface' | 'elevated' | 'translucent';
  /** Shadow strength for the `elevated` variant (Android-style elevation, 0–24). @default 4 */
  elevation?: number;
  /** Optional floating action button rendered centered & elevated */
  fab?: React.ReactNode;
}
```

## Examples

### Basics

Arrange a header and page content inside a responsive app frame.

```tsx
import { AppShell, Block, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth h={240}>
      <AppShell
        header={{ height: 48 }}
        headerContent={<Text p="sm">App header</Text>}
        autoLayout
        withSafeArea={false}
      >
        <Block p="md">
          <Text>Page content</Text>
        </Block>
      </AppShell>
    </Block>
  );
}
```

### Enhanced

```tsx
import { AppShell, Block, Text } from '@plocks/ui';

const sampleTOC = (
  <Block>
    <Text variant="h6" mb="sm">Contents</Text>
    <Text size="sm" style={{ paddingLeft: 0 }}>Introduction</Text>
    <Text size="sm" style={{ paddingLeft: 12 }}>Getting Started</Text>
    <Text size="sm" style={{ paddingLeft: 12 }}>Installation</Text>
    <Text size="sm" style={{ paddingLeft: 24 }}>NPM Package</Text>
    <Text size="sm" style={{ paddingLeft: 24 }}>Yarn Setup</Text>
    <Text size="sm" style={{ paddingLeft: 12 }}>Configuration</Text>
    <Text size="sm" style={{ paddingLeft: 0 }}>Components</Text>
    <Text size="sm" style={{ paddingLeft: 12 }}>AppShell</Text>
    <Text size="sm" style={{ paddingLeft: 12 }}>Layout System</Text>
    <Text size="sm" style={{ paddingLeft: 0 }}>Examples</Text>
  </Block>
);

export function Demo() {
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ 
        width: 280, 
        breakpoint: 'md',
        collapsed: { mobile: true }
      }}
      autoLayout
      headerContent={() => (
        <Text variant="h4" style={{ padding: 16 }}>
          Documentation
        </Text>
      )}
      navbarContent={() => (
        <Block p="md">
          <Text variant="h6">Navigation</Text>
          <Text size="sm">Getting Started</Text>
          <Text size="sm">Components</Text>
          <Text size="sm">Examples</Text>
          <Text size="sm">API Reference</Text>
        </Block>
      )}
      maxContentWidth={960}
      tableOfContents={sampleTOC}
      tableOfContentsWidth={280}
      hideTableOfContentsOnMobile
      centerContent
    >
      <Block p="lg">
        <Text variant="h1">Main Content with TOC</Text>
        <Text>
          This demonstrates the enhanced AppShell with max width constraints 
          and a table of contents sidebar. The main content area has a maximum 
          width and is centered, while the table of contents appears on the right 
          on desktop screens.
        </Text>
        <Text>
          The layout is fully responsive - on mobile devices, the table of contents 
          is hidden by default to preserve screen space.
        </Text>
        <Text variant="h2">Features</Text>
        <Text>
          • Max width constraint for better readability on wide screens
        </Text>
        <Text>
          • Table of contents sidebar with responsive behavior
        </Text>
        <Text>
          • Configurable through AppShell or AppShellMain props
        </Text>
        <Text>
          • Seamless integration with existing AppShell layout system
        </Text>
      </Block>
    </AppShell>
  );
}
```
