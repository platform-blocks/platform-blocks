import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { a11yProps } from '../../../core/accessibility/a11yProps';
import { useAnnouncer } from '../../../core/accessibility/hooks';
import { useThemedStyles } from '../../../core/hooks/useThemedStyles';
import { hasDOM, isWeb } from '../../../core/platform/flags';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { onColor, resolveFontSize, resolveRadius, resolveSpacing } from '../../../core/theme/tokens';
import { getZIndex } from '../../../core/theme/zIndices';
import { Icon } from '../../Icon';
import { VISUALLY_HIDDEN_STYLE } from './AccessibleComponents';

/**
 * Type-checks a style table like `StyleSheet.create` (without registering it:
 * useThemedStyles already memoizes it per theme).
 */
function namedStyles<T extends StyleSheet.NamedStyles<T>>(table: T): T {
  return table;
}

/** The string content of `children`, or undefined when it isn't plain text. */
const textOf = (children: React.ReactNode): string | undefined => {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children) && children.every((c) => typeof c === 'string' || typeof c === 'number')) {
    return children.join('');
  }
  return undefined;
};

/** Moves focus to the in-page target of a `#id` link (web), making it focusable if needed. */
const focusHashTarget = (href: string) => {
  if (!hasDOM || !href.startsWith('#') || href.length < 2) return;
  const target = document.getElementById(decodeURIComponent(href.slice(1)));
  if (!target) return;
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus();
  target.scrollIntoView?.({ block: 'start' });
};

export interface SkipLinkProps {
  /** In-page target, e.g. `#main-content`: focused (and scrolled to) on activation (web). */
  href: string;
  children: React.ReactNode;
  onPress?: () => void;
}

/**
 * Skip link for keyboard navigation — hidden until focused, then lets users
 * jump past repeated navigation to the main content.
 */
export const SkipLink: React.FC<SkipLinkProps> = ({ href, children, onPress }) => {
  const [focused, setFocused] = useState(false);
  const { announce } = useAnnouncer();
  const text = textOf(children);

  const themed = useThemedStyles((theme) => {
    const background = theme.colors.primary[5];
    return namedStyles({
      link: {
        position: 'absolute',
        top: resolveSpacing(theme, 'sm'),
        start: resolveSpacing(theme, 'sm'),
        backgroundColor: background,
        padding: resolveSpacing(theme, 'sm'),
        borderRadius: resolveRadius(theme, 'sm'),
        zIndex: getZIndex(theme, 'max'),
      },
      text: {
        color: theme.text.onPrimary ?? onColor(theme, background),
        fontSize: resolveFontSize(theme, 'sm'),
      },
    });
  });

  const handlePress = useCallback(() => {
    focusHashTarget(href);
    if (text) announce(`Skipped to ${text}`);
    onPress?.();
  }, [href, text, announce, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        focused ? themed.link : VISUALLY_HIDDEN_STYLE,
        { opacity: pressed ? 0.8 : 1 },
      ]}
      {...a11yProps({
        role: 'link',
        label: text ? `Skip to ${text}` : undefined,
        hint: 'Press to skip navigation',
      })}
    >
      <Text style={themed.text}>{children}</Text>
    </Pressable>
  );
};

