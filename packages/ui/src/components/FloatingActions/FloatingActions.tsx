// TODO: Refactor to be more modular, just a proof-of-concept for now

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform, View, Pressable, Linking, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../core/theme/ThemeProvider';
import { Icon } from '../Icon';
// import { useColorScheme } from '../../core/theme/useColorScheme';
import { directSpotlight } from '../Spotlight';
import { useThemeMode } from 'platform-blocks/core/theme/ThemeModeProvider';
import { useDisclosure } from '../../hooks';
import { useMergedRef } from '../../core/utils';

export interface FloatingActionItem {
  key: string;
  icon?: string;
  getIcon?: () => string;
  onPress: () => void;
  accessibilityLabel?: string;
}

export interface FloatingActionsProps {
  /** Custom actions. If not provided, defaults to spotlight, theme toggle, and GitHub */
  actions?: FloatingActionItem[];
  /** Called when the speed dial opens */
  onOpen?: () => void;
  /** Called when the speed dial closes */
  onClose?: () => void;
  /** If true, clicking/tapping outside will not close the menu */
  disableOutsideClose?: boolean;
  /** Radius (in px) for the arc along which actions are laid out */
  radius?: number;
  /** Container style (position should remain absolute for proper layout) */
  style?: ViewStyle;
  /** Handler to toggle theme (if omitted, the Theme action still shows but will be a no-op) */
  onToggleTheme?: () => void;
  /** GitHub URL for the default GitHub action */
  githubUrl?: string;
}

const DEFAULT_GITHUB_URL = 'https://github.com/joshstovall/platform-blocks';

