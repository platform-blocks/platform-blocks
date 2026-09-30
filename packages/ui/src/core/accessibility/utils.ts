import type { AccessibilityRole } from 'react-native';
import { ACCESSIBILITY_LABELS } from './constants';
import { a11yProps, type A11yProps, type A11yValue } from './a11yProps';

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

export type AccessibilityValue = A11yValue;

/**
 * Props that publish a control's current value to assistive technology:
 * `aria-valuemin|max|now|text`, which React Native and react-native-web both
 * understand. (RN's `accessibilityValue` object is dropped by react-native-web,
 * so it is never emitted.) Callers must also set a value-bearing role such as
 * `progressbar`, `slider` or `spinbutton`.
 */
export const getAccessibilityValueProps = (value?: AccessibilityValue): A11yProps => {
  if (!value) return {};
  return a11yProps({ value });
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
export const isFocusable = (element: unknown): boolean => {
  if (!element || typeof element !== 'object') return false;
  const props = (element as { props?: FocusRelevantProps }).props;

  // Check if element is disabled
  if (props?.disabled) return false;

  // Check if element has accessibility props that make it focusable
  if (props?.accessible === false) return false;

  // Check role-based focusability
  const role = props?.accessibilityRole;
  const focusableRoles: readonly unknown[] = ['button', 'link', 'checkbox', 'radio', 'switch', 'adjustable'];

  return focusableRoles.includes(role) || !!props?.onPress || !!props?.onFocus;
};

/** The props of a React element `isFocusable` inspects. */
interface FocusRelevantProps {
  disabled?: unknown;
  accessible?: unknown;
  accessibilityRole?: unknown;
  onPress?: unknown;
  onFocus?: unknown;
}

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