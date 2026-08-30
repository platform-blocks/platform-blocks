/**
 * Configuration for core components that should be displayed in the /components page
 * This ensures only the main UI components are shown, filtering out internal utilities,
 * context providers, and other non-user-facing components.
 */

export interface CoreComponentConfig {
  name: string;
  category: 'input' | 'display' | 'layout' | 'typography' | 'feedback' | 'navigation' | 'overlay' | 'form' | 'data' | 'charts' | 'media' | 'dates' | 'others';
  // Internal Icon name from @platform-blocks/react-ui-library Icon registry
  icon: string;
  description?: string;
}

/**
 * List of core components to show in the components explorer
 * Components not in this list will be hidden from the main /components page
 */
export const CORE_COMPONENTS: CoreComponentConfig[] = [

  // Basic Components
  { name: 'Button', category: 'input', icon: 'button' },
  { name: 'Checkbox', category: 'input', icon: 'check' },
  { name: 'Switch', category: 'input', icon: 'toggle' },
  { name: 'Toggle', category: 'input', icon: 'toggle', description: 'Toggle button group for single or multiple selection' },
  { name: 'BrandButton', category: 'input', icon: 'bolt', description: 'Branded action button and store badge for every brand in the icon registry' },
  { name: 'Radio', category: 'input', icon: 'radio' },
  { name: 'IconButton', category: 'input', icon: 'button', description: 'Icon-only button with the Button variant and size API' },
  { name: 'Rating', category: 'input', icon: 'rating' },

  // Input Components
  { name: 'Input', category: 'input', icon: 'input', description: 'Base text field surface with keyboard-manager integration' },
  { name: 'FileInput', category: 'input', icon: 'file', description: 'File input with drag-and-drop support' },
  { name: 'NumberInput', category: 'input', icon: 'number', description: 'Numeric text input with step controls and formatting options' },
  { name: 'PhoneInput', category: 'input', icon: 'phone', description: 'Masked phone number input with international support' },
  { name: 'PinInput', category: 'input', icon: 'pin' },
  { name: 'Search', category: 'input', icon: 'search', description: 'Search input with debouncing and customizable features' },
  { name: 'Select', category: 'input', icon: 'select', description: 'Dropdown selection input with keyboard-aware dismissal defaults' },
  { name: 'Slider', category: 'input', icon: 'slider' },
  { name: 'Knob', category: 'input', icon: 'knob', description: 'Rotary knob input for selecting values within a range' },
  { name: 'Joystick', category: 'input', icon: 'target', description: 'Two-axis stick and XY pad input with dead zone, stepping, and axis locking' },
  { name: 'TextArea', category: 'input', icon: 'textarea', description: 'Multi-line text input with auto-resize and character counter' },
  { name: 'AutoComplete', category: 'input', icon: 'autocomplete', description: 'Predictive text input with keyboard-aware suggestions and async loading' },
  { name: 'ColorInput', category: 'input', icon: 'colors', description: 'Color selection input with swatches and hex input' },
  { name: 'ColorPicker', category: 'input', icon: 'colors', description: 'Color selection input with swatches' },
  { name: 'ControlField', category: 'input', icon: 'check', description: 'Pressable row combining a label, description, and a switch/checkbox/radio control' },
  { name: 'Form', category: 'input', icon: 'form', description: 'Manages values, validation, and submission state for a group of inputs' },
  { name: 'SegmentedControl', category: 'input', icon: 'splitTrack' },
  { name: 'CopyButton', category: 'input', icon: 'copy', description: 'Utility to copy content to clipboard with feedback' },

  // Date Components
  { name: 'Calendar', category: 'dates', icon: 'calendar', description: 'A versatile calendar component for selecting dates, months, and years with customizable styles and behaviors.' },
  { name: 'MiniCalendar', category: 'dates', icon: 'calendar', description: 'A compact calendar component for displaying a month view with selectable dates.' },
  { name: 'TimePicker', category: 'dates', icon: 'clock', description: 'Inline time panel with hour/minute columns' },
  { name: 'TimePickerInput', category: 'dates', icon: 'clock', description: 'Time field that opens the picker panel in a dialog' },
  { name: 'DatePicker', category: 'dates', icon: 'calendar' },
  { name: 'DatePickerInput', category: 'dates', icon: 'calendar', description: 'Date selection input with dropdown calendar' },
  { name: 'MonthPicker', category: 'dates', icon: 'calendar', description: 'Month selection input with dropdown calendar' },
  { name: 'MonthPickerInput', category: 'dates', icon: 'calendar', description: 'Month selection input with dropdown calendar interface' },
  { name: 'YearPicker', category: 'dates', icon: 'calendar', description: 'Year selection input with dropdown calendar' },
  { name: 'YearPickerInput', category: 'dates', icon: 'calendar', description: 'Year selection input with dropdown calendar interface' },

  // Display Components
  { name: 'Avatar', category: 'display', icon: 'avatar' },
  { name: 'Collapse', category: 'display', icon: 'accordion', description: 'Animated height collapse/expand container for showing/hiding content' },
  { name: 'Carousel', category: 'display', icon: 'carousel' },
  { name: 'Spoiler', category: 'display', icon: 'spoiler', description: 'Hides content until clicked' },
  { name: 'ColorSwatch', category: 'display', icon: 'colors', description: 'Individual color swatch for use in color palettes and pickers' },
  { name: 'Accordion', category: 'display', icon: 'accordion' },
  { name: 'ListGroup', category: 'display', icon: 'list', description: 'Grouped list rows with headers, dividers, and pressable items' },
  { name: 'RollingNumber', category: 'display', icon: 'number', description: 'Animated number readout that rolls each changed digit into place' },


  // Typography Components
  { name: 'Text', category: 'typography', icon: 'text' },
  { name: 'Title', category: 'typography', icon: 'title', description: 'Semantic heading component with size & level mapping' },
  { name: 'Highlight', category: 'typography', icon: 'highlight', description: 'Highlight text with background color for emphasis' },
  { name: 'CodeBlock', category: 'typography', icon: 'code' },
  { name: 'KeyCap', category: 'typography', icon: 'keycap', description: 'Display keyboard shortcuts with press animations' },
  { name: 'GradientText', category: 'typography', icon: 'text', description: 'Text component with gradient color support' },
  { name: 'ShimmerText', category: 'typography', icon: 'text', description: 'Animated shimmering text placeholder for loading states' },
  { name: 'Icon', category: 'typography', icon: 'star' },
  { name: 'BrandIcon', category: 'typography', icon: 'star', description: 'Brand icons for popular platforms (e.g. Apple, Google, Facebook, etc.) with built-in dark mode support.'},

  // Data Components
  { name: 'Indicator', category: 'data', icon: 'indicator', description: 'Status indicator dot with color and size options' },
  { name: 'Chip', category: 'data', icon: 'chip' },
  { name: 'Badge', category: 'data', icon: 'badge', description: 'Small status or counter indicator positioned on a parent element' },
  { name: 'Table', category: 'data', icon: 'table' },
  { name: 'DataTable', category: 'data', icon: 'datatable', description: 'Data grid with sorting, filtering, and pagination' },
  { name: 'DataList', category: 'data', icon: 'list', description: 'Display label/value pairs in a semantic description list' },
  { name: 'QRCode', category: 'data', icon: 'qrcode' },
  { name: 'Markdown', category: 'data', icon: 'markdown' },
  { name: 'Timeline', category: 'data', icon: 'timeline', description: 'Display sequence of events in chronological order' },

  // Layout Components
  { name: 'AppShell', category: 'layout', icon: 'paddingFrame', description: 'Application frame with header, navbar, aside, footer, and mobile bottom navigation' },
  { name: 'Block', category: 'layout', icon: 'block' },
  { name: 'Surface', category: 'layout', icon: 'layers', description: 'Elevation primitive Card, Menu, Popover and Dialog are built on' },
  { name: 'Card', category: 'display', icon: 'card' },
  { name: 'Flex', category: 'layout', icon: 'flex' },
  { name: 'Grid', category: 'layout', icon: 'grid' },
  { name: 'Masonry', category: 'layout', icon: 'masonry', description: 'Pinterest-style masonry layout with FlashList performance' },
  { name: 'Divider', category: 'layout', icon: 'divider' },
  { name: 'Space', category: 'layout', icon: 'paddingFrame' },
  { name: 'TableOfContents', category: 'navigation', icon: 'tableofcontents', description: 'Auto-generated document outline with anchor navigation' },

  // Feedback Components
  { name: 'Alert', category: 'feedback', icon: 'info', description: 'Prominent inline message tied to a semantic status' },
  { name: 'Blockquote', category: 'typography', icon: 'quote', description: 'Stylized blockquote for highlighting quotes or important text' },
  { name: 'Toast', category: 'feedback', icon: 'toast' },
  { name: 'Progress', category: 'feedback', icon: 'progress' },
  { name: 'Ring', category: 'feedback', icon: 'chart-donut', description: 'Circular progress indicator with configurable labels, color stops, and custom center content.' },
  { name: 'Loader', category: 'feedback', icon: 'loader' },
  { name: 'Skeleton', category: 'feedback', icon: 'bone' },
  { name: 'LoadingOverlay', category: 'feedback', icon: 'progress-shield', description: 'Overlay with centered loader for pending operations' },

  // Navigation Components
  { name: 'Tabs', category: 'navigation', icon: 'tabs' },
  { name: 'Link', category: 'navigation', icon: 'link' },
  { name: 'Menu', category: 'navigation', icon: 'menu' },
  { name: 'MenuItemButton', category: 'navigation', icon: 'menu', description: 'Actionable menu list item with consistent styling' },
  { name: 'Breadcrumbs', category: 'navigation', icon: 'breadcrumbs' },
  { name: 'Pagination', category: 'navigation', icon: 'pagination' },
  { name: 'Stepper', category: 'navigation', icon: 'stepper', description: 'Step-by-step navigation component for multi-step processes' },
  { name: 'Spotlight', category: 'navigation', icon: 'spotlight', description: 'Command palette / global action search interface' },
  { name: 'Tree', category: 'navigation', icon: 'tree', description: 'Hierarchical tree view with expansion, selection, checkboxes, and filtering' },
  { name: 'NavTree', category: 'navigation', icon: 'tree', description: 'Sidebar navigation that nests a flat list of routes into a collapsible tree' },

  // Overlay Components
  { name: 'Dialog', category: 'overlay', icon: 'dialog' },
  { name: 'Overlay', category: 'overlay', icon: 'layer-mask', description: 'Dimmed overlay backdrop for modals and popups' },
  { name: 'Popover', category: 'overlay', icon: 'popover' },
  { name: 'Tooltip', category: 'overlay', icon: 'tooltip' },
  { name: 'ContextMenu', category: 'overlay', icon: 'menu', description: 'Menu opened by right-click on web or long-press on native' },

  // Chart Components
  { name: 'AreaChart', category: 'charts', icon: 'chart-area' },
  { name: 'BarChart', category: 'charts', icon: 'chart-bar' },
  { name: 'BubbleChart', category: 'charts', icon: 'chart-scatter' },
  { name: 'CandlestickChart', category: 'charts', icon: 'chart-line' },
  { name: 'ComboChart', category: 'charts', icon: 'chart-line' },
  { name: 'DonutChart', category: 'charts', icon: 'chart-donut' },
  { name: 'FunnelChart', category: 'charts', icon: 'funnel' },
  { name: 'GaugeChart', category: 'charts', icon: 'speedometer', description: 'Radial gauge visualization with ranges, ticks, and animated needle' },
  { name: 'GroupedBarChart', category: 'charts', icon: 'chart-bar' },
  { name: 'HeatmapChart', category: 'charts', icon: 'chart-heatmap' },
  { name: 'HistogramChart', category: 'charts', icon: 'chart-bar' },
  { name: 'LineChart', category: 'charts', icon: 'chart-line' },
  { name: 'NetworkChart', category: 'charts', icon: 'tree' },
  { name: 'PieChart', category: 'charts', icon: 'chart-pie' },
  { name: 'RadarChart', category: 'charts', icon: 'chart-line' },
  { name: 'RadialBarChart', category: 'charts', icon: 'chart-donut' },
  { name: 'RidgeChart', category: 'charts', icon: 'chart-area' },
  { name: 'SankeyChart', category: 'charts', icon: 'chart-line' },
  { name: 'ScatterChart', category: 'charts', icon: 'chart-scatter' },
  { name: 'SparklineChart', category: 'charts', icon: 'chart-sparkline' },
  { name: 'StackedAreaChart', category: 'charts', icon: 'chart-area' },
  { name: 'StackedBarChart', category: 'charts', icon: 'chart-bar' },
  { name: 'ViolinChart', category: 'charts', icon: 'chart-area' },
  { name: 'ParetoChart', category: 'charts', icon: 'chart-line' },
  { name: 'MarimekkoChart', category: 'charts', icon: 'chart-bar' },

  // Media Components
  { name: 'Image', category: 'media', icon: 'image', description: 'Basic image component with optional caption and overlay' },
  { name: 'Gallery', category: 'media', icon: 'gallery', description: 'A fullscreen image viewer with navigation, thumbnails, and metadata display' },
  { name: 'Video', category: 'media', icon: 'play', description: 'Video player for YouTube, MP4, and other formats with timeline synchronization' },
  { name: 'Waveform', category: 'media', icon: 'waveform', description: 'Audio waveform visualization component' },
  { name: 'AudioPlayer', category: 'media', icon: 'music', description: 'Audio player with a seekable waveform, transport controls, and progress callbacks' },

];

