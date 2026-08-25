import React, { ReactNode } from 'react';
import { Text, View } from 'react-native';
import {
  Icon,
  Button,
  Input,
  MenuDropdown,
  MenuItem,
  ListGroup,
  ListGroupItem,
  Form,
  brandIcons,
} from '@platform-blocks/ui';
import { Asset } from 'expo-asset';

/** Every supported BrandIcon name, alphabetized for the playground select */
const BRAND_NAMES = Object.keys(brandIcons).sort();

export type PlaygroundControlType = 'boolean' | 'segmented' | 'select' | 'number' | 'text' | 'color' | 'size-slider' | 'range';

export interface PlaygroundControlOverride {
  controlType?: PlaygroundControlType;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  colorPresets?: string[];
  label?: string;
  /**
   * For `controlType: 'range'` — the sibling prop driven by the upper thumb. The
   * control lives under the lower prop's name; the paired prop's own control is
   * dropped so the two edit as a single range slider.
   */
  pairWith?: string;
}

export interface PlaygroundExtraControl extends PlaygroundControlOverride {
  name: string;
  controlType: PlaygroundControlType;
  initialValue?: any;
  description?: string;
}

export interface ComponentPlaygroundConfig {
  id: string;
  component: string;
  initialProps?: Record<string, any>;
  hiddenProps?: string[];
  pinnedProps?: string[];
  controlOverrides?: Record<string, PlaygroundControlOverride | false>;
  /** Synthetic controls not derived from propsMeta. Useful for editing nested object props via flat sub-controls. */
  extraControls?: PlaygroundExtraControl[];
  /** Transforms the merged playground values into the final props passed to the component (and the JSX snippet). */
  transformProps?: (values: Record<string, any>) => Record<string, any>;
  previewWrapper?: (node: ReactNode, currentProps: Record<string, any>) => ReactNode;
}

const SIZE_TOKENS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

const RADIUS_TOKENS = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full', 'chip'];

const SPORTS_OPTIONS = [
  { label: 'Soccer', value: 'soccer' },
  { label: 'Basketball', value: 'basketball' },
  { label: 'Tennis', value: 'tennis' },
  { label: 'Baseball', value: 'baseball' },
  { label: 'Hockey', value: 'hockey' }
];

const CITY_SUGGESTIONS = [
  { label: 'New York', value: 'new-york' },
  { label: 'Tokyo', value: 'tokyo' },
  { label: 'Paris', value: 'paris' },
  { label: 'Sydney', value: 'sydney' },
  { label: 'São Paulo', value: 'sao-paulo' }
];

const PROGRESS_COLORS = ['primary', 'secondary', 'success', 'warning', 'error', 'gray'];
const KNOB_BEHAVIORS: Array<'level' | 'stepped' | 'endless' | 'dual' | 'status'> = ['level', 'stepped', 'endless', 'dual', 'status'];
const KNOB_VARIANTS: Array<'default' | 'minimal' | 'digital' | 'retro' | 'studio'> = ['default', 'minimal', 'digital', 'retro', 'studio'];
const SLIDER_VARIANTS: Array<'horizontal' | 'vertical'> = ['horizontal', 'vertical'];
const TAB_VARIANTS: Array<'line' | 'chip' | 'card' | 'folder'> = ['line', 'chip', 'card', 'folder'];
const TAB_COLOR_OPTIONS = ['primary', 'secondary', 'gray', 'tertiary'];
const INPUT_TYPES: Array<'text' | 'password' | 'email' | 'tel' | 'number' | 'search'> = ['text', 'email', 'password', 'number', 'tel', 'search'];
const SWITCH_LABEL_POSITIONS: Array<'left' | 'right' | 'top' | 'bottom'> = ['left', 'right', 'top', 'bottom'];
const SWITCH_COLOR_OPTIONS = ['primary', 'secondary', 'success', 'warning', 'error', 'gray'];
const SWITCH_VARIANTS: Array<'filled' | 'outline' | 'ios' | 'android'> = ['filled', 'outline', 'ios', 'android'];
const CARD_VARIANTS: Array<'outline' | 'filled' | 'elevated' | 'subtle' | 'ghost' | 'gradient'> = ['outline', 'filled', 'elevated', 'subtle', 'ghost', 'gradient'];
const CARD_SHADOW_OPTIONS = ['none', 'xs', 'sm', 'md', 'lg', 'xl'];
const TOOLTIP_POSITIONS: Array<'top' | 'bottom' | 'left' | 'right'> = ['top', 'bottom', 'left', 'right'];
const TOOLTIP_COLOR_OPTIONS = ['primary', 'secondary', 'success', 'warning', 'error', 'gray', 'dark'];

const TAB_PLAYGROUND_ITEMS = [
  {
    key: 'overview',
    label: 'Overview',
    subLabel: 'Mission pulse',
    content: 'Monitor crew workload and morale.'
  },
  {
    key: 'deploys',
    label: 'Deploys',
    subLabel: 'Releases',
    content: 'Track the latest launch timeline.'
  },
  {
    key: 'insights',
    label: 'Insights',
    subLabel: 'Focus',
    content: 'Surface the work that needs attention next.'
  }
];

const TOOLTIP_TARGET = React.createElement(
  View,
  {
    style: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 9999,
      backgroundColor: '#111826'
    }
  },
  React.createElement(Text, { style: { color: '#ffffff', fontWeight: '600' } }, 'Hover to preview')
);

const TIMELINE_EVENTS = [
  {
    key: 'design',
    title: 'Design lock',
    description: 'Finalized specs handed to build partners.',
    timestamp: '0900 UTC',
    lineVariant: 'solid' as const
  },
  {
    key: 'fabrication',
    title: 'Fabrication window',
    description: 'Composites curing under thermal watch.',
    timestamp: 'Day 2',
    lineVariant: 'dashed' as const
  },
  {
    key: 'integration',
    title: 'Systems integration',
    description: 'Payload avionics sync with platform core.',
    timestamp: 'Day 5',
    lineVariant: 'solid' as const
  },
  {
    key: 'review',
    title: 'Flight readiness review',
    description: 'Green board vote scheduled with ground.',
    timestamp: 'Day 7',
    lineVariant: 'dotted' as const
  }
];
const TIMELINE_COLOR_VARIANTS = ['primary.5', 'secondary.5', 'gray.6', 'success.5', 'warning.5', 'error.5'];

const WAVEFORM_SAMPLE = Array.from({ length: 140 }, (_, idx) => {
  const primary = Math.sin(idx / 6) * 0.7;
  const secondary = Math.sin(idx / 3.7) * 0.2;
  const composite = Math.abs(primary + secondary);
  return Number(composite.toFixed(3));
});

const WAVEFORM_COLOR_PRESETS = ['#6366f1', '#22c55e', '#f97316', '#e11d48', '#0ea5e9'];
const WAVEFORM_VARIANTS: Array<'bars' | 'line' | 'rounded' | 'gradient'> = ['bars', 'rounded', 'line', 'gradient'];

const TEXT_VARIANT_OPTIONS: Array<
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'p' | 'span' | 'small' | 'code' | 'body' | 'caption'
> = ['h1', 'h2', 'h3', 'h4', 'h5', 'p', 'span', 'small', 'code', 'body', 'caption'];
const TEXT_COLOR_VARIANTS = ['primary', 'secondary', 'muted', 'disabled', 'link', 'success', 'warning', 'error', 'info'];
const FONT_WEIGHT_OPTIONS = ['light', 'normal', 'medium', 'semibold', 'bold', 'black'];

const ALERT_VARIANTS: Array<'light' | 'filled' | 'outline' | 'subtle'> = ['subtle', 'filled', 'outline', 'light'];
const ALERT_COLOR_OPTIONS: Array<'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray'> = ['primary', 'secondary', 'success', 'warning', 'error', 'gray'];
const ALERT_SEVERITIES: Array<'info' | 'success' | 'warning' | 'error'> = ['info', 'success', 'warning', 'error'];

// Served from apps/platform-blocks.com/public/avatars — keeps the playground off third-party image hosts.
const AVATAR_SAMPLE_IMAGE = '/avatars/avatar-1.png';
const AVATAR_COLOR_PRESETS = ['#0f172a', '#475569', '#6366f1', '#0ea5e9', '#f97316', '#f43f5e'];

const STEPPER_ORIENTATIONS: Array<'horizontal' | 'vertical'> = ['horizontal', 'vertical'];
const STEPPER_ICON_POSITIONS: Array<'left' | 'right'> = ['left', 'right'];
const STEPPER_SAMPLE_STEPS = [
  {
    key: 'brief',
    label: 'Brief crew',
    description: 'Share launch dossier and blockers.'
  },
  {
    key: 'systems',
    label: 'Systems check',
    description: 'Async diagnostics in progress.',
    loading: true
  },
  {
    key: 'integration',
    label: 'Integrate payload',
    description: 'Verify harnessing + telemetry taps.'
  },
  {
    key: 'go',
    label: 'Final go/no-go',
    description: 'All stations report readiness.'
  }
];

const SHIMMER_DIRECTIONS: Array<'ltr' | 'rtl'> = ['ltr', 'rtl'];
const SHIMMER_COLOR_PRESETS = ['#94a3b8', '#cbd5f5', '#f8fafc', '#facc15', '#38bdf8'];

const GRADIENT_DEFAULT_COLORS = ['#a855f7', '#ec4899', '#f97316'];
const GRADIENT_STOP_PRESETS = ['#a855f7', '#ec4899', '#f97316', '#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#e11d48', '#14b8a6', '#0f172a'];

const LOADER_VARIANTS: Array<'bars' | 'dots' | 'oval'> = ['dots', 'bars', 'oval'];
const LOADER_COLOR_PRESETS = ['#6366f1', '#22c55e', '#0ea5e9', '#f97316', '#f43f5e'];

const COMMON_EVENT_PROPS = [
  'children',
  'style',
  'testID',
  'accessibilityLabel',
  'accessibilityHint',
  'onPress',
  'onPressIn',
  'onPressOut',
  'onLongPress',
  'onHoverIn',
  'onHoverOut',
  'onLayout',
  'onChange',
  'onChangeText',
  'onSelect',
  'onSearch',
  'onClear',
  'icon',
  'startIcon',
  'endIcon'
];

const ACCORDION_VARIANTS: Array<'default' | 'separated' | 'bordered'> = ['default', 'separated', 'bordered'];
const ACCORDION_TYPES: Array<'single' | 'multiple'> = ['single', 'multiple'];
const ACCORDION_COLORS: Array<'primary' | 'secondary' | 'gray'> = ['primary', 'secondary', 'gray'];
const ACCORDION_DENSITY: Array<'comfortable' | 'compact' | 'spacious'> = ['comfortable', 'compact', 'spacious'];
const ACCORDION_CHEVRON_POSITIONS: Array<'start' | 'end'> = ['start', 'end'];

const ACCORDION_PLAYGROUND_ITEMS = [
  {
    key: 'foundation',
    title: 'What is Platform Blocks?',
    body: 'A cross-platform design system that helps teams ship polished React Native apps faster.',
  },
  {
    key: 'benefits',
    title: 'Why use an accordion?',
    body: 'Accordions keep dense guidance scannable while letting readers expand only the sections they care about.',
  },
  {
    key: 'next-steps',
    title: 'How do I get started?',
    body: 'Install the package, drop the provider at the root, and follow the onboarding checklist.',
  },
];

const buildAccordionPlaygroundItems = () =>
  ACCORDION_PLAYGROUND_ITEMS.map((item) => ({
    key: item.key,
    title: item.title,
    content: React.createElement(
      Text,
      { style: { fontSize: 14, color: '#475569' } },
      item.body
    ),
  }));

// ---------------------------------------------------------------------------
// Sample data + helpers for data-driven / compositional component playgrounds
// ---------------------------------------------------------------------------

const SAMPLE_IMAGE = require('../../assets/images/scene-meadow.png');
const SAMPLE_VIDEO = Asset.fromModule(require('../../assets/video/demo-clip.mp4')).uri;

// Gallery reads `id` + `uri` off each item, so keep those keys in sync with GalleryItem.
const GALLERY_IMAGES = [
  { id: 'aurora', uri: require('../../assets/images/scene-aurora.png'), alt: 'Aurora over a ridge', title: 'Aurora' },
  { id: 'city', uri: require('../../assets/images/scene-city.png'), alt: 'City skyline at dusk', title: 'City lights' },
  { id: 'forest', uri: require('../../assets/images/scene-forest.png'), alt: 'Evergreen forest', title: 'Forest trail' },
];

const TREE_DATA = [
  {
    id: 'src', label: 'src', startOpen: true, children: [
      { id: 'components', label: 'components', children: [
        { id: 'button', label: 'Button.tsx' },
        { id: 'card', label: 'Card.tsx' },
      ] },
      { id: 'index', label: 'index.ts' },
    ]
  },
  { id: 'package', label: 'package.json' },
  { id: 'readme', label: 'README.md' },
];

const TABLE_COLUMNS = [
  { key: 'name', title: 'Name' },
  { key: 'role', title: 'Role' },
  { key: 'status', title: 'Status' },
];
const TABLE_DATA = [
  { name: 'Ada Lovelace', role: 'Engineer', status: 'Active' },
  { name: 'Alan Turing', role: 'Researcher', status: 'Active' },
  { name: 'Grace Hopper', role: 'Admiral', status: 'Away' },
];

const DATATABLE_DATA = [
  { id: '1', mission: 'Artemis I', crew: 4, phase: 'Complete' },
  { id: '2', mission: 'Artemis II', crew: 4, phase: 'Training' },
  { id: '3', mission: 'Europa Clipper', crew: 0, phase: 'Transit' },
];
const DATATABLE_COLUMNS = [
  { key: 'mission', header: 'Mission', accessor: 'mission', sortable: true },
  { key: 'crew', header: 'Crew', accessor: 'crew' },
  { key: 'phase', header: 'Phase', accessor: 'phase' },
];

const MASONRY_COLORS = ['#6366f1', '#22c55e', '#f97316', '#e11d48', '#0ea5e9', '#a855f7', '#14b8a6', '#f59e0b'];
const MASONRY_DATA = Array.from({ length: 8 }, (_, i) => ({ id: String(i), height: 80 + (i % 4) * 40, color: MASONRY_COLORS[i] }));

const SPOTLIGHT_ACTIONS = [
  { id: 'home', label: 'Go home', description: 'Return to the dashboard' },
  { id: 'new', label: 'New project', description: 'Create a new project' },
  { id: 'settings', label: 'Open settings', description: 'Adjust your preferences' },
];

const CONTEXT_MENU_ITEMS = [
  { id: 'copy', label: 'Copy' },
  { id: 'rename', label: 'Rename' },
  { id: 'delete', label: 'Delete', danger: true },
];

// These sub-components carry required props (e.g. ListGroupItem.size is injected
// by its parent at runtime) that the bare createElement call can't satisfy, so we
// address them as loose component types — matching how this file treats View/Text.
const MenuDropdownAny = MenuDropdown as React.ComponentType<any>;
const MenuItemAny = MenuItem as React.ComponentType<any>;
const ListGroupItemAny = ListGroupItem as React.ComponentType<any>;
const FormFieldAny = Form.Field as React.ComponentType<any>;

// Builds the trigger + dropdown children for the Menu playground.
const buildMenuChildren = () => [
  React.createElement(Button, { key: 'trigger', title: 'Open menu', variant: 'outline' }),
  React.createElement(MenuDropdownAny, { key: 'dropdown' }, [
    React.createElement(MenuItemAny, { key: 'profile' }, 'Profile'),
    React.createElement(MenuItemAny, { key: 'settings' }, 'Settings'),
    React.createElement(MenuItemAny, { key: 'logout' }, 'Log out'),
  ]),
];

// Builds ListGroupItem children for the ListGroup playground.
const buildListGroupChildren = () =>
  ['Overview', 'Analytics', 'Reports', 'Settings'].map((label) =>
    React.createElement(ListGroupItemAny, { key: label }, label)
  );

// Builds Form.Field children for the Form playground.
const buildFormChildren = () => [
  React.createElement(FormFieldAny, { key: 'name', name: 'name' },
    React.createElement(Input, { label: 'Full name', placeholder: 'Ada Lovelace' })
  ),
  React.createElement(FormFieldAny, { key: 'email', name: 'email' },
    React.createElement(Input, { label: 'Email', placeholder: 'ada@example.com' })
  ),
];

const INPUT_VARIANTS = ['default', 'filled', 'outline', 'unstyled'];

// Layout / plumbing props shared by the field-style inputs that add noise to the
// playground control list and are hidden by default.
const INPUT_NOISE_PROPS = [
  'value', 'defaultValue', 'name', 'startSection', 'endSection', 'startSectionProps', 'endSectionProps',
  'labelProps', 'descriptionProps', 'placeholderTextColor', 'keyboardFocusId', 'debounceMs', 'onEnter',
  'onFocus', 'onBlur', 'clearButtonLabel',
];

// ---------------------------------------------------------------------------
// Charts (@platform-blocks/charts) — sample data + shared control config
// ---------------------------------------------------------------------------

// Color-picker swatches for the optional per-chart color overrides. These mirror
// the charts theme's default accent palette (see packages/charts/src/colors.ts →
// paletteDefault) so the presets line up with the colors charts auto-assign from
// the (theme-aware) accent palette when a color prop is left unset.
const CHART_COLOR_PRESETS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#06b6d4', '#ec4899'];

// Charts expose a large surface of object-shaped config, interaction internals,
// and accessibility props that don't map to simple playground controls. The data
// itself is supplied via initialProps (sourced from each chart's `basic` demo),
// so these are hidden from the generated control list.
const CHART_HIDDEN_PROPS = [
  ...COMMON_EVENT_PROPS,
  // Data inputs — provided via initialProps
  'data', 'series', 'layers', 'nodes', 'links', 'rings', 'dataKey', 'values',
  // Object-shaped configuration
  'xAxis', 'yAxis', 'yAxisRight', 'grid', 'legend', 'tooltip', 'animation',
  'annotations', 'thresholds', 'bands', 'valueLabel', 'valueLabels', 'colorScale',
  'colorOptions', 'quadrants', 'labels', 'labelTextStyle', 'track', 'ticks', 'needle',
  'centerLabel', 'centerSubLabel', 'ranges', 'statsMarkers', 'valueBands', 'radialGrid',
  'defaultSliceStyle', 'padding', 'chartPadding', 'layout', 'connectors', 'cellSize',
  'domain', 'xDomain', 'yDomain', 'yDomainRight', 'rangeHighlights', 'hoverHighlight',
  'gradientLegend', 'accessibilityTable', 'movingAveragePeriods', 'movingAverageColors',
  'nodeRadiusRange', 'linkWidthRange', 'linkPalette', 'range',
  // Formatter / render callbacks
  'valueFormatter', 'labelFormatter', 'categoryLabelFormatter', 'renderCenterContent',
  'ariaLabelFormatter', 'onDomainChange', 'onSliceHover',
  // Interaction internals
  'enablePanZoom', 'zoomMode', 'minZoom', 'maxZoom', 'enableWheelZoom', 'wheelZoomStep',
  'invertWheelZoom', 'resetOnDoubleTap', 'clampToInitialDomain', 'invertPinchZoom',
  'enableBrushZoom', 'decimationThreshold', 'useSpatialIndex', 'disableAnimations',
  'disableAnimation', 'xScaleType', 'yScaleType', 'maxAnimatedCells', 'enableSeriesToggle',
  'keyboardNavigation', 'legendToggleEnabled',
  // Meta / a11y / misc
  'accessibilityLabel', 'accessibilityHint', 'accessibilityRole', 'accessible',
  'importantForAccessibility', 'useOwnInteractionProvider', 'suppressPopover',
  'animationEasing', 'animationDuration', 'title', 'subtitle', 'id', 'name', 'style', 'testID',
];

// Reusable width/height numeric controls (charts are sized in px).
const CHART_WIDTH_CONTROL = { controlType: 'number' as const, min: 240, max: 720, step: 20 };
const CHART_HEIGHT_CONTROL = { controlType: 'number' as const, min: 160, max: 480, step: 20 };

// -- Sample datasets (mirrors each chart's `basic` demo) --------------------
const AREA_CHART_DATA = [
  { x: 0, y: 42 }, { x: 1, y: 68 }, { x: 2, y: 83 }, { x: 3, y: 97 },
  { x: 4, y: 124 }, { x: 5, y: 138 }, { x: 6, y: 152 }, { x: 7, y: 167 },
];

const BAR_CHART_DATA = [
  { id: 'q1', category: 'Q1', value: 420_000 },
  { id: 'q2', category: 'Q2', value: 515_000 },
  { id: 'q3', category: 'Q3', value: 468_500 },
  { id: 'q4', category: 'Q4', value: 590_200 },
];

