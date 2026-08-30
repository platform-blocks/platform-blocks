/**
 * Tabler-backed icon registry — the default icon set for @platform-blocks/react-ui-library.
 *
 * Every icon is a component from `@tabler/icons-react-native`. `<Icon name="..." />`
 * resolves these by key; the Icon component picks `filled`/`outlined` based on the
 * `variant` prop (falling back to outlined when no filled glyph exists).
 */
// Each glyph is deep-imported from its own module rather than pulled off the
// package barrel. Metro does not tree-shake, so a named import from
// '@tabler/icons-react-native' bundles all ~5,900 icons (~4.4 MB) into every
// app that renders a single <Icon />. The '@tabler/icons-react-native/*'
// subpath export resolves to one icon apiece, so only these ship.
//
// To add an icon: add a deep import here and a `name: { outlined: IconX,
// filled?: IconXFilled }` entry below.
import IconAdjustments from '@tabler/icons-react-native/IconAdjustments';
import IconAdjustmentsFilled from '@tabler/icons-react-native/IconAdjustmentsFilled';
import IconAdjustmentsHorizontal from '@tabler/icons-react-native/IconAdjustmentsHorizontal';
import IconAlertCircle from '@tabler/icons-react-native/IconAlertCircle';
import IconAlertCircleFilled from '@tabler/icons-react-native/IconAlertCircleFilled';
import IconAlertTriangle from '@tabler/icons-react-native/IconAlertTriangle';
import IconAlertTriangleFilled from '@tabler/icons-react-native/IconAlertTriangleFilled';
import IconAlignCenter from '@tabler/icons-react-native/IconAlignCenter';
import IconAlignJustified from '@tabler/icons-react-native/IconAlignJustified';
import IconAlignLeft from '@tabler/icons-react-native/IconAlignLeft';
import IconAlignRight from '@tabler/icons-react-native/IconAlignRight';
import IconAppWindow from '@tabler/icons-react-native/IconAppWindow';
import IconArrowBackUp from '@tabler/icons-react-native/IconArrowBackUp';
import IconArrowDown from '@tabler/icons-react-native/IconArrowDown';
import IconArrowForwardUp from '@tabler/icons-react-native/IconArrowForwardUp';
import IconArrowLeft from '@tabler/icons-react-native/IconArrowLeft';
import IconArrowRight from '@tabler/icons-react-native/IconArrowRight';
import IconArrowUp from '@tabler/icons-react-native/IconArrowUp';
import IconArrowsMaximize from '@tabler/icons-react-native/IconArrowsMaximize';
import IconArrowsMinimize from '@tabler/icons-react-native/IconArrowsMinimize';
import IconArrowsSort from '@tabler/icons-react-native/IconArrowsSort';
import IconBadge from '@tabler/icons-react-native/IconBadge';
import IconBan from '@tabler/icons-react-native/IconBan';
import IconBell from '@tabler/icons-react-native/IconBell';
import IconBellFilled from '@tabler/icons-react-native/IconBellFilled';
import IconBinaryTree from '@tabler/icons-react-native/IconBinaryTree';
import IconBluetooth from '@tabler/icons-react-native/IconBluetooth';
import IconBold from '@tabler/icons-react-native/IconBold';
import IconBolt from '@tabler/icons-react-native/IconBolt';
import IconBoltFilled from '@tabler/icons-react-native/IconBoltFilled';
import IconBone from '@tabler/icons-react-native/IconBone';
import IconBookmark from '@tabler/icons-react-native/IconBookmark';
import IconBookmarkFilled from '@tabler/icons-react-native/IconBookmarkFilled';
import IconBorderOuter from '@tabler/icons-react-native/IconBorderOuter';
import IconBox from '@tabler/icons-react-native/IconBox';
import IconBuildingStore from '@tabler/icons-react-native/IconBuildingStore';
import IconCalendar from '@tabler/icons-react-native/IconCalendar';
import IconCalendarFilled from '@tabler/icons-react-native/IconCalendarFilled';
import IconCamera from '@tabler/icons-react-native/IconCamera';
import IconCameraFilled from '@tabler/icons-react-native/IconCameraFilled';
import IconCards from '@tabler/icons-react-native/IconCards';
import IconCarouselHorizontal from '@tabler/icons-react-native/IconCarouselHorizontal';
import IconChartArea from '@tabler/icons-react-native/IconChartArea';
import IconChartBar from '@tabler/icons-react-native/IconChartBar';
import IconChartDonut from '@tabler/icons-react-native/IconChartDonut';
import IconChartDots from '@tabler/icons-react-native/IconChartDots';
import IconChartLine from '@tabler/icons-react-native/IconChartLine';
import IconChartPie from '@tabler/icons-react-native/IconChartPie';
import IconCheck from '@tabler/icons-react-native/IconCheck';
import IconChevronDown from '@tabler/icons-react-native/IconChevronDown';
import IconChevronLeft from '@tabler/icons-react-native/IconChevronLeft';
import IconChevronRight from '@tabler/icons-react-native/IconChevronRight';
import IconChevronUp from '@tabler/icons-react-native/IconChevronUp';
import IconCircle from '@tabler/icons-react-native/IconCircle';
import IconCircleCheck from '@tabler/icons-react-native/IconCircleCheck';
import IconCircleCheckFilled from '@tabler/icons-react-native/IconCircleCheckFilled';
import IconCircleDot from '@tabler/icons-react-native/IconCircleDot';
import IconCircleFilled from '@tabler/icons-react-native/IconCircleFilled';
import IconClipboardList from '@tabler/icons-react-native/IconClipboardList';
import IconClock from '@tabler/icons-react-native/IconClock';
import IconClockFilled from '@tabler/icons-react-native/IconClockFilled';
import IconCode from '@tabler/icons-react-native/IconCode';
import IconColorSwatch from '@tabler/icons-react-native/IconColorSwatch';
import IconColumns from '@tabler/icons-react-native/IconColumns';
import IconContrast from '@tabler/icons-react-native/IconContrast';
import IconContrastFilled from '@tabler/icons-react-native/IconContrastFilled';
import IconCopy from '@tabler/icons-react-native/IconCopy';
import IconCursorText from '@tabler/icons-react-native/IconCursorText';
import IconDatabase from '@tabler/icons-react-native/IconDatabase';
import IconDeviceFloppy from '@tabler/icons-react-native/IconDeviceFloppy';
import IconDots from '@tabler/icons-react-native/IconDots';
import IconDownload from '@tabler/icons-react-native/IconDownload';
import IconExclamationCircle from '@tabler/icons-react-native/IconExclamationCircle';
import IconExclamationCircleFilled from '@tabler/icons-react-native/IconExclamationCircleFilled';
import IconExternalLink from '@tabler/icons-react-native/IconExternalLink';
import IconEye from '@tabler/icons-react-native/IconEye';
import IconEyeFilled from '@tabler/icons-react-native/IconEyeFilled';
import IconEyeOff from '@tabler/icons-react-native/IconEyeOff';
import IconFile from '@tabler/icons-react-native/IconFile';
import IconFileDescription from '@tabler/icons-react-native/IconFileDescription';
import IconFileFilled from '@tabler/icons-react-native/IconFileFilled';
import IconFileText from '@tabler/icons-react-native/IconFileText';
import IconFilter from '@tabler/icons-react-native/IconFilter';
import IconFilterFilled from '@tabler/icons-react-native/IconFilterFilled';
import IconFlag from '@tabler/icons-react-native/IconFlag';
import IconFlagFilled from '@tabler/icons-react-native/IconFlagFilled';
import IconFolder from '@tabler/icons-react-native/IconFolder';
import IconFolderFilled from '@tabler/icons-react-native/IconFolderFilled';
import IconForms from '@tabler/icons-react-native/IconForms';
import IconGauge from '@tabler/icons-react-native/IconGauge';
import IconGridDots from '@tabler/icons-react-native/IconGridDots';
import IconGuitarPick from '@tabler/icons-react-native/IconGuitarPick';
import IconGuitarPickFilled from '@tabler/icons-react-native/IconGuitarPickFilled';
import IconHash from '@tabler/icons-react-native/IconHash';
import IconHeading from '@tabler/icons-react-native/IconHeading';
import IconHeadphones from '@tabler/icons-react-native/IconHeadphones';
import IconHeadphonesFilled from '@tabler/icons-react-native/IconHeadphonesFilled';
import IconHeart from '@tabler/icons-react-native/IconHeart';
import IconHeartFilled from '@tabler/icons-react-native/IconHeartFilled';
import IconHighlight from '@tabler/icons-react-native/IconHighlight';
import IconHome from '@tabler/icons-react-native/IconHome';
import IconHomeFilled from '@tabler/icons-react-native/IconHomeFilled';
import IconInfoCircle from '@tabler/icons-react-native/IconInfoCircle';
import IconInfoCircleFilled from '@tabler/icons-react-native/IconInfoCircleFilled';
import IconItalic from '@tabler/icons-react-native/IconItalic';
import IconKeyboard from '@tabler/icons-react-native/IconKeyboard';
import IconLayersIntersect from '@tabler/icons-react-native/IconLayersIntersect';
import IconLayoutColumns from '@tabler/icons-react-native/IconLayoutColumns';
import IconLayoutDashboard from '@tabler/icons-react-native/IconLayoutDashboard';
import IconLayoutDashboardFilled from '@tabler/icons-react-native/IconLayoutDashboardFilled';
import IconLayoutGrid from '@tabler/icons-react-native/IconLayoutGrid';
import IconLayoutGridFilled from '@tabler/icons-react-native/IconLayoutGridFilled';
import IconLayoutNavbar from '@tabler/icons-react-native/IconLayoutNavbar';
import IconLayoutNavbarExpand from '@tabler/icons-react-native/IconLayoutNavbarExpand';
import IconLetterCase from '@tabler/icons-react-native/IconLetterCase';
import IconLifebuoy from '@tabler/icons-react-native/IconLifebuoy';
import IconLink from '@tabler/icons-react-native/IconLink';
import IconList from '@tabler/icons-react-native/IconList';
import IconListDetails from '@tabler/icons-react-native/IconListDetails';
import IconListNumbers from '@tabler/icons-react-native/IconListNumbers';
import IconLoader2 from '@tabler/icons-react-native/IconLoader2';
import IconLock from '@tabler/icons-react-native/IconLock';
import IconLockFilled from '@tabler/icons-react-native/IconLockFilled';
import IconMail from '@tabler/icons-react-native/IconMail';
import IconMailFilled from '@tabler/icons-react-native/IconMailFilled';
import IconMap from '@tabler/icons-react-native/IconMap';
import IconMapPin from '@tabler/icons-react-native/IconMapPin';
import IconMapPinFilled from '@tabler/icons-react-native/IconMapPinFilled';
import IconMarkdown from '@tabler/icons-react-native/IconMarkdown';
import IconMenu2 from '@tabler/icons-react-native/IconMenu2';
import IconMessage from '@tabler/icons-react-native/IconMessage';
import IconMessage2 from '@tabler/icons-react-native/IconMessage2';
import IconMessageCircle from '@tabler/icons-react-native/IconMessageCircle';
import IconMessageCircleFilled from '@tabler/icons-react-native/IconMessageCircleFilled';
import IconMessageFilled from '@tabler/icons-react-native/IconMessageFilled';
import IconMicrophone from '@tabler/icons-react-native/IconMicrophone';
import IconMicrophoneFilled from '@tabler/icons-react-native/IconMicrophoneFilled';
import IconMinus from '@tabler/icons-react-native/IconMinus';
import IconMoodSmile from '@tabler/icons-react-native/IconMoodSmile';
import IconMoodSmileFilled from '@tabler/icons-react-native/IconMoodSmileFilled';
import IconMoon from '@tabler/icons-react-native/IconMoon';
import IconMoonFilled from '@tabler/icons-react-native/IconMoonFilled';
import IconMusic from '@tabler/icons-react-native/IconMusic';
import IconPackage from '@tabler/icons-react-native/IconPackage';
import IconPalette from '@tabler/icons-react-native/IconPalette';
import IconPencil from '@tabler/icons-react-native/IconPencil';
import IconPhone from '@tabler/icons-react-native/IconPhone';
import IconPhoneFilled from '@tabler/icons-react-native/IconPhoneFilled';
import IconPhoto from '@tabler/icons-react-native/IconPhoto';
import IconPhotoFilled from '@tabler/icons-react-native/IconPhotoFilled';
import IconPhotoOff from '@tabler/icons-react-native/IconPhotoOff';
import IconPiano from '@tabler/icons-react-native/IconPiano';
import IconPin from '@tabler/icons-react-native/IconPin';
import IconPinFilled from '@tabler/icons-react-native/IconPinFilled';
import IconPlayerPause from '@tabler/icons-react-native/IconPlayerPause';
import IconPlayerPauseFilled from '@tabler/icons-react-native/IconPlayerPauseFilled';
import IconPlayerPlay from '@tabler/icons-react-native/IconPlayerPlay';
import IconPlayerPlayFilled from '@tabler/icons-react-native/IconPlayerPlayFilled';
import IconPlayerRecord from '@tabler/icons-react-native/IconPlayerRecord';
import IconPlayerRecordFilled from '@tabler/icons-react-native/IconPlayerRecordFilled';
import IconPlayerStop from '@tabler/icons-react-native/IconPlayerStop';
import IconPlayerStopFilled from '@tabler/icons-react-native/IconPlayerStopFilled';
import IconPlus from '@tabler/icons-react-native/IconPlus';
import IconPointFilled from '@tabler/icons-react-native/IconPointFilled';
import IconProgress from '@tabler/icons-react-native/IconProgress';
import IconQrcode from '@tabler/icons-react-native/IconQrcode';
import IconQuestionMark from '@tabler/icons-react-native/IconQuestionMark';
import IconQuote from '@tabler/icons-react-native/IconQuote';
import IconRefresh from '@tabler/icons-react-native/IconRefresh';
import IconRepeat from '@tabler/icons-react-native/IconRepeat';
import IconRocket from '@tabler/icons-react-native/IconRocket';
import IconRotate from '@tabler/icons-react-native/IconRotate';
import IconSearch from '@tabler/icons-react-native/IconSearch';
import IconSelector from '@tabler/icons-react-native/IconSelector';
import IconSeparator from '@tabler/icons-react-native/IconSeparator';
import IconSettings from '@tabler/icons-react-native/IconSettings';
import IconSettingsFilled from '@tabler/icons-react-native/IconSettingsFilled';
import IconShare from '@tabler/icons-react-native/IconShare';
import IconShield from '@tabler/icons-react-native/IconShield';
import IconShieldCheck from '@tabler/icons-react-native/IconShieldCheck';
import IconShieldCheckFilled from '@tabler/icons-react-native/IconShieldCheckFilled';
import IconShieldFilled from '@tabler/icons-react-native/IconShieldFilled';
import IconShoppingCart from '@tabler/icons-react-native/IconShoppingCart';
import IconSparkles from '@tabler/icons-react-native/IconSparkles';
import IconSquareRounded from '@tabler/icons-react-native/IconSquareRounded';
import IconStack2 from '@tabler/icons-react-native/IconStack2';
import IconStar from '@tabler/icons-react-native/IconStar';
import IconStarFilled from '@tabler/icons-react-native/IconStarFilled';
import IconStrikethrough from '@tabler/icons-react-native/IconStrikethrough';
import IconSun from '@tabler/icons-react-native/IconSun';
import IconSunFilled from '@tabler/icons-react-native/IconSunFilled';
import IconTable from '@tabler/icons-react-native/IconTable';
import IconTag from '@tabler/icons-react-native/IconTag';
import IconTarget from '@tabler/icons-react-native/IconTarget';
import IconTimeline from '@tabler/icons-react-native/IconTimeline';
import IconToggleLeft from '@tabler/icons-react-native/IconToggleLeft';
import IconToggleRight from '@tabler/icons-react-native/IconToggleRight';
import IconToggleRightFilled from '@tabler/icons-react-native/IconToggleRightFilled';
import IconTrash from '@tabler/icons-react-native/IconTrash';
import IconTrashFilled from '@tabler/icons-react-native/IconTrashFilled';
import IconTypography from '@tabler/icons-react-native/IconTypography';
import IconUnderline from '@tabler/icons-react-native/IconUnderline';
import IconUpload from '@tabler/icons-react-native/IconUpload';
import IconUser from '@tabler/icons-react-native/IconUser';
import IconUserCircle from '@tabler/icons-react-native/IconUserCircle';
import IconUserFilled from '@tabler/icons-react-native/IconUserFilled';
import IconVolume from '@tabler/icons-react-native/IconVolume';
import IconVolumeOff from '@tabler/icons-react-native/IconVolumeOff';
import IconWaveSine from '@tabler/icons-react-native/IconWaveSine';
import IconWebhook from '@tabler/icons-react-native/IconWebhook';
import IconWifi from '@tabler/icons-react-native/IconWifi';
import IconWorld from '@tabler/icons-react-native/IconWorld';
import IconWorldWww from '@tabler/icons-react-native/IconWorldWww';
import IconX from '@tabler/icons-react-native/IconX';
import type { IconRegistry } from '../types';

