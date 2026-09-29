/*
 * Tree-shaking optimized index file
 * 
 * This file provides granular exports to enable better tree-shaking.
 * Components are exported with explicit named exports to help bundlers
 * eliminate unused code.
 */

// =============================================================================
// CORE SYSTEM EXPORTS
// =============================================================================

// Theme & Provider
export { PlatformBlocksProvider, BUILT_IN_DARK_THEME } from './core/theme/PlatformBlocksProvider';
export { HapticsProvider, useHapticsSettings } from './core/haptics/HapticsProvider';
export { useTheme, useThemeVisuals, useThemeLayout, PlatformBlocksThemeProvider } from './core/theme/ThemeProvider';
export type { ThemeVisuals, ThemeLayout, PlatformBlocksThemeProviderProps } from './core/theme/ThemeProvider';
export { ThemeModeProvider, useThemeMode, type ThemeModeConfig, type ColorSchemeMode } from './core/theme/ThemeModeProvider';
export { createTheme } from './core/theme/utils';
export { DEFAULT_THEME } from './core/theme/defaultTheme';
export { DARK_THEME } from './core/theme/darkTheme';
export { resolveVariantRoles, CORE_COLORS } from './core/theme/variantRoles';
export type { VariantRole, VariantRoles, ResolveVariantOptions } from './core/theme/variantRoles';
export { withAlpha, readableTextOn, contrastRatio, composite, pickReadable } from './core/theme/colorUtils';
export {
  withCssVariableColors,
  createThemeColorVariablesCss,
  themeColorVariables,
  literalText,
  literalBackgrounds,
  literalSurfaces,
  shellChrome,
  shellChromeColors,
} from './core/theme/cssVariableTheme';
export type { ThemeColorVariablesCssOptions, ShellChromeColors, ShellChromeToken } from './core/theme/cssVariableTheme';
export { useColorScheme } from './core/theme/useColorScheme';
export { I18nProvider, useI18n } from './core/i18n';
export { OverlayProvider, useOverlay, useOverlayApi, useOverlays } from './core/providers/OverlayProvider';
export { DirectionProvider, useDirection, useDirectionSafe } from './core/providers/DirectionProvider';
export type { Direction, DirectionContextValue, DirectionProviderProps, StorageController } from './core/providers/DirectionProvider';
export { KeyboardManagerProvider, useKeyboardManager, useKeyboardManagerOptional } from './core/providers/KeyboardManagerProvider';
export type { KeyboardManagerProviderProps, KeyboardManagerContextValue } from './core/providers/KeyboardManagerProvider';
export { AccessibilityProvider, useAccessibility } from './core/accessibility/context';
export { useKeyboardMetricsOptional, useKeyboardFocusOptional } from './core/providers/KeyboardManagerProvider';
export type { KeyboardMetrics, KeyboardFocusApi } from './core/providers/KeyboardManagerProvider';
// Accessibility primitives
export { a11yProps } from './core/accessibility/a11yProps';
export type { A11yOptions, A11yProps, A11yRole, A11yValue } from './core/accessibility/a11yProps';
export { announce } from './core/accessibility/announce';
export type { AnnounceOptions, AnnouncePoliteness } from './core/accessibility/announce';
export { useFieldA11y } from './core/accessibility/useFieldA11y';
export type { UseFieldA11yOptions, UseFieldA11yResult, FieldA11yIds } from './core/accessibility/useFieldA11y';
export { useRovingFocus } from './core/accessibility/useRovingFocus';
export type { UseRovingFocusOptions, UseRovingFocusResult, RovingItemProps, RovingOrientation } from './core/accessibility/useRovingFocus';
export { useListNavigation } from './core/accessibility/useListNavigation';
export type { UseListNavigationOptions, UseListNavigationResult } from './core/accessibility/useListNavigation';
export { useAdjustable } from './core/accessibility/useAdjustable';
export type { UseAdjustableOptions, UseAdjustableResult, AdjustableProps } from './core/accessibility/useAdjustable';
// Motion
export { useReducedMotion } from './core/motion/useReducedMotion';
export { ReducedMotionProvider } from './core/motion/ReducedMotionProvider';
export type { ReducedMotionProviderProps, ReducedMotionSetting } from './core/motion/ReducedMotionProvider';
// Performance helpers
export { useThemedStyles, createThemedStyles } from './core/hooks/useThemedStyles';
export { useLatestCallback } from './core/hooks/useLatestCallback';
// `useSoundHaptics` is the sound system's `triggerHaptic` wrapper. It is exported
// under a distinct name so the root `useHaptics` can stay the documented hook from
// `./hooks/useHaptics` (impactPressIn / notifySuccess / selection …), which is what
// Button, IconButton, and Toast use internally.
export { SoundProvider, useSound, useHaptics as useSoundHaptics, getAllSounds, getSoundsByCategory, createSound, DEFAULT_SOUND_IDS } from './core/sound';
export { useSoundOptional } from './core/sound/context';
export type { SoundAsset, SoundOptions, HapticFeedbackOptions } from './core/sound';
export { factory, polymorphicFactory } from './core/factory';
export { BreakpointProvider } from './core/responsive';

