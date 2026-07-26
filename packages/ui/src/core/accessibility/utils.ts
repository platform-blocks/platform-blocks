import { AccessibilityRole, AccessibilityState, Platform } from 'react-native';
import { ACCESSIBILITY_LABELS, ACCESSIBILITY_ROLES } from './constants';

/**
 * Generate accessible label with context
 */
export const createAccessibleLabel = (
  label: string,
  context?: {
    required?: boolean;
    invalid?: boolean;
    current?: number;
    total?: number;
    selected?: boolean;
  }
): string => {
  let accessibleLabel = label;

  if (context) {
    if (context.required) {
      accessibleLabel += `, ${ACCESSIBILITY_LABELS.REQUIRED}`;
    }

    if (context.invalid) {
      accessibleLabel += `, ${ACCESSIBILITY_LABELS.INVALID}`;
    }

    if (context.current !== undefined && context.total !== undefined) {
      accessibleLabel += `, ${ACCESSIBILITY_LABELS.ITEM_OF
        .replace('{current}', context.current.toString())
        .replace('{total}', context.total.toString())}`;
    }

    if (context.selected) {
      accessibleLabel += `, selected`;
    }
  }

  return accessibleLabel;
};

export type AccessibilityValue = {
  min?: number;
  max?: number;
  now?: number;
  text?: string;
};

/**
 * Props that publish a control's current value to assistive technology.
 *
 * `accessibilityValue` is the React Native prop and is all native needs, but
 * react-native-web (0.21) does not map the object — it only forwards the flattened
 * `aria-value*` props. Passing the object alone therefore lands a `role="slider"` or
 * `role="progressbar"` in the DOM with no value for a screen reader to read, silently.
 * Emitting both covers either platform.
 *
 * Note that `aria-value*` is meaningless without a value-bearing role, so callers must
 * also set an `accessibilityRole` such as `progressbar`, `slider`, or `adjustable`.
 */
export const getAccessibilityValueProps = (value?: AccessibilityValue) => {
  if (!value) return {};
  const props: Record<string, unknown> = { accessibilityValue: value };
  if (Platform.OS !== 'web') return props;
  if (value.min !== undefined) props['aria-valuemin'] = value.min;
  if (value.max !== undefined) props['aria-valuemax'] = value.max;
  if (value.now !== undefined) props['aria-valuenow'] = value.now;
  if (value.text !== undefined) props['aria-valuetext'] = value.text;
  return props;
};

/**
 * Generate accessibility props for React Native components
 */
export const createAccessibilityProps = (options: {
  role?: AccessibilityRole;
  label?: string;
  hint?: string;
  state?: AccessibilityState;
  value?: { min?: number; max?: number; now?: number; text?: string };
  actions?: Array<{ name: string; label?: string }>;
  disabled?: boolean;
  selected?: boolean;
}) => {
  const {
    role,
    label,
    hint,
    state,
    value,
    actions,
    disabled = false,
    selected = false,
  } = options;

  const accessibilityProps: any = {
    accessible: true,
  };

  if (role) {
    accessibilityProps.accessibilityRole = role;
  }

  if (label) {
    accessibilityProps.accessibilityLabel = label;
  }

  if (hint) {
    accessibilityProps.accessibilityHint = hint;
  }

  if (state || disabled || selected) {
    accessibilityProps.accessibilityState = {
      ...state,
      disabled,
      selected,
    };
  }

  if (value) {
    Object.assign(accessibilityProps, getAccessibilityValueProps(value));
  }

  if (actions) {
    accessibilityProps.accessibilityActions = actions;
  }

  return accessibilityProps;
};

/**
 * Format numbers for screen readers (e.g., "1,000" becomes "1 thousand")
 */
export const formatNumberForScreenReader = (num: number): string => {
  if (num < 1000) return num.toString();
  
  if (num < 1000000) {
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    if (remainder === 0) {
      return `${thousands} thousand`;
    }
    return `${thousands} thousand ${remainder}`;
  }
  
  if (num < 1000000000) {
    const millions = Math.floor(num / 1000000);
    const remainder = num % 1000000;
    if (remainder === 0) {
      return `${millions} million`;
    }
    return `${millions} million ${Math.floor(remainder / 1000)} thousand`;
  }
  
  return num.toLocaleString();
};

/**
 * Format time duration for screen readers
 */
export const formatDurationForScreenReader = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  }

  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(`${remainingSeconds} ${remainingSeconds === 1 ? 'second' : 'seconds'}`);
  }

  return parts.join(' ');
};

/**
 * Get appropriate ARIA role based on component type
 */
export const getAriaRole = (componentType: string): AccessibilityRole | undefined => {
  const roleMap: Record<string, AccessibilityRole> = {
    button: 'button',
    link: 'link',
    checkbox: 'checkbox',
    radio: 'radio',
    switch: 'switch',
    slider: 'adjustable',
    input: 'none', // Let React Native handle this
    textArea: 'none',
    heading: 'header',
    text: 'text',
    image: 'image',
    list: 'list',
    listItem: 'none',
    menu: 'menu',
    menuItem: 'menuitem',
    tab: 'tab',
    tabPanel: 'none', // React Native doesn't have tabpanel role
    dialog: 'alert',
    alert: 'alert',
    status: 'none',
  };

  return roleMap[componentType];
};

/**
 * Check if an element should be focusable
 */
export const isFocusable = (element: any): boolean => {
  if (!element) return false;

  // Check if element is disabled
  if (element.props?.disabled) return false;

  // Check if element has accessibility props that make it focusable
  if (element.props?.accessible === false) return false;

  // Check role-based focusability
  const role = element.props?.accessibilityRole;
  const focusableRoles = ['button', 'link', 'checkbox', 'radio', 'switch', 'adjustable'];

  return focusableRoles.includes(role) || element.props?.onPress || element.props?.onFocus;
};

/**
 * Debounce announcements to prevent spam
 */
export const debounceAnnouncement = (() => {
  const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

  return (key: string, announcement: () => void, delay: number = 500) => {
    if (timeouts.has(key)) {
      clearTimeout(timeouts.get(key)!);
    }

    const timeout = setTimeout(() => {
      announcement();
      timeouts.delete(key);
    }, delay);

    timeouts.set(key, timeout);
  };
})();

/**
 * Get reading time estimate for content
 */
export const getReadingTime = (text: string, wordsPerMinute: number = 200): string => {
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  
  if (minutes === 1) return '1 minute read';
  return `${minutes} minutes read`;
};