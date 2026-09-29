import React, { useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { ReactNode, RefObject } from 'react';
import { Keyboard, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { useKeyboardManagerOptional } from '../../../core/providers/KeyboardManagerProvider';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { resolveSurface } from '../../../core/theme/surfaces';
import { resolveTextRole } from '../../../core/theme/textRoles';
import { resolveFontSize, resolveRadius, resolveScrim, resolveShadow, resolveSpacing } from '../../../core/theme/tokens';
import {
  getServerViewportSnapshot,
  getViewportSnapshot,
  subscribeViewport,
} from '../../../core/responsive/viewportStore';
import { isIOS, isWeb } from '../../../core/platform';
import { handleModalRequestClose } from '../../../core/overlay/layerStack';
import { LayerScope, useLayer } from '../../../core/overlay/useLayer';
import { OverlayHost } from '../../../core/overlay/OverlayHost';
import { Icon } from '../../Icon';
import { pointerEventsStyles } from '../../../core/platform/pointerEvents';

export type DropdownSheetPlacement = 'center' | 'top' | 'bottom';

export interface DropdownSheetProps {
  /** Whether the sheet is shown. */
  opened: boolean;
  /** Close request: backdrop press, close button, Escape (web), Android back. */
  onClose: () => void;
  children?: ReactNode;
  /** Heading shown above the content; also the sheet's accessible name. */
  title?: ReactNode;
  /** Show a close button in the header. @default true when `title` is set */
  withCloseButton?: boolean;
  /** Accessible label of the close button. @default 'Close' */
  closeButtonLabel?: string;
  /** Accessible name when there is no string `title`. */
  accessibilityLabel?: string;
  /**
   * Where the card sits:
   * - `'center'` — a dialog card (Select, ColorInput, ColorPicker);
   * - `'top'` — pinned under the status bar, for content with a text input,
   *   so the on-screen keyboard never covers it (AutoComplete);
   * - `'bottom'` — a bottom sheet (full width, slides up).
   * @default 'center'
   */
  placement?: DropdownSheetPlacement;
  /** Card width. @default the viewport minus padding, capped at `maxWidth` ('100%' for bottom) */
  width?: DimensionValue;
  /** @default 400 (none for bottom) */
  maxWidth?: number;
  /** Card max height. @default the space left by safe area, padding and keyboard (≤ 80% of the screen) */
  maxHeight?: number;
  /** Shrink to stay above the on-screen keyboard. @default true */
  avoidKeyboard?: boolean;
  /** Wrap children in a ScrollView. @default false (lists bring their own) */
  scrollable?: boolean;
  /** @default true */
  closeOnBackdropPress?: boolean;
  /** Escape (web) and Android back close the sheet. @default true */
  closeOnEscape?: boolean;
  /** @default theme.backgrounds.scrim */
  backdropColor?: string;
  /** @default 'slide' for bottom, 'fade' otherwise */
  animationType?: 'fade' | 'slide' | 'none';
  /** Element focused when the sheet opens (web DOM focus). */
  initialFocusRef?: RefObject<unknown>;
  /** Return focus to the previously focused element on close. @default true */
  restoreFocus?: boolean;
  /** Styles for the card. */
  contentStyle?: StyleProp<ViewStyle>;
  /** Fired after the sheet is shown. */
  onShow?: () => void;
  /** Fired after the sheet has been hidden (iOS / web). */
  onDismiss?: () => void;
  testID?: string;
}

const FILL: ViewStyle = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 };
const FILL_FLEX: ViewStyle = { flex: 1 };
const DEFAULT_MAX_WIDTH = 400;
const MIN_HEIGHT = 180;

/** Keyboard height on native: from KeyboardManagerProvider when mounted, else our own listener. */
function useKeyboardInset(enabled: boolean): number {
  const manager = useKeyboardManagerOptional();
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!enabled || isWeb || manager) return undefined;
    const show = Keyboard.addListener(isIOS ? 'keyboardWillShow' : 'keyboardDidShow', (event) => {
      setHeight(event?.endCoordinates?.height ?? 0);
    });
    const hide = Keyboard.addListener(isIOS ? 'keyboardWillHide' : 'keyboardDidHide', () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [enabled, manager]);

  // Web: the viewport height already excludes the keyboard (visualViewport).
  if (!enabled || isWeb) return 0;
  if (manager) return manager.isKeyboardVisible ? manager.keyboardHeight : 0;
  return height;
}

