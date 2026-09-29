import React, { useCallback, useMemo, useRef } from 'react';
import { Linking, Pressable, View, type ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { useA11yId } from '../../core/accessibility/useA11yId';
import { factory } from '../../core/factory';
import { useLayer } from '../../core/overlay/useLayer';
import { resolveColorProp } from '../../core/theme/resolveColors';
import { useOptionalThemeMode } from '../../core/theme/ThemeModeProvider';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize, onColor, resolveShadow } from '../../core/theme/tokens';
import { getZIndex } from '../../core/theme/zIndices';
import type { BaseProps, ColorProp } from '../../core/types/base';
import { devError, warnOnce } from '../../core/utils/logger';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { extractStyleProps, resolveStyleProps } from '../../core/utils/spacing';
import { useDisclosure } from '../../hooks/useDisclosure';
import { Icon } from '../Icon/Icon';
import { directSpotlight } from '../Spotlight';
import { pointerEventsStyles } from '../../core/platform/pointerEvents';

export interface FloatingActionItem {
  key: string;
  /** Icon registry name */
  icon?: string;
  /** Icon name computed at render time (e.g. reflecting the current theme mode) */
  getIcon?: () => string;
  onPress: () => void;
  /** Accessible name of the action (falls back to `key`, with a dev warning) */
  accessibilityLabel?: string;
  /** Extra description for screen readers (native) */
  accessibilityHint?: string;
}

export interface FloatingActionsProps extends BaseProps<ViewStyle> {
  /** Custom actions. If not provided, defaults to spotlight, theme toggle, and GitHub */
  actions?: FloatingActionItem[];
  /** Called when the speed dial opens */
  onOpen?: () => void;
  /** Called when the speed dial closes */
  onClose?: () => void;
  /** If true, clicking/tapping outside will not close the menu (web) */
  disableOutsideClose?: boolean;
  /** Radius (in px) of the arc the actions are laid out along. @default 88 */
  arcRadius?: number;
  /** @deprecated Use `arcRadius` (this is the layout arc, not a corner radius). */
  radius?: number;
  /** Button color: palette token, `'primary.6'` shade syntax, or CSS color. @default 'primary' */
  color?: ColorProp;
  /** Handler to toggle theme (if omitted, the Theme action still shows but will be a no-op) */
  onToggleTheme?: () => void;
  /** GitHub URL for the default GitHub action */
  githubUrl?: string;
  /** Accessible names of the main button. @default { open: 'Open actions', close: 'Close actions' } */
  toggleLabels?: { open: string; close: string };
}

const DEFAULT_GITHUB_URL = 'https://github.com/platform-blocks/platform-blocks';
const DEFAULT_TOGGLE_LABELS = { open: 'Open actions', close: 'Close actions' };
const EDGE_OFFSET = 24;
const CENTERED: ViewStyle = { alignItems: 'center', justifyContent: 'center' };

/**
 * A floating speed dial pinned to the bottom end corner: a main button that
 * fans out a set of actions along an arc.
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
    disableOutsideClose = false,
    arcRadius: arcRadiusProp,
    radius: legacyRadius,
    color = 'primary',
    style,
    onToggleTheme,
    githubUrl = DEFAULT_GITHUB_URL,
    toggleLabels = DEFAULT_TOGGLE_LABELS,
    testID,
    ...rest
  } = props;

  if (legacyRadius !== undefined) {
    warnOnce('FloatingActions.radius', 'FloatingActions: `radius` is deprecated; use `arcRadius`.');
  }
  const arcRadius = arcRadiusProp ?? legacyRadius ?? 88;

  const theme = useTheme();
  const themeMode = useOptionalThemeMode();
  const mode = themeMode?.mode;
  const { styleProps } = extractStyleProps(rest);
  const actionsId = useA11yId(undefined, 'pb-floating-actions');

  const containerRef = useRef<View>(null);
  const mergedContainerRef = useMergedRef<View>(containerRef, ref);

  // Fires onOpen/onClose on real transitions only.
  const [isOpen, { close, toggle }] = useDisclosure(false, { onOpen, onClose });

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

  const defaultActions = useMemo<FloatingActionItem[]>(
    () => [
      { key: 'spotlight', icon: 'search', onPress: () => directSpotlight.open(), accessibilityLabel: 'Open spotlight' },
      {
        key: 'theme',
        getIcon: () => (mode === 'light' ? 'sun' : mode === 'dark' ? 'moon' : 'contrast'),
        onPress: () => onToggleTheme?.(),
        accessibilityLabel: 'Toggle theme',
        accessibilityHint: 'Toggles the color theme',
      },
      {
        key: 'github',
        icon: 'info',
        onPress: () => {
          Linking.openURL(githubUrl).catch((error) => devError('FloatingActions: failed to open URL', githubUrl, error));
        },
        accessibilityLabel: 'Open GitHub',
      },
    ],
    [mode, onToggleTheme, githubUrl]
  );

  const resolvedActions = actions && actions.length > 0 ? actions : defaultActions;

  const mainColor = resolveColorProp(theme, color) ?? theme.text.link;
  const actionColor = resolveColorProp(theme, color, { shades: [6, 5] }) ?? mainColor;
  const mainSize = getControlSize(theme, '3xl');
  const actionSize = getControlSize(theme, 'xl');

  return (
    <View
      ref={mergedContainerRef}
      testID={testID}
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
        <View {...a11yProps({ id: actionsId })}>
          {resolvedActions.map((action, index, all) => {
            const angle = (index / Math.max(all.length - 1, 1)) * (Math.PI / 2);
            const label = action.accessibilityLabel ?? action.key;
            if (!action.accessibilityLabel) {
              warnOnce(
                `FloatingActions.label:${action.key}`,
                `FloatingActions: action "${action.key}" has no accessibilityLabel; its key is used as the name.`
              );
            }
            return (
              <View
                key={action.key}
                style={{ position: 'absolute', bottom: Math.sin(angle) * arcRadius, end: Math.cos(angle) * arcRadius }}
              >
                <Pressable
                  {...a11yProps({ role: 'button', label, hint: action.accessibilityHint })}
                  onPress={() => handleActionPress(action.onPress)}
                  style={({ pressed }) => [
                    CENTERED,
                    {
                      width: actionSize.height,
                      height: actionSize.height,
                      borderRadius: actionSize.height / 2,
                      backgroundColor: actionColor,
                      opacity: pressed ? 0.85 : 1,
                    },
                    resolveShadow(theme, 'md'),
                  ]}
                >
                  <Icon
                    name={action.getIcon ? action.getIcon() : action.icon}
                    size={actionSize.iconSize + 2}
                    color={onColor(theme, actionColor)}
                  />
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : null}

      <View style={{ transform: [{ rotate: isOpen ? '45deg' : '0deg' }] }}>
        <Pressable
          {...a11yProps({
            role: 'button',
            label: isOpen ? toggleLabels.close : toggleLabels.open,
            expanded: isOpen,
            controls: isOpen ? actionsId : undefined,
          })}
          onPress={toggle}
          style={({ pressed }) => [
            CENTERED,
            {
              width: mainSize.height,
              height: mainSize.height,
              borderRadius: mainSize.height / 2,
              backgroundColor: mainColor,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
            resolveShadow(theme, 'lg'),
          ]}
        >
          <Icon name="plus" size={mainSize.iconSize} color={onColor(theme, mainColor)} />
        </Pressable>
      </View>
    </View>
  );
}, { displayName: 'FloatingActions' });

export default FloatingActions;
