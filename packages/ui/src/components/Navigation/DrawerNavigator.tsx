import React, { useCallback, useId, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory/factory';
import { createThemedStyles } from '../../core/hooks/useThemedStyles';
import { useReducedMotion } from '../../core/motion/useReducedMotion';
import { LayerScope, sanitizeId, useLayer } from '../../core/overlay/useLayer';
import { isIOS, isWeb } from '../../core/platform/flags';
import { webProps } from '../../core/platform/webProps';
import { useDirection } from '../../core/providers/DirectionProvider';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveTextRole } from '../../core/theme/textRoles';
import { resolveFontSize, resolveScrim, resolveShadow } from '../../core/theme/tokens';
import { getZIndex } from '../../core/theme/zIndices';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';

import { useNavigation } from './NavigationContext';
import { resolveScreenOptions, useInitialRoute, useScreens } from './screens';
import type {
  DrawerContentProps,
  DrawerNavigatorProps,
  DrawerOptions,
  DrawerScreenConfig,
  DrawerScreenProps,
  Route,
} from './types';

const DRAWER_WIDTH = 280;
const ANIMATION_MS = 250;
const DRAWER_ICON_SIZE = 24;

const HIDDEN: ViewStyle = { display: 'none' };

export interface DrawerNavigatorConfig {
  Navigator: React.ComponentType<DrawerNavigatorProps>;
  Screen: React.ComponentType<DrawerScreenProps>;
}

// Built once per theme. Named `styles` so the unused-styles lint rule can
// match it with the `styles.x` reads below.
const getStyles = createThemedStyles((theme) => {
  const styles = StyleSheet.create({
    backdrop: {
      bottom: 0,
      end: 0,
      position: 'absolute',
      start: 0,
      top: 0,
      // Scrim behind the open drawer (the same token as Dialog's backdrop).
      backgroundColor: resolveScrim(theme),
      zIndex: getZIndex(theme, 'overlay'),
    },
    backdropPressable: {
      flex: 1,
    },
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
    },
    drawerContent: {
      flex: 1,
    },
    drawerHeader: {
      padding: 20,
      // iOS draws under the status bar; leave room for it.
      paddingTop: isIOS ? 60 : 20,
    },
    drawerIcon: {
      alignItems: 'center',
      marginEnd: 16,
      width: DRAWER_ICON_SIZE,
    },
    drawerItem: {
      alignItems: 'center',
      flexDirection: 'row',
      minHeight: 44,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    drawerItemActive: {
      backgroundColor: theme.backgrounds.selected,
    },
    drawerLabel: {
      color: theme.text.primary,
      fontSize: resolveFontSize(theme, 'md'),
      fontWeight: '500',
    },
    drawerLabelActive: {
      color: theme.text.link,
    },
    // Names the list of screens below it, so it steps back from them.
    drawerTitle: resolveTextRole(theme, 'panelTitle'),
    hamburger: {
      height: 18,
      justifyContent: 'space-between',
      width: 24,
    },
    hamburgerLine: {
      backgroundColor: theme.text.secondary,
      borderRadius: 1,
      height: 2,
      width: '100%',
    },
    header: {
      alignItems: 'center',
      backgroundColor: theme.backgrounds.surface,
      borderBottomColor: theme.backgrounds.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      height: isIOS ? 88 : 56,
      paddingHorizontal: 16,
      paddingTop: isIOS ? 44 : 0,
      ...resolveShadow(theme, 'xs'),
    },
    headerRight: {
      alignItems: 'flex-end',
      minWidth: 44,
    },
    headerTitle: {
      color: theme.text.primary,
      flex: 1,
      fontSize: resolveFontSize(theme, 'lg'),
      fontWeight: '600',
    },
    menuButton: {
      alignItems: 'center',
      height: 44,
      justifyContent: 'center',
      marginEnd: 8,
      width: 44,
    },
    panel: {
      backgroundColor: theme.backgrounds.elevated,
      bottom: 0,
      position: 'absolute',
      // Logical: the drawer sits on the reading-start edge, and flips in RTL.
      start: 0,
      top: 0,
      width: DRAWER_WIDTH,
      zIndex: getZIndex(theme, 'modal'),
      ...resolveShadow(theme, 'lg'),
    },
  });
  return styles;
});

