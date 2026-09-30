/**
 * Snack entry point (`@plocks/ui-snack`).
 *
 * Expo's package bundler (Snackager) cannot finish building the full UI
 * barrel. This separate package bundles a curated subset for the docs site's
 * "Open in Snack" buttons without adding it to ordinary UI installs.
 *
 * Not exported here, to keep the graph small: DataTable, ShimmerText
 * and Waveform. None of them imports an optional peer statically any more —
 * @shopify/flash-list and @react-native-masked-view/masked-view are loaded
 * lazily through utils/optionalModule.ts and degrade when absent — so any of
 * them can be added if the docs need it in Snack.
 *
 * FileInput is included: expo-document-picker is likewise required lazily
 * inside try/catch and falls back when the module is absent.
 *
 * Components from the other @plocks packages (dates, code, media, carousel,
 * spotlight, brands, qrcode) are not part of this entry; a Snack that uses one depends on
 * that package directly.
 *
 * scripts/generate-snack-exports.ts reads this list for the docs site.
 */

// Theme & provider
export { PlocksProvider } from '../../ui/src/core/theme/PlocksProvider';
export { useTheme, useThemeVisuals, useThemeLayout } from '../../ui/src/core/theme/ThemeProvider';
export { useThemeMode } from '../../ui/src/core/theme/ThemeModeProvider';
export { createTheme } from '../../ui/src/core/theme/utils';
export { DEFAULT_THEME } from '../../ui/src/core/theme/defaultTheme';
export { DARK_THEME } from '../../ui/src/core/theme/darkTheme';
export { useColorScheme } from '../../ui/src/core/theme/useColorScheme';

// Layout
export { Block } from '../../ui/src/components/Block';
export { SafeArea } from '../../ui/src/components/SafeArea';
export { ScrollArea } from '../../ui/src/components/ScrollArea';
export { KeyboardAvoidingArea } from '../../ui/src/components/KeyboardAvoidingArea';
export { MotionBlock } from '../../ui/src/components/MotionBlock';
export { BackgroundImage } from '../../ui/src/components/BackgroundImage';
export { Gradient } from '../../ui/src/components/Gradient';
export { AppShell } from '../../ui/src/components/AppShell';
export { Flex } from '../../ui/src/components/Flex';
export { Grid, GridItem } from '../../ui/src/components/Grid';
export { Row, Column } from '../../ui/src/components/Layout';
export { Card } from '../../ui/src/components/Card';
export { StickyNote } from '../../ui/src/components/StickyNote';
export { Surface } from '../../ui/src/components/Surface';
export { Divider } from '../../ui/src/components/Divider';
export { Space } from '../../ui/src/components/Space';
export { Collapse } from '../../ui/src/components/Collapse';

// Typography
export { Text, H1, H2, H3, H4, H5, H6, P, Small, Strong, Bold, Italic, Code, Kbd, Mark } from '../../ui/src/components/Text';
export { Title } from '../../ui/src/components/Title';
export { Highlight } from '../../ui/src/components/Highlight';
export { Blockquote } from '../../ui/src/components/Blockquote';

// Buttons & inputs
export { Button } from '../../ui/src/components/Button';
export { IconButton } from '../../ui/src/components/IconButton';
export { Input, PasswordInput } from '../../ui/src/components/Input';
export { TextArea } from '../../ui/src/components/TextArea';
export { NumberInput } from '../../ui/src/components/NumberInput';
export { PinInput } from '../../ui/src/components/PinInput';
export { Checkbox } from '../../ui/src/components/Checkbox';
export { Radio, RadioGroup } from '../../ui/src/components/Radio';
export { Switch } from '../../ui/src/components/Switch';
export { ToggleButton, ToggleGroup } from '../../ui/src/components/Toggle';
export { SegmentedControl } from '../../ui/src/components/SegmentedControl';
export { Slider, RangeSlider } from '../../ui/src/components/Slider';
export { Search } from '../../ui/src/components/Search';
export { Select } from '../../ui/src/components/Select';
export { Rating } from '../../ui/src/components/Rating';
export { ColorSwatch } from '../../ui/src/components/ColorSwatch';
export { Knob } from '../../ui/src/components/Knob';
export { AutoComplete } from '../../ui/src/components/AutoComplete';
export { ColorInput } from '../../ui/src/components/ColorInput';
export { PhoneInput } from '../../ui/src/components/PhoneInput';
export { FileInput } from '../../ui/src/components/FileInput';

