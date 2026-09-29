/**
 * Guidance published at the top of /llms.txt, /llms-small.txt and
 * /llms-full.txt, ahead of the page lists.
 *
 * The page lists tell an agent where things are; these tell it the handful of
 * library-wide rules it would otherwise get wrong on every screen — the
 * provider, the layout primitives, the token vocabulary — and which of two
 * similar components to reach for. Keep entries short and checkable against
 * the source: every sentence here is read before any page is.
 */
import { LLMS_ICONS_URL, LLMS_SHARED_PROPS_URL, LLMS_THEMING_URL } from './llmsDocs';

export const LLMS_CONVENTIONS: string[] = [
  'Import every component and hook from the package root: `import { Button, Row, useToast } from \'@platform-blocks/ui\'`. Charts are a separate package — `npm install @platform-blocks/charts` — imported from `@platform-blocks/charts`.',
  `Wrap the app once in \`<PlatformBlocksProvider>\` (theme, color scheme, overlays, i18n). \`useToast()\` and \`useDialog()\` render through \`<ToastProvider>\` / \`<DialogProvider>\` — mount those inside it before calling them. Theming: ${LLMS_THEMING_URL}`,
  'Lay out with `Block` in place of `View`, `Row` / `Column` for flex stacks (`gap`, `align`, `justify`, `wrap`), and `Grid` + `GridItem` for columns. `Row` and `Column` are documented on the Flex page.',
  `Most components take the shared style props — spacing (\`m\`, \`p\`, \`mx\`, \`py\`, …), sizing (\`w\`, \`h\`, \`fullWidth\`, …), \`radius\`, \`shadow\` — form inputs share the field props (\`label\`, \`description\`, \`error\`, \`helperText\`, \`required\`, …) and charts the chart props. Component pages list their own props and name the shared groups they accept; the groups are defined once here: ${LLMS_SHARED_PROPS_URL}`,
  '`size`, spacing, `radius` and `shadow` take the tokens `xs` `sm` `md` `lg` `xl` `2xl` `3xl` (default `md`) or a number. `color` takes a palette name (`primary`, `secondary`, `tertiary`, `success`, `warning`, `error`, `gray`), a shade (`\'primary.6\'`), or any CSS color.',
  '`Button` is neutral by default — use `variant="filled"` for the primary action. Events use React Native names: `onPress`, `onChange`, never `onClick`.',
  `\`<Icon name="…">\` accepts only names in the built-in Tabler registry — do not guess one: ${LLMS_ICONS_URL}`,
  'Every example is a complete module: real imports from the published packages and an exported `Demo` component. Fixtures it imports (`./data`) are shown beneath it.',
];

export interface LlmsChoice {
  /** What the reader is trying to do. */
  need: string;
  /** The candidates, each with the case it fits. */
  options: string;
}

export const LLMS_CHOOSING: LlmsChoice[] = [
  {
    need: 'On/off or pick-one input',
    options: '`Switch` for a setting that applies immediately; `Checkbox` for a choice submitted with a form; `ControlField` wraps either (or `Radio`) in a labelled, pressable row; `SegmentedControl` for 2–5 exclusive options shown inline; `RadioGroup` for a vertical list; `Select` for a long list in a dropdown; `AutoComplete` when the list is searched or loaded async; `ToggleGroup` for toolbar-style single or multi selection.',
  },
  {
    need: 'Tabular data',
    options: '`Table` for static semantic markup; `DataTable` for sorting, filtering, pagination and row selection; `DataList` for label/value pairs.',
  },
  {
    need: 'Dates and times',
    options: '`DatePickerInput` / `TimePickerInput` for a form field that opens a picker; `DatePicker` / `TimePicker` for an inline panel; `Calendar` for a full month grid; `MiniCalendar` for a compact month view; `MonthPicker` / `YearPicker` for coarser choices.',
  },
  {
    need: 'Colors',
    options: '`ColorInput` for a hex field plus palette; `ColorPicker` for a swatch button that opens a palette, with no text field; `ColorSwatch` to display a color.',
  },
  {
    need: 'Floating and transient UI',
    options: '`Tooltip` for a non-interactive hint; `Popover` for interactive content anchored to a trigger; `Menu` for a list of actions; `ContextMenu` for right-click / long-press; `Dialog` for modal, confirmation or bottom-sheet content; `Toast` (via `useToast()`) for a transient notice; `Alert` for a message that stays inline.',
  },
  {
    need: 'Loading states',
    options: '`Loader` for a spinner; `Skeleton` for placeholders shaped like the content; `Progress` (linear) or `Ring` (radial) for measurable progress; `LoadingOverlay` to block a region while work runs.',
  },
  {
    need: 'Labels and markers',
    options: '`Badge` for a status, category or count; `Chip` for a tag the user selects, presses or removes; `Indicator` for a dot or count pinned to the corner of another element.',
  },
  {
    need: 'Containers',
    options: '`Block` for plain layout; `Card` for a content card (six variants); `Surface` for an elevation level without card chrome; `Space` for a fixed gap where margins do not fit.',
  },
  {
    need: 'Text',
    options: '`Text` for body copy and inline variants; `Title` for semantic headings (`order={1..6}`); `Highlight` to mark matches in a string; `GradientText` / `ShimmerText` for decorative emphasis.',
  },
  {
    need: 'Actions and navigation',
    options: '`Button` for actions; `IconButton` for icon-only actions (needs `accessibilityLabel`); `Link` for navigation; `Menu` for several related actions behind one trigger; `Tabs`, `Stepper`, `Pagination`, `Breadcrumbs` and `NavTree` for moving between views.',
  },
];