// Design tokens — resolve scale tokens against the current theme (DESIGN §1)
export {
  resolveSpacing,
  resolveRadius,
  resolveFontSize,
  resolveLineHeight,
  resolveIconSize,
  getControlSize,
  stepDown,
  resolveShadow,
  getBreakpoints,
  onColor,
  parsePx,
} from './core/theme/tokens';
export type { ControlSizeMetrics, BreakpointValues, ShadowToken, RadiusInput } from './core/theme/tokens';
export { resolveScrim } from './core/theme/tokens';
export { DEFAULT_TEXT_ROLES, getTextRole, resolveTextRole } from './core/theme/textRoles';
export type { TextRoleName, TextRoleStyle, TextRoles } from './core/theme/types';
export { DEFAULT_Z_INDICES, getZIndex } from './core/theme/zIndices';
export type { ZIndices, ZIndexLayer } from './core/theme/zIndices';
export { getBuiltInTheme } from './core/theme/utils';
export type { PlatformBlocksThemePair, PlatformBlocksThemeOther, ThemeBackgrounds, ControlSizes } from './core/theme/types';
export { themeCssVariables } from './core/theme/cssVariableTheme';
export { getColorSchemeScript, applyColorSchemeMarker } from './core/theme/colorSchemeMarker';
export type { ColorSchemeScriptOptions, ColorSchemeMarkerOptions } from './core/theme/colorSchemeMarker';

// Viewport (one shared, hydration-safe store)
export { useViewport } from './core/responsive';
export type { ViewportState, BreakpointProviderProps } from './core/responsive';

// Component contract (DESIGN §5)
export { useVisibility, withStatics } from './core/factory';
export type { BaseProps, VisibilityProps, FieldHandle, RadiusValue, ColorProp, BreakpointToken } from './core/types/base';
export type { StyleProps, SpacingProps, BoxProps, DimensionProp, SpacingValue } from './core/theme/types';
export { extractStyleProps, useStyleProps, resolveStyleProps } from './core/utils/spacing';

// Platform helpers (DESIGN §2)
export { isWeb, isNative, isIOS, isAndroid, hasDOM, webStyle, webProps } from './core/platform';
export type { WebStyle, WebProps, WebKeyboardEvent, WebMouseEvent } from './core/platform';

// Contexts
export {
  TitleRegistryProvider,
  useTitleRegistry,
  useTitleRegistryOptional,
  type TitleItem
} from './hooks/useTitleRegistration/contexts';

// Core utilities (separate exports for better tree-shaking)
export {
  rem,
  px,
  getSize,
  getFontSize,
  getRadius,
  getShadow,
  getColor,
  debounce,
  throttle,
  measurePerformance,
  measureAsyncPerformance,
  calculateOverlayPositionEnhanced,
  getViewport,
  measureElement,
  pointInRect,
  getScrollPosition,
  clearOverlayPositionCache,
  type Rect,
  type Viewport,
  type PositionResult,
  type PlacementType,
  type PositioningOptions,
} from './core/utils';

export {
  usePopoverPositioning,
  useTooltipPositioning,
  type UsePopoverPositioningOptions,
  type UsePopoverPositioningReturn,
} from './core/hooks/usePopoverPositioning';

export {
  useDropdownPositioning,
  type UseDropdownPositioningOptions,
  type UseDropdownPositioningReturn,
} from './core/hooks/useDropdownPositioning';

// Overlay primitives: layer stack (Escape / Android back / outside press /
// focus), the anchored-overlay hook, and nested hosting inside modals.
export { useLayer, LayerScope, useIsTopLayer } from './core/overlay/useLayer';
export type { UseLayerOptions, UseLayerResult, LayerDismissReason } from './core/overlay/useLayer';
export { handleModalRequestClose } from './core/overlay/layerStack';
export { useFloating } from './core/overlay/useFloating';
export type {
  UseFloatingOptions,
  UseFloatingReturn,
  FloatingRefs,
  FloatingLayer,
  FloatingPopupType,
  FloatingTrigger,
  FloatingDismissReason,
  FloatingRenderOptions,
} from './core/overlay/useFloating';
export { OverlayHost } from './core/overlay/OverlayHost';
export type { OverlayHostProps } from './core/overlay/OverlayHost';
export type { OverlayConfig, OverlayLayerOptions } from './core/providers/OverlayProvider';

