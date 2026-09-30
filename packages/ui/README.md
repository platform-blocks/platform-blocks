<p align="center">
  <a href="https://plocks.dev/" rel="noopener" target="_blank"><img height="64" src="https://raw.githubusercontent.com/platform-blocks/plocks/main/brand/png/mark.png" alt="plocks"/></a>
</p>

<h1 align="center">@plocks/ui</h1>

<div align="center">

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/platform-blocks/plocks/blob/HEAD/LICENSE)
[![npm](https://img.shields.io/npm/v/@plocks/ui)](https://www.npmjs.com/package/@plocks/ui)
[![Discord](https://img.shields.io/badge/Chat%20on-Discord-%235865f2)](https://discord.gg/kbHjwzgXbc)

</div>

A comprehensive React Native UI component library for building accessible, themeable, and cross-platform mobile and web applications. Part of the [plocks](https://plocks.dev/) ecosystem.

## Features

- **90+ components** — Inputs, navigation, data display, overlays, layout, and more
- **Cross-platform** — iOS, Android, and Web from a single codebase
- **Themeable** — Built-in light and dark themes with full customization via `createTheme`
- **Accessible** — Screen reader, keyboard navigation, and RTL support out of the box
- **Animated** — Smooth interactions powered by `react-native-reanimated`
- **Haptics** — Optional feedback via `expo-haptics`
- **i18n ready** — Built-in internationalization with `I18nProvider`
- **Tree-shakeable** — ESM and CJS builds with no side effects

## More packages

Install these alongside `@plocks/ui` for more:

| Package | Contents |
| --- | --- |
| `@plocks/dates` | Calendar and date, month, year and time pickers |
| `@plocks/charts` | Charts that size themselves to their container |
| `@plocks/code` | `CodeBlock` with syntax highlighting, and `Markdown` |
| `@plocks/media` | `AudioPlayer`, `Video`, and sound feedback |
| `@plocks/carousel` | `Carousel` |
| `@plocks/spotlight` | A ⌘K command palette |

## Installation

```bash
npm install @plocks/ui
```

On Expo, install the peers with `npx expo install` so the versions match your SDK:

```bash
npx expo install react-native-reanimated react-native-safe-area-context react-native-svg
```

### Peer dependencies

The built-in `Icon` glyphs are included in `@plocks/ui`; Tabler is only needed if you choose to use additional Tabler icons yourself.

| Package | Version |
| --- | --- |
| `react` | `>=18.0.0 <20.0.0` |
| `react-native` | `>=0.79.0` |
| `react-native-reanimated` | `>=3.5.0` |
| `react-native-safe-area-context` | `>=4.5.0` |
| `react-native-svg` | `>=13.0.0` |

`@plocks/ui` is ESM-only. Use `import` or a React Native/Expo bundler; CommonJS `require('@plocks/ui')` is no longer supported.

### Optional integrations

These are lazily required and only needed when you use features that depend on them:

`expo-clipboard` · `expo-document-picker` · `expo-haptics` · `expo-linear-gradient` · `expo-navigation-bar` · `expo-status-bar` · `react-native-gesture-handler` · `react-native-worklets` · `@react-native-masked-view/masked-view` · `@shopify/flash-list`

They are declared as optional peer dependencies (see `peerDependenciesMeta` in `package.json`) with the minimum versions that work.

## Quick start

```tsx
import { PlocksProvider, Button } from '@plocks/ui';

export function App() {
  return (
    <PlocksProvider>
      <Button label="Hello" />
    </PlocksProvider>
  );
}
```

## Components

Every name below links to its documentation page, with live examples and a full prop table.

### Layout
[`AppShell`](https://plocks.dev/components/AppShell) · [`Block`](https://plocks.dev/components/Block) · [`Surface`](https://plocks.dev/components/Surface) · [`Flex`](https://plocks.dev/components/Flex) · [`Grid`](https://plocks.dev/components/Grid) · [`Masonry`](https://plocks.dev/components/Masonry) · [`Space`](https://plocks.dev/components/Space) · `Row` · `Column` · `KeyboardAwareLayout` · `BottomAppBar`

### Typography
[`Text`](https://plocks.dev/components/Text) · [`Title`](https://plocks.dev/components/Title) · [`Highlight`](https://plocks.dev/components/Highlight) · [`GradientText`](https://plocks.dev/components/GradientText) · [`ShimmerText`](https://plocks.dev/components/ShimmerText) · [`Blockquote`](https://plocks.dev/components/Blockquote) · [`Markdown`](https://plocks.dev/components/Markdown) · [`KeyCap`](https://plocks.dev/components/KeyCap)

`Text` also ships semantic aliases: `H1`–`H6`, `P`, `Small`, `Strong`, `Bold`, `Italic`, `Underline`, `Code`, `Kbd`, `Mark`, `Cite`, `Sub`, `Sup`.

### Forms & inputs
[`Button`](https://plocks.dev/components/Button) · [`BrandButton`](https://plocks.dev/components/BrandButton) · [`Input`](https://plocks.dev/components/Input) · [`TextArea`](https://plocks.dev/components/TextArea) · [`NumberInput`](https://plocks.dev/components/NumberInput) · [`PinInput`](https://plocks.dev/components/PinInput) · [`PhoneInput`](https://plocks.dev/components/PhoneInput) · [`Search`](https://plocks.dev/components/Search) · [`Select`](https://plocks.dev/components/Select) · [`AutoComplete`](https://plocks.dev/components/AutoComplete) · [`Checkbox`](https://plocks.dev/components/Checkbox) · [`Radio`](https://plocks.dev/components/Radio) · [`Switch`](https://plocks.dev/components/Switch) · [`Toggle`](https://plocks.dev/components/Toggle) · [`SegmentedControl`](https://plocks.dev/components/SegmentedControl) · [`Slider`](https://plocks.dev/components/Slider) · [`Knob`](https://plocks.dev/components/Knob) · [`Joystick`](https://plocks.dev/components/Joystick) · [`Rating`](https://plocks.dev/components/Rating) · [`FileInput`](https://plocks.dev/components/FileInput) · [`ColorInput`](https://plocks.dev/components/ColorInput) · [`ColorPicker`](https://plocks.dev/components/ColorPicker) · [`ColorSwatch`](https://plocks.dev/components/ColorSwatch) · [`ControlField`](https://plocks.dev/components/ControlField) · [`Form`](https://plocks.dev/components/Form)

`PasswordInput` (from `Input`), `RangeSlider` (from `Slider`), and `ToggleButton` / `ToggleGroup` / `ToggleBar` (from `Toggle`) are exported alongside their base components.

### Dates & time
[`Calendar`](https://plocks.dev/components/Calendar) · [`MiniCalendar`](https://plocks.dev/components/MiniCalendar) · [`DatePicker`](https://plocks.dev/components/DatePicker) · [`DatePickerInput`](https://plocks.dev/components/DatePickerInput) · [`MonthPicker`](https://plocks.dev/components/MonthPicker) · [`MonthPickerInput`](https://plocks.dev/components/MonthPickerInput) · [`YearPicker`](https://plocks.dev/components/YearPicker) · [`YearPickerInput`](https://plocks.dev/components/YearPickerInput) · [`TimePicker`](https://plocks.dev/components/TimePicker) · [`TimePickerInput`](https://plocks.dev/components/TimePickerInput)

### Navigation
[`Tabs`](https://plocks.dev/components/Tabs) · [`Menu`](https://plocks.dev/components/Menu) · [`MenuItemButton`](https://plocks.dev/components/MenuItemButton) · [`Breadcrumbs`](https://plocks.dev/components/Breadcrumbs) · [`Pagination`](https://plocks.dev/components/Pagination) · [`Stepper`](https://plocks.dev/components/Stepper) · [`Link`](https://plocks.dev/components/Link) · [`TableOfContents`](https://plocks.dev/components/TableOfContents)

### Data display
[`DataTable`](https://plocks.dev/components/DataTable) · [`Table`](https://plocks.dev/components/Table) · [`DataList`](https://plocks.dev/components/DataList) · [`ListGroup`](https://plocks.dev/components/ListGroup) · [`Card`](https://plocks.dev/components/Card) · [`Avatar`](https://plocks.dev/components/Avatar) · [`Badge`](https://plocks.dev/components/Badge) · [`Indicator`](https://plocks.dev/components/Indicator) · [`Chip`](https://plocks.dev/components/Chip) · [`Timeline`](https://plocks.dev/components/Timeline) · [`Tree`](https://plocks.dev/components/Tree) · [`RollingNumber`](https://plocks.dev/components/RollingNumber) · [`Accordion`](https://plocks.dev/components/Accordion)

### Feedback
[`Alert`](https://plocks.dev/components/Alert) · [`Toast`](https://plocks.dev/components/Toast) · [`Progress`](https://plocks.dev/components/Progress) · [`Ring`](https://plocks.dev/components/Ring) · [`Skeleton`](https://plocks.dev/components/Skeleton) · [`Loader`](https://plocks.dev/components/Loader) · [`LoadingOverlay`](https://plocks.dev/components/LoadingOverlay) · `Gauge` · `Notice`

### Overlays
[`Dialog`](https://plocks.dev/components/Dialog) · [`Tooltip`](https://plocks.dev/components/Tooltip) · [`Popover`](https://plocks.dev/components/Popover) · [`ContextMenu`](https://plocks.dev/components/ContextMenu) · [`Overlay`](https://plocks.dev/components/Overlay) · [`Spotlight`](https://plocks.dev/components/Spotlight) · `FloatingActions`

### Media
[`Icon`](https://plocks.dev/components/Icon) · [`IconButton`](https://plocks.dev/components/IconButton) · [`BrandIcon`](https://plocks.dev/components/BrandIcon) · [`Image`](https://plocks.dev/components/Image) · [`Carousel`](https://plocks.dev/components/Carousel) · [`Lightbox`](https://plocks.dev/components/Lightbox) · [`Video`](https://plocks.dev/components/Video) · [`AudioPlayer`](https://plocks.dev/components/AudioPlayer) · [`Waveform`](https://plocks.dev/components/Waveform)

### Utilities
[`Collapse`](https://plocks.dev/components/Collapse) · [`Divider`](https://plocks.dev/components/Divider) · [`CodeBlock`](https://plocks.dev/components/CodeBlock) · [`CopyButton`](https://plocks.dev/components/CopyButton) · [`QRCode`](https://plocks.dev/components/QRCode) · [`Spoiler`](https://plocks.dev/components/Spoiler)

### App store & marketplace badges
Ready-made buttons and badges for App Store, Google Play, Microsoft Store, Amazon, Spotify, Apple Music, YouTube, Discord, GitHub, and 20+ more — see [`BrandButton`](https://plocks.dev/components/BrandButton) and [`BrandIcon`](https://plocks.dev/components/BrandIcon).

### Charts
25 chart types (line, bar, area, pie, donut, candlestick, sankey, heatmap, and more) ship in the companion [`@plocks/charts`](https://www.npmjs.com/package/@plocks/charts) package — browse them at [plocks.dev/charts](https://plocks.dev/charts).

## Hooks

| Hook | Description |
| --- | --- |
| [`useClipboard`](https://plocks.dev/hooks/useClipboard) | Copy text to clipboard |
| [`useControllableState`](https://plocks.dev/hooks/useControllableState) | Controlled / uncontrolled value state |
| [`useDebouncedCallback`](https://plocks.dev/hooks/useDebouncedCallback) | Debounced function wrapper with cancel / flush |
| [`useDebouncedValue`](https://plocks.dev/hooks/useDebouncedValue) | Debounced copy of a changing value |
| [`useDeviceInfo`](https://plocks.dev/hooks/useDeviceInfo) | Device and platform information |
| [`useDisclosure`](https://plocks.dev/hooks/useDisclosure) | Boolean open / close / toggle state |
| [`useEscapeKey`](https://plocks.dev/hooks/useEscapeKey) | Escape key handler |
| [`useGlobalHotkeys`](https://plocks.dev/hooks/useGlobalHotkeys) | Global keyboard shortcuts |
| [`useHotkeys`](https://plocks.dev/hooks/useHotkeys) | Scoped keyboard shortcuts |
| [`useHaptics`](https://plocks.dev/hooks/useHaptics) | Haptic feedback control |
| `useHapticsSettings` | Haptics configuration |
| [`useHover`](https://plocks.dev/hooks/useHover) | Cross-platform hover state and handlers |
| [`useMaskedInput`](https://plocks.dev/hooks/useMaskedInput) | Input masking |
| [`useMediaQuery`](https://plocks.dev/hooks/useMediaQuery) | Media queries on web, dimension queries on native |
| [`useOverlayMode`](https://plocks.dev/hooks/useOverlayMode) | Overlay UI state |
| [`useScrollSpy`](https://plocks.dev/hooks/useScrollSpy) | Scroll position tracking |
| `useSoundHaptics` | Sound system's `triggerHaptic` wrapper |
| [`useSpotlightToggle`](https://plocks.dev/hooks/useSpotlightToggle) | Spotlight tutorial control |
| [`useTitleRegistration`](https://plocks.dev/hooks/useTitleRegistration) | Register headings with the title registry |
| [`useToggleColorScheme`](https://plocks.dev/hooks/useToggleColorScheme) | Dark / light mode toggle |

## Theming

Create custom themes or extend the defaults:

```tsx
import { PlocksProvider, createTheme } from '@plocks/ui';

const theme = createTheme({
  colors: { primary: '#6366f1' },
});

export function App() {
  return (
    <PlocksProvider theme={theme}>
      {/* ... */}
    </PlocksProvider>
  );
}
```

A partial theme is merged onto the built-in theme of the current color scheme, so it keeps
light/dark switching. For different overrides per scheme, pass a pair:
`<PlocksProvider theme={{ light: lightOverrides, dark: darkOverrides }}>`.

### Titles and group labels

Text that labels a group of items, like a sheet title above options or a menu section header,
steps back from the items it labels, so it never reads as one more option. Two text roles
control it:

| Role | Used by | Default |
| --- | --- | --- |
| `panelTitle` | Select / AutoComplete mobile sheet, DrawerNavigator, DataTable filter popover | secondary, `sm`, 600 |
| `sectionLabel` | Menu.Label, AutoComplete and Spotlight groups, ControlField.Group, nested Tree headings | secondary, `sm`, 600, uppercase, 0.5 tracking |

Change a role for every component at once through `textRoles`, field by field. For example,
to restore primary-colored `md` sheet titles and turn off the caps on section labels:

```tsx
const theme = createTheme({
  textRoles: {
    panelTitle: { color: 'primary', fontSize: 'md' },
    sectionLabel: { uppercase: false },
  },
});
```

`color` takes a `theme.text` role, a palette token, or any CSS color. Use a role in your own
UI with `<Text textRole="sectionLabel">`, or with `resolveTextRole(theme, 'sectionLabel')` for
a raw React Native `Text`. To restyle a single instance, use the component's slot prop
(`groupLabelProps`, `titleProps`, `textProps`).

### No-flash color scheme for static / server rendering

Put the scheme variables and the color-scheme script in the document head, so a prerendered page
is in the reader's scheme at first paint (before hydration):

```tsx
import { BUILT_IN_DARK_THEME, DEFAULT_THEME, createThemeColorVariablesCss, getColorSchemeScript } from '@plocks/ui';

<head>
  <style dangerouslySetInnerHTML={{ __html: createThemeColorVariablesCss(DEFAULT_THEME, BUILT_IN_DARK_THEME) }} />
  <script dangerouslySetInnerHTML={{ __html: getColorSchemeScript() }} />
</head>
```

`getColorSchemeScript()` reads the mode `PlocksProvider` persists with `themeModeConfig` (`localStorage`
`plocks-theme-mode`, falling back to `prefers-color-scheme`) and stamps
`<html data-plocks-color-scheme="light|dark">` plus the `plocks-light|dark` class
for an explicit choice — the same marker the providers set after hydration. Pair it with
`colorsAsCssVariables` on `PlocksProvider`.

## Documentation

Full documentation, interactive examples, and component playground are available at [plocks.dev](https://plocks.dev).

- [Getting started](https://plocks.dev/getting-started)
- [Component gallery](https://plocks.dev/components)
- [Charts](https://plocks.dev/charts)
- [Hooks](https://plocks.dev/hooks)
- [Accessibility](https://plocks.dev/accessibility)
- [Localization](https://plocks.dev/localization)
- [FAQ](https://plocks.dev/faq)
- [llms.txt](https://plocks.dev/llms.txt) — Full API reference for LLMs and AI assistants

## Contributing

See the [contributing guide](https://github.com/platform-blocks/plocks/blob/main/CONTRIBUTING.md) for setup instructions.

## License

[MIT](https://github.com/platform-blocks/plocks/blob/main/LICENSE) © [Josh Stovall](https://github.com/joshstovall)
