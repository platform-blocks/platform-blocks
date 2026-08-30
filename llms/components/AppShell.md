# AppShell

High-level layout container orchestrating header, navigation rail/drawer, aside panel, footer, and optional mobile bottom navigation. Provides consistent responsive behavior and safe-area handling across platforms.

## Responsibilities
- Manage responsive breakpoints & derive layout measurements
- Provide context for child sections (header height, navbar width, etc.)
- Support desktop inline collapsing (rail) and mobile drawer presentation
- Coordinate safe-area padding via `SafeAreaProvider`
- Offer configurable animation duration for structural transitions

## Public Sub-Components
- `AppShell.Header` – fixed header region at top
- `AppShell.Navbar` – left navigation (rail / drawer)
- `AppShell.Aside` – right supplemental panel
- `AppShell.Footer` – bottom footer (desktop)
- `AppShell.BottomNav` – mobile-only bottom navigation bar
- `AppShell.Main` – primary scroll/content surface
- `AppShell.Section` – helper container for vertical stacking inside panels

## Key Hooks
- `useAppShell()` – consume computed layout context
- `useBreakpoint()` – current breakpoint token
- `useNavbarHover()` – desktop rail hover expansion state
- `resolveResponsiveValue(value, breakpoint)` – utility to normalize `ResponsiveSize`

## Default Config Reference
See `defaults.ts` for baseline dimension & behavior values and `meta.schema.ts` for a lightweight machine-readable spec.

## Notes
- Hover expansion is intentionally local to navbar to avoid global re-renders
- Rail width defined via `navbar.collapsedWidth` (default 72)
- Future: integrate design token pipeline for breakpoint map & spacing scales.
- `AppShell.Main` supports configurable `maxWidth`, centering, and responsive table-of-contents rail. When `autoLayout` is enabled you can pass `maxContentWidth`, `centerContent`, and table of contents props directly to `AppShell` for convenience.

## Metadata

- Canonical name: `AppShell`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { AppShell } from '@platform-blocks/react-ui-library';`
- Category: layout
- Docs: https://react-ui-library.com/components/AppShell
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/AppShell

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `layout` | 'default' \| 'alt' | No |  |  |
| `header` | HeaderConfig | No |  |  |
| `navbar` | NavbarConfig | No |  |  |
| `aside` | AsideConfig | No |  |  |
| `footer` | FooterConfig | No |  |  |
| `bottomNav` | BottomNavConfig | No |  |  |
| `showHeader` | boolean | No | true |  |
| `layoutSections` | LayoutVisibilityConfig | No |  | Toggle rendering of individual autoLayout sections |
| `autoLayout` | boolean | No |  | Enable AppShell auto-composition. When true, AppShell will render its own Header/Navbar/Main/Footer/BottomBar using the provided content props instead of relying on children. |
| `headerContent` | React.ReactNode \| (() => React.ReactNode) | No |  | Content to render inside AppShell.Header when autoLayout is enabled |
| `navbarContent` | React.ReactNode \| (() => React.ReactNode) | No |  | Content to render inside AppShell.Navbar when autoLayout is enabled |
| `asideContent` | React.ReactNode \| (() => React.ReactNode) | No |  | Content to render inside AppShell.Aside when autoLayout is enabled |
| `footerContent` | React.ReactNode \| (() => React.ReactNode) | No |  | Content to render inside AppShell.Footer when autoLayout is enabled |
| `bottomNavItems` | BottomAppBarItem[] | No |  | Items for a mobile bottom navigation bar when autoLayout is enabled |
| `bottomNavProps` | Partial<AppShellBottomNavProps> | No |  | Additional props forwarded to BottomAppBar in autoLayout mode (items overridden by bottomNavItems) |
| `mobileMenu` | MobileMenuConfig | No |  |  |
| `cssGeometry` | boolean | No | false | Take the shell's geometry from CSS custom properties rather than from the breakpoint the JavaScript resolved. Web only, and a contract: the app must inline the stylesheet `createAppShellCss` builds from the same config. It exists for statically rendered apps, where the prerender has no viewport to measure and every guess it makes lands as a layout shift and a hydration mismatch on first paint. See `shellCssVars.ts`. |
| `statusBar` | StatusBarConfig | No |  |  |
| `padding` | ResponsiveSize | No | 'md' |  |
| `withBorder` | boolean | No | true |  |
| `zIndex` | number | No | 100 |  |
| `transitionDuration` | number | No | 200 |  |
| `transitionTimingFunction` | string | No | 'ease' |  |
| `disabled` | boolean | No | false |  |
| `children` | React.ReactNode | Yes |  |  |
| `backgroundColor` | string | No |  |  |
| `withSafeArea` | boolean | No | true |  |
| `style` | any | No |  |  |
| `testID` | string | No |  |  |
| `maxContentWidth` | number \| string | No |  | Maximum width for main content area to prevent stretching on wide screens |
| `centerContent` | boolean | No | true | Center content when maxContentWidth is set |
| `tableOfContents` | React.ReactNode | No |  | Optional table of contents rendered to the right of the main content |
| `hideTableOfContentsOnMobile` | boolean | No | true | Hide the table of contents automatically on mobile breakpoints |
| `tableOfContentsWidth` | number \| string | No | 280 | Custom width for the table of contents column |
| `tableOfContentsWithBorder` | boolean | No | true | Toggle border between content and table of contents |
| `m` | number | No |  | Margin applied to all sides |
| `mt` | number | No |  | Margin applied to the top side |
| `mr` | number | No |  | Margin applied to the right side |
| `mb` | number | No |  | Margin applied to the bottom side |
| `ml` | number | No |  | Margin applied to the left side |
| `mx` | number | No |  | Horizontal margin applied to left and right sides |
| `my` | number | No |  | Vertical margin applied to top and bottom sides |
| `p` | number | No |  | Padding applied to all sides |
| `pt` | number | No |  | Padding applied to the top side |
| `pr` | number | No |  | Padding applied to the right side |
| `pb` | number | No |  | Padding applied to the bottom side |
| `pl` | number | No |  | Padding applied to the left side |
| `px` | number | No |  | Horizontal padding applied to left and right sides |
| `py` | number | No |  | Vertical padding applied to top and bottom sides |

## Examples

### Enhanced
ID: `AppShell.enhanced` • Category: general

```tsx
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