const BUBBLE_CHART_DATA = [
  { company: 'Aster Labs', revenue: 320, growth: 28, valuation: 920 },
  { company: 'Blue Harbor', revenue: 180, growth: 35, valuation: 620 },
  { company: 'Canopy', revenue: 250, growth: 22, valuation: 710 },
  { company: 'Delta Systems', revenue: 140, growth: 44, valuation: 540 },
  { company: 'Elevate', revenue: 460, growth: 18, valuation: 1080 },
  { company: 'Fieldstone', revenue: 210, growth: 31, valuation: 680 },
  { company: 'Glowforge', revenue: 120, growth: 52, valuation: 480 },
  { company: 'Horizon', revenue: 390, growth: 24, valuation: 960 },
];
const BUBBLE_CHART_DATA_KEY = { x: 'revenue', y: 'growth', z: 'valuation', label: 'company', id: 'company' };

const CANDLESTICK_SERIES = [
  {
    id: 'apple',
    name: 'Apple Inc.',
    colorBull: '#34C38F',
    colorBear: '#F56565',
    wickColor: '#6B7280',
    data: [
      { x: new Date('2023-10-02'), open: 154, high: 158, low: 153, close: 157 },
      { x: new Date('2023-10-03'), open: 157, high: 161, low: 156, close: 160 },
      { x: new Date('2023-10-04'), open: 160, high: 164, low: 159, close: 162 },
      { x: new Date('2023-10-05'), open: 162, high: 166, low: 161, close: 165 },
      { x: new Date('2023-10-06'), open: 165, high: 168, low: 163, close: 164 },
      { x: new Date('2023-10-09'), open: 164, high: 167, low: 162, close: 166 },
      { x: new Date('2023-10-10'), open: 166, high: 170, low: 165, close: 169 },
      { x: new Date('2023-10-11'), open: 169, high: 172, low: 167, close: 168 },
    ],
  },
];

const COMBO_CHART_LAYERS = [
  {
    type: 'bar' as const, id: 'revenue', name: 'Monthly revenue', opacity: 0.85,
    data: [
      { x: 1, y: 420 }, { x: 2, y: 455 }, { x: 3, y: 508 },
      { x: 4, y: 480 }, { x: 5, y: 532 }, { x: 6, y: 575 },
    ],
  },
  {
    type: 'line' as const, id: 'active-users', name: 'Active users', targetAxis: 'right' as const,
    thickness: 3, showPoints: true, pointSize: 6,
    data: [
      { x: 1, y: 110 }, { x: 2, y: 134 }, { x: 3, y: 149 },
      { x: 4, y: 158 }, { x: 5, y: 166 }, { x: 6, y: 172 },
    ],
  },
];

const DONUT_CHART_DATA = [
  { label: 'Design', value: 28 },
  { label: 'Engineering', value: 42 },
  { label: 'Marketing', value: 18 },
  { label: 'Support', value: 12 },
];

const FUNNEL_CHART_SERIES = {
  id: 'pipeline',
  name: 'Q2 pipeline',
  steps: [
    { label: 'Website visits', value: 32_500 },
    { label: 'Sign-ups', value: 9_600 },
    { label: 'Qualified leads', value: 4_350 },
    { label: 'Trials started', value: 2_150 },
    { label: 'Customers', value: 1_120 },
  ],
};

const GAUGE_CHART_RANGES = [
  { from: 0, to: 40, color: '#F87171', label: 'High' },
  { from: 40, to: 70, color: '#FBBF24', label: 'Moderate' },
  { from: 70, to: 100, color: '#34D399', label: 'Optimal' },
];

const GROUPED_BAR_SERIES = [
  {
    id: '2024', name: '2024',
    data: [
      { id: 'analytics-24', category: 'Analytics', value: 420 },
      { id: 'automation-24', category: 'Automation', value: 365 },
      { id: 'integrations-24', category: 'Integrations', value: 298 },
    ],
  },
  {
    id: '2025', name: '2025',
    data: [
      { id: 'analytics-25', category: 'Analytics', value: 512 },
      { id: 'automation-25', category: 'Automation', value: 418 },
      { id: 'integrations-25', category: 'Integrations', value: 342 },
    ],
  },
  {
    id: 'target', name: 'Target',
    data: [
      { id: 'analytics-target', category: 'Analytics', value: 540 },
      { id: 'automation-target', category: 'Automation', value: 440 },
      { id: 'integrations-target', category: 'Integrations', value: 360 },
    ],
  },
];

const HEATMAP_CHART_DATA = {
  rows: ['Morning', 'Afternoon', 'Evening'],
  cols: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  values: [
    [12, 18, 25, 22, 28],
    [8, 14, 19, 24, 20],
    [6, 9, 12, 15, 11],
  ],
};
const HEATMAP_COLOR_SCALE = { min: 0, max: 30, colors: ['#EBF4FF', '#60A5FA', '#1D4ED8'] };

const HISTOGRAM_CHART_DATA = [
  4, 6, 7, 8, 9, 9, 10, 11, 11, 12, 12, 12, 13, 13, 14, 14, 14, 15, 16, 16,
  16, 17, 18, 18, 18, 19, 20, 20, 22, 24, 25,
];

const LINE_CHART_SERIES = [
  {
    id: 'north-america', name: 'North America',
    data: [
      { x: 1, y: 120 }, { x: 2, y: 138 }, { x: 3, y: 152 }, { x: 4, y: 167 },
      { x: 5, y: 176 }, { x: 6, y: 189 }, { x: 7, y: 205 }, { x: 8, y: 220 },
      { x: 9, y: 232 }, { x: 10, y: 246 }, { x: 11, y: 260 }, { x: 12, y: 278 },
    ],
  },
  {
    id: 'emea', name: 'EMEA',
    data: [
      { x: 1, y: 96 }, { x: 2, y: 108 }, { x: 3, y: 117 }, { x: 4, y: 126 },
      { x: 5, y: 134 }, { x: 6, y: 142 }, { x: 7, y: 150 }, { x: 8, y: 158 },
      { x: 9, y: 168 }, { x: 10, y: 175 }, { x: 11, y: 182 }, { x: 12, y: 191 },
    ],
  },
];

const MARIMEKKO_CHART_DATA = [
  { label: 'Inbound', segments: [{ label: 'North America', value: 52 }, { label: 'EMEA', value: 34 }, { label: 'APAC', value: 24 }] },
  { label: 'Outbound', segments: [{ label: 'North America', value: 44 }, { label: 'EMEA', value: 28 }, { label: 'APAC', value: 18 }] },
  { label: 'Partnerships', segments: [{ label: 'North America', value: 29 }, { label: 'EMEA', value: 22 }, { label: 'APAC', value: 15 }] },
  { label: 'Expansion', segments: [{ label: 'North America', value: 37 }, { label: 'EMEA', value: 18 }, { label: 'APAC', value: 12 }] },
];

const NETWORK_CHART_NODES = [
  { id: 'product', name: 'Product', group: 'teams', value: 12 },
  { id: 'design', name: 'Design', group: 'teams', value: 8 },
  { id: 'engineering', name: 'Engineering', group: 'teams', value: 18 },
  { id: 'marketing', name: 'Marketing', group: 'teams', value: 10 },
  { id: 'sales', name: 'Sales', group: 'teams', value: 9 },
  { id: 'support', name: 'Support', group: 'teams', value: 7 },
  { id: 'platform', name: 'Platform', group: 'initiatives', value: 15 },
  { id: 'ai', name: 'AI', group: 'initiatives', value: 11 },
];
const NETWORK_CHART_LINKS = [
  { source: 'platform', target: 'engineering', value: 6 },
  { source: 'platform', target: 'product', value: 5 },
  { source: 'platform', target: 'support', value: 2 },
  { source: 'ai', target: 'product', value: 4 },
  { source: 'ai', target: 'marketing', value: 3 },
  { source: 'ai', target: 'sales', value: 2 },
  { source: 'product', target: 'design', value: 7 },
  { source: 'product', target: 'engineering', value: 8 },
  { source: 'marketing', target: 'sales', value: 5 },
  { source: 'support', target: 'sales', value: 4 },
];

const PARETO_CHART_DATA = [
  { label: 'Authentication', value: 118 },
  { label: 'Checkout', value: 96 },
  { label: 'Notifications', value: 64 },
  { label: 'Analytics', value: 42 },
  { label: 'Billing', value: 31 },
  { label: 'Integrations', value: 27 },
  { label: 'Mobile', value: 19 },
  { label: 'Reporting', value: 17 },
];

const PIE_CHART_DATA = [
  { id: 'direct', label: 'Direct', value: 55 },
  { id: 'organic', label: 'Organic', value: 25 },
  { id: 'referral', label: 'Referral', value: 15 },
  { id: 'social', label: 'Social', value: 5 },
];

const RADAR_CHART_SERIES = [
  {
    id: 'current', name: 'Current quarter',
    data: [
      { axis: 'Sales', value: 42 }, { axis: 'Marketing', value: 30 }, { axis: 'R&D', value: 50 },
      { axis: 'Support', value: 35 }, { axis: 'Operations', value: 24 }, { axis: 'Finance', value: 18 },
    ],
  },
  {
    id: 'target', name: 'Target',
    data: [
      { axis: 'Sales', value: 48 }, { axis: 'Marketing', value: 36 }, { axis: 'R&D', value: 44 },
      { axis: 'Support', value: 40 }, { axis: 'Operations', value: 28 }, { axis: 'Finance', value: 22 },
    ],
  },
];

const RADIAL_BAR_DATA = [
  { id: 'uptime', label: 'Uptime', value: 99, max: 100 },
  { id: 'nps', label: 'NPS', value: 72, max: 100 },
  { id: 'retention', label: 'Retention', value: 86, max: 100 },
  { id: 'sla', label: 'SLA', value: 94, max: 100 },
];

const RIDGE_CHART_SERIES = [
  { id: '2019', name: '2019', values: [42, 44, 45, 46, 47, 48, 49, 49, 50, 52, 53, 54, 55, 55, 55, 57, 58, 60, 62] },
  { id: '2020', name: '2020', values: [38, 39, 40, 41, 42, 43, 44, 46, 48, 50, 51, 51, 52, 53, 53, 54, 55, 57, 59] },
  { id: '2021', name: '2021', values: [45, 47, 48, 49, 50, 51, 52, 53, 55, 56, 57, 58, 59, 59, 60, 61, 62, 63, 64] },
  { id: '2022', name: '2022', values: [50, 51, 52, 54, 55, 56, 57, 58, 60, 61, 62, 63, 64, 65, 65, 66, 67, 68, 69] },
];

const SANKEY_CHART_NODES = [
  { id: 'solar', name: 'Solar' },
  { id: 'wind', name: 'Wind' },
  { id: 'hydro', name: 'Hydro' },
  { id: 'grid', name: 'Grid' },
  { id: 'battery', name: 'Battery Storage' },
  { id: 'residential', name: 'Residential' },
  { id: 'commercial', name: 'Commercial' },
  { id: 'industrial', name: 'Industrial' },
];
const SANKEY_CHART_LINKS = [
  { source: 'solar', target: 'grid', value: 32 },
  { source: 'wind', target: 'grid', value: 28 },
  { source: 'hydro', target: 'grid', value: 18 },
  { source: 'solar', target: 'battery', value: 6 },
  { source: 'wind', target: 'battery', value: 4 },
  { source: 'battery', target: 'grid', value: 8 },
  { source: 'grid', target: 'residential', value: 30 },
  { source: 'grid', target: 'commercial', value: 24 },
  { source: 'grid', target: 'industrial', value: 16 },
];

const SCATTER_CHART_SERIES = [
  {
    id: 'marketing', name: 'Marketing spend', pointSize: 8,
    data: [
      { x: 18, y: 42 }, { x: 22, y: 48 }, { x: 25, y: 54 }, { x: 27, y: 58 },
      { x: 30, y: 61 }, { x: 34, y: 66 }, { x: 38, y: 70 },
    ],
  },
  {
    id: 'events', name: 'Event sponsorship', pointSize: 7,
    data: [
      { x: 12, y: 36 }, { x: 16, y: 41 }, { x: 19, y: 44 }, { x: 23, y: 47 },
      { x: 27, y: 55 }, { x: 32, y: 62 }, { x: 35, y: 65 },
    ],
  },
];
const SCATTER_CHART_DATA = SCATTER_CHART_SERIES.flatMap((serie) => serie.data);

const SPARKLINE_CHART_DATA = [32, 36, 31, 40, 44, 47, 46, 52, 58, 60, 64, 67, 70, 72];

const STACKED_AREA_SERIES = [
  {
    id: 'mobile', name: 'Mobile',
    data: [
      { x: 1, y: 22 }, { x: 2, y: 26 }, { x: 3, y: 28 }, { x: 4, y: 32 }, { x: 5, y: 36 }, { x: 6, y: 38 },
      { x: 7, y: 42 }, { x: 8, y: 44 }, { x: 9, y: 47 }, { x: 10, y: 50 }, { x: 11, y: 52 }, { x: 12, y: 55 },
    ],
  },
  {
    id: 'web', name: 'Web',
    data: [
      { x: 1, y: 18 }, { x: 2, y: 20 }, { x: 3, y: 22 }, { x: 4, y: 25 }, { x: 5, y: 26 }, { x: 6, y: 27 },
      { x: 7, y: 28 }, { x: 8, y: 30 }, { x: 9, y: 32 }, { x: 10, y: 33 }, { x: 11, y: 34 }, { x: 12, y: 35 },
    ],
  },
  {
    id: 'api', name: 'API',
    data: [
      { x: 1, y: 12 }, { x: 2, y: 14 }, { x: 3, y: 15 }, { x: 4, y: 16 }, { x: 5, y: 18 }, { x: 6, y: 19 },
      { x: 7, y: 21 }, { x: 8, y: 22 }, { x: 9, y: 23 }, { x: 10, y: 24 }, { x: 11, y: 25 }, { x: 12, y: 27 },
    ],
  },
];

const STACKED_BAR_SERIES = [
  {
    id: 'new-business', name: 'New business',
    data: [
      { id: 'q1-new', category: 'Q1', value: 220 }, { id: 'q2-new', category: 'Q2', value: 250 },
      { id: 'q3-new', category: 'Q3', value: 240 }, { id: 'q4-new', category: 'Q4', value: 280 },
    ],
  },
  {
    id: 'expansion', name: 'Expansion',
    data: [
      { id: 'q1-exp', category: 'Q1', value: 110 }, { id: 'q2-exp', category: 'Q2', value: 135 },
      { id: 'q3-exp', category: 'Q3', value: 150 }, { id: 'q4-exp', category: 'Q4', value: 165 },
    ],
  },
  {
    id: 'renewal', name: 'Renewal',
    data: [
      { id: 'q1-renew', category: 'Q1', value: 180 }, { id: 'q2-renew', category: 'Q2', value: 172 },
      { id: 'q3-renew', category: 'Q3', value: 188 }, { id: 'q4-renew', category: 'Q4', value: 194 },
    ],
  },
];

const VIOLIN_CHART_SERIES = [
  { id: 'north', name: 'North region', values: [45, 47, 48, 49, 50, 51, 52, 53, 53, 54, 55, 55, 56, 58, 59, 60, 61] },
  { id: 'south', name: 'South region', values: [38, 39, 40, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 52, 53, 54] },
  { id: 'west', name: 'West region', values: [52, 53, 54, 55, 56, 57, 58, 59, 60, 60, 61, 62, 63, 64, 65, 65, 66] },
];

