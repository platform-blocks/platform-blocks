import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import type { BaseProps, ColorProp, RadiusValue } from '../../core/types/base';
import type { SizeValue } from '../../core/theme/types';
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
   * Optional secondary content beside the label. A string renders as a
   * superscript; a node (e.g. a count `Badge`) renders as given.
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
   * Optional icon rendered alongside the label (decorative: hidden from
   * assistive technology).
   */
  icon?: ReactNode;
  /**
   * Accessible name for the tab. Required when `label` has no text (an
   * icon-only tab); otherwise the name comes from the label.
   */
  accessibilityLabel?: string;
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
 *   onChange={(key) => setTab(key)}
 * />
 * ```
 */
export interface TabsProps extends BaseProps<ViewStyle> {
  /**
   * Array of tab definitions to render. The first item becomes active by default when uncontrolled.
   */
  items: TabItem[];
  /**
   * Controlled active tab key. When omitted the component manages internal state.
   */
  value?: string;
  /**
   * Initially active tab key when uncontrolled (a persisted selection wins).
   * Defaults to the first item.
   */
  defaultValue?: string;
  /**
   * Called with the tab key whenever the active tab changes. Fires for both
   * controlled and uncontrolled usage.
   */
  onChange?: (tabKey: string) => void;
  /**
   * @deprecated Use `value` instead.
   */
  activeTab?: string;
  /**
   * @deprecated Use `onChange` instead.
   */
  onTabChange?: (tabKey: string) => void;
  /**
   * Keyboard activation. `'automatic'` selects a tab as soon as arrow keys move
   * focus to it; `'manual'` only moves focus, and Enter/Space selects.
   *
   * @default 'automatic'
   */
  activationMode?: 'automatic' | 'manual';
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
  color?: ColorProp;
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
   * Override props applied to each tab's label `<Text>` (style, fw, ff, size, c).
   * Applies to all tabs in the strip; per-tab styling can still be done via `TabItem.label` (custom node).
   */
  labelProps?: Omit<TextProps, 'children'>;
  /**
   * Array of tab keys that should be rendered disabled.
   */
  disabledKeys?: string[];
  /**
   * Corner radius of every tab (chip, card and folder variants): a radius token,
   * px number, `'none'` or `'full'`.
   */
  radius?: RadiusValue;
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
