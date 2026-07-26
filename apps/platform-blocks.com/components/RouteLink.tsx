import React, { useCallback } from 'react';
import { Platform, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';

export interface RouteLinkProps {
  /** Internal app route, e.g. `/components/Button`. Emitted verbatim as the `href`. */
  href: string;
  children: React.ReactNode;
  /**
   * Layout style for the wrapper. On web this lands on the anchor itself, so it
   * must be plain-CSS-compatible — `paddingHorizontal` and friends won't apply
   * (this element bypasses react-native-web's style pipeline).
   */
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  /**
   * Hover callbacks, mapped to the right event pair per platform. Named after
   * RN's `Pressable` API so `useHover()`'s handlers spread straight in — the raw
   * anchor can't take those props directly, since `onHoverIn`/`onHoverOut` are
   * not DOM events.
   */
  onHoverIn?: () => void;
  onHoverOut?: () => void;
}

const WEB_BASE_STYLE = {
  display: 'flex' as const,
  flexDirection: 'column' as const,
  color: 'inherit',
  textDecoration: 'none' as const,
  cursor: 'pointer' as const,
};

/**
 * Wraps content in a real `<a href>` on web while keeping client-side routing.
 *
 * Navigation built on bare `router.push()` leaves no anchor behind. Every route
 * here is prerendered to static HTML, so a crawler fetching `/components` saw a
 * page listing 117 component names with zero outgoing links — the detail pages
 * were reachable only through `sitemap.xml`. Readers lost middle-click,
 * cmd-click, and "copy link address" for the same reason.
 *
 * The anchor serves both: crawlers and modified clicks get the real URL, plain
 * left-clicks are handed to the router so in-app navigation is unchanged.
 * Native has no anchor to emit and falls back to a Pressable.
 */
export const RouteLink: React.FC<RouteLinkProps> = ({
  href,
  children,
  style,
  accessibilityLabel,
  onHoverIn,
  onHoverOut,
}) => {
  const router = useRouter();

  const navigate = useCallback(() => {
    router.push(href as never);
  }, [href, router]);

  const handleClick = useCallback(
    (event: any) => {
      // Defer to the browser whenever the user explicitly asked for it: modified
      // clicks open a new tab or window, and non-primary buttons aren't ours to
      // intercept. Only the plain left-click becomes a client-side transition.
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate();
    },
    [navigate]
  );

  if (Platform.OS === 'web') {
    return React.createElement(
      'a',
      {
        href,
        onClick: handleClick,
        onMouseEnter: onHoverIn,
        onMouseLeave: onHoverOut,
        'aria-label': accessibilityLabel,
        style: { ...WEB_BASE_STYLE, ...(StyleSheet.flatten(style) as object) },
      },
      children
    );
  }

  return (
    <Pressable
      onPress={navigate}
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}
      style={style}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Pressable>
  );
};
