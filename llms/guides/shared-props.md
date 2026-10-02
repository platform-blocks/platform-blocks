# Shared props and tokens

Component pages list each component's own props, then name the shared groups it also accepts in one line — "Also accepts the shared props — field (…), spacing (…), …". The groups are defined here once.

## Style props

Every component takes the style props — spacing (`m`, `px`, …) and box props (`w`, `h`, `miw`, `maw`, `mih`, `mah`, `bg`, `opacity`) — plus the visibility props and `style` / `testID` (the base group). They apply to the component's root. Many also take `radius` and `shadow`. Values are theme tokens or numbers: `p="md"`, `mt={12}`, `w="full"`, `bg="subtle"`. Horizontal spacing (`ml`, `pl`, …) follows the leading and trailing edges, so it flips in right-to-left layouts. Each prop has only its short name — there is no `maxWidth` or `backgroundColor` spelling.

```tsx
import { Card, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Card p="lg" mt="md" radius="lg" shadow="sm" w="full" maw={480} bg="subtle">
      <Text fw={600} c="dimmed">Spacing, size, background, radius and shadow come from the shared style props.</Text>
    </Card>
  );
}
```

```ts
export interface SpacingProps {
  /** Margin on all sides */
  m?: SpacingValue;
  /** Margin top */
  mt?: SpacingValue;
  /** Margin on the trailing edge (right in LTR, left in RTL) */
  mr?: SpacingValue;
  /** Margin bottom */
  mb?: SpacingValue;
  /** Margin on the leading edge (left in LTR, right in RTL) */
  ml?: SpacingValue;
  /** Margin horizontal (both inline edges) */
  mx?: SpacingValue;
  /** Margin vertical (top and bottom) */
  my?: SpacingValue;

  /** Padding on all sides */
  p?: SpacingValue;
  /** Padding top */
  pt?: SpacingValue;
  /** Padding on the trailing edge (right in LTR, left in RTL) */
  pr?: SpacingValue;
  /** Padding bottom */
  pb?: SpacingValue;
  /** Padding on the leading edge (left in LTR, right in RTL) */
  pl?: SpacingValue;
  /** Padding horizontal (both inline edges) */
  px?: SpacingValue;
  /** Padding vertical (top and bottom) */
  py?: SpacingValue;
}

export interface BoxProps {
  /** Width */
  w?: DimensionProp;
  /** Height */
  h?: DimensionProp;
  /** Minimum width */
  miw?: DimensionProp;
  /** Maximum width */
  maw?: DimensionProp;
  /** Minimum height */
  mih?: DimensionProp;
  /** Maximum height */
  mah?: DimensionProp;
  /**
   * Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`,
   * `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade
   * syntax, or any CSS color.
   */
  bg?: ThemeColor;
  /** Opacity, `0`–`1` */
  opacity?: number;
}

export interface BorderRadiusProps {
  /** Border radius value - supports size tokens, numbers, and special values */
  radius?: RadiusValue;
}

export interface ShadowProps {
  /** Shadow value - supports size tokens and 'none' */
  shadow?: ShadowValue;
}

export interface VisibilityProps {
  /** Do not render in the light color scheme. */
  lightHidden?: boolean;
  /** Do not render in the dark color scheme. */
  darkHidden?: boolean;
  /** Do not render when the viewport is at least this breakpoint wide (`width >= theme.breakpoints[bp]`). */
  hiddenFrom?: BreakpointToken;
  /** Render only when the viewport is at least this breakpoint wide. */
  visibleFrom?: BreakpointToken;
}

export type BaseProps<S = ViewStyle> = StyleProps &
  VisibilityProps & {
    /** Style for the root element — merged last, after the component's own styles. */
    style?: StyleProp<S>;
    /** Test identifier for the root element. */
    testID?: string;
  };
```

`DimensionProp` is a number (dp / px), a percentage such as `'50%'`, `'auto'`, `'full'` (100%), or on web any CSS length.

## Field props

Form inputs — `Input`, `Select`, `Checkbox`, `Radio`, `Switch`, the pickers and the rest — share one field frame: label, description, error and helper text wired to the control for assistive technology. Text inputs add the text-field group (`value`, `onChangeText`, `placeholder`, `clearable`, sections). Inside a `Form.Field`, value, change handler and error are injected for you.