export interface LandmarkProps {
  role: 'main' | 'navigation' | 'banner' | 'contentinfo' | 'complementary';
  label?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Semantic landmark for page structure (`main`, `navigation`, …) — rendered as
 * that ARIA landmark on web; native maps what it supports.
 */
export const Landmark: React.FC<LandmarkProps> = ({ role, label, children, style, testID }) => {
  return (
    <View style={style} testID={testID} {...a11yProps({ role, label })}>
      {children}
    </View>
  );
};

export interface LiveRegionProps {
  priority?: 'polite' | 'assertive';
  children: React.ReactNode;
  /** Read the whole region on every change, not just the changed part (web `aria-atomic`). */
  atomic?: boolean;
}

/**
 * Visually hidden live region: changes to `children` are announced by screen
 * readers (web `aria-live`, Android live region). iOS has no live regions —
 * use `announce()` for iOS-critical messages.
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({ priority = 'polite', children, atomic = false }) => {
  // react-native-web 0.21 reads the wrong prop for `aria-atomic` and never
  // renders it, so set the DOM attribute directly.
  const atomicRef = useCallback(
    (node: View | null) => {
      if (!hasDOM || !(node instanceof HTMLElement)) return;
      if (atomic) node.setAttribute('aria-atomic', 'true');
      else node.removeAttribute('aria-atomic');
    },
    [atomic]
  );

  return (
    <View ref={atomicRef} style={VISUALLY_HIDDEN_STYLE} {...a11yProps({ live: priority })}>
      {children}
    </View>
  );
};

export interface ProgressIndicatorProps {
  value: number;
  max?: number;
  label?: string;
  description?: string;
  showPercentage?: boolean;
}

/**
 * Accessible progress bar (`role="progressbar"` + `aria-value*`), announcing
 * the 25/50/75/100% milestones.
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value,
  max = 100,
  label,
  description,
  showPercentage = true,
}) => {
  const percentage = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0;
  const { announce } = useAnnouncer();

  const themed = useThemedStyles((theme) =>
    namedStyles({
      root: { gap: resolveSpacing(theme, 'xs') },
      label: { fontSize: resolveFontSize(theme, 'sm'), color: theme.text.primary },
      track: {
        height: 8,
        backgroundColor: theme.backgrounds.border,
        borderRadius: resolveRadius(theme, 'sm'),
        overflow: 'hidden',
      },
      bar: { height: '100%', backgroundColor: theme.colors.primary[5] },
      description: { fontSize: resolveFontSize(theme, 'xs'), color: theme.text.secondary },
    })
  );

  useEffect(() => {
    // Announce progress at key milestones.
    if (percentage === 25 || percentage === 50 || percentage === 75 || percentage === 100) {
      announce(`Progress: ${percentage}% complete`, { priority: 'polite' });
    }
  }, [percentage, announce]);

  return (
    <View style={themed.root}>
      {label ? (
        <Text style={themed.label}>
          {label} {showPercentage && `(${percentage}%)`}
        </Text>
      ) : null}

      <View
        style={themed.track}
        {...a11yProps({
          role: 'progressbar',
          label,
          value: { min: 0, max, now: value, text: `${percentage}% complete` },
        })}
      >
        <View style={[themed.bar, { width: `${percentage}%` }]} />
      </View>

      {description ? <Text style={themed.description}>{description}</Text> : null}
    </View>
  );
};

export interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Accessible error boundary fallback: an alert with the error message and a
 * "Try again" button.
 */
export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({ error, resetError }) => {
  const theme = useTheme();
  const { announce } = useAnnouncer();

  const themed = useThemedStyles((t) =>
    namedStyles({
      root: {
        padding: resolveSpacing(t, 'xl'),
        backgroundColor: t.colors.error[1],
        borderRadius: resolveRadius(t, 'md'),
        borderWidth: 1,
        borderColor: t.colors.error[3],
        alignItems: 'center',
        gap: resolveSpacing(t, 'md'),
      },
      messages: { alignItems: 'center', gap: resolveSpacing(t, 'sm') },
      title: {
        fontSize: resolveFontSize(t, 'lg'),
        fontWeight: '600',
        color: t.colors.error[7],
        textAlign: 'center',
      },
      message: { fontSize: resolveFontSize(t, 'sm'), color: t.colors.error[6], textAlign: 'center' },
      button: {
        backgroundColor: t.colors.error[5],
        paddingHorizontal: resolveSpacing(t, 'lg'),
        paddingVertical: resolveSpacing(t, 'md'),
        borderRadius: resolveRadius(t, 'sm'),
      },
      buttonText: { color: onColor(t, t.colors.error[5]), fontSize: resolveFontSize(t, 'sm') },
    })
  );

  useEffect(() => {
    // Web announces the role="alert" region itself; native needs an explicit announcement.
    if (!isWeb) announce('An error occurred. Please try again or contact support.', { priority: 'assertive' });
  }, [announce]);

  return (
    <View style={themed.root} {...a11yProps({ role: 'alert' })}>
      <Icon name="alert-circle" size={48} color={theme.colors.error[5]} decorative />

      <View style={themed.messages}>
        <Text style={themed.title}>Something went wrong</Text>
        <Text style={themed.message}>{error.message || 'An unexpected error occurred'}</Text>
      </View>

      <Pressable
        onPress={resetError}
        style={({ pressed }) => [themed.button, { opacity: pressed ? 0.8 : 1 }]}
        {...a11yProps({ role: 'button', label: 'Try again', hint: 'Press to retry the failed operation' })}
      >
        <Text style={themed.buttonText}>Try Again</Text>
      </Pressable>
    </View>
  );
};
