/**
 * Snack entry point (`@platform-blocks/ui/snack`).
 *
 * The main barrel bundles every component into a single ~2 MB file, which
 * Expo's package bundler (Snackager) will not finish building. This entry
 * re-exports a curated subset from individual module paths so the graph stays
 * small enough to bundle, which is what the "Open in Snack" buttons on the
 * docs site depend on.
 *
 * Deliberately excluded — each statically imports a package that is neither
 * bundled into Expo Go nor worth its bundle weight here:
 *   DataTable, Masonry      -> @shopify/flash-list
 *   Carousel                -> react-native-reanimated-carousel
 *   ShimmerText             -> @react-native-masked-view/masked-view
 *   Waveform, Video         -> expo-asset / expo-audio
 *   BrandButton             -> full brand icon set
 *
 * CodeBlock and FileInput are *included* despite the heavy dependencies they
 * are documented as needing: both reach them through
 * utils/optionalModule.ts, which resolves at runtime and degrades when the
 * module is absent, so neither lands in this graph.
 *
 * Keep `SNACK_COMPONENTS` in apps/platform-blocks.com/utils/snackUrl.ts in sync
 * with what is exported here.
 */

// Theme & provider
export { PlatformBlocksProvider } from './core/theme/PlatformBlocksProvider';
export { useTheme, useThemeVisuals, useThemeLayout } from './core/theme/ThemeProvider';
export { ThemeModeProvider, useThemeMode } from './core/theme/ThemeModeProvider';
export { createTheme } from './core/theme/utils';
export { DEFAULT_THEME } from './core/theme/defaultTheme';
export { DARK_THEME } from './core/theme/darkTheme';
export { useColorScheme } from './core/theme/useColorScheme';

// Layout
export { Block } from './components/Block';
export { Flex } from './components/Flex';
export { Grid, GridItem } from './components/Grid';
export { Row, Column } from './components/Layout';
export { Card } from './components/Card';
export { Surface } from './components/Surface';
export { Divider } from './components/Divider';
export { Space } from './components/Space';
export { Collapse } from './components/Collapse';

// Typography
export { Text, H1, H2, H3, H4, H5, H6, P, Small, Strong, Bold, Italic, Code, Kbd, Mark } from './components/Text';
export { Title } from './components/Title';
export { Highlight } from './components/Highlight';
export { Blockquote } from './components/Blockquote';

// Buttons & inputs
export { Button } from './components/Button';
export { IconButton } from './components/IconButton';
export { Input, PasswordInput } from './components/Input';
export { TextArea } from './components/TextArea';
export { NumberInput } from './components/NumberInput';
export { PinInput } from './components/PinInput';
export { Checkbox } from './components/Checkbox';
export { Radio, RadioGroup } from './components/Radio';
export { Switch } from './components/Switch';
export { ToggleButton, ToggleGroup } from './components/Toggle';
export { SegmentedControl } from './components/SegmentedControl';
export { Slider, RangeSlider } from './components/Slider';
export { Search } from './components/Search';
export { Select } from './components/Select';
export { Rating } from './components/Rating';
export { ColorSwatch } from './components/ColorSwatch';
export { Knob } from './components/Knob';
export { AutoComplete } from './components/AutoComplete';
export { ColorInput } from './components/ColorInput';
export { PhoneInput } from './components/PhoneInput';
export { FileInput } from './components/FileInput';

// Date & time
export { Calendar } from './components/Calendar';
export { MiniCalendar } from './components/MiniCalendar';
export { DatePicker } from './components/DatePicker';
export { DatePickerInput } from './components/DatePickerInput';
export { TimePicker } from './components/TimePicker';

// Navigation
export { Breadcrumbs } from './components/Breadcrumbs';
export { Menu, MenuItem, MenuLabel, MenuDivider, MenuDropdown } from './components/Menu';
export { Tabs } from './components/Tabs';
export { Pagination } from './components/Pagination';
export { Stepper } from './components/Stepper';
export { TableOfContents } from './components/TableOfContents';

// Data display
export { Accordion } from './components/Accordion';
export { Avatar, AvatarGroup } from './components/Avatar';
export { Badge } from './components/Badge';
export { Chip } from './components/Chip';
export { Table } from './components/Table';
export { Timeline } from './components/Timeline';
export { DataList } from './components/DataList';
export { ListGroup, ListGroupItem, ListGroupDivider, ListGroupBody } from './components/ListGroup';
export { Tree } from './components/Tree';

// Feedback
export { Alert, Notice } from './components/Alert';
export { Progress } from './components/Progress';
export { Skeleton } from './components/Skeleton';
export { Loader } from './components/Loader';
export { Ring } from './components/Ring';
export { Gauge } from './components/Gauge';
export { Tooltip } from './components/Tooltip';
export { Popover } from './components/Popover';
export { Overlay } from './components/Overlay';
export { LoadingOverlay } from './components/LoadingOverlay';

// Already in this bundle's graph via the components above, so exporting them
// costs no extra size — see the demo coverage note in snack.ts's header.
export { Toast, ToastProvider, useToast, useToastApi } from './components/Toast';
export { Dialog, DialogProvider, useDialog, useDialogApi, useSimpleDialog } from './components/Dialog';
export { Spotlight, SpotlightProvider, spotlight, useSpotlightStoreInstance } from './components/Spotlight';
export { BrandIcon, brandIcons, resolveBrandName } from './components/BrandIcon';
export { ControlField, ControlFieldGroup, useControlField } from './components/ControlField';
export { Indicator } from './components/Indicator';

// Media & utility
export { Icon } from './components/Icon';
export { Image } from './components/Image';
export { Link } from './components/Link';
export { QRCode } from './components/QRCode';
export { CopyButton } from './components/CopyButton/CopyButton';
export { KeyCap } from './components/KeyCap';
export { Spoiler } from './components/Spoiler';
export { Markdown } from './components/Markdown';
export { CodeBlock } from './components/CodeBlock';

// Hooks commonly used by demos
export { useDisclosure } from './hooks/useDisclosure';
export { useClipboard } from './hooks/useClipboard';
export { useDebouncedValue } from './hooks/useDebouncedValue';
export { useMediaQuery } from './hooks/useMediaQuery';
export { useHover } from './hooks/useHover';