const DrawerNavigator = factory<{ props: DrawerNavigatorProps; ref: View }>((props, ref) => {
  const { styleProps, otherProps } = extractStyleProps(props);
  const {
    children,
    initialRouteName,
    screenOptions,
    drawerStyle,
    drawerContent,
    drawerAccessibilityLabel = 'Navigation',
    style,
    testID,
  } = otherProps;
  const spacing = useStyleProps(styleProps);
  const navigation = useNavigation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const { isRTL } = useDirection();
  const reducedMotion = useReducedMotion();
  const screens = useScreens<DrawerOptions>(children);

  const drawerId = `plocks-drawer-${sanitizeId(useId())}`;
  const panelRef = useRef<View>(null);
  const menuButtonRef = useRef<View>(null);

  // `open` is the target; `panelVisible` keeps the panel rendered until the
  // close animation has finished, then takes it out of the layout, the tab
  // order and the accessibility tree.
  const [open, setOpen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const progress = useSharedValue(0);

  const hidePanel = useCallback(() => setPanelVisible(false), []);

  const openDrawer = useCallback(() => {
    setOpen(true);
    setPanelVisible(true);
    progress.value = reducedMotion ? 1 : withTiming(1, { duration: ANIMATION_MS });
  }, [progress, reducedMotion]);

  const closeDrawer = useCallback(() => {
    setOpen(false);
    if (reducedMotion) {
      progress.value = 0;
      setPanelVisible(false);
      return;
    }
    progress.value = withTiming(0, { duration: ANIMATION_MS }, (finished) => {
      'worklet';
      if (finished) runOnJS(hidePanel)();
    });
  }, [hidePanel, progress, reducedMotion]);

  const toggleDrawer = useCallback(() => {
    if (open) closeDrawer();
    else openDrawer();
  }, [closeDrawer, open, openDrawer]);

  // Modal layer while the panel is shown: Escape (web) and Android back close
  // it, focus moves into the panel and is trapped there, and returns to the
  // menu button. It stays active until the close animation ends — the commit
  // that hides the panel — because ReactDOM re-focuses whatever had focus
  // before a commit if it is still focusable, which would undo a restore made
  // while the panel is still visible.
  const { id: layerId } = useLayer({
    active: panelVisible,
    modal: true,
    onDismiss: closeDrawer,
    containerRef: panelRef,
    restoreFocusRef: menuButtonRef,
  });

  // Transforms don't follow the layout direction, so the off-screen side does.
  const offscreen = isRTL ? DRAWER_WIDTH : -DRAWER_WIDTH;
  // Explicit dependencies for web builds without the worklets Babel plugin.
  const panelAnimatedStyle = useAnimatedStyle(
    () => ({ transform: [{ translateX: (1 - progress.value) * offscreen }] }),
    [offscreen, progress]
  );
  const backdropAnimatedStyle = useAnimatedStyle(() => ({ opacity: progress.value }), [progress]);

  useInitialRoute(navigation, screens, initialRouteName);

  const handleNavigate = useCallback(
    (routeName: string) => {
      navigation.navigate(routeName);
      closeDrawer();
    },
    [navigation, closeDrawer]
  );

  const currentRoute = navigation.state.routes[navigation.state.index];
  const currentScreen = screens.find(s => s.name === currentRoute?.name);

  if (!currentScreen || !currentRoute) {
    return null;
  }

  const Component = currentScreen.component;
  const mergedOptions = resolveScreenOptions(screenOptions, currentScreen.options, currentRoute);
  const contentProps: DrawerContentProps = { navigation, screens, currentRoute, closeDrawer };

  return (
    <View ref={ref} testID={testID} style={[styles.container, spacing, style]}>
      {/* Main Content */}
      <View style={styles.content}>
        {mergedOptions.headerShown !== false && (
          <DrawerHeader
            route={currentRoute}
            options={mergedOptions}
            open={open}
            drawerId={drawerId}
            menuButtonRef={menuButtonRef}
            onMenuPress={toggleDrawer}
          />
        )}
        <Component route={currentRoute} navigation={navigation} />
      </View>

      {/* Backdrop: a pointer affordance only — keyboard and screen reader
          users close the drawer with Escape / back / the escape gesture. */}
      {panelVisible && (
        <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
          <Pressable
            style={styles.backdropPressable}
            onPress={closeDrawer}
            testID={testID ? `${testID}-backdrop` : undefined}
            {...a11yProps({ hidden: true })}
            {...webProps({ tabIndex: -1 })}
          />
        </Animated.View>
      )}

      {/* Drawer */}
      <Animated.View
        ref={panelRef}
        style={[styles.panel, panelAnimatedStyle, drawerStyle, panelVisible ? null : HIDDEN]}
        onAccessibilityEscape={closeDrawer}
        {...a11yProps({
          role: 'dialog',
          // Only while shown: a modal flag on the hidden panel would still hide
          // the screen behind it from VoiceOver.
          modal: panelVisible,
          label: drawerAccessibilityLabel,
          id: drawerId,
          hidden: !panelVisible,
        })}
      >
        {/* Overlays opened from inside the drawer stack above it (and close first). */}
        <LayerScope id={layerId}>
          {drawerContent ? (
            drawerContent(contentProps)
          ) : (
            <DefaultDrawerContent
              screens={screens}
              currentRoute={currentRoute}
              onNavigate={handleNavigate}
              screenOptions={screenOptions}
            />
          )}
        </LayerScope>
      </Animated.View>
    </View>
  );
}, { displayName: 'DrawerNavigator', memo: false });

interface DrawerHeaderProps {
  route: Route;
  options: DrawerOptions;
  open: boolean;
  drawerId: string;
  menuButtonRef: React.RefObject<View | null>;
  onMenuPress: () => void;
}

function DrawerHeader({ route, options, open, drawerId, menuButtonRef, onMenuPress }: DrawerHeaderProps) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const title = options.headerTitle || options.title || route.name;

  return (
    <View style={styles.header}>
      <Pressable
        ref={menuButtonRef}
        onPress={onMenuPress}
        style={styles.menuButton}
        {...a11yProps({
          role: 'button',
          label: 'Open navigation menu',
          expanded: open,
          hasPopup: 'dialog',
          controls: isWeb ? drawerId : undefined,
        })}
      >
        <View style={styles.hamburger} {...a11yProps({ hidden: true })}>
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </View>
      </Pressable>

      <Text style={styles.headerTitle} numberOfLines={1} {...a11yProps({ role: 'heading', level: 1 })}>
        {title}
      </Text>

      <View style={styles.headerRight}>
        {options.headerRight && options.headerRight()}
      </View>
    </View>
  );
}