export const tablerIcons: IconRegistry = {
  accordion: { outlined: IconLayoutNavbarExpand },
  'alert-circle': { outlined: IconAlertCircle, filled: IconAlertCircleFilled },
  alignCenter: { outlined: IconAlignCenter },
  alignJustify: { outlined: IconAlignJustified },
  alignLeft: { outlined: IconAlignLeft },
  alignRight: { outlined: IconAlignRight },
  'arrow-down': { outlined: IconArrowDown },
  'arrow-left': { outlined: IconArrowLeft },
  'arrow-right': { outlined: IconArrowRight },
  'arrow-up': { outlined: IconArrowUp },
  arrowDown: { outlined: IconArrowDown },
  arrowLeft: { outlined: IconArrowLeft },
  arrowRight: { outlined: IconArrowRight },
  arrowUp: { outlined: IconArrowUp },
  autocomplete: { outlined: IconSearch },
  avatar: { outlined: IconUserCircle },
  badge: { outlined: IconBadge },
  'bar-chart': { outlined: IconChartBar },
  bell: { outlined: IconBell, filled: IconBellFilled },
  block: { outlined: IconBan },
  bluetooth: { outlined: IconBluetooth },
  bold: { outlined: IconBold },
  bolt: { outlined: IconBolt, filled: IconBoltFilled },
  bone: { outlined: IconBone },
  bookmark: { outlined: IconBookmark, filled: IconBookmarkFilled },
  breadcrumbs: { outlined: IconChevronRight },
  button: { outlined: IconSquareRounded },
  calendar: { outlined: IconCalendar, filled: IconCalendarFilled },
  camera: { outlined: IconCamera, filled: IconCameraFilled },
  card: { outlined: IconCards },
  carousel: { outlined: IconCarouselHorizontal },
  cart: { outlined: IconShoppingCart },
  'chart-area': { outlined: IconChartArea },
  'chart-bar': { outlined: IconChartBar },
  'chart-donut': { outlined: IconChartDonut },
  'chart-heatmap': { outlined: IconGridDots },
  'chart-line': { outlined: IconChartLine },
  'chart-pie': { outlined: IconChartPie },
  'chart-scatter': { outlined: IconChartDots },
  'chart-sparkline': { outlined: IconChartLine },
  chat: { outlined: IconMessage, filled: IconMessageFilled },
  check: { outlined: IconCheck },
  'chevron-down': { outlined: IconChevronDown },
  'chevron-left': { outlined: IconChevronLeft },
  'chevron-right': { outlined: IconChevronRight },
  'chevron-up': { outlined: IconChevronUp },
  chevronDown: { outlined: IconChevronDown },
  chevronLeft: { outlined: IconChevronLeft },
  chevronRight: { outlined: IconChevronRight },
  chevronUp: { outlined: IconChevronUp },
  'chevrons-up-down': { outlined: IconSelector },
  chip: { outlined: IconTag },
  circle: { outlined: IconCircle, filled: IconCircleFilled },
  clock: { outlined: IconClock, filled: IconClockFilled },
  close: { outlined: IconX },
  code: { outlined: IconCode },
  cog: { outlined: IconSettings, filled: IconSettingsFilled },
  color: { outlined: IconColorSwatch },
  colors: { outlined: IconPalette },
  compress: { outlined: IconArrowsMinimize },
  container: { outlined: IconBox },
  contrast: { outlined: IconContrast, filled: IconContrastFilled },
  copy: { outlined: IconCopy },
  database: { outlined: IconDatabase },
  datatable: { outlined: IconTable },
  delete: { outlined: IconTrash, filled: IconTrashFilled },
  dialog: { outlined: IconAppWindow },
  divider: { outlined: IconSeparator },
  dots: { outlined: IconDots },
  download: { outlined: IconDownload },
  edit: { outlined: IconPencil },
  ellipsis: { outlined: IconDots },
  'ellipsis-h': { outlined: IconDots },
  email: { outlined: IconMail, filled: IconMailFilled },
  emoji: { outlined: IconMoodSmile, filled: IconMoodSmileFilled },
  error: { outlined: IconAlertCircle, filled: IconAlertCircleFilled },
  exclamation: { outlined: IconExclamationCircle, filled: IconExclamationCircleFilled },
  expand: { outlined: IconArrowsMaximize },
  'external-link': { outlined: IconExternalLink },
  eye: { outlined: IconEye, filled: IconEyeFilled },
  eyeOff: { outlined: IconEyeOff },
  file: { outlined: IconFile, filled: IconFileFilled },
  filter: { outlined: IconFilter, filled: IconFilterFilled },
  flag: { outlined: IconFlag, filled: IconFlagFilled },
  flex: { outlined: IconLayoutColumns },
  folder: { outlined: IconFolder, filled: IconFolderFilled },
  font: { outlined: IconTypography },
  form: { outlined: IconForms },
  funnel: { outlined: IconFilter, filled: IconFilterFilled },
  gallery: { outlined: IconPhoto, filled: IconPhotoFilled },
  globe: { outlined: IconWorld },
  grid: { outlined: IconLayoutGrid, filled: IconLayoutGridFilled },
  guitar: { outlined: IconGuitarPick, filled: IconGuitarPickFilled },
  heading: { outlined: IconHeading },
  headphones: { outlined: IconHeadphones, filled: IconHeadphonesFilled },
  heart: { outlined: IconHeart, filled: IconHeartFilled },
  highlight: { outlined: IconHighlight },
  home: { outlined: IconHome, filled: IconHomeFilled },
  hook: { outlined: IconWebhook },
  image: { outlined: IconPhoto, filled: IconPhotoFilled },
  'image-off': { outlined: IconPhotoOff },
  indicator: { outlined: IconPointFilled },
  info: { outlined: IconInfoCircle, filled: IconInfoCircleFilled },
  input: { outlined: IconCursorText },
  italic: { outlined: IconItalic },
  keyboard: { outlined: IconKeyboard },
  keycap: { outlined: IconKeyboard },
  knob: { outlined: IconAdjustments, filled: IconAdjustmentsFilled },
  knobs: { outlined: IconAdjustments, filled: IconAdjustmentsFilled },
  'layer-mask': { outlined: IconLayersIntersect },
  layers: { outlined: IconStack2 },
  'line-chart': { outlined: IconChartLine },
  linechart: { outlined: IconChartLine },
  link: { outlined: IconLink },
  list: { outlined: IconList },
  listOrdered: { outlined: IconListNumbers },
  listUnordered: { outlined: IconList },
  loader: { outlined: IconLoader2 },
  loading: { outlined: IconLoader2 },
  location: { outlined: IconMapPin, filled: IconMapPinFilled },
  lock: { outlined: IconLock, filled: IconLockFilled },
  mail: { outlined: IconMail, filled: IconMailFilled },
  map: { outlined: IconMap },
  markdown: { outlined: IconMarkdown },
  masonry: { outlined: IconLayoutDashboard, filled: IconLayoutDashboardFilled },
  menu: { outlined: IconMenu2 },
  message: { outlined: IconMessageCircle, filled: IconMessageCircleFilled },
  'message-circle': { outlined: IconMessageCircle, filled: IconMessageCircleFilled },
  mic: { outlined: IconMicrophone, filled: IconMicrophoneFilled },
  microphone: { outlined: IconMicrophone, filled: IconMicrophoneFilled },
  minus: { outlined: IconMinus },
  moon: { outlined: IconMoon, filled: IconMoonFilled },
  music: { outlined: IconMusic },
  number: { outlined: IconHash },
  package: { outlined: IconPackage },
  paddingFrame: { outlined: IconBorderOuter },
  pagination: { outlined: IconDots },
  palette: { outlined: IconPalette },
  paper: { outlined: IconFileDescription },
  pause: { outlined: IconPlayerPause, filled: IconPlayerPauseFilled },
  person: { outlined: IconUser, filled: IconUserFilled },
  phone: { outlined: IconPhone, filled: IconPhoneFilled },
  piano: { outlined: IconPiano },
  pin: { outlined: IconPin, filled: IconPinFilled },
  plan: { outlined: IconClipboardList },
  play: { outlined: IconPlayerPlay, filled: IconPlayerPlayFilled },
  plus: { outlined: IconPlus },
  popover: { outlined: IconMessage2 },
  progress: { outlined: IconProgress },
  'progress-shield': { outlined: IconShieldCheck, filled: IconShieldCheckFilled },
  qrcode: { outlined: IconQrcode },
  question: { outlined: IconQuestionMark },
  quote: { outlined: IconQuote },
  radio: { outlined: IconCircleDot },
  rating: { outlined: IconStar, filled: IconStarFilled },
  record: { outlined: IconPlayerRecord, filled: IconPlayerRecordFilled },
  redo: { outlined: IconArrowForwardUp },
  refresh: { outlined: IconRefresh },
  repeat: { outlined: IconRepeat },
  richtext: { outlined: IconFileText },
  rocket: { outlined: IconRocket },
  rotate: { outlined: IconRotate },
  save: { outlined: IconDeviceFloppy },
  search: { outlined: IconSearch },
  select: { outlined: IconSelector },
  'selector-vertical': { outlined: IconSelector },
  selectorVertical: { outlined: IconSelector },
  settings: { outlined: IconSettings, filled: IconSettingsFilled },
  share: { outlined: IconShare },
  sheild: { outlined: IconShield, filled: IconShieldFilled },
  shop: { outlined: IconBuildingStore },
  slider: { outlined: IconAdjustmentsHorizontal },
  smile: { outlined: IconMoodSmile, filled: IconMoodSmileFilled },
  sort: { outlined: IconArrowsSort },
  sparkles: { outlined: IconSparkles },
  speedometer: { outlined: IconGauge },
  splitTrack: { outlined: IconColumns },
  spoiler: { outlined: IconEyeOff },
  spotlight: { outlined: IconSearch },
  star: { outlined: IconStar, filled: IconStarFilled },
  stepper: { outlined: IconListNumbers },
  stop: { outlined: IconPlayerStop, filled: IconPlayerStopFilled },
  strikethrough: { outlined: IconStrikethrough },
  success: { outlined: IconCircleCheck, filled: IconCircleCheckFilled },
  sun: { outlined: IconSun, filled: IconSunFilled },
  support: { outlined: IconLifebuoy },
  switch: { outlined: IconToggleRight, filled: IconToggleRightFilled },
  table: { outlined: IconTable },
  tableofcontents: { outlined: IconListDetails },
  tabs: { outlined: IconLayoutNavbar },
  target: { outlined: IconTarget },
  text: { outlined: IconLetterCase },
  textarea: { outlined: IconForms },
  timeline: { outlined: IconTimeline },
  times: { outlined: IconX },
  title: { outlined: IconHeading },
  toast: { outlined: IconMessage2 },
  toggle: { outlined: IconToggleRight, filled: IconToggleRightFilled },
  toggleOff: { outlined: IconToggleLeft },
  toggleOn: { outlined: IconToggleRight, filled: IconToggleRightFilled },
  tooltip: { outlined: IconMessage2 },
  trash: { outlined: IconTrash, filled: IconTrashFilled },
  tree: { outlined: IconBinaryTree },
  tuning: { outlined: IconAdjustments, filled: IconAdjustmentsFilled },
  underline: { outlined: IconUnderline },
  undo: { outlined: IconArrowBackUp },
  upload: { outlined: IconUpload },
  user: { outlined: IconUser, filled: IconUserFilled },
  'volume-off': { outlined: IconVolumeOff },
  'volume-up': { outlined: IconVolume },
  volumeOff: { outlined: IconVolumeOff },
  warning: { outlined: IconAlertTriangle, filled: IconAlertTriangleFilled },
  waveform: { outlined: IconWaveSine },
  web: { outlined: IconWorldWww },
  wifi: { outlined: IconWifi },
  x: { outlined: IconX },
};