// Size system (granular exports)
export {
  resolveSize,
  getIconSize,
  getHeight,
  getSpacing,
  getLineHeight,
  COMPONENT_SIZES,
  SIZE_SCALES,
} from './core/theme/sizes';

// Breakpoints
export { DEFAULT_BREAKPOINTS, resolveResponsiveProp } from './core/theme/breakpoints';

// Hooks (individual exports for better tree-shaking)
export {
  useHotkeys,
  useGlobalHotkeys,
  useEscapeKey,
  useToggleColorScheme,
  useSpotlightToggle,
  globalHotkeys,
  useDeviceInfo,
  useClipboard,
  useControllableState,
  useDisclosure,
  useDebouncedValue,
  useDebouncedCallback,
  useMediaQuery,
  useHover,
  useScrollSpy,
  useMaskedInput,
  useTitleRegistration,
  useOverlayMode,
  useHaptics,
} from './hooks';
export type { UseHapticsOptions, UseHapticsReturn } from './hooks';

// =============================================================================
// COMPONENT EXPORTS (organized by category for better mental model)
// =============================================================================

// Layout Components
export { KeyboardAwareLayout } from './components/KeyboardAwareLayout';
export { Flex } from './components/Flex';
export { Grid, GridItem } from './components/Grid';
export { Masonry } from './components/Masonry';
export {
  AppShell,
  useAppShell,
  useAppShellApi,
  useAppShellLayout,
  AppShellHeader,
  AppShellNavbar,
  AppShellAside,
  AppShellFooter,
  AppShellBottomNav,
  AppShellMain,
  AppShellSection,
  BottomAppBar,
  StatusBarManager,
  useBreakpoint,
  useNavbarHover,
  resolveResponsiveValue,
  APP_SHELL_CSS_VARS,
  createAppShellCss,
  defineAppLayout,
  AppLayoutProvider,
  AppLayoutRenderer,
  useAppLayoutContext
} from './components/AppShell';
export { Row, Column } from './components/Layout';

// Text & Typography
export { Text, H1, H2, H3, H4, H5, H6, P, Small, Strong, Bold, Italic, Emphasis, Underline, Code, Kbd, Mark, Cite, Sub, Sup } from './components/Text';
export { ShimmerText } from './components/ShimmerText';
export { GradientText } from './components/GradientText';
export { Highlight } from './components/Highlight';
export { Title, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6 } from './components/Title';
export { Markdown } from './components/Markdown';

// Form Components
export { Button } from './components/Button';
export { BrandButton } from './components/BrandButton';
export { Input, PasswordInput, TextInputBase } from './components/Input';
export { TextArea } from './components/TextArea';
export { NumberInput } from './components/NumberInput';
export { PinInput } from './components/PinInput';
export { Checkbox } from './components/Checkbox';
export { ControlField, ControlFieldGroup, useControlField, useControlFieldContext, useControlFieldGroup } from './components/ControlField';
export { Radio, RadioGroup } from './components/Radio';
export { Switch } from './components/Switch';
export { ToggleButton, ToggleGroup } from './components/Toggle';
export { ToggleBar } from './components/Toggle';
export { SegmentedControl } from './components/SegmentedControl';
export { Slider, RangeSlider } from './components/Slider';
export { Knob } from './components/Knob';
export { Joystick } from './components/Joystick';
export { Search } from './components/Search';
export { Select } from './components/Select';
export { AutoComplete } from './components/AutoComplete';
export { FileInput } from './components/FileInput';
export { DatePicker, Calendar, MiniCalendar, Month, Day } from './components/DatePicker';
export { MonthPicker } from './components/MonthPicker';
export { YearPicker } from './components/YearPicker';
export { DatePickerInput } from './components/DatePickerInput';
export { MonthPickerInput } from './components/MonthPickerInput';
export { YearPickerInput } from './components/YearPickerInput';
export { Wheel } from './components/Wheel';
export { TimePicker } from './components/TimePicker';
export { TimePickerInput } from './components/TimePickerInput';
export { PhoneInput } from './components/PhoneInput';
export { ColorInput } from './components/ColorInput';
export { ColorPicker } from './components/ColorPicker';
export { ColorSwatch } from './components/ColorSwatch';
export { Rating } from './components/Rating';
export { RollingNumber } from './components/RollingNumber';
export { Form, useFormContext, useOptionalFormContext } from './components/Form';

