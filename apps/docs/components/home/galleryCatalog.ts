import { CORE_COMPONENTS, type CoreComponentConfig } from '../../config/coreComponents';

export const GALLERY_TABS = [
  'Essentials', 'Forms', 'Selection', 'Feedback', 'Data', 'Media',
  'Navigation', 'Overlays', 'Layout', 'Charts',
] as const;

export type GalleryTab = typeof GALLERY_TABS[number];

// These already have live examples in ComponentGallery or ChartDemos. Radio and
// Toggle are catalog families demonstrated by RadioGroup and ToggleGroup.
const INLINE_EXAMPLES = new Set([
  'Accordion', 'Alert', 'AutoComplete', 'Avatar', 'Badge', 'Block', 'Button',
  'Calendar', 'Card', 'Checkbox', 'Chip', 'DatePickerInput', 'Gauge', 'Grid',
  'Icon', 'IconButton', 'Image', 'Input', 'KeyCap', 'Lightbox', 'Loader',
  'NumberInput', 'Pagination', 'PinInput', 'Progress', 'Radio', 'Rating',
  'Search', 'Select', 'Skeleton', 'Slider', 'Switch', 'Tabs', 'Text',
  'TextArea', 'TimePickerInput', 'Timeline', 'Title', 'Toast', 'Toggle',
  'Tooltip', 'Video', 'Waveform', 'AreaChart', 'BarChart', 'PieChart',
]);

const CATEGORY_TABS: Record<CoreComponentConfig['category'], GalleryTab> = {
  input: 'Forms',
  display: 'Essentials',
  layout: 'Layout',
  typography: 'Essentials',
  feedback: 'Feedback',
  navigation: 'Navigation',
  overlay: 'Overlays',
  form: 'Forms',
  data: 'Data',
  charts: 'Charts',
  media: 'Media',
  dates: 'Forms',
  others: 'Essentials',
};

const COMPONENT_TABS: Record<string, GalleryTab> = {
  BrandButton: 'Essentials',
  CopyButton: 'Essentials',
  Link: 'Essentials',
  Carousel: 'Media',
  MiniCalendar: 'Data',
  ListGroup: 'Data',
  RollingNumber: 'Data',
  Tree: 'Data',
  Indicator: 'Feedback',
  ShimmerText: 'Feedback',
  Knob: 'Selection',
  Wheel: 'Selection',
  Joystick: 'Selection',
  SegmentedControl: 'Selection',
  ColorPicker: 'Selection',
  ColorSwatch: 'Selection',
  EmojiPicker: 'Selection',
  ControlField: 'Selection',
  FloatingIndicator: 'Selection',
};

export function getGalleryComponents(tab: GalleryTab): CoreComponentConfig[] {
  return CORE_COMPONENTS.filter(component =>
    !INLINE_EXAMPLES.has(component.name)
    && (COMPONENT_TABS[component.name] ?? CATEGORY_TABS[component.category]) === tab
  );
}
