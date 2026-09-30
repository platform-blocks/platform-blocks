import type {
  AccessibilityActionEvent,
  AccessibilityActionInfo,
  AccessibilityRole,
  Role,
} from 'react-native';

import { isWeb } from '../platform';

/**
 * Cross-platform accessibility props.
 *
 * React Native (>= 0.71) and react-native-web (0.21) both understand `role` and
 * the flat `aria-*` props, so those are what this module emits. react-native-web
 * silently DROPS `accessibilityState`, `accessibilityValue` and
 * `accessibilityHint`, so none of them are ever produced here; native-only extras
 * (`accessibilityHint`, `accessibilityActions`, `onAccessibilityAction`,
 * `accessibilityViewIsModal`, `accessibilityLiveRegion`) are only emitted on native.
 *
 * Web-only ARIA that native has no equivalent for (`aria-describedby`,
 * `aria-controls`, `aria-haspopup`, `aria-level`, `aria-invalid`, `aria-required`,
 * ...) is only emitted on web. Where native has a close equivalent it is mapped:
 * `current` → selected, `pressed` → checked, `modal` → accessibilityViewIsModal,
 * `live` → accessibilityLiveRegion.
 */

/** ARIA roles React Native's `Role` type lacks. Web gets them verbatim; native maps them (see `a11yProps`). */
export type WebOnlyRole = 'listbox' | 'textbox' | 'gridcell' | 'menuitemcheckbox' | 'menuitemradio';
export type A11yRole = Role | WebOnlyRole;

const NATIVE_ROLE_FOR: Record<WebOnlyRole, Role | undefined> = {
  listbox: 'list',
  // A native TextInput already announces itself as a text field.
  textbox: undefined,
  gridcell: 'cell',
  menuitemcheckbox: 'menuitem',
  menuitemradio: 'menuitem',
};

function resolveRole(role: A11yRole): Role | undefined {
  if (role in NATIVE_ROLE_FOR) {
    // react-native-web forwards any role string to the DOM; RN's `Role` type
    // just doesn't list these, hence the cast on web.
    return isWeb ? (role as Role) : NATIVE_ROLE_FOR[role as WebOnlyRole];
  }
  return role as Role;
}
export type AriaCurrent = boolean | 'page' | 'step' | 'location' | 'date' | 'time';
export type AriaHasPopup = boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
export type AriaLive = 'polite' | 'assertive' | 'off';
export type AriaChecked = boolean | 'mixed';

/** A value-bearing control's range/value (slider, progressbar, spinbutton, meter). */
export interface A11yValue {
  min?: number;
  max?: number;
  now?: number;
  text?: string;
}

/**
 * Roles a native screen reader must treat as one element. A plain `View` isn't
 * accessible by default (unlike `Pressable`), so without this its children are
 * announced separately and the role/value is lost.
 */
const NATIVE_LEAF_ROLES: ReadonlySet<A11yRole> = new Set<A11yRole>([
  'slider',
  'img',
  'progressbar',
  'meter',
  'spinbutton',
  'scrollbar',
]);

/** One id or several. Falsy entries are skipped, so conditional ids can be inlined. */
export type IdRefs = string | ReadonlyArray<string | false | null | undefined>;