// Navigation Components
export { Breadcrumbs } from './components/Breadcrumbs';
export { Menu, MenuItem, MenuLabel, MenuDivider, MenuDropdown, MenuSub } from './components/Menu';
export { MenuItemButton } from './components/MenuItemButton';
export { Tabs } from './components/Tabs';
export { Pagination } from './components/Pagination';
export { Stepper } from './components/Stepper';

// Data Display
export { Avatar, AvatarGroup } from './components/Avatar';
export { Badge } from './components/Badge';
export { Blockquote } from './components/Blockquote';
export * from './components/Indicator';
export { Block } from './components/Block';
export { Surface, useSurfaceLevel } from './components/Surface';
export { Card } from './components/Card';
export { Chip } from './components/Chip';
export { DataTable } from './components/DataTable';
export { Disclaimer, ComponentWithDisclaimer, useDisclaimer, withDisclaimer, extractDisclaimerProps } from './components/_internal/Disclaimer';
export { Table } from './components/Table';
export { Timeline } from './components/Timeline';
export { DataList } from './components/DataList';
export { ListGroup, ListGroupItem, ListGroupDivider, ListGroupBody } from './components/ListGroup';
export { TableOfContents } from './components/TableOfContents';
export { Tree, useTreeState } from './components/Tree';
export { NavTree, buildNavTree } from './components/NavTree';

// Feedback Components
export { Alert } from './components/Alert';
export { Progress, ProgressRoot, ProgressSection, ProgressLabel } from './components/Progress';
export { Skeleton } from './components/Skeleton';
export { Loader } from './components/Loader';
export { Gauge } from './components/Gauge';
export { Ring } from './components/Ring';
export {
  Toast,
  ToastProvider, useToast,
  useToastApi,
  onToastsRequested,
  useToastViewportOffset,
  setToastViewportOffset
} from './components/Toast';

export type { ToastViewportOffset, ToastItem } from './components/Toast';
export { useOptionalToast } from './components/Toast';

// Overlay Components
export { Dialog, DialogProvider, DialogRenderer, useDialog, useDialogApi, useDialogs, useSimpleDialog, onDialogsRequested } from './components/Dialog';
export { Tooltip, resolveTooltipProps, getTooltipText } from './components/Tooltip';
export { Overlay } from './components/Overlay';
export { LoadingOverlay } from './components/LoadingOverlay';
export { ContextMenu } from './components/ContextMenu';
export { Popover } from './components/Popover';
export { HoverCard } from './components/HoverCard';
export {
  Spotlight,
  SpotlightProvider,
  useSpotlightStore,
  spotlight,
  createSpotlightStore,
  useSpotlightStoreInstance,
  useDirectSpotlightState,
  directSpotlight,
  onSpotlightRequested
} from './components/Spotlight';
export { FloatingActions } from './components/FloatingActions';

// Permission Components


// Media Components
export { Icon } from './components/Icon';
export { IconButton } from './components/IconButton';
export { Image } from './components/Image';
export { BrandIcon, brandIcons } from './components/BrandIcon';
export { Carousel } from './components/Carousel';
export { Gallery } from './components/Gallery';
export { Video } from './components/Video';
export type {
  VideoProps,
  VideoRef,
  VideoSource,
  VideoState,
  VideoTimelineEvent,
} from './components/Video';
export { AudioPlayer } from './components/AudioPlayer';
export { Waveform } from './components/Waveform';

// Utility Components
export { Collapse } from './components/Collapse';
export { Divider } from './components/Divider';
export { Space } from './components/Space';
export { Link } from './components/Link';
export { CodeBlock } from './components/CodeBlock';
export { CopyButton } from './components/CopyButton/CopyButton';
export { QRCode } from './components/QRCode';
export { KeyCap } from './components/KeyCap';
export { Spoiler } from './components/Spoiler';
export { PressAnimation, withPressAnimation, AnimatedPressable } from './components/_internal/PressAnimation/PressAnimation';

// Specialized Components
export { Accordion } from './components/Accordion';
// =============================================================================
// TYPE EXPORTS (grouped for clarity)
// =============================================================================