```ts
export interface FieldBaseProps<S = ViewStyle> extends BaseProps<S>, LayoutProps, DisclaimerSupport {
  /** Label rendered above (or beside) the control. */
  label?: React.ReactNode;
  /** Short description rendered under the label. */
  description?: React.ReactNode;
  /** Error message. Marks the field invalid and is announced to assistive technology. */
  error?: React.ReactNode;
  /** Helper text rendered under the control when there is no error. */
  helperText?: React.ReactNode;
  /** Marks the field required (announced; shows an asterisk unless `withAsterisk` is false). */
  required?: boolean;
  /** Show the required asterisk. Defaults to `required`. */
  withAsterisk?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  size?: SizeValue;
  radius?: RadiusValue;
  variant?: FieldVariant;
  /** Field name for form integration. */
  name?: string;
  /** Overrides the accessible name composed from `label`. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Identifier used with KeyboardManagerProvider to request refocus. */
  keyboardFocusId?: string;
  /** Props applied to the label `<Text>`. */
  labelProps?: Omit<TextProps, 'children'>;
  /** Props applied to the description `<Text>`. */
  descriptionProps?: Omit<TextProps, 'children'>;
  onFocus?: () => void;
  onBlur?: () => void;
}

export interface TextFieldBaseProps<S = ViewStyle> extends FieldBaseProps<S> {
  value?: string;
  defaultValue?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  /** Falls back to `theme.text.muted`. */
  placeholderTextColor?: string;
  /** Show a clear button while the field has a value. */
  clearable?: boolean;
  clearButtonLabel?: string;
  onClear?: () => void;
  /** Debounce delay for validation, in milliseconds. */
  debounceMs?: number;
  /** Called when Enter is pressed. */
  onEnter?: () => void;
  startSection?: React.ReactNode;
  endSection?: React.ReactNode;
  startSectionProps?: Omit<ViewProps, 'children'>;
  endSectionProps?: Omit<ViewProps, 'children'>;
}

export interface DisclaimerSupport {
  disclaimer?: React.ReactNode;
  disclaimerProps?: Omit<DisclaimerProps, 'children'>;
}
```

## Chart props

Every chart in `@plocks/charts` accepts the chart group (size, title, legend, tooltip, animation and accessibility options) and the chart event callbacks, on top of its own data props.

```ts
export interface BaseChartProps extends SpacingProps {
  /**
   * Chart width in px. Omit it and the chart fills the box it is placed in,
   * redrawing when that box changes. A number is honoured up to the width the
   * container can actually give it — a chart never draws wider than its slot.
   */
  w?: number;
  /** Chart height in px. Defaults to the chart's resting height, or `width / aspectRatio`. */
  h?: number;
  /**
   * Height as a fraction of the resolved width (`width / height`), used when
   * `height` is omitted. `2` keeps the chart twice as wide as it is tall at
   * every container size.
   */
  aspectRatio?: number;
  /** Upper bound on the resolved width. Useful for radial charts in wide columns. */
  maw?: number;
  /** Lower bound on the resolved width. */
  miw?: number;
  /** Upper bound on a height derived from `aspectRatio`. */
  mah?: number;
  /** Lower bound on a height derived from `aspectRatio`. */
  mih?: number;
  /** Chart test ID for testing */
  testID?: string;
  /** Additional styles */
  style?: any;
  /** Accessibility label surfaced to assistive tech */
  accessibilityLabel?: string;
  /** Accessibility hint describing chart interaction */
  accessibilityHint?: string;
  /** Accessibility role override */
  accessibilityRole?: string;
  /** Whether the chart container is accessible */
  accessible?: boolean;
  /** Platform specific accessibility importance */
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
  /** Animation duration in ms */
  animationDuration?: number;
  /** Animation easing function */
  animationEasing?: string;
  /** Whether chart is disabled */
  disabled?: boolean;
  /** Chart title */
  title?: string;
  /** Chart subtitle */
  subtitle?: string;
  /** If false, chart expects a parent interaction provider (shared context). */
  useOwnInteractionProvider?: boolean;
  /** Force suppress or show internal popover (auto suppressed when useOwnInteractionProvider=false if undefined). */
  suppressPopover?: boolean;
}

export interface ChartInteractionCallbacks<TData = ChartDataPoint> {
  /** Called when chart is tapped/clicked */
  onPress?: (event: ChartInteractionEvent<TData>) => void;
  /** Called when data point is selected */
  onDataPointPress?: (dataPoint: TData, event: ChartInteractionEvent<TData>) => void;
}
```

The option types those props take — a chart's own data types are on its page:

```ts
export interface ChartDataPoint {
  /** Unique identifier for the data point */
  id?: string | number;
  /** X-axis value */
  x: number;
  /** Y-axis value */
  y: number;
  /** Optional label */
  label?: string;
  /** Optional color override */
  color?: string;
  /** Optional size override */
  size?: number;
  /** Custom data for interactions */
  data?: any;
}

export interface ChartAxis {
  /** Show axis line */
  show?: boolean;
  /** Axis color */
  color?: string;
  /** Axis thickness */
  thickness?: number;
  /** Show tick marks */
  showTicks?: boolean;
  /** Tick positions (auto-calculated if not provided) */
  ticks?: number[];
  /** Tick color */
  tickColor?: string;
  /** Tick length */
  tickLength?: number;
  /** Show labels */
  showLabels?: boolean;
  /** Label formatter */
  labelFormatter?: (value: number) => string;
  /** Label color */
  labelColor?: string;
  /** Label font size */
  labelFontSize?: number;
  /** Axis title */
  title?: string;
  /** Title color */
  titleColor?: string;
  /** Title font size */
  titleFontSize?: number;
}

export interface ChartGrid {
  /** Show grid */
  show?: boolean;
  /** Grid color */
  color?: string;
  /** Grid line thickness */
  thickness?: number;
  /** Grid line style */
  style?: 'solid' | 'dashed' | 'dotted';
  /** Show major grid lines */
  showMajor?: boolean;
  /** Show minor grid lines */
  showMinor?: boolean;
  /** Major grid positions */
  majorLines?: number[];
  /** Minor grid positions */
  minorLines?: number[];
}

export interface ChartLegend {
  /** Show legend */
  show?: boolean;
  /** Legend position */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Legend alignment */
  align?: 'start' | 'center' | 'end';
  /** Legend items (auto-generated if not provided) */
  items?: ChartLegendItem[];
  /** Legend item color */
  textColor?: string;
  /** Legend item font size */
  fontSize?: number;
}

export interface ChartTooltip<TData = ChartDataPoint> {
  /** Show tooltip on hover/press */
  show?: boolean;
  /** Tooltip formatter */
  formatter?: (dataPoint: TData) => string | React.ReactNode;
  /** Tooltip background color */
  backgroundColor?: string;
  /** Tooltip text color */
  textColor?: string;
  /** Tooltip font size */
  fontSize?: number;
  /** Tooltip border radius */
  borderRadius?: number;
  /** Tooltip padding */
  padding?: number;
}

export interface ChartAnimation {
  /** Animation duration */
  duration?: number;
  /** Animation delay */
  delay?: number;
  /** Animation easing */
  easing?: string;
  /** Animation type */
  type?: 'fade' | 'scale' | 'slide' | 'draw' | 'drawOn' | 'spiral' | 'bounce' | 'elastic' | 'wave';
  /** Stagger animation for multiple elements */
  stagger?: number;
}

export interface ChartAnnotation {
  /** Unique identifier for the annotation */
  id: string | number;
  /** Visual shape used to render the annotation */
  shape: ChartAnnotationShape;
  /** X coordinate for point or vertical-line annotations */
  x?: number;
  /** Y coordinate for point or horizontal-line annotations */
  y?: number;
  /** Starting x coordinate for range or box annotations */
  x1?: number;
  /** Ending x coordinate for range or box annotations */
  x2?: number;
  /** Starting y coordinate for range or box annotations */
  y1?: number;
  /** Ending y coordinate for range or box annotations */
  y2?: number;
  /** Label displayed near the annotation */
  label?: string;
  /** Stroke or outline color used for the annotation */
  color?: string;
  /** Fill color used for the annotation */
  backgroundColor?: string;
  /** Overall opacity of the annotation */
  opacity?: number;
  /** Stroke width for line-based annotations */
  lineWidth?: number;
  /** Dashed stroke pattern for the annotation */
  dashArray?: number[];
  /** Font size for any annotation text */
  fontSize?: number;
  /** Text color for the annotation label */
  textColor?: string;
  /** Arbitrary additional data associated with the annotation */
  data?: any;
}

export type ChartFill = string | ChartGradient;
```

## Token types

```ts
/** Size tokens, smallest to largest (also exported as `ComponentSize`). */
export type SizeToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

/** `SizeValue` is the same type. A number is read in px. */
export type ComponentSizeValue = SizeToken | number;

export type SpacingValue = SizeToken | 'auto' | '0' | number;

export type DimensionProp = number | 'auto' | 'full' | `${number}%` | (string & {});

export type RadiusValue = SizeToken | 'none' | 'full' | number;

export type ShadowValue =
  | SizeValue
  | 'none';

export type ThemeColorToken =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'error'
  | 'gray';

export type ThemeColor = ThemeColorToken | (string & {});

export type BreakpointToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
```