interface DefaultDrawerContentProps {
  screens: DrawerScreenConfig[];
  currentRoute: Route;
  onNavigate: (routeName: string) => void;
  screenOptions?: DrawerOptions;
}

function DefaultDrawerContent({ screens, currentRoute, onNavigate, screenOptions }: DefaultDrawerContentProps) {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <ScrollView style={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle} {...a11yProps({ role: 'heading', level: 2 })}>
          Navigation
        </Text>
      </View>

      {screens.map((screen) => (
        <DrawerItem
          key={screen.name}
          screen={screen}
          currentRoute={currentRoute}
          screenOptions={screenOptions}
          onNavigate={onNavigate}
        />
      ))}
    </ScrollView>
  );
}

interface DrawerItemProps {
  screen: DrawerScreenConfig;
  currentRoute: Route;
  screenOptions?: DrawerOptions;
  onNavigate: (routeName: string) => void;
}

function DrawerItem({ screen, currentRoute, screenOptions, onNavigate }: DrawerItemProps) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const options = resolveScreenOptions(screenOptions, screen.options, currentRoute);
  const isActive = currentRoute.name === screen.name;
  const label = options.drawerLabel || options.title || screen.name;
  const { name } = screen;
  const handlePress = useCallback(() => onNavigate(name), [name, onNavigate]);

  return (
    <Pressable
      style={[styles.drawerItem, isActive && styles.drawerItemActive]}
      onPress={handlePress}
      {...a11yProps({
        role: 'button',
        label,
        // Web: "you are here"; native has no `current`, so it reads as selected.
        current: isActive ? 'page' : undefined,
        selected: isWeb ? undefined : isActive,
      })}
    >
      {options.drawerIcon && (
        <View style={styles.drawerIcon} {...a11yProps({ hidden: true })}>
          {options.drawerIcon({
            color: isActive ? theme.text.link : theme.text.secondary,
            size: DRAWER_ICON_SIZE,
            focused: isActive,
          })}
        </View>
      )}
      <Text style={[styles.drawerLabel, isActive && styles.drawerLabelActive]}>{label}</Text>
    </Pressable>
  );
}

/**
 * Declares a screen for the drawer. Renders nothing itself: the navigator
 * reads its props and renders the active screen.
 */
function DrawerScreen(_props: DrawerScreenProps): null {
  return null;
}

export function createDrawerNavigator<ParamList = Record<string, object | undefined>>(): DrawerNavigatorConfig {
  return {
    Navigator: DrawerNavigator,
    Screen: DrawerScreen,
  };
}