// Core types
export type { PlatformBlocksTheme, PlatformBlocksThemeOverride } from './core/theme/types';
export type { PlatformBlocksProviderProps } from './core/theme/PlatformBlocksProvider';
export type { ColorScheme } from './core/theme/useColorScheme';
export type { SizeValue } from './core/theme/sizes';
export {
  COMPONENT_SIZE_ORDER,
  DEFAULT_COMPONENT_SIZE,
  clampComponentSize,
  resolveComponentSize,
} from './core/theme/componentSize';
export type {
  ComponentSize,
  ComponentSizeValue,
} from './core/theme/componentSize';
export type { SizeToken } from './core/theme/types';
export type { ResponsiveProp } from './core/theme/breakpoints';
export type { HotkeyItem, KeyboardModifiers, DeviceInfo, UseDeviceInfoOptions } from './hooks';
export type { UseClipboardOptions, UseClipboardReturnValue } from './hooks';
export type { UseDisclosureCallbacks, UseDisclosureHandlers, UseDisclosureReturn } from './hooks';
export type { ControllableStateAction, UseControllableStateOptions, UseControllableStateReturn } from './hooks';
export type { UseDebouncedValueOptions, UseDebouncedCallbackReturn, UseHoverHandlers, UseHoverReturn } from './hooks';
export type { ScrollSpyOptions, UseScrollSpyItem } from './hooks';
export type { UseMaskedInputOptions, UseMaskedInputReturn } from './hooks';
export type { UseTitleRegistrationOptions } from './hooks';
export type { UseOverlayModeOptions, UseOverlayModeResult } from './hooks';

// Shared gesture plumbing — the pan/scroll-lock layer behind Slider, Knob,
// Joystick and Rating, exported so app code can build its own drag surfaces
// with the same scroll and selection behaviour.
export {
  useDragGesture,
  getGestureSurfaceStyle,
  GESTURE_RESPONDER_LOCK,
} from './core/gestures';
export type {
  DragAxis,
  DragPoint,
  UseDragGestureOptions,
  UseDragGestureResult,
  GestureSurfaceStyleOptions,
} from './core/gestures';

// Component props types (exported alongside components for co-location)
export type { ButtonProps } from './components/Button';
export type { BrandButtonProps, BrandPlatform, BrandConfig } from './components/BrandButton';
export type { TreeProps, TreeNode, TreeNodeState } from './components/Tree';
export type { NavTreeProps, NavTreeItem, BuildNavTreeOptions } from './components/NavTree';
export type { TextProps } from './components/Text';
export type { ShimmerTextProps } from './components/ShimmerText';
export type { GradientTextProps } from './components/GradientText';
export type { HighlightProps } from './components/Highlight';
export type { OverlayProps } from './components/Overlay';
export type { TitleProps } from './components/Title/types';
export type { KeyboardAwareLayoutProps } from './components/KeyboardAwareLayout';
export type { FlexProps } from './components/Flex';
export type { GridProps, GridItemProps } from './components/Grid';
export type { MasonryProps, MasonryItem } from './components/Masonry';
export type { InputProps, PasswordInputProps } from './components/Input';
export type { NumberInputProps } from './components/NumberInput';
export type { PinInputProps } from './components/PinInput';
export type { CheckboxProps } from './components/Checkbox';
export type {
  ControlFieldProps,
  ControlFieldVariant,
  ControlFieldContextValue,
  ControlFieldGroupProps,
} from './components/ControlField';
export type { RadioProps, RadioGroupProps } from './components/Radio';
export type { SwitchProps } from './components/Switch';
export type { ToggleButtonProps, ToggleGroupProps } from './components/Toggle';
export type { ToggleBarProps, ToggleBarOption } from './components/Toggle/ToggleBar';
export type { SegmentedControlProps, SegmentedControlItem, SegmentedControlData } from './components/SegmentedControl';
export type { SliderProps, RangeSliderProps } from './components/Slider';
export type { KnobProps, KnobMark, KnobVariant, KnobBehavior } from './components/Knob';
export type { JoystickProps, JoystickValue, JoystickShape, JoystickVariant } from './components/Joystick';
export type { SearchProps } from './components/Search';
export type { SelectProps, SelectOption } from './components/Select';
export type { AutoCompleteProps, AutoCompleteOption } from './components/AutoComplete';
export type { FileInputProps, FileInputFile } from './components/FileInput';
export type { DatePickerProps, CalendarProps, MiniCalendarProps } from './components/DatePicker';
export type { MonthPickerProps } from './components/MonthPicker';
export type { YearPickerProps } from './components/YearPicker';
export type { DatePickerInputProps } from './components/DatePickerInput';
export type { MonthPickerInputProps } from './components/MonthPickerInput';
export type { YearPickerInputProps } from './components/YearPickerInput';
export type { WheelItem, WheelProps, WheelValue } from './components/Wheel';
export type { TimePickerProps, TimePickerValue } from './components/TimePicker/types';
export type { TimePickerInputProps } from './components/TimePickerInput';
export type { PhoneInputProps } from './components/PhoneInput';
export type { ColorInputProps } from './components/ColorInput';
export type { ColorPickerProps } from './components/ColorPicker';
export type { RatingProps, RatingIcon } from './components/Rating';
export type { RollingNumberProps, RollingNumberTimingFunction } from './components/RollingNumber';
export type { FormProps } from './components/Form';
export type { BreadcrumbsProps } from './components/Breadcrumbs';
export type { MenuProps, MenuItemProps, MenuSubProps } from './components/Menu';
export type { TabsProps, TabItem } from './components/Tabs';
export type { PaginationProps } from './components/Pagination';
export type { StepperProps } from './components/Stepper';
export type { AvatarProps, AvatarGroupProps } from './components/Avatar';
export type { BadgeProps } from './components/Badge';
export type { IndicatorProps } from './components/Indicator';
export type { CardProps } from './components/Card';
export type { SurfaceProps, SurfaceLevel } from './components/Surface';
export type { ChipProps } from './components/Chip';
export type { DataTableProps, DataTableColumn, DataTableFilter, DataTableSort, DataTablePagination } from './components/DataTable';
export type { InputVariant } from './components/Input';
export type { SliderVariant } from './components/Slider';
export type { RadioGroupVariant } from './components/Radio';
export type { DividerVariant } from './components/Divider';
export type { DisclaimerProps, WithDisclaimerProps, ComponentWithDisclaimerProps, DisclaimerSupport } from './components/_internal/Disclaimer';
export type { TableProps } from './components/Table';
export type { TimelineProps } from './components/Timeline';
export type { DataListProps, DataListItemProps, DataListItemLabelProps, DataListItemValueProps, DataListDataItem, DataListOrientation } from './components/DataList';
export type { TableOfContentsProps } from './components/TableOfContents';
export type {
  AlertProps,
  AlertVariant,
  AlertSeverity,
} from './components/Alert';
export type {
  ProgressProps,
  ProgressRootProps,
  ProgressSectionProps,
  ProgressLabelProps,
  ProgressOrientation,
} from './components/Progress';
export type { SkeletonProps } from './components/Skeleton';
export type { LoaderProps } from './components/Loader';
export type { LoadingOverlayProps } from './components/LoadingOverlay';
export type { GaugeProps } from './components/Gauge';
export type { RingProps, RingColorStop, RingRenderContext } from './components/Ring';
export type { ToastProps } from './components/Toast';
export type { DialogProps, DialogConfig, DialogAutoFocus, UseSimpleDialogOptions } from './components/Dialog';
export type { TooltipProps, TooltipConfig, TooltipPropValue } from './components/Tooltip';
export type { ContextMenuProps } from './components/ContextMenu';
export type { PopoverProps, PopoverTargetProps, PopoverDropdownProps } from './components/Popover';
export type { HoverCardProps, HoverCardPosition, HoverCardShadow } from './components/HoverCard';
export type { SpotlightProps } from './components/Spotlight';

