<p align="center">
  <a href="https://platform-blocks.com/" rel="noopener" target="_blank"><img width="75" height="75" src="https://raw.githubusercontent.com/joshstovall/platform-blocks/refs/heads/main/apps/platform-blocks.com/assets/favicon.png" alt="Platform Blocks logo"/></a>
</p>

<h1 align="center">@platform-blocks/ui</h1>

<div align="center">

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/joshstovall/platform-blocks/blob/HEAD/LICENSE)
[![npm](https://img.shields.io/npm/v/@platform-blocks/ui)](https://www.npmjs.com/package/@platform-blocks/ui)
[![Discord](https://img.shields.io/badge/Chat%20on-Discord-%235865f2)](https://discord.gg/kbHjwzgXbc)

</div>

A comprehensive React Native UI component library for building accessible, themeable, and cross-platform mobile and web applications. Part of the [Platform Blocks](https://platform-blocks.com/) ecosystem.

## Features

- **95+ components** — Inputs, dates, navigation, data display, overlays, media, and more
- **Cross-platform** — iOS, Android, and Web from a single codebase
- **Themeable** — Built-in light and dark themes with full customization via `createTheme`
- **Accessible** — Screen reader, keyboard navigation, and RTL support out of the box
- **Animated** — Smooth interactions powered by `react-native-reanimated`
- **Haptics & sound** — Optional feedback via `expo-haptics` and `expo-audio`
- **i18n ready** — Built-in internationalization with `I18nProvider`
- **Tree-shakeable** — ESM and CJS builds with no side effects

## Installation

```bash
npm install @platform-blocks/ui @tabler/icons-react-native
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
import { PlatformBlocksProvider, Button } from '@platform-blocks/ui';

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
[`AppShell`](https://platform-blocks.com/components/AppShell) · [`Block`](https://platform-blocks.com/components/Block) · [`Surface`](https://platform-blocks.com/components/Surface) · [`Flex`](https://platform-blocks.com/components/Flex) · [`Grid`](https://platform-blocks.com/components/Grid) · [`Masonry`](https://platform-blocks.com/components/Masonry) · [`Space`](https://platform-blocks.com/components/Space) · `Row` · `Column` · `KeyboardAwareLayout` · `BottomAppBar`

### Typography
[`Text`](https://platform-blocks.com/components/Text) · [`Title`](https://platform-blocks.com/components/Title) · [`Highlight`](https://platform-blocks.com/components/Highlight) · [`GradientText`](https://platform-blocks.com/components/GradientText) · [`ShimmerText`](https://platform-blocks.com/components/ShimmerText) · [`Blockquote`](https://platform-blocks.com/components/Blockquote) · [`Markdown`](https://platform-blocks.com/components/Markdown) · [`KeyCap`](https://platform-blocks.com/components/KeyCap)

`Text` also ships semantic aliases: `H1`–`H6`, `P`, `Small`, `Strong`, `Bold`, `Italic`, `Underline`, `Code`, `Kbd`, `Mark`, `Cite`, `Sub`, `Sup`.

### Forms & inputs
[`Button`](https://platform-blocks.com/components/Button) · [`BrandButton`](https://platform-blocks.com/components/BrandButton) · [`Input`](https://platform-blocks.com/components/Input) · [`TextArea`](https://platform-blocks.com/components/TextArea) · [`NumberInput`](https://platform-blocks.com/components/NumberInput) · [`PinInput`](https://platform-blocks.com/components/PinInput) · [`PhoneInput`](https://platform-blocks.com/components/PhoneInput) · [`Search`](https://platform-blocks.com/components/Search) · [`Select`](https://platform-blocks.com/components/Select) · [`AutoComplete`](https://platform-blocks.com/components/AutoComplete) · [`Checkbox`](https://platform-blocks.com/components/Checkbox) · [`Radio`](https://platform-blocks.com/components/Radio) · [`Switch`](https://platform-blocks.com/components/Switch) · [`Toggle`](https://platform-blocks.com/components/Toggle) · [`SegmentedControl`](https://platform-blocks.com/components/SegmentedControl) · [`Slider`](https://platform-blocks.com/components/Slider) · [`Knob`](https://platform-blocks.com/components/Knob) · [`Rating`](https://platform-blocks.com/components/Rating) · [`FileInput`](https://platform-blocks.com/components/FileInput) · [`ColorInput`](https://platform-blocks.com/components/ColorInput) · [`ColorPicker`](https://platform-blocks.com/components/ColorPicker) · [`ColorSwatch`](https://platform-blocks.com/components/ColorSwatch) · [`EmojiPicker`](https://platform-blocks.com/components/EmojiPicker) · [`ControlField`](https://platform-blocks.com/components/ControlField) · [`Form`](https://platform-blocks.com/components/Form)

`PasswordInput` (from `Input`), `RangeSlider` (from `Slider`), and `ToggleButton` / `ToggleGroup` / `ToggleBar` (from `Toggle`) are exported alongside their base components.

### Dates & time
[`Calendar`](https://platform-blocks.com/components/Calendar) · [`MiniCalendar`](https://platform-blocks.com/components/MiniCalendar) · [`DatePicker`](https://platform-blocks.com/components/DatePicker) · [`DatePickerInput`](https://platform-blocks.com/components/DatePickerInput) · [`MonthPicker`](https://platform-blocks.com/components/MonthPicker) · [`MonthPickerInput`](https://platform-blocks.com/components/MonthPickerInput) · [`YearPicker`](https://platform-blocks.com/components/YearPicker) · [`YearPickerInput`](https://platform-blocks.com/components/YearPickerInput) · [`TimePicker`](https://platform-blocks.com/components/TimePicker) · [`TimePickerInput`](https://platform-blocks.com/components/TimePickerInput)

### Navigation
[`Tabs`](https://platform-blocks.com/components/Tabs) · [`Menu`](https://platform-blocks.com/components/Menu) · [`MenuItemButton`](https://platform-blocks.com/components/MenuItemButton) · [`Breadcrumbs`](https://platform-blocks.com/components/Breadcrumbs) · [`Pagination`](https://platform-blocks.com/components/Pagination) · [`Stepper`](https://platform-blocks.com/components/Stepper) · [`Link`](https://platform-blocks.com/components/Link) · [`TableOfContents`](https://platform-blocks.com/components/TableOfContents)

### Data display
[`DataTable`](https://platform-blocks.com/components/DataTable) · [`Table`](https://platform-blocks.com/components/Table) · [`DataList`](https://platform-blocks.com/components/DataList) · [`ListGroup`](https://platform-blocks.com/components/ListGroup) · [`Card`](https://platform-blocks.com/components/Card) · [`Avatar`](https://platform-blocks.com/components/Avatar) · [`Badge`](https://platform-blocks.com/components/Badge) · [`Indicator`](https://platform-blocks.com/components/Indicator) · [`Chip`](https://platform-blocks.com/components/Chip) · [`Timeline`](https://platform-blocks.com/components/Timeline) · [`Tree`](https://platform-blocks.com/components/Tree) · [`Accordion`](https://platform-blocks.com/components/Accordion)

### Feedback
[`Alert`](https://platform-blocks.com/components/Alert) · [`Toast`](https://platform-blocks.com/components/Toast) · [`Progress`](https://platform-blocks.com/components/Progress) · [`Ring`](https://platform-blocks.com/components/Ring) · [`Skeleton`](https://platform-blocks.com/components/Skeleton) · [`Loader`](https://platform-blocks.com/components/Loader) · [`LoadingOverlay`](https://platform-blocks.com/components/LoadingOverlay) · `Gauge` · `Notice`

### Overlays
[`Dialog`](https://platform-blocks.com/components/Dialog) · [`Tooltip`](https://platform-blocks.com/components/Tooltip) · [`Popover`](https://platform-blocks.com/components/Popover) · [`ContextMenu`](https://platform-blocks.com/components/ContextMenu) · [`Overlay`](https://platform-blocks.com/components/Overlay) · [`Spotlight`](https://platform-blocks.com/components/Spotlight) · `FloatingActions`

### Media
[`Icon`](https://platform-blocks.com/components/Icon) · [`IconButton`](https://platform-blocks.com/components/IconButton) · [`BrandIcon`](https://platform-blocks.com/components/BrandIcon) · [`Image`](https://platform-blocks.com/components/Image) · [`Carousel`](https://platform-blocks.com/components/Carousel) · [`Gallery`](https://platform-blocks.com/components/Gallery) · [`Video`](https://platform-blocks.com/components/Video) · [`AudioPlayer`](https://platform-blocks.com/components/AudioPlayer) · [`Waveform`](https://platform-blocks.com/components/Waveform)

### Utilities
[`Collapse`](https://platform-blocks.com/components/Collapse) · [`Divider`](https://platform-blocks.com/components/Divider) · [`CodeBlock`](https://platform-blocks.com/components/CodeBlock) · [`CopyButton`](https://platform-blocks.com/components/CopyButton) · [`QRCode`](https://platform-blocks.com/components/QRCode) · [`Spoiler`](https://platform-blocks.com/components/Spoiler)

### App store & marketplace badges
Ready-made buttons and badges for App Store, Google Play, Microsoft Store, Amazon, Spotify, Apple Music, YouTube, Discord, GitHub, and 20+ more — see [`BrandButton`](https://platform-blocks.com/components/BrandButton) and [`BrandIcon`](https://platform-blocks.com/components/BrandIcon).

### Charts
25 chart types (line, bar, area, pie, donut, candlestick, sankey, heatmap, and more) ship in the companion [`@platform-blocks/charts`](https://www.npmjs.com/package/@platform-blocks/charts) package — browse them at [platform-blocks.com/charts](https://platform-blocks.com/charts).

## Hooks

| Hook | Description |
| --- | --- |
| [`useClipboard`](https://platform-blocks.com/hooks/useClipboard) | Copy text to clipboard |
| [`useControllableState`](https://platform-blocks.com/hooks/useControllableState) | Controlled / uncontrolled value state |
| [`useDebouncedCallback`](https://platform-blocks.com/hooks/useDebouncedCallback) | Debounced function wrapper with cancel / flush |
| [`useDebouncedValue`](https://platform-blocks.com/hooks/useDebouncedValue) | Debounced copy of a changing value |
| [`useDeviceInfo`](https://platform-blocks.com/hooks/useDeviceInfo) | Device and platform information |
| [`useDisclosure`](https://platform-blocks.com/hooks/useDisclosure) | Boolean open / close / toggle state |
| [`useEscapeKey`](https://platform-blocks.com/hooks/useEscapeKey) | Escape key handler |
| [`useGlobalHotkeys`](https://platform-blocks.com/hooks/useGlobalHotkeys) | Global keyboard shortcuts |
| [`useHotkeys`](https://platform-blocks.com/hooks/useHotkeys) | Scoped keyboard shortcuts |
| [`useHaptics`](https://platform-blocks.com/hooks/useHaptics) | Haptic feedback control |
| `useHapticsSettings` | Haptics configuration |
| [`useHover`](https://platform-blocks.com/hooks/useHover) | Cross-platform hover state and handlers |
| [`useMaskedInput`](https://platform-blocks.com/hooks/useMaskedInput) | Input masking |
| [`useMediaQuery`](https://platform-blocks.com/hooks/useMediaQuery) | Media queries on web, dimension queries on native |
| [`useOverlayMode`](https://platform-blocks.com/hooks/useOverlayMode) | Overlay UI state |
| [`useScrollSpy`](https://platform-blocks.com/hooks/useScrollSpy) | Scroll position tracking |
| `useSoundHaptics` | Sound system's `triggerHaptic` wrapper |
| [`useSpotlightToggle`](https://platform-blocks.com/hooks/useSpotlightToggle) | Spotlight tutorial control |
| [`useTitleRegistration`](https://platform-blocks.com/hooks/useTitleRegistration) | Register headings with the title registry |
| [`useToggleColorScheme`](https://platform-blocks.com/hooks/useToggleColorScheme) | Dark / light mode toggle |

## Theming

Create custom themes or extend the defaults:

```tsx
import { PlatformBlocksProvider, createTheme } from '@platform-blocks/ui';

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

Full documentation, interactive examples, and component playground are available at [platform-blocks.com](https://platform-blocks.com).

- [Getting started](https://platform-blocks.com/getting-started)
- [Component gallery](https://platform-blocks.com/components)
- [Charts](https://platform-blocks.com/charts)
- [Hooks](https://platform-blocks.com/hooks)
- [Accessibility](https://platform-blocks.com/accessibility)
- [Localization](https://platform-blocks.com/localization)
- [FAQ](https://platform-blocks.com/faq)
- [llms.txt](https://platform-blocks.com/llms.txt) — Full API reference for LLMs and AI assistants

## Contributing

See the [contributing guide](https://github.com/joshstovall/platform-blocks/blob/main/CONTRIBUTING.md) for setup instructions.

## License

[MIT](https://github.com/joshstovall/platform-blocks/blob/main/LICENSE) © [Josh Stovall](https://github.com/joshstovall)