const PLAYGROUND_CONFIGS: Record<string, ComponentPlaygroundConfig> = {
  Accordion: {
    id: 'Accordion',
    component: 'Accordion',
    initialProps: {
      type: 'single',
      variant: 'default',
      size: 'md',
      color: 'primary',
      density: 'comfortable',
      chevronPosition: 'end',
      showChevron: true,
      animated: true,
    },
    pinnedProps: ['type', 'variant', 'size', 'color', 'density', 'chevronPosition', 'showChevron', 'animated'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'items', 'expanded', 'defaultExpanded', 'persistKey', 'autoPersist', 'titleProps', 'headerStyle', 'contentStyle', 'headerTextStyle'],
    controlOverrides: {
      type: { controlType: 'segmented', options: ACCORDION_TYPES },
      variant: { controlType: 'segmented', options: ACCORDION_VARIANTS },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      color: { controlType: 'segmented', options: ACCORDION_COLORS },
      density: { controlType: 'segmented', options: ACCORDION_DENSITY },
      chevronPosition: { controlType: 'segmented', options: ACCORDION_CHEVRON_POSITIONS },
    },
    transformProps: (values) => ({ ...values, items: buildAccordionPlaygroundItems() }),
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 520 } }, node),
  },
  Button: {
    id: 'Button',
    component: 'Button',
    initialProps: {
      title: 'Launch mission',
      variant: 'filled',
      size: 'md',
      fullWidth: false,
      loading: false,
      disabled: false
    },
    pinnedProps: ['title', 'variant', 'size', 'fullWidth', 'loading', 'disabled', 'colorVariant', 'textColor'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'tooltip', 'tooltipPosition'],
    controlOverrides: {
      variant: { controlType: 'segmented', options: ['filled', 'secondary', 'outline', 'ghost', 'gradient', 'link', 'none'] },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      colorVariant: {
        controlType: 'color',
        placeholder: 'primary.6 or #3b82f6',
        colorPresets: ['#228be6', '#845ef7', '#40c057', '#f59f00', '#e03131', '#15aabf']
      },
      textColor: {
        controlType: 'color',
        placeholder: '#FFFFFF',
        colorPresets: ['#ffffff', '#000000', '#0f172a', '#f8f9fa']
      },
      loadingTitle: { controlType: 'text', placeholder: 'Loading…' }
    }
  },
  Select: {
    id: 'Select',
    component: 'Select',
    initialProps: {
      label: 'Favorite sport',
      placeholder: 'Choose a sport',
      value: SPORTS_OPTIONS[0].value,
      options: SPORTS_OPTIONS,
      helperText: 'Local data source',
      variant: 'default',
      clearable: true,
      searchable: false
    },
    pinnedProps: ['value', 'placeholder', 'variant', 'size', 'fullWidth', 'disabled', 'searchable', 'clearable'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'options', 'renderOption', 'renderEmptyState', 'renderLoadingState', 'data', 'renderGroupHeader', 'labelProps', 'descriptionProps'],
    controlOverrides: {
      value: { controlType: 'select', options: SPORTS_OPTIONS.map(option => option.value) },
      variant: { controlType: 'segmented', options: ['default', 'filled', 'outline', 'unstyled'] },
      size: { controlType: 'size-slider', options: SIZE_TOKENS }
    }
  },
  AutoComplete: {
    id: 'AutoComplete',
    component: 'AutoComplete',
    initialProps: {
      label: 'Search cities',
      placeholder: 'Start typing…',
      data: CITY_SUGGESTIONS,
      helperText: 'Suggestions update after 2 characters',
      minWidth: 280,
      clearable: true,
      showSuggestionsOnFocus: true
    },
    pinnedProps: ['placeholder', 'size', 'radius', 'disabled', 'clearable', 'multiSelect', 'allowCustomValue'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'data', 'renderItem', 'renderEmptyState', 'renderLoadingState', 'value', 'selectedValues', 'textInputProps', 'selectedValuesContainerStyle', 'selectedValueChipProps', 'suggestionsStyle', 'suggestionItemStyle'],
    controlOverrides: {
      size: { controlType: 'size-slider', options: SIZE_TOKENS }
    }
  },
  Knob: {
    id: 'Knob',
    component: 'Knob',
    initialProps: {
      value: 48,
      min: 0,
      max: 100,
      step: 1,
      size: 'xl',
      behavior: 'level',
      variant: 'default',
      valueLabel: {
        position: 'center',
        suffix: '%'
      }
    },
    pinnedProps: ['value', 'min', 'max', 'step', 'size', 'ringThickness', 'variant', 'behavior'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'valueLabel', 'marks', 'tickLayers', 'panning', 'appearance', 'interaction', 'pointer', 'progress', 'renderThumb'],
    controlOverrides: {
      value: { controlType: 'number', min: 0, max: 100, step: 1 },
      min: { controlType: 'range', pairWith: 'max', label: 'Min / Max', min: 0, max: 200, step: 1 },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      variant: { controlType: 'select', options: KNOB_VARIANTS },
      behavior: { controlType: 'select', options: KNOB_BEHAVIORS }
    },
    // Ring thickness lives under the nested `appearance` prop, which flat controls can't
    // reach — expose it on its own and fold it back in. It starts at 0 meaning "auto", so
    // the visual variants keep the stroke weights that distinguish them until you take over.
    extraControls: [
      { name: 'ringThickness', label: 'Ring Thickness (0 = auto)', controlType: 'number', min: 0, max: 40, step: 1, initialValue: 0 },
    ],
    transformProps: (values) => {
      const { ringThickness, ...rest } = values;
      if (typeof ringThickness === 'number' && ringThickness > 0) {
        rest.appearance = {
          ...(rest.appearance ?? {}),
          ring: { ...(rest.appearance?.ring ?? {}), thickness: ringThickness },
        };
      }
      return rest;
    },
  },
  Slider: {
    id: 'Slider',
    component: 'Slider',
    initialProps: {
      label: 'Volume',
      value: 32,
      min: 0,
      max: 100,
      step: 1,
      variant: 'default',
      showTicks: true,
      restrictToTicks: false,
      fullWidth: true,
      valueLabelAlwaysOn: true,
      valueLabelPosition: 'top',
      valueLabelAsCard: true
    },
    pinnedProps: [
      'value', 'min', 'max', 'step', 'variant', 'disabled', 'showTicks', 'restrictToTicks', 'orientation',
      'valueLabelAlwaysOn', 'valueLabelPosition', 'valueLabelOffset', 'valueLabelAsCard',
    ],
    hiddenProps: [
      ...COMMON_EVENT_PROPS,
      'ticks', 'valueLabel', 'trackColor', 'activeTrackColor', 'thumbColor', 'containerSize', 'trackSize', 'thumbSize', 'precision',
      'trackStyle', 'activeTrackStyle', 'thumbStyle', 'tickStyle', 'activeTickStyle',
      'tickColor', 'activeTickColor', 'tickLabelProps', 'valueLabelStyle', 'valueLabelProps',
    ],
    controlOverrides: {
      value: { controlType: 'number', min: 0, max: 100, step: 1 },
      // SliderVariant — Slider has its own visual variants distinct from InputVariant
      variant: { controlType: 'segmented', options: ['default', 'filled', 'outline', 'minimal', 'segmented', 'unstyled'] },
      orientation: { controlType: 'segmented', options: SLIDER_VARIANTS },
      valueLabelPosition: { controlType: 'segmented', options: ['top', 'bottom', 'left', 'right'] },
      valueLabelOffset: { controlType: 'number', min: 0, max: 32, step: 1 },
      valueLabelAlwaysOn: { controlType: 'boolean' },
      valueLabelAsCard: { controlType: 'boolean' }
    }
  },
  Progress: {
    id: 'Progress',
    component: 'Progress',
    initialProps: {
      value: 60,
      size: 'md',
      color: 'primary',
      striped: false,
      animate: true,
      fullWidth: true
    },
    pinnedProps: ['value', 'size', 'color', 'striped', 'animate', 'fullWidth'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'transitionDuration', 'radius'],
    controlOverrides: {
      value: { controlType: 'number', min: 0, max: 100, step: 5 },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      color: { controlType: 'select', options: PROGRESS_COLORS }
    }
  },
  Card: {
    id: 'Card',
    component: 'Card',
    initialProps: {
      variant: 'elevated',
      padding: 'md',
      radius: 'lg',
      shadow: 'md',
      withBorder: false,
      children: React.createElement(
        Text,
        { style: { fontSize: 16, color: '#111827' } },
        'Mission briefing with highlights from the last sprint.'
      )
    },
    pinnedProps: ['variant', 'withBorder', 'bg', 'borderColor', 'borderWidth', 'padding', 'radius', 'shadow', 'disabled'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'onContextMenu'],
    controlOverrides: {
      variant: { controlType: 'segmented', options: CARD_VARIANTS },
      withBorder: { controlType: 'boolean' },
      // bg accepts palette names ('primary', 'success', …), theme.backgrounds keys
      // ('surface', 'subtle', 'elevated', 'base'), or any CSS color string.
      bg: {
        controlType: 'select',
        options: ['', 'primary', 'secondary', 'success', 'warning', 'error', 'gray', 'surface', 'subtle', 'elevated', 'base']
      },
      borderColor: { controlType: 'color' },
      borderWidth: { controlType: 'number', min: 0, max: 6, step: 1 },
      // padding accepts size tokens AND numbers — segmented covers the common case
      padding: { controlType: 'select', options: SIZE_TOKENS },
      radius: { controlType: 'select', options: RADIUS_TOKENS },
      shadow: { controlType: 'select', options: CARD_SHADOW_OPTIONS }
    }
  },
  Surface: {
    id: 'Surface',
    component: 'Surface',
    initialProps: {
      level: 1,
      padding: 'md',
      radius: 'lg',
      children: React.createElement(
        Text,
        { style: { fontSize: 16 } },
        'A Surface owns one decision: how far off the page it sits.'
      )
    },
    pinnedProps: ['level', 'raised', 'withBorder', 'bg', 'padding', 'radius', 'shadow', 'borderColor', 'borderWidth'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'style', 'testID'],
    controlOverrides: {
      // Number, not segmented — segmented emits strings, and the level has to
      // stay numeric for the ladder lookup.
      level: { controlType: 'number', min: 0, max: 3, step: 1 },
      raised: { controlType: 'boolean' },
      // Left unset in initialProps so the default 'auto' (hairline in dark mode
      // only) is what the playground shows until you toggle it.
      withBorder: { controlType: 'boolean' },
      bg: {
        controlType: 'select',
        options: ['', 'primary', 'secondary', 'success', 'warning', 'error', 'gray', 'surface', 'subtle', 'elevated', 'base']
      },
      borderColor: { controlType: 'color' },
      borderWidth: { controlType: 'number', min: 0, max: 6, step: 1 },
      padding: { controlType: 'select', options: SIZE_TOKENS },
      radius: { controlType: 'select', options: RADIUS_TOKENS },
      shadow: { controlType: 'select', options: CARD_SHADOW_OPTIONS }
    }
  },
  Input: {
    id: 'Input',
    component: 'Input',
    initialProps: {
      label: 'Email address',
      placeholder: 'crew@luna.dev',
      value: 'crew@luna.dev',
      helperText: 'We will notify you about launch windows.',
      description: 'Used for weekly mission summaries.',
      size: 'md',
      type: 'email',
      variant: 'default',
      clearable: true,
      required: true
    },
    pinnedProps: ['value', 'placeholder', 'type', 'variant', 'size', 'disabled', 'required', 'clearable', 'multiline', 'radius', 'placeholderTextColor'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'validation', 'textInputProps', 'inputRef', 'keyboardFocusId', 'name', 'startSection', 'endSection', 'startSectionProps', 'endSectionProps', 'labelProps', 'descriptionProps', 'disclaimerProps'],
    controlOverrides: {
      type: { controlType: 'segmented', options: INPUT_TYPES },
      variant: { controlType: 'segmented', options: ['default', 'filled', 'outline', 'unstyled'] },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      radius: { controlType: 'select', options: RADIUS_TOKENS },
      placeholderTextColor: { controlType: 'color' }
    }
  },
  Switch: {
    id: 'Switch',
    component: 'Switch',
    initialProps: {
      label: 'Enable notifications',
      description: 'Send weekly launch recaps.',
      defaultChecked: true,
      variant: 'filled',
      size: '2xl',
      color: 'primary',
      labelPosition: 'right',
      onLabel: 'On',
      offLabel: 'Off'
    },
    pinnedProps: ['checked', 'label', 'variant', 'size', 'color', 'labelPosition', 'disabled', 'required', 'description'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'controls', 'children', 'onIcon', 'offIcon'],
    controlOverrides: {
      variant: { controlType: 'select', options: SWITCH_VARIANTS },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      color: { controlType: 'select', options: SWITCH_COLOR_OPTIONS },
      labelPosition: { controlType: 'segmented', options: SWITCH_LABEL_POSITIONS }
    },
    extraControls: [
      {
        name: 'thumbIcons',
        label: 'Thumb icons',
        controlType: 'boolean',
        initialValue: false,
        description: 'Render check / ✕ icons inside the moving thumb (onIcon / offIcon).',
      },
    ],
    transformProps: (values) => {
      const { thumbIcons, ...rest } = values;
      if (thumbIcons) {
        rest.onIcon = React.createElement(Icon, { name: 'check', size: 12, stroke: 3, color: '#111827' });
        rest.offIcon = React.createElement(Icon, { name: 'close', size: 12, stroke: 3, color: '#6B7280' });
      }
      return rest;
    },
  },
  Tabs: {
    id: 'Tabs',
    component: 'Tabs',
    initialProps: {
      items: TAB_PLAYGROUND_ITEMS,
      variant: 'line',
      size: 'md',
      color: 'primary',
      orientation: 'horizontal',
      location: 'start',
      scrollable: false,
      animated: true,
      tabGap: 12,
      indicatorThickness: 2
    },
    pinnedProps: ['variant', 'size', 'color', 'orientation', 'location', 'scrollable', 'animated', 'navigationOnly', 'tabGap', 'indicatorThickness'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'items', 'tabStyle', 'textStyle', 'contentStyle', 'persistKey', 'autoPersist', 'children', 'disabledKeys'],
    controlOverrides: {
      variant: { controlType: 'segmented', options: TAB_VARIANTS },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      color: { controlType: 'select', options: TAB_COLOR_OPTIONS },
      orientation: { controlType: 'segmented', options: ['horizontal', 'vertical'] },
      location: { controlType: 'segmented', options: ['start', 'end'] },
      tabGap: { controlType: 'number', min: 0, max: 32, step: 2 },
      indicatorThickness: { controlType: 'number', min: 1, max: 6, step: 1 }
    }
  },
  Tooltip: {
    id: 'Tooltip',
    component: 'Tooltip',
    initialProps: {
      label: 'Share to mission control',
      position: 'top',
      withArrow: true,
      color: 'primary',
      radius: 'sm',
      offset: 8,
      multiline: true,
      width: 220,
      children: TOOLTIP_TARGET
    },
    pinnedProps: ['label', 'position', 'withArrow', 'color', 'radius', 'offset', 'multiline', 'width'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'events'],
    controlOverrides: {
      position: { controlType: 'segmented', options: TOOLTIP_POSITIONS },
      color: { controlType: 'select', options: TOOLTIP_COLOR_OPTIONS },
      radius: { controlType: 'select', options: RADIUS_TOKENS },
      offset: { controlType: 'number', min: 0, max: 32, step: 1 },
      width: { controlType: 'number', min: 120, max: 320, step: 10 }
    },
    previewWrapper: (node) => React.createElement(
      View,
      { style: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32 } },
      node
    )
  },
  KeyCap: {
    id: 'KeyCap',
    component: 'KeyCap',
    initialProps: {
      children: 'Cmd + K',
      size: 'md',
      variant: 'default',
      color: 'primary',
      animateOnPress: true,
      keyCode: 'k',
      modifiers: ['cmd']
    },
    pinnedProps: ['size', 'variant', 'color', 'animateOnPress', 'pressed'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'modifiers'],
    controlOverrides: {
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      variant: { controlType: 'segmented', options: ['default', 'minimal', 'outline', 'filled'] },
      color: { controlType: 'select', options: ['primary', 'secondary', 'gray', 'success', 'warning', 'error'] },
      modifiers: false
    }
  },
  Ring: {
    id: 'Ring',
    component: 'Ring',
    initialProps: {
      value: 72,
      min: 0,
      max: 100,
      size: 160,
      thickness: 16,
      label: 'System health',
      subLabel: 'Nominal',
      caption: '24h rolling',
      showValue: true,
      trackColor: 'rgba(148,163,184,0.35)',
      progressColor: '#22c55e',
      roundedCaps: true,
      colorStops: [
        { value: 0, color: '#94a3b8' },
        { value: 50, color: '#22c55e' },
        { value: 80, color: '#f97316' }
      ]
    },
    pinnedProps: ['value', 'size', 'thickness', 'showValue', 'roundedCaps', 'neutral'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'valueFormatter', 'children'],
    controlOverrides: {
      value: { controlType: 'number', min: 0, max: 100, step: 1 },
      size: { controlType: 'number', min: 80, max: 280, step: 10 },
      thickness: { controlType: 'number', min: 4, max: 32, step: 1 },
      progressColor: {
        controlType: 'color',
        placeholder: '#22c55e',
        colorPresets: ['#22c55e', '#f97316', '#e11d48', '#0ea5e9']
      },
      trackColor: {
        controlType: 'color',
        placeholder: '#e2e8f0',
        colorPresets: ['#e2e8f0', '#cbd5f5', '#94a3b8', '#1e293b']
      }
    }
  },
  Text: {
    id: 'Text',
    component: 'Text',
    initialProps: {
      children: 'Telemetry stream ready',
      variant: 'h4',
      size: 'lg',
      colorVariant: 'primary',
      weight: 'semibold',
      align: 'left',
      tracking: 0.2,
      uppercase: false,
      numberOfLines: 2
    },
    pinnedProps: ['variant', 'size', 'c', 'color', 'colorVariant', 'weight', 'align', 'uppercase', 'ff', 'numberOfLines', 'ellipsizeMode'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'tx', 'txParams', 'value', 'fontFamily', 'as'],
    controlOverrides: {
      variant: { controlType: 'select', options: TEXT_VARIANT_OPTIONS },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      colorVariant: { controlType: 'select', options: TEXT_COLOR_VARIANTS },
      color: {
        controlType: 'color',
        placeholder: '#0f172a',
        colorPresets: ['#0f172a', '#475569', '#f8fafc', '#14b8a6']
      },
      // `c` shorthand — accepts 'dimmed', palette names, palette.shade
      // (e.g. 'primary.6'), or any CSS color string.
      c: {
        controlType: 'select',
        options: ['', 'dimmed', 'primary', 'secondary', 'success', 'warning', 'error', 'gray', 'primary.5', 'primary.7', 'error.6']
      },
      // ff is the shorthand alias for fontFamily
      ff: { controlType: 'text', placeholder: 'monospace, Georgia, …' },
      weight: { controlType: 'segmented', options: FONT_WEIGHT_OPTIONS },
      align: { controlType: 'segmented', options: ['left', 'center', 'right', 'justify'] },
      tracking: { controlType: 'number', min: -1, max: 2, step: 0.1 }
    }
  },
  Timeline: {
    id: 'Timeline',
    component: 'Timeline',
    initialProps: {
      active: 2,
      size: 'md',
      colorVariant: 'primary.5',
      align: 'left',
      lineWidth: 2,
      bulletSize: 24,
      centerMode: false,
      reverseActive: false
    },
    pinnedProps: ['active', 'size', 'colorVariant', 'align', 'lineWidth', 'bulletSize', 'centerMode', 'reverseActive'],
    hiddenProps: [...COMMON_EVENT_PROPS],
    controlOverrides: {
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      colorVariant: { controlType: 'select', options: TIMELINE_COLOR_VARIANTS },
      color: {
        controlType: 'color',
        placeholder: 'primary.5',
        colorPresets: ['#0ea5e9', '#22c55e', '#f97316', '#ef4444']
      },
      align: { controlType: 'segmented', options: ['left', 'right'] },
      lineWidth: { controlType: 'number', min: 1, max: 6, step: 1 },
      bulletSize: { controlType: 'number', min: 12, max: 40, step: 2 },
      active: { controlType: 'number', min: 0, max: TIMELINE_EVENTS.length - 1, step: 1 }
    },
    previewWrapper: (node) => {
      if (!React.isValidElement(node)) return node;
      const TimelineItem = (node.type as any)?.Item;
      if (!TimelineItem) return node;
      const items = TIMELINE_EVENTS.map(event =>
        React.createElement(
          TimelineItem,
          {
            key: event.key,
            title: event.title,
            lineVariant: event.lineVariant,
            colorVariant: event.lineVariant === 'dotted' ? 'secondary.5' : undefined
          },
          React.createElement(
            View,
            { style: { marginTop: 6 } },
            React.createElement(Text, { style: { fontSize: 14, color: '#475569' } }, `${event.timestamp} · ${event.description}`)
          )
        )
      );
      return React.cloneElement(node, undefined, items);
    }
  },
  DataList: {
    id: 'DataList',
    component: 'DataList',
    initialProps: {
      // `data` shorthand renders directly — more robust than injecting
      // Item/ItemLabel/ItemValue children by reflecting off the component.
      data: [
        { label: 'Name', value: 'John Doe' },
        { label: 'Email', value: 'john@example.com' },
        { label: 'Role', value: 'Software Engineer' },
      ],
      orientation: 'horizontal',
      size: 'md',
      withDivider: false,
      labelWidth: 120,
    },
    pinnedProps: ['orientation', 'size', 'withDivider', 'labelWidth', 'spacing'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'data', 'children', 'style', 'testID', 'labelColor', 'valueColor', 'dividerColor'],
    controlOverrides: {
      orientation: { controlType: 'segmented', options: ['horizontal', 'vertical'] },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      labelWidth: { controlType: 'number', min: 60, max: 240, step: 10 },
    },
  },
  Waveform: {
    id: 'Waveform',
    component: 'Waveform',
    initialProps: {
      peaks: WAVEFORM_SAMPLE,
      width: 320,
      height: 80,
      progressColor: '#22c55e',
      variant: 'bars',
      barWidth: 2,
      barGap: 1,
      strokeWidth: 2,
      progress: 0.35,
      showProgressLine: true,
      progressLineStyle: { color: '#22c55e', width: 2, opacity: 0.6 },
      interactive: false,
      normalize: true,
      fullWidth: true,
      showTimeStamps: false,
      duration: 120,
      timeStampInterval: 15
    },
    pinnedProps: ['variant', 'width', 'height', 'color', 'progress', 'barWidth', 'barGap', 'strokeWidth', 'showProgressLine', 'interactive', 'normalize', 'fullWidth'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'peaks', 'progressLineStyle', 'gradientColors', 'selection', 'rmsData', 'markers', 'onSeek', 'onDragStart', 'onDrag', 'onDragEnd', 'onSelectionChange', 'onZoomChange', 'onPerformanceMetrics'],
    controlOverrides: {
      variant: { controlType: 'segmented', options: WAVEFORM_VARIANTS },
      width: { controlType: 'number', min: 200, max: 640, step: 10 },
      height: { controlType: 'number', min: 40, max: 160, step: 5 },
      color: {
        controlType: 'color',
        placeholder: '#6366f1',
        colorPresets: WAVEFORM_COLOR_PRESETS
      },
      progressColor: {
        controlType: 'color',
        placeholder: '#22c55e',
        colorPresets: WAVEFORM_COLOR_PRESETS
      },
      barWidth: { controlType: 'number', min: 1, max: 6, step: 1 },
      barGap: { controlType: 'number', min: 0, max: 4, step: 1 },
      strokeWidth: { controlType: 'number', min: 1, max: 6, step: 1 },
      progress: { controlType: 'number', min: 0, max: 1, step: 0.05 },
      duration: { controlType: 'number', min: 30, max: 480, step: 30 },
      timeStampInterval: { controlType: 'number', min: 5, max: 60, step: 5 }
    }
  },
  Alert: {
    id: 'Alert',
    component: 'Alert',
    initialProps: {
      title: 'Mission status',
      children: 'Opportunity window closes in 14 minutes.',
      variant: 'subtle',
      color: 'warning',
      sev: 'warning',
      withCloseButton: true,
      fullWidth: false,
      radius: 'md'
    },
    pinnedProps: ['title', 'children', 'variant', 'color', 'sev', 'withCloseButton', 'fullWidth', 'radius'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'icon', 'closeButtonLabel', 'onClose', 'style', 'testID', 'titleProps', 'bodyProps'],
    controlOverrides: {
      variant: { controlType: 'segmented', options: ALERT_VARIANTS },
      color: { controlType: 'select', options: ALERT_COLOR_OPTIONS },
      sev: { controlType: 'segmented', options: ALERT_SEVERITIES },
      radius: { controlType: 'select', options: RADIUS_TOKENS },
      title: { controlType: 'text', placeholder: 'Alert title' },
      children: { controlType: 'text', placeholder: 'Alert message' }
    }
  },
  Avatar: {
    id: 'Avatar',
    component: 'Avatar',
    initialProps: {
      size: 'lg',
      src: AVATAR_SAMPLE_IMAGE,
      fallback: 'ES',
      label: 'Edda Salazar',
      description: 'Flight software lead',
      showText: true,
      gap: 12,
      online: true,
      indicatorColor: '#16a34a',
      backgroundColor: '#0f172a',
      textColor: '#f1f5f9'
    },
    pinnedProps: ['size', 'src', 'fallback', 'online', 'showText', 'gap', 'indicatorColor', 'backgroundColor', 'textColor'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'accessibilityLabel', 'style', 'fallbackProps', 'labelProps', 'descriptionProps'],
    controlOverrides: {
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      src: { controlType: 'text', placeholder: 'https://example.com/avatar.jpg' },
      gap: { controlType: 'number', min: 0, max: 32, step: 1 },
      backgroundColor: { controlType: 'color', colorPresets: AVATAR_COLOR_PRESETS, placeholder: '#0f172a' },
      textColor: { controlType: 'color', colorPresets: ['#f8fafc', '#0f172a', '#1e293b'], placeholder: '#f1f5f9' },
      indicatorColor: { controlType: 'color', colorPresets: ['#22c55e', '#f97316', '#6366f1'], placeholder: '#16a34a', label: 'Indicator color' }
    }
  },
  Stepper: {
    id: 'Stepper',
    component: 'Stepper',
    initialProps: {
      active: 1,
      orientation: 'horizontal',
      iconPosition: 'left',
      size: 'md',
      allowNextStepsSelect: true
    },
    pinnedProps: ['active', 'orientation', 'iconPosition', 'size', 'color', 'allowNextStepsSelect'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'completedIcon', 'children', 'ref', 'iconSize', 'icon'],
    controlOverrides: {
      active: { controlType: 'number', min: 0, max: STEPPER_SAMPLE_STEPS.length - 1, step: 1 },
      orientation: { controlType: 'segmented', options: STEPPER_ORIENTATIONS },
      iconPosition: { controlType: 'segmented', options: STEPPER_ICON_POSITIONS },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      color: { controlType: 'color', placeholder: '#6366f1', colorPresets: ['#6366f1', '#0ea5e9', '#22c55e', '#f97316'] }
    },
    previewWrapper: (node) => {
      if (!React.isValidElement(node)) return node;
      const StepComponent = (node.type as any)?.Step;
      if (!StepComponent) return node;
      const steps = STEPPER_SAMPLE_STEPS.map(step =>
        React.createElement(
          StepComponent,
          {
            key: step.key,
            label: step.label,
            description: step.description,
            loading: step.loading,
            allowStepSelect: true
          }
        )
      );
      return React.cloneElement(node, undefined, steps);
    }
  },
  ShimmerText: {
    id: 'ShimmerText',
    component: 'ShimmerText',
    initialProps: {
      text: 'Synchronizing telemetry feed',
      variant: 'h5',
      size: 'lg',
      shimmerColor: '#f8fafc',
      spread: 2.5,
      duration: 1.6,
      delay: 0,
      repeatDelay: 0.4,
      repeat: true,
      once: false,
      direction: 'ltr',
      tracking: 0.4,
      numberOfLines: 2
    },
    pinnedProps: ['text', 'variant', 'size', 'weight', 'color', 'shimmerColor', 'spread', 'duration', 'direction', 'repeat', 'once', 'delay', 'repeatDelay'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'colors', 'containerStyle', 'debug', 'startOnView', 'inViewMargin'],
    controlOverrides: {
      variant: { controlType: 'select', options: TEXT_VARIANT_OPTIONS },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      color: { controlType: 'color', placeholder: '#94a3b8', colorPresets: SHIMMER_COLOR_PRESETS },
      shimmerColor: { controlType: 'color', placeholder: '#f8fafc', colorPresets: SHIMMER_COLOR_PRESETS },
      direction: { controlType: 'segmented', options: SHIMMER_DIRECTIONS },
      spread: { controlType: 'number', min: 1, max: 4, step: 0.1 },
      duration: { controlType: 'number', min: 0.5, max: 4, step: 0.1 },
      delay: { controlType: 'number', min: 0, max: 2, step: 0.1 },
      repeatDelay: { controlType: 'number', min: 0, max: 2, step: 0.1 },
      weight: { controlType: 'segmented', options: FONT_WEIGHT_OPTIONS }
    }
  },
  GradientText: {
    id: 'GradientText',
    component: 'GradientText',
    initialProps: {
      children: 'Aurora uplink stable',
      colors: GRADIENT_DEFAULT_COLORS,
      variant: 'h3',
      size: 'xl',
      weight: 'bold',
      angle: 120,
      position: 0.1,
      tracking: 0.2
    },
    pinnedProps: ['variant', 'size', 'weight', 'angle', 'position'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'colors', 'locations', 'start', 'end'],
    controlOverrides: {
      variant: { controlType: 'select', options: TEXT_VARIANT_OPTIONS },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      weight: { controlType: 'segmented', options: FONT_WEIGHT_OPTIONS },
      angle: { controlType: 'number', min: 0, max: 360, step: 5 },
      position: { controlType: 'number', min: 0, max: 1, step: 0.05 }
    },
    // The `colors` prop is an array, which flat controls can't edit directly — so
    // expose three individual color pickers and reassemble them in transformProps.
    extraControls: [
      { name: 'color1', label: 'Gradient color 1', controlType: 'color', initialValue: GRADIENT_DEFAULT_COLORS[0], colorPresets: GRADIENT_STOP_PRESETS },
      { name: 'color2', label: 'Gradient color 2', controlType: 'color', initialValue: GRADIENT_DEFAULT_COLORS[1], colorPresets: GRADIENT_STOP_PRESETS },
      { name: 'color3', label: 'Gradient color 3 (optional)', controlType: 'color', initialValue: GRADIENT_DEFAULT_COLORS[2], colorPresets: GRADIENT_STOP_PRESETS },
    ],
    transformProps: (values) => {
      const { color1, color2, color3, ...rest } = values;
      const picked = [color1, color2, color3].filter((c) => typeof c === 'string' && c.trim());
      // GradientText requires at least two stops — fall back to the defaults otherwise.
      rest.colors = picked.length >= 2 ? picked : GRADIENT_DEFAULT_COLORS;
      return rest;
    },
  },
  Loader: {
    id: 'Loader',
    component: 'Loader',
    initialProps: {
      variant: 'dots',
      size: 'md',
      speed: 700
    },
    pinnedProps: ['variant', 'size', 'color', 'speed'],
    hiddenProps: [...COMMON_EVENT_PROPS],
    controlOverrides: {
      variant: { controlType: 'segmented', options: LOADER_VARIANTS },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      color: { controlType: 'color', placeholder: '#6366f1', colorPresets: LOADER_COLOR_PRESETS },
      speed: { controlType: 'number', min: 200, max: 2000, step: 50 }
    }
  },
  Dialog: {
    id: 'Dialog',
    component: 'Dialog',
    initialProps: {
      visible: true,
      variant: 'modal',
      title: 'Confirm launch',
      closable: true,
      backdrop: true,
      backdropClosable: true,
      showHeader: true,
    },
    pinnedProps: ['visible', 'variant', 'title', 'closable', 'backdrop', 'backdropClosable', 'showHeader', 'bottomSheetSwipeZone'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'shouldClose', 'style'],
    controlOverrides: {
      variant: { controlType: 'segmented', options: ['modal', 'bottomsheet', 'fullscreen'] },
      bottomSheetSwipeZone: { controlType: 'segmented', options: ['container', 'handle', 'none'] },
    },
    previewWrapper: (node) => React.createElement(View, { style: { minHeight: 320, position: 'relative', overflow: 'hidden', borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.05)' } }, node),
  },
  Badge: {
    id: 'Badge',
    component: 'Badge',
    initialProps: {
      children: 'New',
      variant: 'filled',
      size: 'md',
      color: 'primary',
      disabled: false,
    },
    pinnedProps: ['children', 'variant', 'size', 'color', 'disabled'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'startIcon', 'endIcon', 'onRemove', 'removePosition', 'style', 'textStyle', 'v', 'c'],
    controlOverrides: {
      variant: { controlType: 'segmented', options: ['filled', 'outline', 'light', 'subtle', 'gradient'] },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      color: { controlType: 'select', options: ['primary', 'secondary', 'success', 'warning', 'error', 'gray'] },
      children: { controlType: 'text', placeholder: 'Badge label' },
    },
  },
  Chip: {
    id: 'Chip',
    component: 'Chip',
    initialProps: {
      children: 'React Native',
      variant: 'filled',
      size: 'md',
      color: 'primary',
      disabled: false,
    },
    pinnedProps: ['children', 'variant', 'size', 'color', 'disabled'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'startIcon', 'endIcon', 'onRemove', 'removePosition', 'style', 'textStyle'],
    controlOverrides: {
      variant: { controlType: 'segmented', options: ['filled', 'outline', 'light', 'subtle', 'gradient'] },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      color: { controlType: 'segmented', options: ['primary', 'secondary', 'success', 'warning', 'error', 'gray'] },
      children: { controlType: 'text', placeholder: 'Chip label' },
    },
  },
  Checkbox: {
    id: 'Checkbox',
    component: 'Checkbox',
    initialProps: {
      label: 'Accept terms',
      checked: false,
      size: 'md',
      disabled: false,
      indeterminate: false,
    },
    pinnedProps: ['label', 'checked', 'size', 'disabled', 'indeterminate', 'colorVariant', 'labelPosition', 'description', 'error'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'defaultChecked', 'icon', 'indeterminateIcon', 'style', 'testID', 'children', 'required'],
    controlOverrides: {
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      colorVariant: { controlType: 'segmented', options: ['primary', 'secondary', 'success', 'error', 'warning'] },
      labelPosition: { controlType: 'segmented', options: ['left', 'right', 'top', 'bottom'] },
      label: { controlType: 'text', placeholder: 'Checkbox label' },
      description: { controlType: 'text', placeholder: 'Description text' },
      error: { controlType: 'text', placeholder: 'Error message' },
    },
  },
  ControlField: {
    id: 'ControlField',
    component: 'ControlField',
    initialProps: {
      label: 'Push notifications',
      description: 'Get notified when something happens',
      variant: 'switch',
      checked: true,
      size: 'md',
      indicatorPosition: 'right',
      disabled: false,
      isInvalid: false,
    },
    pinnedProps: ['label', 'description', 'variant', 'checked', 'size', 'indicatorPosition', 'colorVariant', 'disabled', 'isRequired', 'isInvalid', 'error'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'isSelected', 'defaultSelected', 'control', 'color', 'style', 'testID', 'children', 'accessibilityLabel', 'labelProps', 'descriptionProps'],
    controlOverrides: {
      variant: { controlType: 'segmented', options: ['switch', 'checkbox', 'radio'] },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      indicatorPosition: { controlType: 'segmented', options: ['left', 'right'] },
      colorVariant: { controlType: 'segmented', options: ['primary', 'secondary', 'success', 'error', 'warning'] },
      label: { controlType: 'text', placeholder: 'Label text' },
      description: { controlType: 'text', placeholder: 'Description text' },
      error: { controlType: 'text', placeholder: 'Error message' },
    },
  },
  Toggle: {
    id: 'Toggle',
    component: 'ToggleButton',
    initialProps: {
      value: 'option-a',
      selected: false,
      size: 'md',
      variant: 'solid',
      disabled: false,
      children: 'Dark mode',
    },
    pinnedProps: ['children', 'selected', 'size', 'variant', 'disabled', 'colorVariant'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'value', 'style', 'testID'],
    controlOverrides: {
      variant: { controlType: 'segmented', options: ['solid', 'ghost'] },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      colorVariant: { controlType: 'segmented', options: ['primary', 'secondary', 'success', 'error', 'warning'] },
      children: { controlType: 'text', placeholder: 'Toggle label' },
    },
  },
  Radio: {
    id: 'Radio',
    component: 'RadioGroup',
    initialProps: {
      options: [
        { value: 'card', label: 'Credit card', description: 'Pay with a credit or debit card' },
        { value: 'paypal', label: 'PayPal', description: 'Redirect to PayPal checkout' },
        { value: 'apple', label: 'Apple Pay', description: 'Use Touch ID or Face ID' },
      ],
      value: 'card',
      variant: 'default',
      orientation: 'vertical',
      labelPosition: 'right',
      size: 'md',
      color: 'primary',
      label: 'Payment method',
      disabled: false,
    },
    pinnedProps: ['variant', 'orientation', 'labelPosition', 'size', 'color', 'label', 'description', 'error', 'disabled', 'required'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'name', 'style', 'testID', 'children', 'onKeyDown', 'value', 'checked', 'icon'],
    controlOverrides: {
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      labelPosition: { controlType: 'segmented', options: ['left', 'right'] },
      label: { controlType: 'text', placeholder: 'Group label' },
      description: { controlType: 'text', placeholder: 'Description text' },
      error: { controlType: 'text', placeholder: 'Error message' },
      color: {
        controlType: 'color',
        placeholder: '#228be6',
        colorPresets: ['#228be6', '#845ef7', '#40c057', '#f59f00', '#e03131'],
      },
    },
    extraControls: [
      {
        name: 'variant',
        controlType: 'segmented',
        options: ['default', 'card', 'segmented', 'chip'],
        initialValue: 'default',
        description: 'Visual variant of the group',
      },
      {
        name: 'orientation',
        controlType: 'segmented',
        options: ['vertical', 'horizontal'],
        initialValue: 'vertical',
        description: 'Layout direction (ignored by segmented and chip)',
      },
    ],
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 420 } }, node),
  },
  Skeleton: {
    id: 'Skeleton',
    component: 'Skeleton',
    initialProps: {
      shape: 'rectangle',
      w: 200,
      h: 100,
      animate: true,
    },
    pinnedProps: ['shape', 'w', 'h', 'size', 'radius', 'animate', 'animationDuration'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'colors', 'style', 'testID'],
    controlOverrides: {
      shape: { controlType: 'segmented', options: ['text', 'chip', 'avatar', 'button', 'card', 'circle', 'rectangle', 'rounded'] },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      w: { controlType: 'number', min: 50, max: 500, step: 10, label: 'Width' },
      h: { controlType: 'number', min: 20, max: 300, step: 10, label: 'Height' },
      animationDuration: { controlType: 'number', min: 500, max: 3000, step: 100 },
    },
  },
  Rating: {
    id: 'Rating',
    component: 'Rating',
    initialProps: {
      value: 3,
      count: 5,
      size: 'md',
      readOnly: false,
      allowFraction: false,
    },
    pinnedProps: ['value', 'count', 'size', 'readOnly', 'allowFraction', 'color', 'emptyColor', 'gap'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'onHover', 'character', 'emptyCharacter', 'hoverColor', 'style', 'testID', 'accessibilityLabel', 'accessibilityHint', 'label', 'labelPosition', 'labelGap', 'precision', 'defaultValue', 'showTooltip'],
    controlOverrides: {
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      count: { controlType: 'number', min: 1, max: 10, step: 1 },
      value: { controlType: 'number', min: 0, max: 10, step: 0.5 },
      gap: { controlType: 'number', min: 0, max: 20, step: 1 },
      color: {
        controlType: 'color',
        placeholder: '#f59f00',
        colorPresets: ['#f59f00', '#e03131', '#228be6', '#40c057', '#845ef7'],
      },
      emptyColor: {
        controlType: 'color',
        placeholder: '#dee2e6',
        colorPresets: ['#dee2e6', '#adb5bd', '#868e96'],
      },
    },
  },
  Divider: {
    id: 'Divider',
    component: 'Divider',
    initialProps: {
      orientation: 'horizontal',
      variant: 'solid',
      size: 'xs',
      colorVariant: 'border',
      opacity: 1,
    },
    pinnedProps: ['orientation', 'variant', 'size', 'opacity', 'label', 'labelPosition', 'labelColorVariant', 'labelWeight', 'labelItalic', 'color', 'colorVariant'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'style', 'testID', 'labelProps'],
    controlOverrides: {
      orientation: { controlType: 'segmented', options: ['horizontal', 'vertical'] },
      // 'gradient' added — fades transparent → color → transparent (uses
      // expo-linear-gradient when available; falls back gracefully otherwise)
      variant: { controlType: 'segmented', options: ['solid', 'dashed', 'dotted', 'gradient'] },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      labelPosition: { controlType: 'segmented', options: ['left', 'center', 'right'] },
      label: { controlType: 'text', placeholder: 'Divider label' },
      // colorVariant aligned with the rest of the lib — drops 'tertiary' and
      // 'subtle'/'surface' fragments, adds 'border' (the new default).
      colorVariant: {
        controlType: 'select',
        options: ['border', 'subtle', 'muted', 'gray', 'primary', 'secondary', 'success', 'warning', 'error']
      },
      color: {
        controlType: 'color',
        placeholder: '#dee2e6',
        colorPresets: ['#dee2e6', '#228be6', '#e03131', '#40c057'],
      },
      opacity: { controlType: 'number', min: 0, max: 1, step: 0.05 },
    },
    extraControls: [
      {
        name: 'labelColorVariant',
        label: 'Label color',
        controlType: 'select',
        options: ['primary', 'secondary', 'muted', 'disabled', 'link', 'success', 'warning', 'error', 'info'],
        initialValue: 'muted',
      },
      {
        name: 'labelWeight',
        label: 'Label weight',
        controlType: 'select',
        options: ['light', 'normal', 'medium', 'semibold', 'bold', 'black'],
        initialValue: 'normal',
      },
      {
        name: 'labelItalic',
        label: 'Label italic',
        controlType: 'boolean',
        initialValue: false,
      },
    ],
    transformProps: (values) => {
      const { labelColorVariant, labelWeight, labelItalic, ...rest } = values;
      const labelProps: Record<string, any> = {};
      if (labelColorVariant) labelProps.colorVariant = labelColorVariant;
      if (labelWeight && labelWeight !== 'normal') labelProps.weight = labelWeight;
      if (labelItalic) labelProps.style = { fontStyle: 'italic' };
      if (Object.keys(labelProps).length && rest.label) {
        rest.labelProps = labelProps;
      }
      return rest;
    },
    previewWrapper: (node, currentProps) => {
      const isVertical = currentProps.orientation === 'vertical';
      return React.createElement(View, {
        style: isVertical
          ? { height: 120, justifyContent: 'center' }
          : { width: '100%', paddingVertical: 20 },
      }, node);
    },
  },
  Breadcrumbs: {
    id: 'Breadcrumbs',
    component: 'Breadcrumbs',
    initialProps: {
      items: [
        { label: 'Home', href: '/' },
        { label: 'Components', href: '/components' },
        { label: 'Breadcrumbs' },
      ],
      size: 'md',
      showIcons: false,
    },
    pinnedProps: ['size', 'maxItems', 'showIcons'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'items', 'accessibilityLabel'],
    controlOverrides: {
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      maxItems: { controlType: 'number', min: 1, max: 10, step: 1 },
    },
  },
  Pagination: {
    id: 'Pagination',
    component: 'Pagination',
    initialProps: {
      current: 5,
      total: 20,
      siblings: 1,
      boundaries: 1,
      size: 'md',
      variant: 'default',
      color: 'primary',
      showFirst: true,
      showPrevNext: true,
      disabled: false,
      hideOnSinglePage: false,
    },
    pinnedProps: ['total', 'siblings', 'boundaries', 'size', 'variant', 'color', 'showFirst', 'showPrevNext', 'disabled', 'hideOnSinglePage'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'current', 'pageSizeOptions', 'showSizeChanger', 'showTotal', 'totalItems', 'pageSize'],
    controlOverrides: {
      total: { controlType: 'number', min: 1, max: 100, step: 1 },
      siblings: { controlType: 'number', min: 0, max: 5, step: 1 },
      boundaries: { controlType: 'number', min: 0, max: 3, step: 1 },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      variant: { controlType: 'segmented', options: ['default', 'outline', 'subtle'] },
      color: { controlType: 'segmented', options: ['primary', 'secondary', 'gray'] },
    },
  },
  IconButton: {
    id: 'IconButton',
    component: 'IconButton',
    initialProps: {
      icon: 'rocket',
      variant: 'filled',
      size: 'md',
      disabled: false,
      loading: false,
      tooltip: 'Launch mission',
    },
    pinnedProps: ['icon', 'variant', 'size', 'disabled', 'loading', 'colorVariant', 'tooltip'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'iconColor', 'iconVariant', 'iconSize', 'tooltipPosition', 'accessibilityLabel'],
    controlOverrides: {
      icon: { controlType: 'text', placeholder: 'Icon name (e.g. rocket)' },
      variant: { controlType: 'segmented', options: ['filled', 'secondary', 'outline', 'ghost', 'gradient', 'none'] },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      colorVariant: { controlType: 'color', placeholder: '#6366f1', colorPresets: ['#228be6', '#845ef7', '#12b886', '#f59f00', '#e03131'] },
      tooltip: { controlType: 'text', placeholder: 'Tooltip text' },
    },
  },
  TextArea: {
    id: 'TextArea',
    component: 'TextArea',
    initialProps: {
      label: 'Mission notes',
      placeholder: 'Enter your notes here...',
      size: 'md',
      rows: 4,
      autoResize: false,
      maxLength: 500,
      showCharCounter: true,
      disabled: false,
      editable: true,
      resize: 'vertical',
    },
    pinnedProps: ['label', 'placeholder', 'size', 'rows', 'autoResize', 'maxLength', 'showCharCounter', 'resize', 'disabled', 'error'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'value', 'defaultValue', 'minRows', 'maxRows', 'h', 'startSection', 'endSection', 'clearable', 'clearButtonLabel'],
    controlOverrides: {
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      rows: { controlType: 'number', min: 1, max: 20, step: 1 },
      maxLength: { controlType: 'number', min: 0, max: 2000, step: 50 },
      resize: { controlType: 'segmented', options: ['none', 'vertical', 'horizontal', 'both'] },
      label: { controlType: 'text', placeholder: 'Field label' },
      placeholder: { controlType: 'text', placeholder: 'Placeholder text' },
      error: { controlType: 'text', placeholder: 'Error message' },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 400 } }, node),
  },
  NumberInput: {
    id: 'NumberInput',
    component: 'NumberInput',
    initialProps: {
      label: 'Quantity',
      placeholder: 'Enter a number',
      size: 'md',
      min: 0,
      max: 100,
      step: 1,
      withControls: true,
      disabled: false,
      allowDecimal: true,
      allowNegative: false,
    },
    pinnedProps: ['label', 'size', 'min', 'max', 'step', 'withControls', 'withSideButtons', 'disabled', 'allowDecimal', 'allowNegative', 'prefix', 'suffix', 'thousandSeparator'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'value', 'defaultValue', 'precision', 'decimalScale', 'fixedDecimalScale', 'decimalSeparator', 'thousandsGroupStyle', 'format', 'currency', 'startValue', 'shiftMultiplier', 'hideControlsOnMobile', 'withDragGesture', 'dragAxis', 'clampBehavior', 'allowEmpty', 'allowLeadingZeros', 'startSection', 'endSection', 'clearable', 'clearButtonLabel'],
    controlOverrides: {
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      min: { controlType: 'number', min: -1000, max: 1000, step: 1 },
      max: { controlType: 'number', min: -1000, max: 10000, step: 1 },
      step: { controlType: 'number', min: 0.01, max: 100, step: 0.5 },
      prefix: { controlType: 'text', placeholder: '$ or €' },
      suffix: { controlType: 'text', placeholder: 'kg, lbs, etc.' },
      label: { controlType: 'text', placeholder: 'Field label' },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 320 } }, node),
  },
  Popover: {
    id: 'Popover',
    component: 'Popover',
    initialProps: {
      opened: true,
      position: 'bottom',
      withArrow: true,
      arrowSize: 8,
      offset: 8,
      shadow: 'md',
      disabled: false,
      closeOnClickOutside: true,
      withOverlay: false,
      trapFocus: false,
    },
    pinnedProps: ['opened', 'position', 'withArrow', 'arrowSize', 'offset', 'shadow', 'disabled', 'closeOnClickOutside', 'withOverlay', 'trapFocus'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'defaultOpened', 'trigger', 'keepMounted', 'returnFocus', 'withinPortal', 'w', 'maxW', 'maxH', 'minW', 'minH', 'radius', 'zIndex', 'floatingStrategy', 'arrowRadius', 'arrowOffset', 'arrowPosition'],
    controlOverrides: {
      position: { controlType: 'segmented', options: ['top', 'bottom', 'left', 'right'] },
      arrowSize: { controlType: 'number', min: 0, max: 20, step: 1 },
      offset: { controlType: 'number', min: 0, max: 30, step: 2 },
      shadow: { controlType: 'segmented', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
    },
    previewWrapper: (node) => React.createElement(View, { style: { minHeight: 200, alignItems: 'center', justifyContent: 'center' } }, node),
  },
  SegmentedControl: {
    id: 'SegmentedControl',
    component: 'SegmentedControl',
    initialProps: {
      data: [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
      ],
      size: 'md',
      orientation: 'horizontal',
      variant: 'filled',
      fullWidth: false,
      disabled: false,
      readOnly: false,
      withItemsBorders: true,
    },
    pinnedProps: ['size', 'color', 'orientation', 'fullWidth', 'disabled', 'readOnly', 'variant', 'withItemsBorders', 'label', 'labelPosition'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'data', 'value', 'defaultValue', 'autoContrast', 'transitionDuration', 'transitionTimingFunction', 'description'],
    controlOverrides: {
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      color: { controlType: 'color', placeholder: '#228be6', colorPresets: ['#228be6', '#845ef7', '#12b886', '#f59f00', '#e03131'] },
      orientation: { controlType: 'segmented', options: ['horizontal', 'vertical'] },
      variant: { controlType: 'segmented', options: ['default', 'filled', 'outline', 'ghost'] },
      labelPosition: { controlType: 'segmented', options: ['left', 'right', 'top', 'bottom'] },
      label: { controlType: 'text', placeholder: 'Label text' },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 420 } }, node),
  },
  Highlight: {
    id: 'Highlight',
    component: 'Highlight',
    initialProps: {
      children: 'Platform Blocks ships accessible, cross-platform UI components for React Native and web.',
      highlight: 'cross-platform',
      highlightColor: 'yellow',
      caseSensitive: false,
    },
    pinnedProps: ['highlight', 'highlightColor', 'caseSensitive', 'size', 'weight', 'color'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'highlightStyles', 'highlightProps', 'trim', 'variant'],
    controlOverrides: {
      highlight: { controlType: 'text', placeholder: 'Text to highlight' },
      highlightColor: { controlType: 'color', placeholder: '#ffec99', colorPresets: ['#ffec99', '#a5d8ff', '#b2f2bb', '#ffc9c9', '#d0bfff'] },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      weight: { controlType: 'segmented', options: ['normal', 'medium', 'semibold', 'bold'] },
      color: { controlType: 'color', placeholder: '#1a1b1e', colorPresets: ['#1a1b1e', '#495057', '#228be6', '#e03131'] },
    },
  },
  CodeBlock: {
    id: 'CodeBlock',
    component: 'CodeBlock',
    initialProps: {
      children: 'import { Button } from \'@platform-blocks/ui\';\n\nexport function App() {\n  return (\n    <Button title="Launch" variant="filled" />\n  );\n}',
      language: 'tsx',
      title: 'App.tsx',
      showLineNumbers: true,
      highlight: true,
      showCopyButton: true,
      variant: 'code',
      wrap: true,
      fullWidth: true,
    },
    pinnedProps: ['language', 'title', 'showLineNumbers', 'highlight', 'showCopyButton', 'variant', 'wrap', 'fullWidth', 'spoiler', 'fileHeader'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'children', 'fileName', 'fileIcon', 'files', 'defaultFile', 'activeFile', 'highlightLines', 'spoilerMaxHeight', 'promptSymbol', 'githubUrl', 'colors'],
    controlOverrides: {
      language: { controlType: 'select', options: ['tsx', 'typescript', 'javascript', 'python', 'json', 'html', 'css', 'bash', 'markdown'] },
      title: { controlType: 'text', placeholder: 'File title' },
      variant: { controlType: 'segmented', options: ['code', 'terminal', 'hacker'] },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%' } }, node),
  },
  Toast: {
    id: 'Toast',
    component: 'Toast',
    initialProps: {
      variant: 'filled',
      sev: 'success',
      title: 'Mission accomplished',
      children: 'Your payload has been deployed to production.',
      withCloseButton: true,
      loading: false,
      visible: true,
      position: 'top',
    },
    pinnedProps: ['variant', 'sev', 'title', 'withCloseButton', 'loading', 'visible', 'position', 'color', 'dismissOnTap', 'persistent'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'children', 'icon', 'actions', 'autoHide', 'animationDuration', 'maxWidth', 'keepMounted'],
    controlOverrides: {
      variant: { controlType: 'segmented', options: ['light', 'filled', 'outline'] },
      sev: { controlType: 'segmented', options: ['info', 'success', 'warning', 'error'] },
      title: { controlType: 'text', placeholder: 'Toast title' },
      color: { controlType: 'color', placeholder: '#228be6', colorPresets: ['#228be6', '#40c057', '#fab005', '#e03131', '#868e96'] },
      position: { controlType: 'segmented', options: ['top', 'bottom'] },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 420 } }, node),
  },
  Blockquote: {
    id: 'Blockquote',
    component: 'Blockquote',
    initialProps: {
      children: 'Design is not just what it looks like and feels like. Design is how it works.',
      variant: 'testimonial',
      size: 'md',
      alignment: 'left',
      attributionAlignment: 'right',
      border: false,
      shadow: true,
      verified: true,
      quoteIconPosition: 'top-left',
    },
    pinnedProps: [
      'variant', 'size', 'alignment', 'attributionAlignment', 'quoteIconPosition',
      'authorName', 'authorTitle', 'authorOrganization', 'authorAvatar',
      'sourceName', 'date', 'ratingValue', 'verified', 'border', 'shadow',
    ],
    // `author`/`source`/`rating` are objects — they're edited through the flat
    // sub-controls below and reassembled in transformProps.
    hiddenProps: [...COMMON_EVENT_PROPS, 'author', 'source', 'rating', 'links', 'quoteIcon', 'quoteIconSize', 'verifiedTooltip', 'color'],
    controlOverrides: {
      variant: { controlType: 'select', options: ['default', 'testimonial', 'featured', 'minimal'] },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      alignment: { controlType: 'segmented', options: ['left', 'center', 'right'], label: 'Quote alignment' },
      attributionAlignment: { controlType: 'segmented', options: ['left', 'center', 'right'], label: 'Author side' },
      quoteIconPosition: { controlType: 'select', options: ['top-left', 'top-center', 'bottom-right', 'none'] },
      date: { controlType: 'text', placeholder: '2 hours ago' },
    },
    extraControls: [
      { name: 'authorName', label: 'Author name', controlType: 'text', initialValue: 'Steve Jobs', placeholder: 'Author name' },
      { name: 'authorTitle', label: 'Author title', controlType: 'text', initialValue: 'Co-founder', placeholder: 'Role or title' },
      { name: 'authorOrganization', label: 'Author organization', controlType: 'text', initialValue: 'Apple', placeholder: 'Company' },
      { name: 'authorAvatar', label: 'Author avatar', controlType: 'boolean', initialValue: true },
      { name: 'sourceName', label: 'Source', controlType: 'text', initialValue: 'Apple Newsroom', placeholder: 'Source name' },
      { name: 'ratingValue', label: 'Rating', controlType: 'number', initialValue: 5, min: 0, max: 5, step: 1 },
    ],
    transformProps: (values) => {
      const { authorName, authorTitle, authorOrganization, authorAvatar, sourceName, ratingValue, ...rest } = values;
      // Cleared text controls emit '' — drop them so the snippet stays clean.
      const props: Record<string, any> = Object.fromEntries(
        Object.entries(rest).filter(([, v]) => v !== '')
      );

      if (authorName) {
        props.author = {
          name: authorName,
          ...(authorTitle ? { title: authorTitle } : {}),
          ...(authorOrganization ? { organization: authorOrganization } : {}),
          ...(authorAvatar
            ? { avatar: AVATAR_SAMPLE_IMAGE, avatarFallback: String(authorName).charAt(0).toUpperCase() }
            : {}),
        };
      }
      if (sourceName) props.source = { name: sourceName };
      if (Number(ratingValue) > 0) props.rating = { value: Number(ratingValue), max: 5, showValue: true };

      return props;
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 520 } }, node),
  },
  BrandButton: {
    id: 'BrandButton',
    component: 'BrandButton',
    initialProps: {
      brand: 'google',
      title: 'Continue with Google',
      variant: 'filled',
      size: 'md',
      iconPosition: 'left',
      fullWidth: false,
      loading: false,
      disabled: false,
      // Filling either badge line swaps the single-line button for the store badge.
      primaryText: '',
      secondaryText: '',
    },
    pinnedProps: ['brand', 'title', 'primaryText', 'secondaryText', 'variant', 'size', 'iconPosition', 'iconVariant', 'fullWidth', 'loading', 'disabled', 'darkMode'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'key', 'color', 'textColor', 'backgroundColor', 'borderColor', 'colorVariant', 'tooltip', 'tooltipPosition', 'labelProps', 'loadingTitle', 'onPressIn', 'onPressOut', 'onLongPress', 'onLayout', 'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py'],
    controlOverrides: {
      brand: { controlType: 'select', options: ['google', 'apple', 'facebook', 'github', 'x', 'microsoft', 'discord', 'spotify', 'slack', 'linkedin', 'app-store', 'google-play'] },
      variant: { controlType: 'segmented', options: ['filled', 'outline', 'ghost'] },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      iconPosition: { controlType: 'segmented', options: ['left', 'right'] },
      title: { controlType: 'text', placeholder: 'Button label' },
      primaryText: { controlType: 'text', placeholder: 'Badge line 1, e.g. Download on the' },
      secondaryText: { controlType: 'text', placeholder: 'Badge line 2, e.g. App Store' },
    },
    // Cleared text controls emit '' — drop them so the snippet stays clean.
    transformProps: (values) => Object.fromEntries(
      Object.entries(values).filter(([key, value]) =>
        !(value === '' && (key === 'primaryText' || key === 'secondaryText')))
    ),
  },
  BrandIcon: {
    id: 'BrandIcon',
    component: 'BrandIcon',
    initialProps: {
      brand: 'github',
      size: '3xl',
      variant: 'default',
      invertInDarkMode: true,
    },
    pinnedProps: ['brand', 'size', 'variant', 'color', 'invertInDarkMode', 'decorative'],
    hiddenProps: ['style', 'label', 'colorScheme'],
    controlOverrides: {
      brand: { controlType: 'select', options: BRAND_NAMES, placeholder: 'Select a brand' },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      color: { controlType: 'color', placeholder: 'auto' },
    },
    previewWrapper: (node) => React.createElement(View, { style: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24 } }, node),
  },
  Calendar: {
    id: 'Calendar',
    component: 'Calendar',
    initialProps: {
      type: 'single',
      size: 'md',
      numberOfMonths: 1,
      firstDayOfWeek: 0,
      highlightToday: true,
      hideOutsideDates: false,
      hideWeekdays: false,
    },
    pinnedProps: ['type', 'size', 'numberOfMonths', 'firstDayOfWeek', 'highlightToday', 'hideOutsideDates', 'hideWeekdays', 'withCellSpacing'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'date', 'defaultDate', 'value', 'minDate', 'maxDate', 'excludeDate', 'locale', 'getDayProps', 'renderDay', 'level', 'defaultLevel', 'onLevelChange', 'onDateChange', 'static', 'weekendDays'],
    controlOverrides: {
      type: { controlType: 'segmented', options: ['single', 'multiple', 'range'] },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      numberOfMonths: { controlType: 'number', min: 1, max: 3, step: 1 },
      firstDayOfWeek: { controlType: 'number', min: 0, max: 6, step: 1 },
    },
    previewWrapper: (node) => React.createElement(View, { style: { alignItems: 'center' } }, node),
  },
  Carousel: {
    id: 'Carousel',
    component: 'Carousel',
    initialProps: {
      orientation: 'horizontal',
      showArrows: true,
      showDots: true,
      autoPlay: false,
      loop: true,
      itemsPerPage: 1,
      align: 'center',
      height: 200,
      slideGap: 12,
    },
    pinnedProps: ['orientation', 'showArrows', 'showDots', 'autoPlay', 'loop', 'itemsPerPage', 'align', 'height', 'slideGap', 'dragFree'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'itemStyle', 'breakpoints', 'slideSize', 'itemGap', 'windowSize', 'containScroll', 'startIndex', 'slidesToScroll', 'dragThreshold', 'duration', 'skipSnaps', 'snapToItem', 'arrowPosition', 'arrowSize', 'dotSize', 'scrollEnabled', 'reducedMotion', 'autoPlayInterval', 'autoPlayPauseOnTouch', 'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py'],
    controlOverrides: {
      orientation: { controlType: 'segmented', options: ['horizontal', 'vertical'] },
      align: { controlType: 'segmented', options: ['start', 'center', 'end'] },
      itemsPerPage: { controlType: 'number', min: 1, max: 4, step: 1 },
      height: { controlType: 'number', min: 120, max: 360, step: 20 },
      slideGap: { controlType: 'number', min: 0, max: 32, step: 2 },
    },
    transformProps: (values) => ({
      ...values,
      children: MASONRY_COLORS.slice(0, 4).map((color, i) =>
        React.createElement(
          View,
          { key: i, style: { flex: 1, height: values.height ?? 200, borderRadius: 12, backgroundColor: color, alignItems: 'center', justifyContent: 'center' } },
          React.createElement(Text, { style: { color: '#fff', fontWeight: '700', fontSize: 24 } }, `Slide ${i + 1}`)
        )
      ),
    }),
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 480 } }, node),
  },
  Collapse: {
    id: 'Collapse',
    component: 'Collapse',
    initialProps: {
      isCollapsed: false,
      duration: 300,
      timing: 'ease-out',
      animateOnMount: false,
      fadeContent: true,
      collapsedHeight: 0,
      children: React.createElement(
        View,
        { style: { padding: 16, borderRadius: 12, backgroundColor: 'rgba(99,102,241,0.12)' } },
        React.createElement(Text, { style: { fontSize: 14, color: '#334155' } }, 'This content can be smoothly collapsed and expanded. Toggle the isCollapsed control to see the animation.')
      ),
    },
    pinnedProps: ['isCollapsed', 'duration', 'timing', 'animateOnMount', 'fadeContent', 'collapsedHeight'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'contentStyle', 'easing', 'onAnimationStart', 'onAnimationEnd'],
    controlOverrides: {
      duration: { controlType: 'number', min: 0, max: 1000, step: 50 },
      timing: { controlType: 'segmented', options: ['ease', 'ease-in', 'ease-out', 'linear'] },
      collapsedHeight: { controlType: 'number', min: 0, max: 80, step: 4 },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 420 } }, node),
  },
  ColorInput: {
    id: 'ColorInput',
    component: 'ColorInput',
    initialProps: {
      label: 'Brand color',
      defaultValue: '#6366f1',
      format: 'hex',
      size: 'md',
      variant: 'default',
      radius: 'md',
      showPreview: true,
      showInput: true,
      withSwatches: true,
      withAlpha: false,
      clearable: false,
      disabled: false,
    },
    pinnedProps: ['format', 'size', 'variant', 'radius', 'showPreview', 'showInput', 'withSwatches', 'withAlpha', 'clearable', 'disabled', 'required'],
    hiddenProps: [...COMMON_EVENT_PROPS, ...INPUT_NOISE_PROPS, 'swatches', 'placement', 'flip', 'shift', 'boundary', 'offset', 'autoReposition', 'fallbackPlacements', 'keyboardAvoidance', 'previewStyle', 'inputStyle', 'error', 'description', 'placeholder', 'label', 'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py'],
    controlOverrides: {
      format: { controlType: 'segmented', options: ['hex', 'rgba', 'hsla'] },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      variant: { controlType: 'segmented', options: INPUT_VARIANTS },
      radius: { controlType: 'select', options: RADIUS_TOKENS },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 320 } }, node),
  },
  ColorSwatch: {
    id: 'ColorSwatch',
    component: 'ColorSwatch',
    initialProps: {
      size: 48,
      selected: false,
      disabled: false,
      showBorder: true,
      showCheckmark: true,
      borderWidth: 1,
      borderRadius: 8,
    },
    pinnedProps: ['color', 'size', 'selected', 'disabled', 'showBorder', 'showCheckmark', 'borderWidth', 'borderRadius'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'borderColor', 'checkmarkColor', 'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py'],
    controlOverrides: {
      color: { controlType: 'color', placeholder: '#6366f1', colorPresets: MASONRY_COLORS.slice(0, 6) },
      size: { controlType: 'number', min: 16, max: 96, step: 4 },
      borderWidth: { controlType: 'number', min: 0, max: 6, step: 1 },
      borderRadius: { controlType: 'number', min: 0, max: 48, step: 2 },
    },
    previewWrapper: (node) => React.createElement(View, { style: { alignItems: 'center', paddingVertical: 16 } }, node),
  },
  ContextMenu: {
    id: 'ContextMenu',
    component: 'ContextMenu',
    initialProps: {
      closeOnSelect: true,
      maxHeight: 240,
    },
    pinnedProps: ['closeOnSelect', 'longPressDelay', 'maxHeight'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'items', 'open', 'position', 'onOpen', 'onClose'],
    controlOverrides: {
      maxHeight: { controlType: 'number', min: 120, max: 400, step: 20 },
    },
    transformProps: (values) => ({
      ...values,
      items: CONTEXT_MENU_ITEMS,
      children: (triggerProps: any) =>
        React.createElement(
          View,
          { ...triggerProps, style: { paddingVertical: 24, paddingHorizontal: 32, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#cbd5e1', alignItems: 'center' } },
          React.createElement(Text, { style: { color: '#475569', fontWeight: '600' } }, 'Right-click / long-press me')
        ),
    }),
    previewWrapper: (node) => React.createElement(View, { style: { minHeight: 160, alignItems: 'center', justifyContent: 'center' } }, node),
  },
  CopyButton: {
    id: 'CopyButton',
    component: 'CopyButton',
    initialProps: {
      value: 'npm install @platform-blocks/ui',
      label: 'Copy',
      iconOnly: false,
      size: 'md',
      disableToast: false,
    },
    pinnedProps: ['value', 'label', 'iconOnly', 'size', 'mode', 'buttonVariant', 'disableToast'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'onCopy', 'toastTitle', 'toastMessage', 'iconName', 'copiedIconName', 'iconColor', 'copiedIconColor', 'tooltip', 'tooltipPosition'],
    controlOverrides: {
      value: { controlType: 'text', placeholder: 'Text to copy' },
      label: { controlType: 'text', placeholder: 'Button label' },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
    },
  },
  DataTable: {
    id: 'DataTable',
    component: 'DataTable',
    initialProps: {
      data: DATATABLE_DATA,
      columns: DATATABLE_COLUMNS,
      searchable: true,
      selectable: false,
      striped: true,
      variant: 'default',
      density: 'normal',
      fullWidth: true,
      showRowDividers: true,
    },
    pinnedProps: ['searchable', 'selectable', 'striped', 'variant', 'density', 'fullWidth', 'showRowDividers', 'loading'],
    hiddenProps: [
      ...COMMON_EVENT_PROPS, 'exportFileName', 'footerLabel', 'columnOrder', 'ariaLabel', 'enhancedHover',
      'id', 'data', 'columns', 'error', 'emptyMessage', 'searchPlaceholder', 'searchValue', 'onSearchChange',
      'sortBy', 'onSortChange', 'filters', 'onFilterChange', 'pagination', 'onPaginationChange', 'selectedRows', 'onSelectionChange',
      'getRowId', 'onRowClick', 'editMode', 'onEditModeChange', 'onCellEdit', 'bulkActions', 'height', 'virtual', 'enableColumnResizing',
      'rowFeatureToggle', 'initialHiddenColumns', 'onColumnVisibilityChange', 'showColumnVisibilityManager',
      'rowsPerPageOptions', 'showRowsPerPageControl', 'rowActions', 'actionsColumnWidth', 'headerBackgroundColor', 'enhancedLoading',
      'enhancedEmptyState', 'hoverColor', 'enhancedSelection', 'borderColor', 'hoverHighlight', 'rowBorderWidth', 'rowBorderColor',
      'rowBorderStyle', 'columnBorderWidth', 'columnBorderColor', 'columnBorderStyle', 'showOuterBorder', 'outerBorderWidth',
      'outerBorderColor', 'expandableRowRender', 'initialExpandedRows', 'expandedRows', 'onExpandedRowsChange', 'allowMultipleExpanded',
      'expandIcon', 'collapseIcon', 'headerTextProps', 'cellTextProps',
      'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py',
    ],
    controlOverrides: {
      variant: { controlType: 'segmented', options: ['default', 'minimal', 'bordered'] },
      density: { controlType: 'segmented', options: ['compact', 'normal', 'comfortable'] },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%' } }, node),
  },
  DatePicker: {
    id: 'DatePicker',
    component: 'DatePicker',
    initialProps: {
      type: 'single',
    },
    pinnedProps: ['type'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'value', 'defaultValue', 'calendarProps'],
    controlOverrides: {
      type: { controlType: 'segmented', options: ['single', 'multiple', 'range'] },
    },
    previewWrapper: (node) => React.createElement(View, { style: { alignItems: 'center' } }, node),
  },
  DatePickerInput: {
    id: 'DatePickerInput',
    component: 'DatePickerInput',
    initialProps: {
      label: 'Launch date',
      placeholder: 'Pick a date',
      type: 'single',
      clearable: true,
      size: 'md',
      variant: 'default',
      dropdownType: 'popover',
      closeOnSelect: true,
    },
    pinnedProps: ['label', 'placeholder', 'type', 'size', 'variant', 'clearable', 'disabled', 'required', 'withAsterisk', 'dropdownType', 'closeOnSelect'],
    hiddenProps: [...COMMON_EVENT_PROPS, ...INPUT_NOISE_PROPS, 'calendarProps', 'displayFormat', 'valueFormat', 'withInput', 'onOpen', 'onClose', 'error', 'helperText', 'description', 'onClear', 'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py'],
    controlOverrides: {
      type: { controlType: 'segmented', options: ['single', 'multiple', 'range'] },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      variant: { controlType: 'segmented', options: INPUT_VARIANTS },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 320 } }, node),
  },
  EmojiPicker: {
    id: 'EmojiPicker',
    component: 'EmojiPicker',
    initialProps: {
      variant: 'quick',
      showBackground: false,
      disabled: false,
    },
    pinnedProps: ['variant', 'searchPlaceholder', 'showBackground', 'disabled'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'value', 'emojis', 'defaultOpened', 'onOpenChange', 'onSearchChange', 'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py'],
    controlOverrides: {
      searchPlaceholder: { controlType: 'text', placeholder: 'Search emoji…' },
    },
    previewWrapper: (node) => React.createElement(View, { style: { alignItems: 'center', paddingVertical: 16 } }, node),
  },
  FileInput: {
    id: 'FileInput',
    component: 'FileInput',
    initialProps: {
      label: 'Upload files',
      multiple: true,
      showFileList: true,
      enableDragDrop: true,
      imagePreview: true,
      size: 'md',
      disabled: false,
      clearable: true,
    },
    pinnedProps: ['label', 'variant', 'multiple', 'showFileList', 'enableDragDrop', 'imagePreview', 'size', 'disabled', 'clearable', 'required'],
    hiddenProps: [
      ...COMMON_EVENT_PROPS, ...INPUT_NOISE_PROPS, 'accept', 'maxSize', 'maxFiles', 'onUpload', 'onProgress', 'onFilesChange',
      'onFileRemove', 'PreviewComponent', 'validateFile', 'uploadSettings', 'placeholder', 'error', 'helperText', 'description',
      'withAsterisk', 'onChangeText', 'onClear', 'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py',
    ],
    controlOverrides: {
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      label: { controlType: 'text', placeholder: 'Field label' },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 420 } }, node),
  },
  Form: {
    id: 'Form',
    component: 'Form',
    initialProps: {
      disabled: false,
      validateOnChange: true,
      validateOnBlur: true,
    },
    pinnedProps: ['disabled', 'validateOnChange', 'validateOnBlur'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'initialValues', 'validationSchema', 'onSubmit', 'validate'],
    transformProps: (values) => ({ ...values, initialValues: {}, children: buildFormChildren() }),
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 400 } }, node),
  },
  Gallery: {
    id: 'Gallery',
    component: 'Gallery',
    initialProps: {
      images: GALLERY_IMAGES,
      showThumbnails: true,
      showMetadata: true,
      showDownloadButton: false,
      allowKeyboardNavigation: true,
      allowSwipeNavigation: true,
      overlayOpacity: 0.9,
    },
    pinnedProps: ['showThumbnails', 'showMetadata', 'showDownloadButton', 'allowKeyboardNavigation', 'allowSwipeNavigation', 'overlayOpacity'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'images', 'initialIndex', 'onClose', 'onImageChange', 'onDownload', 'animationDuration'],
    controlOverrides: {
      overlayOpacity: { controlType: 'number', min: 0, max: 1, step: 0.05 },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', height: 360, borderRadius: 12, overflow: 'hidden' } }, node),
  },
  Image: {
    id: 'Image',
    component: 'Image',
    initialProps: {
      src: SAMPLE_IMAGE,
      alt: 'Sample photograph',
      w: 240,
      h: 160,
      resizeMode: 'cover',
      rounded: 'md',
      circle: false,
    },
    pinnedProps: ['resizeMode', 'w', 'h', 'aspectRatio', 'rounded', 'circle', 'borderWidth', 'borderColor'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'src', 'source', 'alt', 'fallback', 'loading', 'onLoad', 'onError', 'onLoadStart', 'onLoadEnd', 'containerStyle', 'imageStyle', 'size', 'accessibilityLabel', 'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py'],
    controlOverrides: {
      resizeMode: { controlType: 'segmented', options: ['cover', 'contain', 'stretch', 'center'] },
      w: { controlType: 'number', min: 80, max: 480, step: 20 },
      h: { controlType: 'number', min: 80, max: 480, step: 20 },
      rounded: { controlType: 'select', options: RADIUS_TOKENS },
      borderWidth: { controlType: 'number', min: 0, max: 8, step: 1 },
      borderColor: { controlType: 'color' },
    },
    previewWrapper: (node) => React.createElement(View, { style: { alignItems: 'center', paddingVertical: 8 } }, node),
  },
  Indicator: {
    id: 'Indicator',
    component: 'Indicator',
    initialProps: {
      label: '3',
      size: 'lg',
      placement: 'top-end',
      offset: 4,
      invisible: false,
      children: React.createElement(
        View,
        { style: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#e2e8f0' } }
      ),
    },
    pinnedProps: ['label', 'size', 'color', 'placement', 'offset', 'borderWidth', 'invisible'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'labelProps', 'borderColor'],
    controlOverrides: {
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      color: { controlType: 'color', placeholder: '#e11d48', colorPresets: ['#e11d48', '#22c55e', '#f97316', '#6366f1', '#0ea5e9'] },
      placement: { controlType: 'select', options: ['top-start', 'top-end', 'bottom-start', 'bottom-end'] },
      offset: { controlType: 'number', min: -8, max: 16, step: 1 },
      label: { controlType: 'text', placeholder: 'Badge label' },
    },
    previewWrapper: (node) => React.createElement(View, { style: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24 } }, node),
  },
  Link: {
    id: 'Link',
    component: 'Link',
    initialProps: {
      children: 'Visit Platform Blocks',
      href: 'https://platform-blocks.com',
      size: 'lg',
      variant: 'default',
      external: true,
      disabled: false,
    },
    pinnedProps: ['size', 'variant', 'color', 'external', 'disabled', 'target'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'href', 'textStyle', 'fontFamily', 'ff', 'accessibilityLabel', 'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py'],
    controlOverrides: {
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      variant: { controlType: 'segmented', options: ['default', 'subtle', 'underline'] },
      color: { controlType: 'color' },
      target: { controlType: 'segmented', options: ['_self', '_blank'] },
    },
  },
  ListGroup: {
    id: 'ListGroup',
    component: 'ListGroup',
    initialProps: {
      variant: 'default',
      size: 'md',
    },
    pinnedProps: ['variant', 'size'],
    hiddenProps: [...COMMON_EVENT_PROPS],
    controlOverrides: {
      variant: { controlType: 'segmented', options: ['default', 'bordered', 'flush'] },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
    },
    transformProps: (values) => ({ ...values, children: buildListGroupChildren() }),
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 360 } }, node),
  },
  LoadingOverlay: {
    id: 'LoadingOverlay',
    component: 'LoadingOverlay',
    initialProps: {
      visible: true,
    },
    pinnedProps: ['visible', 'zIndex'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'overlayProps', 'loaderProps', 'loader'],
    controlOverrides: {
      zIndex: { controlType: 'number', min: 0, max: 1000, step: 10 },
    },
    previewWrapper: (node) => React.createElement(
      View,
      { style: { width: '100%', maxWidth: 420, height: 180, borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(148,163,184,0.12)', padding: 16 } },
      [
        React.createElement(Text, { key: 'bg', style: { fontSize: 15, color: '#334155' } }, 'Content sits behind the overlay while it is visible. Toggle the visible control to reveal it.'),
        node,
      ]
    ),
  },
  Masonry: {
    id: 'Masonry',
    component: 'Masonry',
    initialProps: {
      data: MASONRY_DATA,
      numColumns: 3,
      gap: 8,
      optimizeItemArrangement: true,
      scrollEnabled: false,
      renderItem: ({ item }: any) =>
        React.createElement(View, { style: { height: item.height, borderRadius: 12, backgroundColor: item.color } }),
    },
    pinnedProps: ['numColumns', 'gap', 'optimizeItemArrangement', 'scrollEnabled'],
    hiddenProps: [
      ...COMMON_EVENT_PROPS, 'data', 'renderItem', 'contentContainerStyle', 'loading', 'emptyContent', 'flashListProps',
      'onEndReached', 'onEndReachedThreshold', 'onViewableItemsChanged', 'ListEmptyComponent', 'ListFooterComponent',
      'ListHeaderComponent', 'estimatedItemSize', 'refreshControl', 'onScroll', 'scrollEventThrottle',
      'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py',
    ],
    controlOverrides: {
      numColumns: { controlType: 'number', min: 1, max: 5, step: 1 },
      gap: { controlType: 'number', min: 0, max: 24, step: 2 },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', height: 360 } }, node),
  },
  Menu: {
    id: 'Menu',
    component: 'Menu',
    initialProps: {
      trigger: 'click',
      position: 'bottom',
      offset: 4,
      shadow: 'md',
      radius: 'md',
      closeOnClickOutside: true,
      closeOnEscape: true,
      disabled: false,
    },
    pinnedProps: ['trigger', 'position', 'offset', 'shadow', 'radius', 'w', 'closeOnClickOutside', 'closeOnEscape', 'disabled'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'opened', 'maxH', 'strategy', 'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py'],
    controlOverrides: {
      trigger: { controlType: 'segmented', options: ['click', 'hover'] },
      position: { controlType: 'select', options: ['auto', 'top', 'bottom', 'left', 'right'] },
      shadow: { controlType: 'segmented', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
      radius: { controlType: 'select', options: RADIUS_TOKENS },
      offset: { controlType: 'number', min: 0, max: 24, step: 2 },
    },
    transformProps: (values) => ({ ...values, children: buildMenuChildren() }),
    previewWrapper: (node) => React.createElement(View, { style: { minHeight: 200, alignItems: 'center', justifyContent: 'flex-start', paddingVertical: 16 } }, node),
  },
  MenuItemButton: {
    id: 'MenuItemButton',
    component: 'MenuItemButton',
    initialProps: {
      title: 'Settings',
      size: 'md',
      active: false,
      disabled: false,
      danger: false,
      compact: false,
      rounded: false,
      fullWidth: false,
    },
    pinnedProps: ['title', 'size', 'active', 'disabled', 'danger', 'compact', 'rounded', 'fullWidth'],
    hiddenProps: [
      ...COMMON_EVENT_PROPS, 'startIcon', 'endIcon', 'tone', 'hoverTone', 'activeTone', 'textColor', 'hoverTextColor',
      'activeTextColor', 'labelProps', 'onPressIn', 'onPressOut', 'onMouseDown', 'onMouseEnter', 'onMouseLeave', 'onFocus', 'onBlur',
      'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py',
    ],
    controlOverrides: {
      title: { controlType: 'text', placeholder: 'Item label' },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 260 } }, node),
  },
  MiniCalendar: {
    id: 'MiniCalendar',
    component: 'MiniCalendar',
    initialProps: {
      size: 'md',
    },
    pinnedProps: ['size'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'value', 'defaultDate', 'getDayProps', 'nextControlProps', 'previousControlProps', 'minDate', 'maxDate'],
    controlOverrides: {
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
    },
    previewWrapper: (node) => React.createElement(View, { style: { alignItems: 'center' } }, node),
  },
  MonthPicker: {
    id: 'MonthPicker',
    component: 'MonthPicker',
    initialProps: {
      size: 'md',
      monthsPerRow: 3,
      hideHeader: false,
    },
    pinnedProps: ['size', 'monthsPerRow', 'hideHeader'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'value', 'year', 'onYearChange', 'minDate', 'maxDate', 'locale', 'monthLabelFormat'],
    controlOverrides: {
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      monthsPerRow: { controlType: 'number', min: 1, max: 4, step: 1 },
    },
    previewWrapper: (node) => React.createElement(View, { style: { alignItems: 'center' } }, node),
  },
  MonthPickerInput: {
    id: 'MonthPickerInput',
    component: 'MonthPickerInput',
    initialProps: {
      label: 'Billing month',
      placeholder: 'Pick a month',
      clearable: true,
      size: 'md',
      variant: 'default',
      closeOnSelect: true,
    },
    pinnedProps: ['label', 'placeholder', 'size', 'variant', 'clearable', 'disabled', 'required', 'withAsterisk', 'closeOnSelect'],
    hiddenProps: [...COMMON_EVENT_PROPS, ...INPUT_NOISE_PROPS, 'locale', 'formatOptions', 'formatValue', 'monthPickerProps', 'modalTitle', 'onOpen', 'onClose', 'error', 'helperText', 'description', 'onClear', 'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py'],
    controlOverrides: {
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      variant: { controlType: 'segmented', options: INPUT_VARIANTS },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 320 } }, node),
  },
  Overlay: {
    id: 'Overlay',
    component: 'Overlay',
    initialProps: {
      opacity: 0.6,
      backgroundOpacity: 0.6,
      blur: 0,
      radius: 'md',
      center: true,
      fixed: false,
      children: React.createElement(Text, { style: { color: '#fff', fontWeight: '700', fontSize: 16 } }, 'Overlay content'),
    },
    pinnedProps: ['opacity', 'backgroundOpacity', 'blur', 'radius', 'center', 'fixed', 'gradient', 'zIndex'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'color'],
    controlOverrides: {
      opacity: { controlType: 'number', min: 0, max: 1, step: 0.05 },
      backgroundOpacity: { controlType: 'number', min: 0, max: 1, step: 0.05 },
      blur: { controlType: 'number', min: 0, max: 20, step: 1 },
      radius: { controlType: 'select', options: RADIUS_TOKENS },
      zIndex: { controlType: 'number', min: 0, max: 1000, step: 10 },
    },
    previewWrapper: (node) => React.createElement(
      View,
      { style: { width: '100%', maxWidth: 420, height: 200, borderRadius: 12, overflow: 'hidden', backgroundColor: '#e2e8f0', padding: 16 } },
      [
        React.createElement(Text, { key: 'bg', style: { fontSize: 15, color: '#334155' } }, 'Background content behind the overlay.'),
        node,
      ]
    ),
  },
  PhoneInput: {
    id: 'PhoneInput',
    component: 'PhoneInput',
    initialProps: {
      label: 'Phone number',
      country: 'US',
      size: 'md',
      variant: 'default',
      showCountryCode: true,
      autoDetect: false,
      selectableCountry: false,
      clearable: true,
      disabled: false,
    },
    pinnedProps: ['label', 'country', 'size', 'variant', 'showCountryCode', 'selectableCountry', 'autoDetect', 'clearable', 'disabled', 'required'],
    hiddenProps: [...COMMON_EVENT_PROPS, ...INPUT_NOISE_PROPS, 'defaultCountry', 'onCountryChange', 'textInputProps', 'mask', 'placeholder', 'error', 'helperText', 'description', 'withAsterisk', 'onClear', 'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py'],
    controlOverrides: {
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      variant: { controlType: 'segmented', options: INPUT_VARIANTS },
      country: { controlType: 'select', options: ['US', 'CA', 'GB', 'FR', 'DE', 'AU', 'BR', 'IN', 'JP', 'INTL'] },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 320 } }, node),
  },
  PinInput: {
    id: 'PinInput',
    component: 'PinInput',
    initialProps: {
      length: 4,
      mask: false,
      size: 'md',
      type: 'numeric',
      disabled: false,
      oneTimeCode: false,
      spacing: 8,
    },
    pinnedProps: ['length', 'mask', 'size', 'type', 'disabled', 'oneTimeCode', 'spacing', 'autoFocus'],
    hiddenProps: [...COMMON_EVENT_PROPS, ...INPUT_NOISE_PROPS, 'maskChar', 'manageFocus', 'enforceOrderInitialOnly', 'placeholder', 'allowPaste', 'borderRadius', 'onComplete', 'textInputProps', 'autoCapitalize', 'autoCorrect', 'selectTextOnFocus', 'textContentType', 'textAlign', 'spellCheck', 'selectionColor', 'showSoftInputOnFocus', 'error', 'helperText', 'description', 'withAsterisk', 'onClear', 'variant', 'label', 'required', 'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py'],
    controlOverrides: {
      length: { controlType: 'number', min: 3, max: 8, step: 1 },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      type: { controlType: 'segmented', options: ['numeric', 'alphanumeric'] },
      spacing: { controlType: 'number', min: 0, max: 24, step: 2 },
    },
    previewWrapper: (node) => React.createElement(View, { style: { alignItems: 'center', paddingVertical: 8 } }, node),
  },
  QRCode: {
    id: 'QRCode',
    component: 'QRCode',
    initialProps: {
      value: 'https://platform-blocks.com',
      size: 'md',
      errorCorrectionLevel: 'M',
      moduleShape: 'square',
      finderShape: 'square',
      quietZone: 4,
      showCopyButton: false,
    },
    pinnedProps: ['value', 'size', 'backgroundColor', 'color', 'moduleShape', 'finderShape', 'cornerRadius', 'errorCorrectionLevel', 'quietZone', 'showCopyButton'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'logo', 'gradient', 'onError', 'onLoadStart', 'onLoadEnd', 'copyOnPress', 'copyToastTitle', 'copyToastMessage', 'accessibilityLabel', 'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py'],
    controlOverrides: {
      value: { controlType: 'text', placeholder: 'URL or text' },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      color: { controlType: 'color', placeholder: '#000000' },
      backgroundColor: { controlType: 'color', placeholder: '#ffffff' },
      moduleShape: { controlType: 'segmented', options: ['square', 'rounded', 'dot'] },
      finderShape: { controlType: 'segmented', options: ['square', 'rounded', 'circle'] },
      errorCorrectionLevel: { controlType: 'segmented', options: ['L', 'M', 'Q', 'H'] },
      quietZone: { controlType: 'number', min: 0, max: 16, step: 1 },
    },
    previewWrapper: (node) => React.createElement(View, { style: { alignItems: 'center', paddingVertical: 8 } }, node),
  },
  Search: {
    id: 'Search',
    component: 'Search',
    initialProps: {
      placeholder: 'Search…',
      size: 'md',
      clearButton: true,
      loading: false,
      autoFocus: false,
    },
    pinnedProps: ['placeholder', 'size', 'radius', 'clearButton', 'loading', 'autoFocus', 'buttonMode', 'debounce'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'value', 'defaultValue', 'onSubmit', 'endSection', 'rightComponent', 'accessibilityLabel', 'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py'],
    controlOverrides: {
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      radius: { controlType: 'select', options: RADIUS_TOKENS },
      debounce: { controlType: 'number', min: 0, max: 1000, step: 50 },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 360 } }, node),
  },
  Spoiler: {
    id: 'Spoiler',
    component: 'Spoiler',
    initialProps: {
      maxHeight: 60,
      showLabel: 'Show more',
      hideLabel: 'Hide',
      initiallyOpen: false,
      transitionDuration: 200,
      size: 'md',
      disabled: false,
      children: React.createElement(
        Text,
        { style: { fontSize: 14, color: '#334155', lineHeight: 22 } },
        'Platform Blocks is a cross-platform design system for React Native and web. This block of text is intentionally long so that the Spoiler component clips it and reveals a show/hide control. Adjust the maxHeight to change how much is visible before clipping.'
      ),
    },
    pinnedProps: ['maxHeight', 'showLabel', 'hideLabel', 'transitionDuration', 'size', 'disabled', 'transparentFade'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'opened', 'renderControl', 'fadeColor', 'controlProps', 'disableFadeAnimation', 'initiallyOpen', 'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py'],
    controlOverrides: {
      maxHeight: { controlType: 'number', min: 20, max: 200, step: 10 },
      transitionDuration: { controlType: 'number', min: 0, max: 800, step: 50 },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      showLabel: { controlType: 'text', placeholder: 'Show more' },
      hideLabel: { controlType: 'text', placeholder: 'Hide' },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 420 } }, node),
  },
  Spotlight: {
    id: 'Spotlight',
    component: 'Spotlight',
    initialProps: {
      actions: SPOTLIGHT_ACTIONS,
      nothingFound: 'Nothing found…',
      limit: 5,
      scrollable: true,
      variant: 'default',
    },
    pinnedProps: ['limit', 'scrollable', 'maxHeight', 'width', 'height', 'variant'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'actions', 'store', 'searchProps', 'shortcut', 'highlightQuery', 'nothingFound'],
    controlOverrides: {
      limit: { controlType: 'number', min: 1, max: 10, step: 1 },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 480, alignItems: 'center' } }, node),
  },
  Table: {
    id: 'Table',
    component: 'Table',
    initialProps: {
      data: TABLE_DATA,
      columns: TABLE_COLUMNS,
      striped: true,
      highlightOnHover: true,
      withTableBorder: true,
      withColumnBorders: false,
      withRowBorders: true,
      variant: 'default',
      layout: 'auto',
      fullWidth: true,
    },
    pinnedProps: ['striped', 'highlightOnHover', 'withTableBorder', 'withColumnBorders', 'withRowBorders', 'variant', 'layout', 'fullWidth', 'horizontalSpacing', 'verticalSpacing'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'data', 'columns', 'captionSide', 'tabularNums', 'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py'],
    controlOverrides: {
      variant: { controlType: 'segmented', options: ['default', 'vertical'] },
      layout: { controlType: 'segmented', options: ['auto', 'fixed'] },
      horizontalSpacing: { controlType: 'select', options: SIZE_TOKENS },
      verticalSpacing: { controlType: 'select', options: SIZE_TOKENS },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 520 } }, node),
  },
  TableOfContents: {
    id: 'TableOfContents',
    component: 'TableOfContents',
    initialProps: {
      variant: 'filled',
      size: 'sm',
      minDepthToOffset: 1,
      depthOffset: 20,
      autoContrast: false,
      initialData: [
        { value: 'Introduction', depth: 1, id: 'introduction' },
        { value: 'Installation', depth: 1, id: 'installation' },
        { value: 'Usage', depth: 2, id: 'usage' },
        { value: 'API reference', depth: 1, id: 'api' },
      ],
    },
    pinnedProps: ['variant', 'size', 'color', 'radius', 'minDepthToOffset', 'depthOffset', 'autoContrast'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'scrollSpyOptions', 'getControlProps', 'initialData', 'reinitializeRef', 'onActiveChange', 'container', 'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py'],
    controlOverrides: {
      variant: { controlType: 'segmented', options: ['none', 'filled', 'light'] },
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      radius: { controlType: 'select', options: RADIUS_TOKENS },
      depthOffset: { controlType: 'number', min: 0, max: 40, step: 4 },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 280 } }, node),
  },
  TimePicker: {
    id: 'TimePicker',
    component: 'TimePicker',
    initialProps: {
      withSeconds: false,
      minuteStep: 1,
      disabled: false,
    },
    pinnedProps: ['format', 'withSeconds', 'minuteStep', 'secondStep', 'columnWidth', 'columnHeight', 'disabled'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'value', 'defaultValue', 'onChangeComplete'],
    controlOverrides: {
      format: { controlType: 'segmented', options: ['12', '24'] },
      minuteStep: { controlType: 'number', min: 1, max: 30, step: 1 },
      secondStep: { controlType: 'number', min: 1, max: 30, step: 1 },
      columnWidth: { controlType: 'number', min: 56, max: 160, step: 8 },
      columnHeight: { controlType: 'number', min: 120, max: 360, step: 20 },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 320 } }, node),
  },
  TimePickerInput: {
    id: 'TimePickerInput',
    component: 'TimePickerInput',
    initialProps: {
      label: 'Meeting time',
      placeholder: 'Select time',
      clearable: true,
      size: 'md',
    },
    pinnedProps: ['label', 'placeholder', 'size', 'clearable', 'disabled'],
    hiddenProps: [...COMMON_EVENT_PROPS, ...INPUT_NOISE_PROPS],
    controlOverrides: {
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 320 } }, node),
  },
  Title: {
    id: 'Title',
    component: 'Title',
    initialProps: {
      text: 'Mission Control',
      order: 2,
      underline: false,
      afterline: false,
      subtitle: 'Systems nominal',
      align: 'left',
    },
    pinnedProps: ['text', 'order', 'underline', 'afterline', 'align', 'weight', 'colorVariant', 'uppercase', 'size'],
    hiddenProps: [
      ...COMMON_EVENT_PROPS, 'underlineColor', 'underlineStroke', 'afterlineGap', 'underlineOffset', 'prefix', 'prefixVariant',
      'prefixColor', 'prefixSize', 'prefixLength', 'prefixGap', 'prefixRadius', 'containerStyle', 'startIcon', 'endIcon', 'action',
      'subtitleProps', 'subtitleSpacing', 'tx', 'txParams', 'c', 'color', 'lineHeight', 'tracking', 'fontFamily', 'ff', 'as',
      'selectable', 'value', 'numberOfLines', 'ellipsizeMode', 'variant', 'prefix',
      'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py',
    ],
    controlOverrides: {
      text: { controlType: 'text', placeholder: 'Title text' },
      order: { controlType: 'number', min: 1, max: 6, step: 1 },
      align: { controlType: 'segmented', options: ['left', 'center', 'right'] },
      weight: { controlType: 'segmented', options: FONT_WEIGHT_OPTIONS },
      colorVariant: { controlType: 'select', options: TEXT_COLOR_VARIANTS },
      subtitle: { controlType: 'text', placeholder: 'Subtitle' },
    },
  },
  Tree: {
    id: 'Tree',
    component: 'Tree',
    initialProps: {
      data: TREE_DATA,
      collapsible: true,
      indent: 16,
      accordion: false,
      selectionMode: 'single',
      expandOnClick: true,
      striped: false,
      useAnimations: true,
    },
    pinnedProps: ['collapsible', 'indent', 'accordion', 'expandAll', 'selectionMode', 'checkboxes', 'striped', 'expandOnClick', 'useAnimations'],
    hiddenProps: [
      ...COMMON_EVENT_PROPS, 'data', 'onNavigate', 'onNodePress', 'renderLabel', 'selectedIds', 'defaultSelectedIds',
      'onSelectionChange', 'onActiveNodeChange', 'checkedIds', 'defaultCheckedIds', 'onCheckedChange', 'cascadeCheck',
      'expandedIds', 'onToggle', 'filterQuery', 'hideFiltered', 'noResultsFallback', 'highlight',
    ],
    controlOverrides: {
      indent: { controlType: 'number', min: 8, max: 40, step: 2 },
      selectionMode: { controlType: 'segmented', options: ['none', 'single', 'multiple'] },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 360 } }, node),
  },
  Video: {
    id: 'Video',
    component: 'Video',
    initialProps: {
      source: SAMPLE_VIDEO,
      w: 360,
      aspectRatio: 16 / 9,
      controls: true,
      autoPlay: false,
      loop: false,
      muted: true,
      volume: 1,
      playbackRate: 1,
      timeline: true,
    },
    pinnedProps: ['controls', 'autoPlay', 'loop', 'muted', 'volume', 'playbackRate', 'w', 'aspectRatio', 'timeline'],
    hiddenProps: [
      ...COMMON_EVENT_PROPS, 'source', 'poster', 'quality', 'youtubeOptions', 'onPlay', 'onPause', 'onSeek', 'onTimeUpdate',
      'onDurationChange', 'onVolumeChange', 'onPlaybackRateChange', 'onQualityChange', 'onFullscreenChange', 'onError', 'onLoad',
      'onLoadStart', 'onBuffer', 'onTimelineEvent', 'videoStyle', 'controlsStyle', 'accessibilityLabel', 'h',
      'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py',
    ],
    controlOverrides: {
      volume: { controlType: 'number', min: 0, max: 1, step: 0.1 },
      playbackRate: { controlType: 'number', min: 0.25, max: 2, step: 0.25 },
      w: { controlType: 'number', min: 240, max: 640, step: 20 },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 480, alignItems: 'center' } }, node),
  },
  YearPicker: {
    id: 'YearPicker',
    component: 'YearPicker',
    initialProps: {
      size: 'md',
      yearsPerRow: 3,
      hideHeader: false,
    },
    pinnedProps: ['size', 'yearsPerRow', 'hideHeader', 'totalYears'],
    hiddenProps: [...COMMON_EVENT_PROPS, 'value', 'decade', 'onDecadeChange', 'minDate', 'maxDate'],
    controlOverrides: {
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      yearsPerRow: { controlType: 'number', min: 1, max: 4, step: 1 },
      totalYears: { controlType: 'number', min: 6, max: 24, step: 3 },
    },
    previewWrapper: (node) => React.createElement(View, { style: { alignItems: 'center' } }, node),
  },
  YearPickerInput: {
    id: 'YearPickerInput',
    component: 'YearPickerInput',
    initialProps: {
      label: 'Year',
      placeholder: 'Pick a year',
      clearable: true,
      size: 'md',
      variant: 'default',
      closeOnSelect: true,
    },
    pinnedProps: ['label', 'placeholder', 'size', 'variant', 'clearable', 'disabled', 'required', 'withAsterisk', 'closeOnSelect'],
    hiddenProps: [...COMMON_EVENT_PROPS, ...INPUT_NOISE_PROPS, 'formatValue', 'yearPickerProps', 'modalTitle', 'onOpen', 'onClose', 'error', 'helperText', 'description', 'onClear', 'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py'],
    controlOverrides: {
      size: { controlType: 'size-slider', options: SIZE_TOKENS },
      variant: { controlType: 'segmented', options: INPUT_VARIANTS },
    },
    previewWrapper: (node) => React.createElement(View, { style: { width: '100%', maxWidth: 280 } }, node),
  },

  // ----------------------------- Charts -----------------------------------
  AreaChart: {
    id: 'AreaChart',
    component: 'AreaChart',
    initialProps: {
      title: 'Weekly signups',
      subtitle: 'Organic vs virality',
      width: 360,
      height: 240,
      data: AREA_CHART_DATA,
      areaOpacity: 0.35,
      lineThickness: 2,
      lineStyle: 'solid',
      showPoints: true,
      pointSize: 4,
      smooth: false,
      fill: true,
      fillOpacity: 0.3,
      layout: 'overlap',
      grid: { show: true, style: 'dashed' },
      xAxis: { show: true },
      yAxis: { show: true },
      tooltip: { show: true },
      enableCrosshair: true,
      liveTooltip: true,
    },
    pinnedProps: ['width', 'height', 'layout', 'fill', 'fillOpacity', 'areaOpacity', 'smooth', 'lineThickness', 'lineStyle', 'showPoints', 'pointSize', 'stackOrder'],
    hiddenProps: CHART_HIDDEN_PROPS.filter((p) => p !== 'layout'),
    controlOverrides: {
      width: CHART_WIDTH_CONTROL,
      height: CHART_HEIGHT_CONTROL,
      layout: { controlType: 'segmented', options: ['overlap', 'stacked', 'stackedPercentage'] },
      lineStyle: { controlType: 'segmented', options: ['solid', 'dashed', 'dotted'] },
      stackOrder: { controlType: 'segmented', options: ['normal', 'reverse'] },
      areaFillMode: { controlType: 'segmented', options: ['single', 'series'] },
      areaOpacity: { controlType: 'number', min: 0, max: 1, step: 0.05 },
      fillOpacity: { controlType: 'number', min: 0, max: 1, step: 0.05 },
      lineThickness: { controlType: 'number', min: 1, max: 6, step: 0.5 },
      pointSize: { controlType: 'number', min: 2, max: 10, step: 1 },
      lineColor: { controlType: 'color', colorPresets: CHART_COLOR_PRESETS },
      fillColor: { controlType: 'color', colorPresets: CHART_COLOR_PRESETS },
      pointColor: { controlType: 'color', colorPresets: CHART_COLOR_PRESETS },
    },
  },
  BarChart: {
    id: 'BarChart',
    component: 'BarChart',
    initialProps: {
      title: 'Quarterly revenue',
      subtitle: 'North America',
      width: 380,
      height: 260,
      data: BAR_CHART_DATA,
      barSpacing: 0.25,
      barBorderRadius: 6,
      orientation: 'vertical',
      layout: 'single',
      stackMode: 'normal',
      grid: { show: true, style: 'dotted' },
      xAxis: { show: true },
      yAxis: { show: true },
      tooltip: { show: true },
      enableCrosshair: true,
      liveTooltip: true,
    },
    pinnedProps: ['width', 'height', 'orientation', 'layout', 'stackMode', 'barColor', 'barSpacing', 'barBorderRadius'],
    hiddenProps: CHART_HIDDEN_PROPS.filter((p) => p !== 'layout'),
    controlOverrides: {
      width: CHART_WIDTH_CONTROL,
      height: CHART_HEIGHT_CONTROL,
      orientation: { controlType: 'segmented', options: ['vertical', 'horizontal'] },
      layout: { controlType: 'segmented', options: ['single', 'grouped', 'stacked'] },
      stackMode: { controlType: 'segmented', options: ['normal', '100%'] },
      barColor: { controlType: 'color', colorPresets: CHART_COLOR_PRESETS },
      barSpacing: { controlType: 'number', min: 0, max: 0.9, step: 0.05 },
      barBorderRadius: { controlType: 'number', min: 0, max: 16, step: 1 },
    },
  },
  BubbleChart: {
    id: 'BubbleChart',
    component: 'BubbleChart',
    initialProps: {
      title: 'Revenue vs Growth',
      subtitle: 'Bubble size shows valuation (in millions)',
      width: 520,
      height: 360,
      data: BUBBLE_CHART_DATA,
      dataKey: BUBBLE_CHART_DATA_KEY,
      range: [64, 1152],
      grid: { show: true },
      xAxis: {},
      yAxis: {},
      withTooltip: true,
    },
    pinnedProps: ['width', 'height', 'color', 'bubbleOpacity', 'bubbleStrokeWidth', 'bubbleStrokeColor', 'withTooltip'],
    hiddenProps: [...CHART_HIDDEN_PROPS, 'label', 'minBubbleSize', 'maxBubbleSize'],
    controlOverrides: {
      width: CHART_WIDTH_CONTROL,
      height: CHART_HEIGHT_CONTROL,
      color: { controlType: 'color', colorPresets: CHART_COLOR_PRESETS },
      bubbleStrokeColor: { controlType: 'color', colorPresets: ['rgba(0,0,0,0.12)', '#94A3B8', '#4C6EF5'] },
      bubbleOpacity: { controlType: 'number', min: 0, max: 1, step: 0.05 },
      bubbleStrokeWidth: { controlType: 'number', min: 0, max: 4, step: 0.5 },
    },
  },
  CandlestickChart: {
    id: 'CandlestickChart',
    component: 'CandlestickChart',
    initialProps: {
      title: 'AAPL daily candles',
      subtitle: 'Daily open / high / low / close',
      width: 520,
      height: 360,
      series: CANDLESTICK_SERIES,
      gap: 0.3,
      barWidth: 12,
      showMovingAverages: false,
      showVolume: false,
      grid: { show: true },
      xAxis: { show: true },
      yAxis: { show: true },
      legend: { show: true },
      tooltip: { show: true },
      enableCrosshair: true,
      liveTooltip: true,
      xScaleType: 'time',
    },
    pinnedProps: ['width', 'height', 'barWidth', 'gap', 'showMovingAverages', 'showVolume', 'volumeHeightRatio', 'enableCrosshair', 'liveTooltip'],
    hiddenProps: CHART_HIDDEN_PROPS,
    controlOverrides: {
      width: CHART_WIDTH_CONTROL,
      height: CHART_HEIGHT_CONTROL,
      barWidth: { controlType: 'number', min: 4, max: 24, step: 1 },
      gap: { controlType: 'number', min: 0, max: 0.9, step: 0.05 },
      volumeHeightRatio: { controlType: 'number', min: 0.1, max: 0.5, step: 0.05 },
    },
  },
  ComboChart: {
    id: 'ComboChart',
    component: 'ComboChart',
    initialProps: {
      title: 'Revenue vs. active users',
      subtitle: 'First half of FY25',
      width: 540,
      height: 340,
      layers: COMBO_CHART_LAYERS,
      xAxis: { show: true },
      yAxis: { show: true },
      yAxisRight: { show: true },
      yDomain: [0, 650],
      yDomainRight: [80, 200],
      grid: { show: true, style: 'dashed' },
      legend: { show: true, position: 'bottom' },
      enableCrosshair: true,
      multiTooltip: true,
      liveTooltip: true,
    },
    pinnedProps: ['width', 'height', 'enableCrosshair', 'multiTooltip', 'liveTooltip'],
    hiddenProps: CHART_HIDDEN_PROPS,
    controlOverrides: {
      width: CHART_WIDTH_CONTROL,
      height: CHART_HEIGHT_CONTROL,
    },
  },
  DonutChart: {
    id: 'DonutChart',
    component: 'DonutChart',
    initialProps: {
      title: 'Team allocation',
      data: DONUT_CHART_DATA,
      size: 260,
      innerRadiusRatio: 0.55,
      padAngle: 1.5,
      startAngle: -90,
      endAngle: 270,
      inheritColorByLabel: true,
      isolateOnClick: false,
      legend: { show: true, position: 'bottom' },
    },
    pinnedProps: ['size', 'innerRadiusRatio', 'thickness', 'ringGap', 'padAngle', 'startAngle', 'endAngle', 'inheritColorByLabel', 'isolateOnClick'],
    hiddenProps: [...CHART_HIDDEN_PROPS, 'width', 'height', 'emptyLabel'],
    controlOverrides: {
      size: { controlType: 'number', min: 160, max: 360, step: 10 },
      innerRadiusRatio: { controlType: 'number', min: 0, max: 0.9, step: 0.05 },
      thickness: { controlType: 'number', min: 8, max: 60, step: 2 },
      ringGap: { controlType: 'number', min: 0, max: 20, step: 1 },
      padAngle: { controlType: 'number', min: 0, max: 8, step: 0.5 },
      startAngle: { controlType: 'number', min: -180, max: 180, step: 10 },
      endAngle: { controlType: 'number', min: -180, max: 360, step: 10 },
    },
    previewWrapper: (node) => React.createElement(View, { style: { alignItems: 'center' } }, node),
  },
  FunnelChart: {
    id: 'FunnelChart',
    component: 'FunnelChart',
    initialProps: {
      title: 'Product acquisition funnel',
      width: 420,
      height: 420,
      series: FUNNEL_CHART_SERIES,
      layout: { shape: 'trapezoid', gap: 8, showConversion: false, align: 'center', connectors: { show: false } },
      legend: { show: false },
      tooltip: { show: true },
    },
    pinnedProps: ['width', 'height'],
    hiddenProps: CHART_HIDDEN_PROPS,
    controlOverrides: {
      width: CHART_WIDTH_CONTROL,
      height: CHART_HEIGHT_CONTROL,
    },
  },
  GaugeChart: {
    id: 'GaugeChart',
    component: 'GaugeChart',
    initialProps: {
      title: 'System Health',
      subtitle: 'Live CPU utilisation',
      width: 320,
      height: 240,
      value: 68,
      min: 0,
      max: 100,
      thickness: 16,
      track: { opacity: 0.2 },
      ranges: GAUGE_CHART_RANGES,
      ticks: { major: 5, minor: 4 },
      needle: { length: 0.85, centerSize: 6, showCenter: true },
      legend: { show: true, position: 'bottom' },
    },
    pinnedProps: ['value', 'min', 'max', 'thickness', 'width', 'height'],
    hiddenProps: [...CHART_HIDDEN_PROPS, 'markers'],
    controlOverrides: {
      value: { controlType: 'number', min: 0, max: 100, step: 1 },
      min: { controlType: 'number', min: 0, max: 100, step: 5 },
      max: { controlType: 'number', min: 0, max: 200, step: 5 },
      thickness: { controlType: 'number', min: 4, max: 40, step: 2 },
      width: CHART_WIDTH_CONTROL,
      height: CHART_HEIGHT_CONTROL,
    },
  },
  GroupedBarChart: {
    id: 'GroupedBarChart',
    component: 'GroupedBarChart',
    initialProps: {
      title: 'Product revenue by segment',
      subtitle: 'Comparison vs targets',
      width: 520,
      height: 320,
      series: GROUPED_BAR_SERIES,
      barSpacing: 0.15,
      innerBarSpacing: 0.2,
      grid: { show: true },
      xAxis: { show: true },
      yAxis: { show: true },
      legend: { show: true, position: 'bottom' },
      colorOptions: { hash: false },
    },
    pinnedProps: ['width', 'height', 'barSpacing', 'innerBarSpacing', 'enableCrosshair', 'multiTooltip', 'liveTooltip'],
    hiddenProps: CHART_HIDDEN_PROPS,
    controlOverrides: {
      width: CHART_WIDTH_CONTROL,
      height: CHART_HEIGHT_CONTROL,
      barSpacing: { controlType: 'number', min: 0, max: 0.9, step: 0.05 },
      innerBarSpacing: { controlType: 'number', min: 0, max: 0.9, step: 0.05 },
    },
  },
  HeatmapChart: {
    id: 'HeatmapChart',
    component: 'HeatmapChart',
    initialProps: {
      title: 'Support ticket load',
      subtitle: 'Average tickets per hour',
      width: 520,
      height: 320,
      data: HEATMAP_CHART_DATA,
      colorScale: HEATMAP_COLOR_SCALE,
      cellSize: { width: 48, height: 44 },
      gap: 4,
      xAxis: { show: true },
      yAxis: { show: true },
      grid: { show: false },
      tooltip: { show: true },
      legend: { show: true, position: 'bottom' },
    },
    pinnedProps: ['width', 'height', 'gap', 'cellCornerRadius', 'showCellLabels'],
    hiddenProps: CHART_HIDDEN_PROPS,
    controlOverrides: {
      width: CHART_WIDTH_CONTROL,
      height: CHART_HEIGHT_CONTROL,
      gap: { controlType: 'number', min: 0, max: 12, step: 1 },
      cellCornerRadius: { controlType: 'number', min: 0, max: 16, step: 1 },
    },
  },
  HistogramChart: {
    id: 'HistogramChart',
    component: 'HistogramChart',
    initialProps: {
      title: 'Session duration distribution',
      subtitle: 'Product analytics cohort',
      width: 460,
      height: 280,
      data: HISTOGRAM_CHART_DATA,
      bins: 10,
      showDensity: true,
      densityThickness: 3,
      barGap: 0.15,
      tooltip: { show: true },
      enableCrosshair: true,
      liveTooltip: true,
    },
    pinnedProps: ['width', 'height', 'bins', 'binMethod', 'showDensity', 'density', 'densityThickness', 'barGap', 'barColor', 'densityColor', 'barOpacity', 'barRadius'],
    hiddenProps: CHART_HIDDEN_PROPS,
    controlOverrides: {
      width: CHART_WIDTH_CONTROL,
      height: CHART_HEIGHT_CONTROL,
      bins: { controlType: 'number', min: 4, max: 30, step: 1 },
      binMethod: { controlType: 'select', options: ['sturges', 'sqrt', 'fd'] },
      densityThickness: { controlType: 'number', min: 1, max: 6, step: 0.5 },
      barGap: { controlType: 'number', min: 0, max: 0.6, step: 0.05 },
      barColor: { controlType: 'color', colorPresets: CHART_COLOR_PRESETS },
      densityColor: { controlType: 'color', colorPresets: CHART_COLOR_PRESETS },
      barOpacity: { controlType: 'number', min: 0, max: 1, step: 0.05 },
      barRadius: { controlType: 'number', min: 0, max: 12, step: 1 },
      bandwidth: { controlType: 'number', min: 0.5, max: 6, step: 0.5 },
    },
  },
  LineChart: {
    id: 'LineChart',
    component: 'LineChart',
    initialProps: {
      title: 'Monthly active customers',
      subtitle: 'FY25',
      width: 560,
      height: 320,
      series: LINE_CHART_SERIES,
      lineThickness: 2,
      lineStyle: 'solid',
      showPoints: true,
      pointSize: 4,
      smooth: false,
      fill: false,
      fillOpacity: 0.3,
      grid: { show: true, style: 'dashed' },
      xAxis: { show: true },
      yAxis: { show: true },
      legend: { show: true, position: 'bottom' },
      tooltip: { show: true },
      enableCrosshair: true,
      multiTooltip: true,
      liveTooltip: true,
    },
    pinnedProps: ['width', 'height', 'lineThickness', 'lineStyle', 'smooth', 'showPoints', 'pointSize', 'fill', 'fillOpacity', 'enableCrosshair', 'multiTooltip', 'liveTooltip'],
    hiddenProps: CHART_HIDDEN_PROPS,
    controlOverrides: {
      width: CHART_WIDTH_CONTROL,
      height: CHART_HEIGHT_CONTROL,
      lineStyle: { controlType: 'segmented', options: ['solid', 'dashed', 'dotted'] },
      areaFillMode: { controlType: 'segmented', options: ['single', 'series'] },
      lineThickness: { controlType: 'number', min: 1, max: 6, step: 0.5 },
      pointSize: { controlType: 'number', min: 2, max: 10, step: 1 },
      fillOpacity: { controlType: 'number', min: 0, max: 1, step: 0.05 },
      lineColor: { controlType: 'color', colorPresets: CHART_COLOR_PRESETS },
      fillColor: { controlType: 'color', colorPresets: CHART_COLOR_PRESETS },
      pointColor: { controlType: 'color', colorPresets: CHART_COLOR_PRESETS },
    },
  },
  MarimekkoChart: {
    id: 'MarimekkoChart',
    component: 'MarimekkoChart',
    initialProps: {
      title: 'Pipeline contribution by segment',
      subtitle: 'Quarter to date',
      width: 720,
      height: 440,
      data: MARIMEKKO_CHART_DATA,
      columnGap: 16,
      legend: { show: true, position: 'bottom' },
      yAxis: { title: 'Segment share (%)' },
      grid: { show: true, style: 'dotted' },
    },
    pinnedProps: ['width', 'height', 'columnGap', 'segmentBorderRadius'],
    hiddenProps: CHART_HIDDEN_PROPS,
    controlOverrides: {
      width: { controlType: 'number', min: 400, max: 800, step: 20 },
      height: CHART_HEIGHT_CONTROL,
      columnGap: { controlType: 'number', min: 0, max: 40, step: 2 },
      segmentBorderRadius: { controlType: 'number', min: 0, max: 16, step: 1 },
    },
  },
  NetworkChart: {
    id: 'NetworkChart',
    component: 'NetworkChart',
    initialProps: {
      title: 'Cross-team collaboration',
      width: 560,
      height: 420,
      nodes: NETWORK_CHART_NODES,
      links: NETWORK_CHART_LINKS,
      showLabels: true,
    },
    pinnedProps: ['width', 'height', 'showLabels', 'nodeRadius', 'linkCurveStrength'],
    hiddenProps: [...CHART_HIDDEN_PROPS, 'linkShape'],
    controlOverrides: {
      width: CHART_WIDTH_CONTROL,
      height: CHART_HEIGHT_CONTROL,
      nodeRadius: { controlType: 'number', min: 4, max: 24, step: 1 },
      linkCurveStrength: { controlType: 'number', min: 0, max: 1, step: 0.05 },
    },
  },
  ParetoChart: {
    id: 'ParetoChart',
    component: 'ParetoChart',
    initialProps: {
      title: 'Monthly defect analysis',
      subtitle: 'Product QA triage',
      width: 720,
      height: 420,
      data: PARETO_CHART_DATA,
      valueSeriesLabel: 'Defects',
      cumulativeSeriesLabel: 'Cumulative impact',
      sortDirection: 'desc',
      grid: { show: true, style: 'dotted' },
      legend: { show: true, position: 'bottom' },
      yAxis: { title: 'Defects reported' },
      yAxisRight: { title: 'Cumulative share' },
    },
    pinnedProps: ['width', 'height', 'sortDirection', 'barColor', 'lineColor', 'enableCrosshair', 'multiTooltip', 'liveTooltip'],
    hiddenProps: [...CHART_HIDDEN_PROPS, 'valueSeriesLabel', 'cumulativeSeriesLabel'],
    controlOverrides: {
      width: { controlType: 'number', min: 400, max: 800, step: 20 },
      height: CHART_HEIGHT_CONTROL,
      sortDirection: { controlType: 'segmented', options: ['desc', 'asc', 'none'] },
      barColor: { controlType: 'color', colorPresets: CHART_COLOR_PRESETS },
      lineColor: { controlType: 'color', colorPresets: CHART_COLOR_PRESETS },
    },
  },
  PieChart: {
    id: 'PieChart',
    component: 'PieChart',
    initialProps: {
      title: 'Traffic sources',
      width: 380,
      height: 340,
      data: PIE_CHART_DATA,
      innerRadius: 70,
      outerRadius: 150,
      showLabels: true,
      labelPosition: 'outside',
      showValues: true,
      startAngle: -90,
      endAngle: 270,
      padAngle: 0,
      legend: { show: true, position: 'right' },
      tooltip: { show: true },
    },
    pinnedProps: ['width', 'height', 'innerRadius', 'outerRadius', 'padAngle', 'showLabels', 'labelPosition', 'showValues', 'startAngle', 'endAngle'],
    hiddenProps: CHART_HIDDEN_PROPS,
    controlOverrides: {
      width: CHART_WIDTH_CONTROL,
      height: CHART_HEIGHT_CONTROL,
      innerRadius: { controlType: 'number', min: 0, max: 140, step: 5 },
      outerRadius: { controlType: 'number', min: 60, max: 180, step: 5 },
      padAngle: { controlType: 'number', min: 0, max: 10, step: 0.5 },
      startAngle: { controlType: 'number', min: -180, max: 180, step: 10 },
      endAngle: { controlType: 'number', min: -180, max: 360, step: 10 },
      labelPosition: { controlType: 'segmented', options: ['inside', 'outside', 'center'] },
      labelStrategy: { controlType: 'select', options: ['auto', 'inside', 'outside', 'center'] },
    },
    previewWrapper: (node) => React.createElement(View, { style: { alignItems: 'center' } }, node),
  },
  RadarChart: {
    id: 'RadarChart',
    component: 'RadarChart',
    initialProps: {
      title: 'Team capability radar',
      width: 420,
      height: 360,
      series: RADAR_CHART_SERIES,
      maxValue: 60,
      radialGrid: { rings: 5, shape: 'polygon', showAxes: true },
      smooth: true,
      fill: true,
      legend: { show: true, position: 'bottom' },
      tooltip: { show: true },
      enableCrosshair: true,
      multiTooltip: true,
      liveTooltip: true,
    },
    pinnedProps: ['width', 'height', 'maxValue', 'smooth', 'fill', 'enableCrosshair', 'multiTooltip', 'liveTooltip'],
    hiddenProps: [...CHART_HIDDEN_PROPS, 'colorScheme'],
    controlOverrides: {
      width: CHART_WIDTH_CONTROL,
      height: CHART_HEIGHT_CONTROL,
      maxValue: { controlType: 'number', min: 10, max: 100, step: 5 },
    },
    previewWrapper: (node) => React.createElement(View, { style: { alignItems: 'center' } }, node),
  },
  RadialBarChart: {
    id: 'RadialBarChart',
    component: 'RadialBarChart',
    initialProps: {
      title: 'Quarterly KPIs',
      subtitle: 'Progress toward goals',
      width: 360,
      height: 360,
      data: RADIAL_BAR_DATA,
      barThickness: 16,
      gap: 12,
      showValueLabels: true,
      animate: true,
      legend: { show: true, position: 'bottom' },
      multiTooltip: true,
      liveTooltip: true,
    },
    pinnedProps: ['width', 'height', 'barThickness', 'gap', 'minAngle', 'startAngle', 'endAngle', 'showValueLabels', 'animate'],
    hiddenProps: [...CHART_HIDDEN_PROPS, 'radius'],
    controlOverrides: {
      width: CHART_WIDTH_CONTROL,
      height: CHART_HEIGHT_CONTROL,
      barThickness: { controlType: 'number', min: 6, max: 40, step: 2 },
      gap: { controlType: 'number', min: 0, max: 30, step: 2 },
      minAngle: { controlType: 'number', min: 0, max: 90, step: 5 },
      startAngle: { controlType: 'number', min: -180, max: 180, step: 10 },
      endAngle: { controlType: 'number', min: 0, max: 360, step: 10 },
    },
    previewWrapper: (node) => React.createElement(View, { style: { alignItems: 'center' } }, node),
  },
  RidgeChart: {
    id: 'RidgeChart',
    component: 'RidgeChart',
    initialProps: {
      title: 'Customer satisfaction distribution',
      subtitle: 'Annual NPS density',
      width: 560,
      height: 360,
      series: RIDGE_CHART_SERIES,
      samples: 96,
      bandwidth: 3,
      statsMarkers: { enabled: true, showP90: true, showLabels: true },
    },
    pinnedProps: ['width', 'height', 'samples', 'bandwidth', 'bandPadding', 'amplitudeScale'],
    hiddenProps: CHART_HIDDEN_PROPS,
    controlOverrides: {
      width: CHART_WIDTH_CONTROL,
      height: CHART_HEIGHT_CONTROL,
      samples: { controlType: 'number', min: 16, max: 160, step: 8 },
      bandwidth: { controlType: 'number', min: 0.5, max: 8, step: 0.5 },
      bandPadding: { controlType: 'number', min: 0, max: 1, step: 0.05 },
      amplitudeScale: { controlType: 'number', min: 0.5, max: 3, step: 0.1 },
    },
  },
  SankeyChart: {
    id: 'SankeyChart',
    component: 'SankeyChart',
    initialProps: {
      title: 'Renewable energy flow',
      width: 560,
      height: 360,
      nodes: SANKEY_CHART_NODES,
      links: SANKEY_CHART_LINKS,
      highlightOnHover: true,
    },
    pinnedProps: ['width', 'height', 'nodeWidth', 'nodePadding', 'highlightOnHover'],
    hiddenProps: CHART_HIDDEN_PROPS,
    controlOverrides: {
      width: CHART_WIDTH_CONTROL,
      height: CHART_HEIGHT_CONTROL,
      nodeWidth: { controlType: 'number', min: 4, max: 40, step: 2 },
      nodePadding: { controlType: 'number', min: 0, max: 40, step: 2 },
    },
  },
  ScatterChart: {
    id: 'ScatterChart',
    component: 'ScatterChart',
    initialProps: {
      title: 'Spend vs. qualified leads',
      subtitle: 'Campaign cohort',
      width: 520,
      height: 340,
      data: SCATTER_CHART_DATA,
      series: SCATTER_CHART_SERIES,
      pointSize: 6,
      pointOpacity: 1,
      showTrendline: 'per-series',
      grid: { show: true },
      xAxis: { show: true },
      yAxis: { show: true },
      legend: { show: true, position: 'bottom' },
      tooltip: { show: true },
      enableCrosshair: true,
      multiTooltip: true,
      liveTooltip: true,
    },
    pinnedProps: ['width', 'height', 'pointSize', 'pointOpacity', 'pointColor', 'showTrendline', 'enableCrosshair', 'multiTooltip', 'liveTooltip'],
    hiddenProps: [...CHART_HIDDEN_PROPS, 'allowAddPoints', 'allowDragPoints'],
    controlOverrides: {
      width: CHART_WIDTH_CONTROL,
      height: CHART_HEIGHT_CONTROL,
      pointSize: { controlType: 'number', min: 2, max: 14, step: 1 },
      pointOpacity: { controlType: 'number', min: 0, max: 1, step: 0.05 },
      pointColor: { controlType: 'color', colorPresets: CHART_COLOR_PRESETS },
      trendlineColor: { controlType: 'color', colorPresets: CHART_COLOR_PRESETS },
    },
  },
  SparklineChart: {
    id: 'SparklineChart',
    component: 'SparklineChart',
    initialProps: {
      width: 220,
      height: 80,
      data: SPARKLINE_CHART_DATA,
      fill: true,
      fillOpacity: 0.18,
      smooth: true,
      showPoints: false,
      pointSize: 4,
      strokeWidth: 2.5,
      highlightLast: false,
      domain: { y: [20, 80] },
    },
    pinnedProps: ['width', 'height', 'color', 'fill', 'fillOpacity', 'smooth', 'showPoints', 'pointSize', 'strokeWidth', 'highlightLast', 'highlightExtrema'],
    hiddenProps: CHART_HIDDEN_PROPS,
    controlOverrides: {
      width: { controlType: 'number', min: 120, max: 480, step: 20 },
      height: { controlType: 'number', min: 40, max: 200, step: 10 },
      color: { controlType: 'color', colorPresets: CHART_COLOR_PRESETS },
      fillOpacity: { controlType: 'number', min: 0, max: 1, step: 0.02 },
      pointSize: { controlType: 'number', min: 2, max: 10, step: 1 },
      strokeWidth: { controlType: 'number', min: 0.5, max: 6, step: 0.5 },
    },
    previewWrapper: (node) => React.createElement(View, { style: { alignItems: 'center' } }, node),
  },
  StackedAreaChart: {
    id: 'StackedAreaChart',
    component: 'StackedAreaChart',
    initialProps: {
      title: 'Active users by surface',
      subtitle: 'Monthly totals',
      width: 560,
      height: 340,
      series: STACKED_AREA_SERIES,
      stackOrder: 'normal',
      stackMode: 'absolute',
      opacity: 0.65,
      grid: { show: true },
      xAxis: { show: true },
      yAxis: { show: true },
      legend: { show: true, position: 'bottom' },
      enableCrosshair: true,
      multiTooltip: true,
      liveTooltip: true,
    },
    pinnedProps: ['width', 'height', 'stackOrder', 'stackMode', 'opacity', 'smooth', 'lineThickness', 'lineStyle', 'showPoints', 'enableCrosshair', 'multiTooltip', 'liveTooltip'],
    hiddenProps: CHART_HIDDEN_PROPS,
    controlOverrides: {
      width: CHART_WIDTH_CONTROL,
      height: CHART_HEIGHT_CONTROL,
      stackOrder: { controlType: 'segmented', options: ['normal', 'reverse'] },
      stackMode: { controlType: 'segmented', options: ['absolute', 'percentage'] },
      lineStyle: { controlType: 'segmented', options: ['solid', 'dashed', 'dotted'] },
      opacity: { controlType: 'number', min: 0, max: 1, step: 0.05 },
      lineThickness: { controlType: 'number', min: 0, max: 6, step: 0.5 },
    },
  },
  StackedBarChart: {
    id: 'StackedBarChart',
    component: 'StackedBarChart',
    initialProps: {
      title: 'Quarterly ARR by motion',
      width: 520,
      height: 320,
      series: STACKED_BAR_SERIES,
      barSpacing: 0.25,
      grid: { show: true },
      xAxis: { show: true },
      yAxis: { show: true },
      legend: { show: true, position: 'bottom' },
    },
    pinnedProps: ['width', 'height', 'barSpacing'],
    hiddenProps: CHART_HIDDEN_PROPS,
    controlOverrides: {
      width: CHART_WIDTH_CONTROL,
      height: CHART_HEIGHT_CONTROL,
      barSpacing: { controlType: 'number', min: 0, max: 0.9, step: 0.05 },
    },
  },
  ViolinChart: {
    id: 'ViolinChart',
    component: 'ViolinChart',
    initialProps: {
      title: 'Delivery time distribution',
      width: 560,
      height: 360,
      series: VIOLIN_CHART_SERIES,
      samples: 128,
      bandwidth: 3.5,
      showLegend: true,
      legendPosition: 'bottom',
    },
    pinnedProps: ['width', 'height', 'samples', 'bandwidth', 'violinWidthRatio', 'stackOverlap', 'showLegend', 'legendPosition'],
    hiddenProps: CHART_HIDDEN_PROPS,
    controlOverrides: {
      width: CHART_WIDTH_CONTROL,
      height: CHART_HEIGHT_CONTROL,
      samples: { controlType: 'number', min: 16, max: 200, step: 8 },
      bandwidth: { controlType: 'number', min: 0.5, max: 8, step: 0.5 },
      violinWidthRatio: { controlType: 'number', min: 0.2, max: 1, step: 0.05 },
      stackOverlap: { controlType: 'number', min: 0, max: 1, step: 0.05 },
      legendPosition: { controlType: 'segmented', options: ['top', 'bottom'] },
    },
  },
};

export function getPlaygroundConfig(id: string): ComponentPlaygroundConfig | null {
  return PLAYGROUND_CONFIGS[id] || null;
}

export function listPlaygroundConfigs(): ComponentPlaygroundConfig[] {
  return Object.values(PLAYGROUND_CONFIGS);
}
