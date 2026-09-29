import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { a11yProps } from '../../../core/accessibility/a11yProps';
import { announce } from '../../../core/accessibility/announce';
import { useA11yId } from '../../../core/accessibility/useA11yId';
import { useThemedStyles } from '../../../core/hooks/useThemedStyles';
import { LayerScope, useLayer } from '../../../core/overlay/useLayer';
import { isIOS } from '../../../core/platform/flags';
import { resolveSurface } from '../../../core/theme/surfaces';
import { resolveFontSize, resolveRadius, resolveScrim, resolveShadow, resolveSpacing } from '../../../core/theme/tokens';
import { getZIndex } from '../../../core/theme/zIndices';

/**
 * Type-checks a style table like `StyleSheet.create` (without registering it:
 * useThemedStyles already memoizes it per theme).
 */
function namedStyles<T extends StyleSheet.NamedStyles<T>>(table: T): T {
  return table;
}

/** Off-screen but still in the accessibility tree (the "sr-only" recipe). */
export const VISUALLY_HIDDEN_STYLE: ViewStyle = {
  position: 'absolute',
  start: -10000,
  width: 1,
  height: 1,
  overflow: 'hidden',
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  hidden: VISUALLY_HIDDEN_STYLE,
});

export interface AccessibleAnnouncerProps {
  children: React.ReactNode;
  /** Messages for screen readers; each new last entry is announced politely. */
  announcements: string[];
}

/**
 * Wraps `children` with a visually hidden polite live region listing
 * `announcements` (web `aria-live`, Android live region). iOS has no live
 * regions, so the newest entry is spoken with `announce()` there.
 */
export const AccessibleAnnouncer: React.FC<AccessibleAnnouncerProps> = ({ children, announcements }) => {
  const count = announcements.length;
  const latest = count > 0 ? announcements[count - 1] : undefined;

  useEffect(() => {
    if (isIOS && latest) announce(latest, { politeness: 'polite' });
    // `count` re-announces a repeated message appended again.
  }, [count, latest]);

  return (
    <View style={styles.fill}>
      {children}
      <View style={styles.hidden} {...a11yProps({ role: 'status', live: 'polite' })}>
        {announcements.map((announcement, index) => (
          <Text key={`${announcement}-${index}`}>{announcement}</Text>
        ))}
      </View>
    </View>
  );
};

export interface AccessibleModalProps {
  /** Whether the dialog is shown. */
  visible: boolean;
  /** Dialog title; it names the dialog for assistive technology. */
  title?: string;
  children: React.ReactNode;
  /** Called on Escape (web) / hardware back (Android). */
  onDismiss?: () => void;
}

/**
 * Modal dialog rendered in place over its container: role `dialog` +
 * `aria-modal`, named by its title, registered as a modal layer (focus moves in
 * and is trapped and restored on web; Escape / Android back call `onDismiss`).
 */
export const AccessibleModal: React.FC<AccessibleModalProps> = ({ visible, title, children, onDismiss }) => {
  const containerRef = useRef<View>(null);
  const titleId = useA11yId(undefined, 'pb-modal-title');
  const { id: layerId } = useLayer({
    active: visible,
    modal: true,
    onDismiss: () => onDismiss?.(),
    containerRef,
    initialFocus: 'container',
  });

  const themed = useThemedStyles((theme) =>
    namedStyles({
      backdrop: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        start: 0,
        end: 0,
        // Scrim behind the modal card — the theme's backdrop, like DropdownSheet's.
        backgroundColor: resolveScrim(theme),
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: getZIndex(theme, 'modal'),
      },
      card: {
        backgroundColor: resolveSurface(theme, 3).background,
        borderRadius: resolveRadius(theme, 'lg'),
        padding: resolveSpacing(theme, 'xl'),
        margin: resolveSpacing(theme, 'lg'),
        minWidth: 280,
        maxWidth: '90%',
        ...resolveShadow(theme, resolveSurface(theme, 3).shadow),
      },
      title: {
        fontSize: resolveFontSize(theme, 'lg'),
        fontWeight: '600',
        color: theme.text.primary,
        marginBottom: resolveSpacing(theme, 'md'),
      },
    })
  );

  if (!visible) return null;

  return (
    <View style={themed.backdrop}>
      <LayerScope id={layerId}>
        <View
          ref={containerRef}
          style={themed.card}
          {...a11yProps({ role: 'dialog', modal: true, labelledBy: title ? titleId : undefined })}
        >
          {title ? (
            <Text style={themed.title} {...a11yProps({ role: 'heading', id: titleId })}>
              {title}
            </Text>
          ) : null}
          {children}
        </View>
      </LayerScope>
    </View>
  );
};
