import type { ReactNode } from 'react';
import type { SpacingProps } from '../../core/utils';
// Using generic radius via style props; no dedicated BorderRadiusProps available
interface RadiusProp { radius?: number | string; }
import type { SizeValue } from '../../core/theme/sizes';
import type { ViewStyle, TextStyle, StyleProp } from 'react-native';
import type { TextProps } from '../Text';

/**
 * Describes a single tab rendered by the {@link Tabs} component.
 */
export interface TabItem {
  /**
   * Unique identifier for the tab. This is also the value returned in callbacks and
   * persisted when `persistKey` / `autoPersist` are used.
   */
  key: string;
  /**
   * Main tab label. Accepts a string or custom React node for iconographic or styled content.
   */
  label: string | ReactNode;
  /**
   * Optional secondary line displayed beneath the label when supplied.
   */
  subLabel?: string | ReactNode;
  /**
   * Content rendered when the tab becomes active. Ignored when `navigationOnly` is true.
   */
  content: ReactNode;
  /**
   * When true the tab is visually disabled and interaction is delegated to `onDisabledTabPress`.
   */
  disabled?: boolean;
  /**
   * Optional icon rendered alongside the label.
   */
  icon?: ReactNode;
}

/**
 * Props for the {@link Tabs} component.
 *
 * @example
 * ```tsx
 * <Tabs
 *   items={[
 *     { key: 'overview', label: 'Overview', content: <OverviewScreen /> },
 *     { key: 'activity', label: 'Activity', content: <ActivityScreen /> },
 *   ]}
 *   onTabChange={(key) => console.log('Active tab:', key)}
 * />
 * ```
 */
export interface TabsProps extends SpacingProps, RadiusProp {
  /**
   * Array of tab definitions to render. The first item becomes active by default when uncontrolled.
   */
  items: TabItem[];
  /**
   * Controlled active tab key. When omitted the component manages internal state.
   */
  activeTab?: string;
  /**
   * Called whenever the active tab changes. Fires for both controlled and uncontrolled usage.
   */
  onTabChange?: (tabKey: string) => void;
  /**
   * Invoked when a disabled tab is pressed, allowing custom messaging or recovery flows.
   */
  onDisabledTabPress?: (tabKey: string, item: TabItem) => void;
  /**
   * Visual style of the tabs.
   *
   * @default 'line'
   */
  variant?: 'line' | 'chip' | 'card' | 'folder';
  /**
   * Size token controlling text and padding.
   *
   * @default 'sm'
   */
  size?: SizeValue;
  /**
   * Theme color token or custom color used for indicators and active states.
   *
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'gray' | 'tertiary' | string;
  /**
   * Orientation of the tab list.
   *
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Placement of the tabs relative to their content. Influences indicator positioning.
   *
   * @default 'start'
   */
  location?: 'start' | 'end';
  /**
   * Enables scrolling when tabs overflow the available axis.
   */
  scrollable?: boolean;
  /**
   * Enables animated indicator transitions between tabs.
   *
   * @default true
   */
  animated?: boolean;
  /**
   * Duration (ms) for indicator animations when `animated` is true.
   *
   * @default 250
   */
  animationDuration?: number;
  /**
   * Duration (ms) of the indicator transition. Cross-component spelling that
   * takes precedence over `animationDuration`; `0` moves the indicator
   * instantly. Always 0 under reduced motion.
   *
   * @default 250
   */
  transitionDuration?: number;
  /**
   * Style overrides for the outer container.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Style overrides applied to each tab pressable.
   */
  tabStyle?: StyleProp<ViewStyle>;
  /**
   * Style for the active tab content wrapper.
   */
  contentStyle?: StyleProp<ViewStyle>;
  /**
   * Additional text style applied to tab labels.
   */
  textStyle?: StyleProp<TextStyle>;
  /**
   * Override props applied to each tab's label `<Text>` (style, weight, ff, size, colorVariant).
   * Applies to all tabs in the strip; per-tab styling can still be done via `TabItem.label` (custom node).
   */
  labelProps?: Omit<TextProps, 'children'>;
  /**
   * Array of tab keys that should be rendered disabled.
   */
  disabledKeys?: string[];
  /**
   * Corner radius applied to the tab elements (variant dependent).
   */
  tabCornerRadius?: number;
  /**
   * Corner radius applied to the content panel. Falls back to theme defaults when omitted.
   */
  contentCornerRadius?: number;
  /**
   * Thickness (px) of the line indicator. Applies to `line` variant primarily.
   */
  indicatorThickness?: number;
  /**
   * Gap (px) inserted between tabs.
   */
  tabGap?: number;
  /**
   * Override background color for the active tab. Accepts theme tokens.
   */
  activeTabBackgroundColor?: string;
  /**
   * Override background color for inactive tabs.
   */
  inactiveTabBackgroundColor?: string;
  /**
   * Explicit text color for the active tab label.
   */
  activeTabTextColor?: string;
  /**
   * Key used to persist the active tab selection across sessions.
   */
  persistKey?: string;
  /**
   * Determines whether internal persistence should be enabled when `persistKey` is provided.
   *
   * @default true
   */
  autoPersist?: boolean;
  /**
   * When true, the component only renders the tab list and forwards children for custom content.
   */
  navigationOnly?: boolean;
  /**
   * Optional custom content rendered below the tab list when `navigationOnly` is enabled.
   */
  children?: ReactNode;
}
