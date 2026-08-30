<p align="center">
  <a href="https://react-ui-library.com/" rel="noopener" target="_blank"><img width="75" height="75" src="https://raw.githubusercontent.com/platform-blocks/react-ui-library/refs/heads/main/apps/react-ui-library.com/assets/favicon.png" alt="React UI Library logo"/></a>
</p>

<h1 align="center">@platform-blocks/react-ui-library</h1>

<div align="center">

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/platform-blocks/react-ui-library/blob/HEAD/LICENSE)
[![npm](https://img.shields.io/npm/v/@platform-blocks/react-ui-library)](https://www.npmjs.com/package/@platform-blocks/react-ui-library)
[![Discord](https://img.shields.io/badge/Chat%20on-Discord-%235865f2)](https://discord.gg/kbHjwzgXbc)

</div>

A comprehensive React Native UI component library for building accessible, themeable, and cross-platform mobile and web applications. Part of the [React UI Library](https://react-ui-library.com/) ecosystem.

## Features

- **100+ components** — Inputs, dates, navigation, data display, overlays, media, and more
- **Cross-platform** — iOS, Android, and Web from a single codebase
- **Themeable** — Built-in light and dark themes with full customization via `createTheme`
- **Accessible** — Screen reader, keyboard navigation, and RTL support out of the box
- **Animated** — Smooth interactions powered by `react-native-reanimated`
- **Haptics & sound** — Optional feedback via `expo-haptics` and `expo-audio`
- **i18n ready** — Built-in internationalization with `I18nProvider`
- **Tree-shakeable** — ESM and CJS builds with no side effects

## Installation

```bash
npm install @platform-blocks/react-ui-library @tabler/icons-react-native
```

On Expo, install the peers with `npx expo install` so the versions match your SDK:

```bash
npx expo install react-native-reanimated react-native-safe-area-context react-native-svg @tabler/icons-react-native
```

### Peer dependencies

All of these are required. `@tabler/icons-react-native` backs the `Icon` registry, which is imported from the package root — without it, `Icon` (and every component that renders one) fails to resolve.

| Package | Version |
| --- | --- |
| `react` | `>=18.0.0 <20.0.0` |
| `react-native` | `>=0.73.0` |
| `react-native-reanimated` | `>=3.4.0` |
| `react-native-safe-area-context` | `>=4.5.0` |
| `react-native-svg` | `>=13.0.0` |
| `@tabler/icons-react-native` | `>=3.0.0` |

### Optional integrations

These are lazily required and only needed when you use features that depend on them:

`expo-audio` · `expo-document-picker` · `expo-haptics` · `expo-linear-gradient` · `expo-status-bar` · `react-native-worklets` · `react-syntax-highlighter` · `@react-native-masked-view/masked-view` · `@shopify/flash-list` · `react-native-reanimated-carousel`

## Quick start

```tsx
import { PlatformBlocksProvider, Button } from '@platform-blocks/react-ui-library';

export function App() {
  return (
    <PlatformBlocksProvider>
      <Button label="Hello" />
    </PlatformBlocksProvider>
  );
}
```

## Components

Every name below links to its documentation page, with live examples and a full prop table.

### Layout
[`AppShell`](https://react-ui-library.com/components/AppShell) · [`Block`](https://react-ui-library.com/components/Block) · [`Surface`](https://react-ui-library.com/components/Surface) · [`Flex`](https://react-ui-library.com/components/Flex) · [`Grid`](https://react-ui-library.com/components/Grid) · [`Masonry`](https://react-ui-library.com/components/Masonry) · [`Space`](https://react-ui-library.com/components/Space) · `Row` · `Column` · `KeyboardAwareLayout` · `BottomAppBar`

### Typography
[`Text`](https://react-ui-library.com/components/Text) · [`Title`](https://react-ui-library.com/components/Title) · [`Highlight`](https://react-ui-library.com/components/Highlight) · [`GradientText`](https://react-ui-library.com/components/GradientText) · [`ShimmerText`](https://react-ui-library.com/components/ShimmerText) · [`Blockquote`](https://react-ui-library.com/components/Blockquote) · [`Markdown`](https://react-ui-library.com/components/Markdown) · [`KeyCap`](https://react-ui-library.com/components/KeyCap)

`Text` also ships semantic aliases: `H1`–`H6`, `P`, `Small`, `Strong`, `Bold`, `Italic`, `Underline`, `Code`, `Kbd`, `Mark`, `Cite`, `Sub`, `Sup`.

### Forms & inputs
[`Button`](https://react-ui-library.com/components/Button) · [`BrandButton`](https://react-ui-library.com/components/BrandButton) · [`Input`](https://react-ui-library.com/components/Input) · [`TextArea`](https://react-ui-library.com/components/TextArea) · [`NumberInput`](https://react-ui-library.com/components/NumberInput) · [`PinInput`](https://react-ui-library.com/components/PinInput) · [`PhoneInput`](https://react-ui-library.com/components/PhoneInput) · [`Search`](https://react-ui-library.com/components/Search) · [`Select`](https://react-ui-library.com/components/Select) · [`AutoComplete`](https://react-ui-library.com/components/AutoComplete) · [`Checkbox`](https://react-ui-library.com/components/Checkbox) · [`Radio`](https://react-ui-library.com/components/Radio) · [`Switch`](https://react-ui-library.com/components/Switch) · [`Toggle`](https://react-ui-library.com/components/Toggle) · [`SegmentedControl`](https://react-ui-library.com/components/SegmentedControl) · [`Slider`](https://react-ui-library.com/components/Slider) · [`Knob`](https://react-ui-library.com/components/Knob) · [`Joystick`](https://react-ui-library.com/components/Joystick) · [`Rating`](https://react-ui-library.com/components/Rating) · [`FileInput`](https://react-ui-library.com/components/FileInput) · [`ColorInput`](https://react-ui-library.com/components/ColorInput) · [`ColorPicker`](https://react-ui-library.com/components/ColorPicker) · [`ColorSwatch`](https://react-ui-library.com/components/ColorSwatch) · [`ControlField`](https://react-ui-library.com/components/ControlField) · [`Form`](https://react-ui-library.com/components/Form)

`PasswordInput` (from `Input`), `RangeSlider` (from `Slider`), and `ToggleButton` / `ToggleGroup` / `ToggleBar` (from `Toggle`) are exported alongside their base components.

### Dates & time
[`Calendar`](https://react-ui-library.com/components/Calendar) · [`MiniCalendar`](https://react-ui-library.com/components/MiniCalendar) · [`DatePicker`](https://react-ui-library.com/components/DatePicker) · [`DatePickerInput`](https://react-ui-library.com/components/DatePickerInput) · [`MonthPicker`](https://react-ui-library.com/components/MonthPicker) · [`MonthPickerInput`](https://react-ui-library.com/components/MonthPickerInput) · [`YearPicker`](https://react-ui-library.com/components/YearPicker) · [`YearPickerInput`](https://react-ui-library.com/components/YearPickerInput) · [`TimePicker`](https://react-ui-library.com/components/TimePicker) · [`TimePickerInput`](https://react-ui-library.com/components/TimePickerInput)

### Navigation
[`Tabs`](https://react-ui-library.com/components/Tabs) · [`Menu`](https://react-ui-library.com/components/Menu) · [`MenuItemButton`](https://react-ui-library.com/components/MenuItemButton) · [`Breadcrumbs`](https://react-ui-library.com/components/Breadcrumbs) · [`Pagination`](https://react-ui-library.com/components/Pagination) · [`Stepper`](https://react-ui-library.com/components/Stepper) · [`Link`](https://react-ui-library.com/components/Link) · [`TableOfContents`](https://react-ui-library.com/components/TableOfContents)

### Data display
[`DataTable`](https://react-ui-library.com/components/DataTable) · [`Table`](https://react-ui-library.com/components/Table) · [`DataList`](https://react-ui-library.com/components/DataList) · [`ListGroup`](https://react-ui-library.com/components/ListGroup) · [`Card`](https://react-ui-library.com/components/Card) · [`Avatar`](https://react-ui-library.com/components/Avatar) · [`Badge`](https://react-ui-library.com/components/Badge) · [`Indicator`](https://react-ui-library.com/components/Indicator) · [`Chip`](https://react-ui-library.com/components/Chip) · [`Timeline`](https://react-ui-library.com/components/Timeline) · [`Tree`](https://react-ui-library.com/components/Tree) · [`RollingNumber`](https://react-ui-library.com/components/RollingNumber) · [`Accordion`](https://react-ui-library.com/components/Accordion)

### Feedback
[`Alert`](https://react-ui-library.com/components/Alert) · [`Toast`](https://react-ui-library.com/components/Toast) · [`Progress`](https://react-ui-library.com/components/Progress) · [`Ring`](https://react-ui-library.com/components/Ring) · [`Skeleton`](https://react-ui-library.com/components/Skeleton) · [`Loader`](https://react-ui-library.com/components/Loader) · [`LoadingOverlay`](https://react-ui-library.com/components/LoadingOverlay) · `Gauge` · `Notice`

### Overlays
[`Dialog`](https://react-ui-library.com/components/Dialog) · [`Tooltip`](https://react-ui-library.com/components/Tooltip) · [`Popover`](https://react-ui-library.com/components/Popover) · [`ContextMenu`](https://react-ui-library.com/components/ContextMenu) · [`Overlay`](https://react-ui-library.com/components/Overlay) · [`Spotlight`](https://react-ui-library.com/components/Spotlight) · `FloatingActions`

### Media
[`Icon`](https://react-ui-library.com/components/Icon) · [`IconButton`](https://react-ui-library.com/components/IconButton) · [`BrandIcon`](https://react-ui-library.com/components/BrandIcon) · [`Image`](https://react-ui-library.com/components/Image) · [`Carousel`](https://react-ui-library.com/components/Carousel) · [`Gallery`](https://react-ui-library.com/components/Gallery) · [`Video`](https://react-ui-library.com/components/Video) · [`AudioPlayer`](https://react-ui-library.com/components/AudioPlayer) · [`Waveform`](https://react-ui-library.com/components/Waveform)

### Utilities
[`Collapse`](https://react-ui-library.com/components/Collapse) · [`Divider`](https://react-ui-library.com/components/Divider) · [`CodeBlock`](https://react-ui-library.com/components/CodeBlock) · [`CopyButton`](https://react-ui-library.com/components/CopyButton) · [`QRCode`](https://react-ui-library.com/components/QRCode) · [`Spoiler`](https://react-ui-library.com/components/Spoiler)

### App store & marketplace badges
Ready-made buttons and badges for App Store, Google Play, Microsoft Store, Amazon, Spotify, Apple Music, YouTube, Discord, GitHub, and 20+ more — see [`BrandButton`](https://react-ui-library.com/components/BrandButton) and [`BrandIcon`](https://react-ui-library.com/components/BrandIcon).

### Charts
25 chart types (line, bar, area, pie, donut, candlestick, sankey, heatmap, and more) ship in the companion [`@platform-blocks/charts`](https://www.npmjs.com/package/@platform-blocks/charts) package — browse them at [react-ui-library.com/charts](https://react-ui-library.com/charts).

## Hooks

| Hook | Description |
| --- | --- |
| [`useClipboard`](https://react-ui-library.com/hooks/useClipboard) | Copy text to clipboard |
| [`useControllableState`](https://react-ui-library.com/hooks/useControllableState) | Controlled / uncontrolled value state |
| [`useDebouncedCallback`](https://react-ui-library.com/hooks/useDebouncedCallback) | Debounced function wrapper with cancel / flush |
| [`useDebouncedValue`](https://react-ui-library.com/hooks/useDebouncedValue) | Debounced copy of a changing value |
| [`useDeviceInfo`](https://react-ui-library.com/hooks/useDeviceInfo) | Device and platform information |
| [`useDisclosure`](https://react-ui-library.com/hooks/useDisclosure) | Boolean open / close / toggle state |
| [`useEscapeKey`](https://react-ui-library.com/hooks/useEscapeKey) | Escape key handler |
| [`useGlobalHotkeys`](https://react-ui-library.com/hooks/useGlobalHotkeys) | Global keyboard shortcuts |
| [`useHotkeys`](https://react-ui-library.com/hooks/useHotkeys) | Scoped keyboard shortcuts |
| [`useHaptics`](https://react-ui-library.com/hooks/useHaptics) | Haptic feedback control |
| `useHapticsSettings` | Haptics configuration |
| [`useHover`](https://react-ui-library.com/hooks/useHover) | Cross-platform hover state and handlers |
| [`useMaskedInput`](https://react-ui-library.com/hooks/useMaskedInput) | Input masking |
| [`useMediaQuery`](https://react-ui-library.com/hooks/useMediaQuery) | Media queries on web, dimension queries on native |
| [`useOverlayMode`](https://react-ui-library.com/hooks/useOverlayMode) | Overlay UI state |
| [`useScrollSpy`](https://react-ui-library.com/hooks/useScrollSpy) | Scroll position tracking |
| `useSoundHaptics` | Sound system's `triggerHaptic` wrapper |
| [`useSpotlightToggle`](https://react-ui-library.com/hooks/useSpotlightToggle) | Spotlight tutorial control |
| [`useTitleRegistration`](https://react-ui-library.com/hooks/useTitleRegistration) | Register headings with the title registry |
| [`useToggleColorScheme`](https://react-ui-library.com/hooks/useToggleColorScheme) | Dark / light mode toggle |

## Theming

Create custom themes or extend the defaults:

```tsx
import { PlatformBlocksProvider, createTheme } from '@platform-blocks/react-ui-library';

const theme = createTheme({
  colors: { primary: '#6366f1' },
});

export function App() {
  return (
    <PlatformBlocksProvider theme={theme}>
      {/* ... */}
    </PlatformBlocksProvider>
  );
}
```

## Documentation

Full documentation, interactive examples, and component playground are available at [react-ui-library.com](https://react-ui-library.com).

- [Getting started](https://react-ui-library.com/getting-started)
- [Component gallery](https://react-ui-library.com/components)
- [Charts](https://react-ui-library.com/charts)
- [Hooks](https://react-ui-library.com/hooks)
- [Accessibility](https://react-ui-library.com/accessibility)
- [Localization](https://react-ui-library.com/localization)
- [FAQ](https://react-ui-library.com/faq)
- [llms.txt](https://react-ui-library.com/llms.txt) — Full API reference for LLMs and AI assistants

## Contributing

See the [contributing guide](https://github.com/platform-blocks/react-ui-library/blob/main/CONTRIBUTING.md) for setup instructions.

## License

[MIT](https://github.com/platform-blocks/react-ui-library/blob/main/LICENSE) © [Josh Stovall](https://github.com/joshstovall)