export type { BrandIconProps, BrandName } from './components/BrandIcon';
export type { CollapseProps } from './components/Collapse';
export type { IconButtonProps } from './components/IconButton';
export type { CarouselProps } from './components/Carousel';
export type { GalleryProps, GalleryItem } from './components/Gallery';
export type { ImageProps } from './components/Image';
export type { AudioPlayerProps, AudioPlayerRef } from './components/AudioPlayer';
export type { WaveformProps } from './components/Waveform';
export type { DividerProps } from './components/Divider';
export type { SpaceProps } from './components/Space';
export type { LinkProps } from './components/Link';
export type { CodeBlockProps } from './components/CodeBlock';
export type { CopyButtonProps } from './components/CopyButton/types';
export type { QRCodeProps } from './components/QRCode';
export type { KeyCapProps } from './components/KeyCap';
export type { SpoilerProps } from './components/Spoiler';
export type { FloatingActionsProps, FloatingActionItem } from './components/FloatingActions';
export type { PressAnimationProps } from './components/_internal/PressAnimation/PressAnimation';
export type { AccordionProps, AccordionItemType } from './components/Accordion';
export type { MarkdownProps, MarkdownComponentMap } from './components/Markdown';
export type { AppShellProps } from './components/AppShell';
export type { AppShellBottomNavProps, BottomAppBarItem } from './components/AppShell';
export type {
  AppLayoutBlueprint,
  AppLayoutRuntimeContext,
  AppLayoutRuntimeOverrides,
  LayoutEntry,
  LayoutComponentEntry,
  LayoutNavbarConfig,
  LayoutAsideConfig,
  LayoutFooterConfig,
  LayoutBottomNavConfig,
  LayoutMainConfig,
  LayoutOptions,
  LayoutSection,
} from './components/AppShell';