// Date & time
export { Wheel } from '../../ui/src/components/Wheel';

// Navigation
export { Breadcrumbs } from '../../ui/src/components/Breadcrumbs';
export { Menu, MenuItem, MenuLabel, MenuDivider, MenuDropdown } from '../../ui/src/components/Menu';
export { Tabs } from '../../ui/src/components/Tabs';
export { Pagination } from '../../ui/src/components/Pagination';
export { Stepper } from '../../ui/src/components/Stepper';
export { TableOfContents } from '../../ui/src/components/TableOfContents';

// Data display
export { Accordion } from '../../ui/src/components/Accordion';
export { Avatar, AvatarGroup } from '../../ui/src/components/Avatar';
export { Badge } from '../../ui/src/components/Badge';
export { Chip } from '../../ui/src/components/Chip';
export { Table } from '../../ui/src/components/Table';
export { Timeline } from '../../ui/src/components/Timeline';
export { DataList } from '../../ui/src/components/DataList';
export { ListGroup, ListGroupItem, ListGroupDivider, ListGroupBody } from '../../ui/src/components/ListGroup';
export { Tree } from '../../ui/src/components/Tree';

// Feedback
export { Alert } from '../../ui/src/components/Alert';
export { Progress } from '../../ui/src/components/Progress';
export { Skeleton } from '../../ui/src/components/Skeleton';
export { Loader } from '../../ui/src/components/Loader';
export { Ring } from '../../ui/src/components/Ring';
export { Gauge } from '../../ui/src/components/Gauge';
export { Tooltip } from '../../ui/src/components/Tooltip';
export { Popover } from '../../ui/src/components/Popover';
export { Overlay } from '../../ui/src/components/Overlay';
export { LoadingOverlay } from '../../ui/src/components/LoadingOverlay';

// Already in this bundle's graph via the components above, so exporting them
// costs no extra size — see the demo coverage note above.
export { Toast, ToastProvider, useToast, useToastApi } from '../../ui/src/components/Toast';
export { Dialog, DialogProvider, useDialog, useDialogApi, useSimpleDialog } from '../../ui/src/components/Dialog';
export { ControlField, ControlFieldGroup, useControlField } from '../../ui/src/components/ControlField';
export { Indicator } from '../../ui/src/components/Indicator';

// Media & utility
export { Icon } from '../../ui/src/components/Icon';
export { Image } from '../../ui/src/components/Image';
export { Lightbox } from '../../ui/src/components/Lightbox';
export type { LightboxItem } from '../../ui/src/components/Lightbox';
export { Masonry } from '../../ui/src/components/Masonry';
export { Link } from '../../ui/src/components/Link';
export { CopyButton } from '../../ui/src/components/CopyButton/CopyButton';
export { KeyCap } from '../../ui/src/components/KeyCap';
export { Spoiler } from '../../ui/src/components/Spoiler';

// Hooks commonly used by demos
export { useDisclosure } from '../../ui/src/hooks/useDisclosure';
export { useClipboard } from '../../ui/src/hooks/useClipboard';
export { useDebouncedValue } from '../../ui/src/hooks/useDebouncedValue';
export { useMediaQuery } from '../../ui/src/hooks/useMediaQuery';
export { useHover } from '../../ui/src/hooks/useHover';

// Mantine-inspired components
export { ActionBar, ActionBarDivider, ActionBarCloseButton } from '../../ui/src/components/ActionBar';
export { Menubar, MenubarMenu, MenubarTarget, MenubarDropdown } from '../../ui/src/components/Menubar';
export { EmptyState, EmptyStateIndicator, EmptyStateTitle, EmptyStateDescription, EmptyStateActions } from '../../ui/src/components/EmptyState';
export { ComboboxPopover, ComboboxPopoverTarget } from '../../ui/src/components/ComboboxPopover';
export { TreeSelect } from '../../ui/src/components/TreeSelect';
export { FloatingWindow, FloatingWindowDragHandle, FloatingWindowResizeHandle, useFloatingWindow } from '../../ui/src/components/FloatingWindow';
export { OverflowList } from '../../ui/src/components/OverflowList';
export { Marquee } from '../../ui/src/components/Marquee';
export { Scroller, useScroller } from '../../ui/src/components/Scroller';
export { Splitter, SplitterPane, useSplitter } from '../../ui/src/components/Splitter';
export { Cascader } from '../../ui/src/components/Cascader';
export { FloatingIndicator } from '../../ui/src/components/FloatingIndicator';
