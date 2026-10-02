import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Linking, View, type ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { useA11yId } from '../../core/accessibility/useA11yId';
import { factory } from '../../core/factory';
import { hasDOM, webProps } from '../../core/platform';
import { useLayer } from '../../core/overlay/useLayer';
import { useOptionalThemeMode } from '../../core/theme/ThemeModeProvider';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize, onColor, resolveShadow } from '../../core/theme/tokens';
import { getZIndex } from '../../core/theme/zIndices';
import type { BaseProps, ColorProp } from '../../core/types/base';
import { devError, warnOnce } from '../../core/utils/logger';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { extractStyleProps, resolveStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState';
import { IconButton } from '../IconButton';
import type { IconButtonVariant } from '../IconButton/types';
import { Text } from '../Text';
import { Tooltip } from '../Tooltip';
import { pointerEventsStyles } from '../../core/platform/pointerEvents';

export interface FloatingActionItem {
  key: string;
  /** Icon registry name */
  icon?: string;
  /** Icon name computed at render time (e.g. reflecting the current theme mode) */
  getIcon?: () => string;
  onPress: () => void;
  /** Visible label; defaults to `accessibilityLabel`, then `key` */
  label?: string;
  /** Accessible name of the action (falls back to `key`, with a dev warning) */
  accessibilityLabel?: string;
  /** Extra description for screen readers (native) */
  accessibilityHint?: string;
  /** Use the Button theme roles for each action. @default 'filled' */
  variant?: IconButtonVariant;
  /** Override the dial's color for this action. */
  color?: ColorProp;
  /** Disabled actions remain visible but cannot be activated. */
  disabled?: boolean;
}

export interface FloatingActionsProps extends BaseProps<ViewStyle> {
  /** Custom actions. If not provided, defaults to a theme toggle, plus Spotlight and GitHub when `onOpenSpotlight` / `githubUrl` are set */
  actions?: FloatingActionItem[];
  /** Called when the speed dial opens */
  onOpen?: () => void;
  /** Called when the speed dial closes */
  onClose?: () => void;
  /** Controlled open state. */
  opened?: boolean;
  /** Initial open state when uncontrolled. @default false */
  defaultOpened?: boolean;
  /** Called when an interaction requests an open-state change. */
  onChange?: (opened: boolean) => void;
  /** How the dial opens on web. Tap and keyboard activation work in either mode. @default 'click' */
  trigger?: 'click' | 'hover';
  /** If true, clicking/tapping outside will not close the menu (web) */
  disableOutsideClose?: boolean;
  /** Action layout. @default 'stack' */
  mode?: 'stack' | 'flower';
  /** How action labels appear. @default 'tooltip' */
  labelMode?: 'tooltip' | 'persistent' | 'none';
  /** Minimum radius (in px) of the flower layout. @default 88 */
  arcRadius?: number;
  /** Button color: palette token, `'primary.6'` shade syntax, or CSS color. @default 'primary' */
  color?: ColorProp;
  /** Trigger and default action appearance. @default 'filled' */
  variant?: IconButtonVariant;
  /** Trigger icon while closed. @default 'plus' */
  toggleIcon?: string;
  /** Trigger icon while open. Defaults to a rotated plus when `toggleIcon` is `'plus'`, otherwise `'close'`. */
  closeIcon?: string;
  /** Opens Spotlight; the default Spotlight action is only shown when this is set */
  onOpenSpotlight?: () => void;
  /** Handler to toggle theme (if omitted, the Theme action still shows but will be a no-op) */
  onToggleTheme?: () => void;
  /** Repository URL for the default GitHub action; the action is only shown when this is set */
  githubUrl?: string;
  /** Accessible names of the main button. @default { open: 'Open actions', close: 'Close actions' } */
  toggleLabels?: { open: string; close: string };
}

const DEFAULT_TOGGLE_LABELS = { open: 'Open actions', close: 'Close actions' };
const EDGE_OFFSET = 24;
const ACTION_GAP = 12;
const HOVER_CLOSE_DELAY = 150;

/**
 * A floating speed dial pinned to the bottom end corner. Actions stack above
 * the trigger by default or fan out along a quarter-circle in flower mode.
 *
 * The main button is a disclosure (`aria-expanded`, `aria-controls`). While
 * open, the actions form a layer: focus moves to the first action, Tab cycles
 * within the dial, Escape (web) / back (Android) or a press outside (web)
 * closes it, and focus returns to the main button.
 */
export const FloatingActions = factory<{ props: FloatingActionsProps; ref: View }>((props, ref) => {
  const {
    actions,
    onOpen,
    onClose,
    opened,
    defaultOpened = false,
    onChange,
    trigger = 'click',
    disableOutsideClose = false,
    mode = 'stack',
    labelMode = 'tooltip',
    arcRadius = 88,
    color = 'primary',
    variant = 'filled',
    toggleIcon = 'plus',
    closeIcon,
    style,
    onToggleTheme,
    onOpenSpotlight,
    githubUrl,
    toggleLabels = DEFAULT_TOGGLE_LABELS,
    testID,
    ...rest
  } = props;

  const theme = useTheme();
  const themeMode = useOptionalThemeMode();
  const colorMode = themeMode?.mode;
  const { styleProps } = extractStyleProps(rest);
  const actionsId = useA11yId(undefined, 'plocks-floating-actions');

  const containerRef = useRef<View>(null);
  const mergedContainerRef = useMergedRef<View>(containerRef, ref);
  const [isOpen, setOpen] = useControllableState<boolean>({
    value: opened,
    defaultValue: defaultOpened,
    finalValue: false,
    onChange,
  });
  const openRef = useRef(isOpen);
  openRef.current = isOpen;
  const hoveredRef = useRef(false);
  const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoverClose = useCallback(() => {
    if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current);
    hoverCloseTimer.current = null;
  }, []);
  useEffect(() => clearHoverClose, [clearHoverClose]);

  const commitOpen = useCallback((next: boolean) => {
    if (openRef.current === next) return;
    openRef.current = next;
    setOpen(next);
    if (next) onOpen?.();
    else onClose?.();
  }, [setOpen, onOpen, onClose]);
  const open = useCallback(() => commitOpen(true), [commitOpen]);
  const close = useCallback(() => {
    clearHoverClose();
    commitOpen(false);
  }, [clearHoverClose, commitOpen]);
  const toggle = useCallback(() => commitOpen(!openRef.current), [commitOpen]);

  const hoverEnabled = () =>
    hasDOM &&
    (window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? true);
  const handleHoverEnter = () => {
    if (!hoverEnabled()) return;
    hoveredRef.current = true;
    clearHoverClose();
    open();
  };
  const handleHoverLeave = () => {
    if (!hoveredRef.current) return;
    hoveredRef.current = false;
    clearHoverClose();
    hoverCloseTimer.current = setTimeout(close, HOVER_CLOSE_DELAY);
  };
  const handleTriggerPress = () => {
    if (trigger === 'hover' && hoveredRef.current) open();
    else toggle();
  };

  useLayer({
    active: isOpen,
    onDismiss: close,
    closeOnOutsidePress: !disableOutsideClose,
    trapFocus: true,
    containerRef,
  });

  const handleActionPress = useCallback(
    (callback: () => void) => {
      try {
        callback();
      } finally {
        close();
      }
    },
    [close]
  );

  const defaultActions = useMemo<FloatingActionItem[]>(() => {
    const items: FloatingActionItem[] = [];
    if (onOpenSpotlight) {
      items.push({ key: 'spotlight', icon: 'search', onPress: onOpenSpotlight, accessibilityLabel: 'Open spotlight' });
    }
    items.push({
        key: 'theme',
        getIcon: () => (colorMode === 'light' ? 'sun' : colorMode === 'dark' ? 'moon' : 'contrast'),
        onPress: () => onToggleTheme?.(),
        accessibilityLabel: 'Toggle theme',
        accessibilityHint: 'Toggles the color theme',
    });
    if (githubUrl) {
      items.push({
        key: 'github',
        icon: 'info',
        onPress: () => {
          Linking.openURL(githubUrl).catch((error) => devError('FloatingActions: failed to open URL', githubUrl, error));
        },
        accessibilityLabel: 'Open GitHub',
      });
    }
    return items;
  }, [colorMode, onToggleTheme, onOpenSpotlight, githubUrl]);

  const resolvedActions = actions && actions.length > 0 ? actions : defaultActions;

  const mainSize = getControlSize(theme, '3xl');
  const actionSize = getControlSize(theme, 'xl');
  const centerOffset = (mainSize.height - actionSize.height) / 2;
  const flowerRadius = Math.max(
    arcRadius,
    (mainSize.height + actionSize.height) / 2 + ACTION_GAP,
    resolvedActions.length > 1
      ? ((resolvedActions.length - 1) * (actionSize.height + ACTION_GAP)) / (Math.PI / 2)
      : arcRadius
  );

  return (
    <View
      ref={mergedContainerRef}
      testID={testID}
      {...(trigger === 'hover' ? webProps({ onMouseEnter: handleHoverEnter, onMouseLeave: handleHoverLeave }) : null)}
      style={[
        {
          position: 'absolute',
          bottom: EDGE_OFFSET,
          end: EDGE_OFFSET,
          zIndex: getZIndex(theme, 'sticky'),
        },
        pointerEventsStyles.boxNone,
        resolveStyleProps(styleProps, theme),
        style,
      ]}
    >
      {isOpen ? (
        <View
          {...a11yProps({ id: actionsId })}
          style={[{
            position: 'absolute',
            bottom: 0,
            end: 0,
            width: mainSize.height,
            height: mainSize.height,
          }, pointerEventsStyles.boxNone]}
        >
          {resolvedActions.map((action, index, all) => {
            const angle = all.length === 1 ? Math.PI / 4 : (index / (all.length - 1)) * (Math.PI / 2);
            const label = action.label ?? action.accessibilityLabel ?? action.key;
            const accessibleName = action.accessibilityLabel ?? action.label ?? action.key;
            if (!action.accessibilityLabel && !action.label) {
              warnOnce(
                `FloatingActions.label:${action.key}`,
                `FloatingActions: action "${action.key}" has no label or accessibilityLabel; its key is used as the name.`
              );
            }
            const position: ViewStyle = mode === 'stack'
              ? {
                  bottom: mainSize.height + ACTION_GAP + (all.length - index - 1) * (actionSize.height + ACTION_GAP),
                  end: centerOffset,
                }
              : {
                  bottom: centerOffset + Math.cos(angle) * flowerRadius,
                  end: centerOffset + Math.sin(angle) * flowerRadius,
                };
            const button = (
              <IconButton
                icon={action.getIcon ? action.getIcon() : action.icon ?? 'plus'}
                accessibilityLabel={accessibleName}
                accessibilityHint={action.accessibilityHint}
                variant={action.variant ?? variant}
                color={action.color ?? color}
                disabled={action.disabled}
                size="xl"
                radius="full"
                shadow="md"
                onPress={() => handleActionPress(action.onPress)}
              />
            );
            return (
              <View
                key={action.key}
                style={{ position: 'absolute', ...position }}
              >
                {labelMode === 'persistent' && (
                  <View style={{
                    position: 'absolute',
                    end: actionSize.height + ACTION_GAP,
                    top: (actionSize.height - 30) / 2,
                    minHeight: 30,
                    maxWidth: 200,
                    justifyContent: 'center',
                    paddingHorizontal: 10,
                    borderRadius: 6,
                    backgroundColor: theme.text.primary,
                    ...resolveShadow(theme, 'sm'),
                  }}>
                    <Text numberOfLines={1} style={{ color: onColor(theme, theme.text.primary), fontSize: 13 }}>
                      {label}
                    </Text>
                  </View>
                )}
                {labelMode === 'tooltip' ? (
                  <Tooltip label={label} position="left" events={{ touch: false }}>
                    {button}
                  </Tooltip>
                ) : button}
              </View>
            );
          })}
        </View>
      ) : null}

      <View style={{ transform: [{ rotate: isOpen && !closeIcon && toggleIcon === 'plus' ? '45deg' : '0deg' }] }}>
        <IconButton
          icon={isOpen ? closeIcon ?? (toggleIcon === 'plus' ? 'plus' : 'close') : toggleIcon}
          accessibilityLabel={isOpen ? toggleLabels.close : toggleLabels.open}
          aria-expanded={isOpen}
          aria-controls={isOpen ? actionsId : undefined}
          onPress={handleTriggerPress}
          variant={variant}
          color={color}
          size="3xl"
          iconSize={mainSize.iconSize}
          radius="full"
          shadow="lg"
        />
      </View>
    </View>
  );
}, { displayName: 'FloatingActions' });

export default FloatingActions;