// ---------------------------------------------------------------------------
// Sub-component, handle, and supporting types surfaced by the component
// migration. Generic names are prefixed with their component to keep the root
// namespace unambiguous.
// ---------------------------------------------------------------------------
export type { BlockProps, BlockStyleProps } from './components/Block';
export type { RowProps, ColumnProps } from './components/Layout';
export type { BlockquoteProps } from './components/Blockquote';
export type { BreadcrumbItem } from './components/Breadcrumbs';
export type { PaginationAccessibilityLabels } from './components/Pagination';
export type { StepperStepProps, StepperCompletedProps } from './components/Stepper';
export type { TimelineItemProps } from './components/Timeline';
export type { TableOfContentsControlProps, TocItem } from './components/TableOfContents';
export type { CollapseTiming } from './components/Collapse';
export type { SpoilerControlArgs } from './components/Spoiler';
export type { AccordionRef, AccordionType, AccordionVariant, AccordionToggleDetail, OnAccordionToggle, AccordionAnimationProp } from './components/Accordion';
export type { CodeBlockFile, CodeBlockVariant, CodeBlockColorOverrides, CodeBlockTextPalette, CodeBlockToken } from './components/CodeBlock';
export type { HighlightStyles, HighlightValue } from './components/Highlight';
export type { MarkdownTableAlignment } from './components/Markdown';
export type { SkeletonShape } from './components/Skeleton';
export type { LoaderVariant } from './components/Loader';
export type { ProgressLabelPosition, ProgressFieldProps, ProgressInteractionProps } from './components/Progress';
export type { GaugeTrackProps, GaugeRangeProps, GaugeTicksProps, GaugeLabelsProps, GaugeNeedleProps, GaugeCenterProps, GaugeEasing, GaugeNeedleShape } from './components/Gauge';
export { TableTh, TableTd, TableTr, TableThead, TableTbody, TableTfoot, TableCaption, TableScrollContainer } from './components/Table';
export type { TableData, TableScrollContainerProps, TableSectionProps, TableRowProps, TableCellProps, TableColumnConfig, TableAriaProps } from './components/Table';
export type { ListGroupProps, ListGroupItemProps, ListGroupDividerProps } from './components/ListGroup';
export type { DataTableRowFeatures, DataTableBulkAction, DataTableRowAction, DataTableGroupHeaderInfo, DataTableRowId, DataTableValue, SortDirection as DataTableSortDirection, FilterType as DataTableFilterType, ColumnDataType as DataTableColumnDataType, AggregateType as DataTableAggregateType } from './components/DataTable';
export type { TextAreaProps } from './components/TextArea';
export { FormLayout, FormSection, FormGroup } from './components/FormLayout';
export type { FormLayoutProps, FormSectionProps, FormGroupProps } from './components/FormLayout';
export type { FormFieldProps, FormInputProps, FormLabelProps, FormErrorProps, FormSubmitProps, FormValues, FormFieldDependency, ValidationSchema } from './components/Form';
export type { BaseInputProps, TextInputBaseProps, ExtendedTextInputProps, ValidationRule, ValidatorFunction } from './components/Input';
export type { FileInputSource, FileInputUploadSettings, FileUploadHelpers } from './components/FileInput';
export type { NumberFormat, ThousandsGroupStyle } from './components/NumberInput';
export type { PhoneCountryCode, PhoneChangeMeta, PhoneFormat } from './components/PhoneInput';
export type { SelectHandle } from './components/Select';
export type { AutoCompleteHandle } from './components/AutoComplete';
export type { DatePickerInputHandle } from './components/DatePickerInput';
export type { MonthPickerInputHandle } from './components/MonthPickerInput';
export type { YearPickerInputHandle } from './components/YearPickerInput';
export type { TimePickerInputHandle } from './components/TimePickerInput';
export type { ColorSwatchProps, ColorSwatchRole } from './components/ColorSwatch';
export type { DayProps, MonthProps, MiniCalendarControlProps, CalendarLevel, CalendarType, CalendarValue, DateTimePickerProps } from './components/DatePicker';
export type { ButtonVariant, ButtonAccessibilityProps, PassthroughAccessibilityProps } from './components/Button';
export type { BrandButtonVariant, BrandButtonBreakpoint } from './components/BrandButton';
export type { IconButtonVariant } from './components/IconButton';
export type { CopyButtonVariant } from './components/CopyButton';
export type { ChipVariant } from './components/Chip';
export type { BadgeVariant } from './components/Badge';
export type { ToggleProps, ToggleGroupContextValue, ToggleValue, ToggleGroupValue, ToggleVariant } from './components/Toggle';
export type { KeyCapVariant, KeyCapModifier, KeyCapMetrics, KeyCapStyleProps } from './components/KeyCap';
export { useKeyCapStyles, getKeyCapStyles } from './components/KeyCap';
export type { MenuItemButtonProps, MenuItemColor } from './components/MenuItemButton';
export type { IconProps, IconSize, IconVariant, IconDefinition, IconRegistry, ExternalIconProps, ExternalIconComponent } from './components/Icon';
export { registerIcon, registerIcons, getIconNames, hasIcon } from './components/Icon';
export type { BrandIconDefinition, BrandShape } from './components/BrandIcon';
export type { GalleryModalProps, GalleryThumbnailProps, GalleryControlsProps, GalleryMetadataProps } from './components/Gallery';
export type { VideoControls, VideoTimelineEventData, VideoQuality, VideoPlaybackRate } from './components/Video';
export type { AudioPlayerControls, PlaybackState as AudioPlaybackState, ProgressData as AudioProgressData, AudioLoadData, AudioError, AudioMetadata, KeyboardShortcuts as AudioPlayerKeyboardShortcuts } from './components/AudioPlayer';
export { WaveformSkeleton } from './components/Waveform';
export type { WaveformMarker, PerformanceMetrics as WaveformPerformanceMetrics, WaveformSkeletonProps } from './components/Waveform';
export { QRCodeSVG } from './components/QRCode';
export type { QRCodeSVGProps } from './components/QRCode';
export type { MasonryViewToken, MasonryFlashListProps } from './components/Masonry';
export { MobileMenu, resolveNavbarReservedWidth, resolveContentBottom, isMobileBreakpoint, DEFAULT_HEADER, DEFAULT_NAVBAR, DEFAULT_ASIDE, DEFAULT_FOOTER, DEFAULT_BOTTOM_NAV, APP_SHELL_META } from './components/AppShell';
export type { AppShellHeaderProps, AppShellNavbarProps, AppShellAsideProps, AppShellFooterProps, AppShellMainProps, AppShellSectionProps, MobileMenuProps, MobileMenuConfig, StatusBarManagerProps, StatusBarConfig, HeaderConfig, NavbarConfig, AsideConfig, FooterConfig, BottomNavConfig, LayoutVisibilityConfig, LayoutType as AppShellLayoutType, ResponsiveSize as AppShellResponsiveSize, Breakpoint as AppShellBreakpoint, AppShellContextValue, AppShellApi, AppShellLayoutValue, AppShellCssConfig, AppShellCssOptions, AppShellCssVar, AppLayoutProviderProps, AppLayoutRendererProps, LayoutMainExtraProps } from './components/AppShell';
export { ancestorIds, findNode, findNodeByHref, collectBranchIds, buildParentMap } from './components/Tree';
export type { TreeRow, TreeRenderNode, TreeCheckState, TreeDisclosure, TreePressEvent, UseTreeStateOptions, TreeStateResult } from './components/Tree';
export { groupNodeId, isGroupNodeId, GROUP_ID_PREFIX } from './components/NavTree';
export { useMenuContext, useMenuStyles } from './components/Menu';
export type { MenuLabelProps, MenuDividerProps, MenuDropdownProps, MenuPosition } from './components/Menu';
export type { TooltipEvents, TooltipPositionType } from './components/Tooltip';
export type { ContextMenuItem, ContextMenuTriggerProps } from './components/ContextMenu';
export type { DialogFocusable, DialogVariant, DialogContextValue } from './components/Dialog';
export { useActiveToasts, toasts } from './components/Toast';
export type { ToastOptions, ToastStackPosition, ToastPosition, ToastDirection, ToastVariant, ToastSeverity, ToastAction, SeverityToastOptions, ToastShortcut, ToastMessage, ToastQueueOptions } from './components/Toast';
export type { PopoverMiddlewares, FloatingStrategy, ArrowPosition } from './components/Popover';
export type { SpotlightSearchProps, SpotlightActionProps, SpotlightActionData, SpotlightItem, SpotlightStore } from './components/Spotlight';
export { SoundButton } from './components/Button/SoundButton';
export type { SoundButtonProps } from './components/Button/SoundButton';
export type { UseScrollSpyReturn } from './hooks/useScrollSpy';
export type { UseTitleRegistrationReturn } from './hooks/useTitleRegistration';
export type { CheckboxLabelPosition } from './components/Checkbox';
export type { SwitchVariant, SwitchLabelPosition } from './components/Switch';
export type { RadioGroupOption, RadioLabelPosition } from './components/Radio';
export type { ControlFieldIds, ControlFieldPart, ControlFieldLabelProps, ControlFieldDescriptionProps, ControlFieldIndicatorProps, ControlFieldErrorProps } from './components/ControlField';
export type { SliderBaseProps, SliderTick } from './components/Slider';