export const FloatingActions = React.memo(
  React.forwardRef<View, FloatingActionsProps>(({
    actions,
    onOpen,
    onClose,
    disableOutsideClose = false,
    radius = 88,
    style,
    onToggleTheme,
    githubUrl = DEFAULT_GITHUB_URL,
  }, ref) => {
    const theme = useTheme();
    // const scheme = useColorScheme();
      const { mode, cycleMode } = useThemeMode();

    const containerRef = useRef<View>(null);
    const mainButtonRef = useRef<any>(null);

    // Focusable refs for web keyboard nav
    const actionRefs = useRef<any[]>([]);

    // useDisclosure handles the boolean state plus onOpen/onClose firing on
    // real transitions only — replaces the manual useState + transition logic.
    const [isOpen, { open, close, toggle: toggleOpen }] = useDisclosure(false, {
      onOpen,
      onClose,
    });

    const closeMenu = close;

    const toggle = useCallback(() => {
      if (!isOpen) {
        // Focus first action on web for accessibility before flipping state
        if (Platform.OS === 'web') {
          actionRefs.current?.[0]?.focus?.();
        }
        open();
      } else {
        toggleOpen();
      }
    }, [isOpen, open, toggleOpen]);

    const handleActionPress = useCallback(
      (callback: () => void) => {
        try {
          callback?.();
        } finally {
          closeMenu();
        }
      },
      [closeMenu]
    );

    const defaultActions: FloatingActionItem[] = useMemo(() => {
      return [
        { key: 'spotlight', icon: 'search', onPress: () => directSpotlight.open(), accessibilityLabel: 'Open spotlight' },
        {
          key: 'theme',
          getIcon: () => (mode === 'light' ? 'sun' : mode === 'dark' ? 'moon' : 'contrast'),
          onPress: () => onToggleTheme?.(),
          accessibilityLabel: 'Toggle theme',
        },
        { key: 'github', icon: 'info', onPress: () => Linking.openURL(githubUrl), accessibilityLabel: 'Open GitHub' },
      ];
    }, [mode, onToggleTheme, githubUrl]);

    const resolvedActions = actions && actions.length > 0 ? actions : defaultActions;

    // Outside click/tap handling
    useEffect(() => {
      if (!isOpen || disableOutsideClose) return;
      if (Platform.OS !== 'web') return; // web only below

      const handler = (e: Event) => {
        const target = e.target as Node | null;
        if (!target) return;
        const el = containerRef.current as any;
        if (el && typeof el.contains === 'function' && el.contains(target)) return;
        closeMenu();
      };
      document.addEventListener('pointerdown', handler, true);
      return () => document.removeEventListener('pointerdown', handler, true);
    }, [isOpen, disableOutsideClose, closeMenu]);

    // Focus trap & keyboard accessibility (web only)
    useEffect(() => {
      if (Platform.OS !== 'web') return;
      if (!isOpen) return;
      const keyHandler = (e: KeyboardEvent) => {
        if (!isOpen) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          closeMenu();
          mainButtonRef.current?.focus?.();
          return;
        }
        if (e.key === 'Tab') {
          e.preventDefault();
          const focusables = [...actionRefs.current.slice(0, resolvedActions.length), mainButtonRef.current].filter(Boolean);
          if (focusables.length === 0) return;
          const currentIndex = focusables.indexOf(document.activeElement as any);
          const dir = e.shiftKey ? -1 : 1;
          const nextIndex = (currentIndex + dir + focusables.length) % focusables.length;
          (focusables[nextIndex] as any)?.focus?.();
        }
      };
      document.addEventListener('keydown', keyHandler, true);
      return () => document.removeEventListener('keydown', keyHandler, true);
    }, [isOpen, closeMenu, resolvedActions.length]);

    const mergedContainerRef = useMergedRef<View>(containerRef, ref);

    return (
      <View
        ref={mergedContainerRef}
        style={[
          styles.container,
          { bottom: 24, right: 24, pointerEvents: 'box-none' },
          style,
        ]}
      >
        {/* Native overlay to capture outside presses */}
        {isOpen && !disableOutsideClose && Platform.OS !== 'web' && (
          <Pressable
            key="press-outside-overlay"
            style={StyleSheet.absoluteFill}
            accessibilityLabel="Close actions overlay"
            onPress={closeMenu}
          />
        )}

        {/* Action buttons */}
        {isOpen &&
          resolvedActions.map((a, idx, arr) => {
            const angle = (idx / Math.max(arr.length - 1, 1)) * (Math.PI / 2);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <View key={a.key} style={{ position: 'absolute', bottom: y, right: x }}>
                <Pressable
                  ref={(el) => {
                    actionRefs.current[idx] = el as any;
                  }}
                  accessibilityLabel={a.accessibilityLabel || a.key}
                  accessibilityRole="button"
                  accessibilityHint={a.key === 'theme' ? 'Toggle color theme' : undefined}
                  onPress={() => handleActionPress(a.onPress)}
                  style={({ pressed }) => [
                    styles.actionButton,
                    {
                      backgroundColor: theme.colors.primary[6],
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Icon name={(a.getIcon ? a.getIcon() : a.icon) as any} size={22} color={theme.text.onPrimary || '#FFFFFF'} />
                </Pressable>
              </View>
            );
          })}

        {/* Main button */}
        <View style={{ transform: [{ rotate: isOpen ? '45deg' : '0deg' }] }}>
          <Pressable
            ref={mainButtonRef}
            accessibilityLabel={isOpen ? 'Close actions' : 'Open actions'}
            accessibilityRole="button"
            accessibilityHint={isOpen ? 'Closes action menu' : 'Opens action menu'}
            onPress={toggle}
            style={({ pressed }) => [
              styles.mainButton,
              { backgroundColor: theme.colors.primary[5], transform: [{ scale: pressed ? 0.96 : 1 }] },
            ]}
          >
            <Icon name="plus" size={28} color={theme.text.onPrimary || '#FFFFFF'} />
          </Pressable>
        </View>
      </View>
    );
  })
);

FloatingActions.displayName = 'FloatingActions';

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 26,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  container: {
    position: 'absolute',
    zIndex: 3000,
  },
  mainButton: {
    alignItems: 'center',
    borderRadius: 30,
    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.3)',
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
});

export default FloatingActions;