export interface A11yOptions {
  /** ARIA role (`button`, `slider`, `tab`, `heading`, ...). */
  role?: A11yRole;
  /** Human-readable role name that replaces the announced role (web `aria-roledescription`, e.g. "carousel"). */
  roleDescription?: string;
  /** Accessible name. */
  label?: string;
  /** Ids of the element(s) that label this one (web, and Android on native). */
  labelledBy?: IdRefs;
  /** Extra description. Native: `accessibilityHint`. Web: use `describedBy` with an id. */
  hint?: string;
  /** Ids of the element(s) describing this one (web `aria-describedby`). */
  describedBy?: IdRefs;
  /** Element id (DOM `id` on web, `nativeID` on native). */
  id?: string;
  /**
   * Group this element into one accessibility node on native. Defaults to true
   * on native for leaf value/image roles (slider, img, progressbar, meter,
   * spinbutton, scrollbar), which a plain View otherwise doesn't expose as one
   * element.
   */
  accessible?: boolean;
  disabled?: boolean;
  checked?: AriaChecked;
  selected?: boolean;
  expanded?: boolean;
  busy?: boolean;
  /** Toggle-button pressed state. Native maps to `checked` (the closest native state). */
  pressed?: AriaChecked;
  /** Current item in a set (nav link, step, date). Native maps to `selected`. */
  current?: AriaCurrent;
  hasPopup?: AriaHasPopup;
  /** Id(s) of the element this one controls (web). */
  controls?: IdRefs;
  /** Active descendant id for composite widgets using virtual focus (web). */
  activeDescendant?: string;
  invalid?: boolean;
  required?: boolean;
  readOnly?: boolean;
  /** Heading level (web `aria-level`); use with `role: 'heading'`. */
  level?: number;
  orientation?: 'horizontal' | 'vertical';
  live?: AriaLive;
  modal?: boolean;
  /** Hide from assistive technology. */
  hidden?: boolean;
  value?: A11yValue;
  /** Native custom/standard accessibility actions (increment, decrement, activate, ...). */
  actions?: ReadonlyArray<AccessibilityActionInfo>;
  onAction?: (event: AccessibilityActionEvent) => void;
}

/**
 * The props `a11yProps` returns. Every key is valid on RN `View`, `Pressable`,
 * `Text` and `TextInput` on both platforms (web-only keys are simply absent on
 * native and vice versa).
 */
export interface A11yProps {
  /** Typed as RN's `Role`; on web it may carry a `WebOnlyRole` (react-native-web forwards any role). */
  role?: Role;
  accessible?: boolean;
  id?: string;
  'aria-label'?: string;
  'aria-roledescription'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-hidden'?: boolean;
  'aria-disabled'?: boolean;
  'aria-checked'?: AriaChecked;
  'aria-selected'?: boolean;
  'aria-expanded'?: boolean;
  'aria-busy'?: boolean;
  'aria-pressed'?: AriaChecked;
  'aria-current'?: AriaCurrent;
  'aria-haspopup'?: AriaHasPopup;
  'aria-controls'?: string;
  'aria-activedescendant'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
  'aria-readonly'?: boolean;
  'aria-level'?: number;
  'aria-orientation'?: 'horizontal' | 'vertical';
  'aria-live'?: AriaLive;
  'aria-modal'?: boolean;
  'aria-valuemin'?: number;
  'aria-valuemax'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  accessibilityHint?: string;
  accessibilityActions?: ReadonlyArray<AccessibilityActionInfo>;
  onAccessibilityAction?: (event: AccessibilityActionEvent) => void;
  accessibilityViewIsModal?: boolean;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
}

/**
 * Joins id refs for the current platform: space-separated on web (the ARIA IDREF
 * list syntax), comma-separated on native (RN splits `aria-labelledby` on commas).
 * Returns undefined when nothing is left.
 */
export function joinIdRefs(ids: IdRefs | undefined, separator: string = isWeb ? ' ' : ','): string | undefined {
  if (ids == null) return undefined;
  if (typeof ids === 'string') return ids || undefined;
  const list = ids.filter((id): id is string => typeof id === 'string' && id.length > 0);
  return list.length ? list.join(separator) : undefined;
}

/**
 * Builds the accessibility prop set for a host element on the current platform.
 *
 * @example
 * <Pressable {...a11yProps({ role: 'tab', selected: isActive, controls: panelId })} />
 * <View {...a11yProps({ role: 'slider', label: 'Volume', value: { min: 0, max: 100, now: 40 } })} />
 */
