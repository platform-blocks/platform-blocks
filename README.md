<p align="center">
  <a href="https://react-ui-library.com/" rel="noopener" target="_blank"><img width="75" height="75" src="./apps/react-ui-library.com/assets/favicon.png" alt="React UI Library logo"/></a>
</p>

<h1 align="center">React UI Library</h1>

<div align="center">

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/platform-blocks/react-ui-library/blob/HEAD/LICENSE)
[![Discord](https://img.shields.io/badge/Chat%20on-Discord-%235865f2)](https://discord.gg/kbHjwzgXbc)

</div>

[React UI Library](https://react-ui-library.com/) is a React Native UI component library for building intuitive, accessible, and highly customizable mobile and web applications.

## Packages

| Package | Description | Version |
| --- | --- | --- |
| [`@platform-blocks/react-ui-library`](./packages/ui) | 100+ UI components — inputs, navigation, overlays, media, theming, and more | [![npm](https://img.shields.io/npm/v/@platform-blocks/react-ui-library)](https://www.npmjs.com/package/@platform-blocks/react-ui-library) |
| [`@platform-blocks/charts`](./packages/charts) | 25 data visualization chart types with animations and interactions | [![npm](https://img.shields.io/npm/v/@platform-blocks/charts)](https://www.npmjs.com/package/@platform-blocks/charts) |

## Installation

```sh
npm i @platform-blocks/react-ui-library
npm i @platform-blocks/charts
```

Then install the peer dependencies your app provides — on Expo, use `expo install` so the versions match your SDK:

```sh
npx expo install react-native-reanimated react-native-safe-area-context react-native-svg @tabler/icons-react-native
```

`@tabler/icons-react-native` backs the `Icon` registry, which is imported from the package root — it is required, not optional. See the [package README](./packages/ui/README.md#peer-dependencies) for the full list.

## Key features

- **Cross-platform** — iOS, Android, and Web from a single codebase
- **100+ components** — Comprehensive set of UI primitives and complex widgets
- **25 chart types** — Bar, Line, Area, Pie, Scatter, Radar, Heatmap, and more
- **Themeable** — Built-in light/dark themes with full customization support
- **Accessible** — Screen reader, keyboard navigation, and RTL support
- **Animated** — Smooth transitions powered by `react-native-reanimated`
- **Tree-shakeable** — Optimized ESM and CJS builds

## Documentation

Full documentation and examples are available at [react-ui-library.com](https://react-ui-library.com).

- [Getting started](https://react-ui-library.com/getting-started)
- [Component gallery](https://react-ui-library.com/components)
- [Theming](https://react-ui-library.com/theming)
- [Accessibility](https://react-ui-library.com/accessibility)
- [llms.txt](https://react-ui-library.com/llms.txt) — Documentation index for LLMs and AI assistants,
  linking a standalone Markdown page per component, chart, hook, guide, and FAQ entry.
  [llms-full.txt](https://react-ui-library.com/llms-full.txt) is the same content in one file;
  [react-ui-library.com/llms](https://react-ui-library.com/llms) explains the layout.

## Contributing

Read the [contributing guide](CONTRIBUTING.md) to learn how to set up the development environment.

## License

This project is licensed under the [MIT License](LICENSE).