/**
 * Internal: the shared small-screen / native presentation of a dropdown — a
 * Modal with a backdrop and a card (centered, top-pinned, or a bottom sheet).
 *
 * It is a modal layer in the overlay layer stack (Escape on web, Android back
 * via the Modal's `onRequestClose`, focus moved in and restored), and an
 * `OverlayHost`, so popovers/tooltips opened from inside it render above it.
 *
 * @example
 * <DropdownSheet opened={open} onClose={close} title="Choose a color">
 *   <SwatchGrid … />
 * </DropdownSheet>
 */
export function DropdownSheet(props: DropdownSheetProps) {
  const {
    opened,
    onClose,
    children,
    title,
    withCloseButton = title != null,
    closeButtonLabel = 'Close',
    accessibilityLabel,
    placement = 'center',
    width,
    maxWidth,
    maxHeight,
    avoidKeyboard = true,
    scrollable = false,
    closeOnBackdropPress = true,
    closeOnEscape = true,
    backdropColor,
    animationType,
    initialFocusRef,
    restoreFocus = true,
    contentStyle,
    onShow,
    onDismiss,
    testID,
  } = props;

  const theme = useTheme();
  const sheetRef = useRef<View>(null);
  const insets = useContext(SafeAreaInsetsContext);
  const viewport = useSyncExternalStore(subscribeViewport, getViewportSnapshot, getServerViewportSnapshot);
  const keyboardInset = useKeyboardInset(opened && avoidKeyboard);

  const { id: layerId } = useLayer({
    active: opened,
    onDismiss: () => onClose(),
    modal: true,
    closeOnEscape,
    containerRef: sheetRef,
    initialFocusRef,
    initialFocus: 'first-tabbable',
    restoreFocus,
  });

  const isBottom = placement === 'bottom';
  const padding = isBottom ? 0 : resolveSpacing(theme, placement === 'top' ? 'sm' : 'lg') as number;
  const safeTop = insets?.top ?? 0;
  const safeBottom = insets?.bottom ?? 0;

  const resolvedMaxWidth = maxWidth ?? (isBottom ? undefined : DEFAULT_MAX_WIDTH);
  const resolvedWidth: DimensionValue = width
    ?? (isBottom ? '100%' : Math.max(0, Math.min(viewport.width - padding * 2, resolvedMaxWidth ?? viewport.width)));

  // Room the card may use: the viewport minus insets, padding and keyboard.
  const available = viewport.height - safeTop - (isBottom ? 0 : safeBottom) - padding * 2 - keyboardInset;
  const resolvedMaxHeight = maxHeight
    ?? Math.max(MIN_HEIGHT, Math.min(available, Math.round(viewport.height * (isBottom ? 0.85 : 0.8))));

  const surface = resolveSurface(theme, 2);
  const radius = resolveRadius(theme, 'lg');
  const styles = useMemo(() => {
    const rootStyle: ViewStyle = {
      flex: 1,
      paddingTop: isBottom ? 0 : safeTop + padding,
      paddingBottom: isBottom ? keyboardInset : safeBottom + padding + keyboardInset,
      paddingHorizontal: padding,
      alignItems: 'center',
      justifyContent: placement === 'top' ? 'flex-start' : isBottom ? 'flex-end' : 'center',
    };
    const cardStyle: ViewStyle = {
      width: resolvedWidth,
      maxWidth: resolvedMaxWidth,
      maxHeight: resolvedMaxHeight,
      backgroundColor: surface.background,
      borderColor: surface.border,
      borderWidth: isBottom ? 0 : 1,
      borderRadius: radius,
      ...(isBottom ? { borderBottomStartRadius: 0, borderBottomEndRadius: 0, paddingBottom: safeBottom } : null),
      overflow: 'hidden',
      ...resolveShadow(theme, surface.shadow === 'none' ? 'lg' : surface.shadow),
    };
    const headerStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      gap: resolveSpacing(theme, 'sm') as number,
      paddingHorizontal: resolveSpacing(theme, 'md') as number,
      paddingTop: resolveSpacing(theme, 'md') as number,
      paddingBottom: resolveSpacing(theme, 'sm') as number,
    };
    return { rootStyle, cardStyle, headerStyle };
  }, [isBottom, safeTop, safeBottom, padding, keyboardInset, placement, resolvedWidth, resolvedMaxWidth, resolvedMaxHeight, surface.background, surface.border, surface.shadow, radius, theme]);

  const titleIsText = typeof title === 'string' || typeof title === 'number';
  const titleStyle = useMemo(() => resolveTextRole(theme, 'panelTitle'), [theme]);
  const sheetLabel = accessibilityLabel ?? (titleIsText ? String(title) : undefined);
  const iconSize = resolveFontSize(theme, 'lg');

  const header = title != null || withCloseButton ? (
    <View style={styles.headerStyle}>
      <View style={{ flex: 1 }}>
        {titleIsText ? (
          <Text
            role="heading"
            // The panelTitle role steps back from the option rows below it
            // (secondary, one size down) so the title never reads as an option.
            style={titleStyle}
            numberOfLines={2}
          >
            {title}
          </Text>
        ) : title}
      </View>
      {withCloseButton && (
        <Pressable
          onPress={onClose}
          role="button"
          aria-label={closeButtonLabel}
          hitSlop={8}
          testID={testID ? `${testID}-close` : undefined}
          style={({ pressed }) => [{ padding: 4, borderRadius: 6 }, pressed ? { opacity: 0.6 } : null]}
        >
          <Icon name="x" size={iconSize} color={theme.text.muted} />
        </Pressable>
      )}
    </View>
  ) : null;

  const body = scrollable ? (
    <ScrollView keyboardShouldPersistTaps="handled" style={{ flexGrow: 0 }}>
      {children}
    </ScrollView>
  ) : children;

  return (
    <Modal
      visible={opened}
      transparent
      animationType={animationType ?? (isBottom ? 'slide' : 'fade')}
      statusBarTranslucent
      // Android back goes to the layer stack (topmost layer only); on web the
      // stack already handled Escape on keydown.
      onRequestClose={handleModalRequestClose}
      onShow={onShow}
      onDismiss={onDismiss}
      testID={testID}
    >
      <OverlayHost>
        <LayerScope id={layerId}>
          <View style={FILL_FLEX}>
            <Pressable
              style={[FILL, { backgroundColor: backdropColor ?? resolveScrim(theme) }]}
              onPress={closeOnBackdropPress ? onClose : undefined}
              // The close button / Escape / back are the accessible ways out;
              // the scrim is a pointer affordance only.
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              aria-hidden
              tabIndex={-1}
              testID={testID ? `${testID}-backdrop` : undefined}
            />
            {/* Presses outside the card fall through to the backdrop. */}
            <View style={[styles.rootStyle, pointerEventsStyles.boxNone]}>
              <View
                ref={sheetRef}
                role="dialog"
                aria-modal
                aria-label={sheetLabel}
                accessibilityViewIsModal
                style={[styles.cardStyle, contentStyle]}
                testID={testID ? `${testID}-content` : undefined}
              >
                {header}
                {body}
              </View>
            </View>
          </View>
        </LayerScope>
      </OverlayHost>
    </Modal>
  );
}