/**
 * Get the configuration for a core component
 */
export function getCoreComponentConfig(componentName: string): CoreComponentConfig | undefined {
  return CORE_COMPONENTS.find(component => component.name === componentName);
}

/**
 * Check if a component is a core component
 */
export function isCoreComponent(componentName: string): boolean {
  return CORE_COMPONENTS.some(component => component.name === componentName);
}

/**
 * Get all core component names
 */
export function getCoreComponentNames(): string[] {
  return CORE_COMPONENTS.map(component => component.name);
}

/**
 * Get core components by category
 */
export function getCoreComponentsByCategory(): Record<string, CoreComponentConfig[]> {
  return CORE_COMPONENTS.reduce((acc, component) => {
    if (!acc[component.category]) {
      acc[component.category] = [];
    }
    acc[component.category].push(component);
    return acc;
  }, {} as Record<string, CoreComponentConfig[]>);
}

/**
 * Get all unique categories from core components in the desired order
 */
export function getCoreCategories(): string[] {
  // Define the desired order of categories
  const categoryOrder: CoreComponentConfig['category'][] = ['charts', 'data', 'input', 'display', 'feedback', 'layout', 'navigation', 'overlay', 'typography', 'media', 'dates', 'others'];

  // Get all categories that actually exist in the components
  const existingCategories = new Set(CORE_COMPONENTS.map(component => component.category));

  // Return categories in the specified order, but only include those that have components
  return categoryOrder.filter(category => existingCategories.has(category));
}

/**
 * Map component categories to colors.
 *
 * Typed against the category union rather than `string`, so adding a category
 * without a color here is a compile error — `dates` silently had no color or
 * icon for its ten components until the categories were reconciled.
 */
export const CATEGORY_COLORS: Record<CoreComponentConfig['category'], 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray'> = {
  charts: 'primary',
  data: 'secondary',
  input: 'success',
  display: 'warning',
  feedback: 'error',
  layout: 'gray',
  navigation: 'primary',
  overlay: 'secondary',
  typography: 'secondary',
  form: 'success',
  media: 'warning',
  dates: 'primary',
  others: 'gray',
};

/**
 * Map component categories to fallback icons. Exhaustive for the same reason as
 * CATEGORY_COLORS.
 */
export const CATEGORY_ICONS: Record<CoreComponentConfig['category'], string> = {
  charts: 'chart-bar',
  data: 'database',
  input: 'plus',
  display: 'star',
  feedback: 'bell',
  layout: 'menu',
  navigation: 'arrow-right',
  overlay: 'layers',
  typography: 'font',
  form: 'search',
  media: 'image',
  dates: 'calendar',
  others: 'ellipsis-h',
};