export function a11yProps(opts: A11yOptions): A11yProps {
  const props: A11yProps = {};

  if (opts.role !== undefined) {
    const role = resolveRole(opts.role);
    if (role) props.role = role;
  }
  if (opts.accessible !== undefined) props.accessible = opts.accessible;
  if (opts.id) props.id = opts.id;
  if (opts.label !== undefined && opts.label !== '') props['aria-label'] = opts.label;

  const labelledBy = joinIdRefs(opts.labelledBy);
  if (labelledBy) props['aria-labelledby'] = labelledBy;

  // Boolean flags: only meaningful when on.
  if (opts.disabled) props['aria-disabled'] = true;
  if (opts.busy) props['aria-busy'] = true;
  if (opts.hidden) props['aria-hidden'] = true;

  // Two-sided states: `false` is information too ("not checked", "collapsed").
  if (opts.checked !== undefined) props['aria-checked'] = opts.checked;
  if (opts.selected !== undefined) props['aria-selected'] = opts.selected;
  if (opts.expanded !== undefined) props['aria-expanded'] = opts.expanded;

  const value = opts.value;
  if (value) {
    if (value.min !== undefined) props['aria-valuemin'] = value.min;
    if (value.max !== undefined) props['aria-valuemax'] = value.max;
    if (value.now !== undefined) props['aria-valuenow'] = value.now;
    if (value.text !== undefined) props['aria-valuetext'] = value.text;
  }

  if (isWeb) {
    if (opts.roleDescription) props['aria-roledescription'] = opts.roleDescription;
    const describedBy = joinIdRefs(opts.describedBy);
    if (describedBy) props['aria-describedby'] = describedBy;
    if (opts.pressed !== undefined) props['aria-pressed'] = opts.pressed;
    if (opts.current) props['aria-current'] = opts.current;
    if (opts.hasPopup) props['aria-haspopup'] = opts.hasPopup;
    const controls = joinIdRefs(opts.controls);
    if (controls) props['aria-controls'] = controls;
    if (opts.activeDescendant) props['aria-activedescendant'] = opts.activeDescendant;
    if (opts.invalid) props['aria-invalid'] = true;
    if (opts.required) props['aria-required'] = true;
    if (opts.readOnly) props['aria-readonly'] = true;
    if (opts.level !== undefined) props['aria-level'] = opts.level;
    if (opts.orientation) props['aria-orientation'] = opts.orientation;
    if (opts.live) props['aria-live'] = opts.live;
    if (opts.modal) props['aria-modal'] = true;
    return props;
  }

  // Native
  if (props.accessible === undefined && opts.role !== undefined && NATIVE_LEAF_ROLES.has(opts.role)) {
    props.accessible = true;
  }
  if (opts.hint) props.accessibilityHint = opts.hint;
  if (opts.pressed !== undefined && opts.checked === undefined) props['aria-checked'] = opts.pressed;
  if (opts.current && opts.selected === undefined) props['aria-selected'] = true;
  if (opts.live) props.accessibilityLiveRegion = opts.live === 'off' ? 'none' : opts.live;
  if (opts.modal) props.accessibilityViewIsModal = true;
  if (opts.actions && opts.actions.length) props.accessibilityActions = opts.actions;
  if (opts.onAction) props.onAccessibilityAction = opts.onAction;
  return props;
}

/**
 * Maps a legacy `accessibilityRole` to the equivalent ARIA `role`. Returns
 * undefined for roles ARIA has no counterpart for (`text`, `keyboardkey`, ...),
 * which callers should keep passing as `accessibilityRole`.
 */
export function roleFromAccessibilityRole(role: AccessibilityRole | undefined): A11yRole | undefined {
  switch (role) {
    case undefined:
      return undefined;
    case 'adjustable':
      return 'slider';
    case 'header':
      return 'heading';
    case 'image':
      return 'img';
    case 'imagebutton':
    case 'togglebutton':
      return 'button';
    case 'search':
      return 'searchbox';
    case 'tabbar':
      return 'tablist';
    case 'text':
    case 'keyboardkey':
      return undefined;
    default:
      // Every remaining AccessibilityRole is spelled the same as its ARIA role.
      return role;
  }
}
