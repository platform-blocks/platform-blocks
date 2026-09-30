import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory/factory';
import { createThemedStyles } from '../../core/hooks/useThemedStyles';
import { isIOS } from '../../core/platform/flags';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveFontSize, resolveShadow } from '../../core/theme/tokens';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { Icon } from '../Icon/Icon';

import { useNavigation } from './NavigationContext';
import { resolveScreenOptions, useInitialRoute, useScreens } from './screens';
import type { Route, StackNavigatorProps, StackOptions, StackScreenProps } from './types';

export interface StackNavigatorConfig {
  Navigator: React.ComponentType<StackNavigatorProps>;
  Screen: React.ComponentType<StackScreenProps>;
}

// Built once per theme. Named `styles` so the unused-styles lint rule can
// match it with the `styles.x` reads below.
const getStyles = createThemedStyles((theme) => {
  const styles = StyleSheet.create({
    backButton: {
      alignItems: 'center',
      flexDirection: 'row',
      minHeight: 44,
      minWidth: 44,
      paddingEnd: 8,
    },
    backTitle: {
      color: theme.text.link,
      fontSize: resolveFontSize(theme, 'md'),
      marginStart: 4,
    },
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
    },
    header: {
      alignItems: 'center',
      backgroundColor: theme.backgrounds.surface,
      borderBottomColor: theme.backgrounds.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      // iOS draws under the status bar; leave room for it.
      height: isIOS ? 88 : 56,
      paddingHorizontal: 16,
      paddingTop: isIOS ? 44 : 0,
      ...resolveShadow(theme, 'xs'),
    },
    headerCenter: {
      alignItems: 'center',
      flex: 2,
    },
    headerLeft: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
    },
    headerRight: {
      alignItems: 'flex-end',
      flex: 1,
    },
    headerTitle: {
      color: theme.text.primary,
      fontSize: resolveFontSize(theme, 'lg'),
      fontWeight: '600',
    },
  });
  return styles;
});

const StackNavigator = factory<{ props: StackNavigatorProps; ref: View }>((props, ref) => {
  const { styleProps, otherProps } = extractStyleProps(props);
  const { children, initialRouteName, screenOptions, style, testID } = otherProps;
  const spacing = useStyleProps(styleProps);
  const navigation = useNavigation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const screens = useScreens<StackOptions>(children);

  useInitialRoute(navigation, screens, initialRouteName);

  const currentRoute = navigation.state.routes[navigation.state.index];
  const currentScreen = screens.find(s => s.name === currentRoute?.name);

  if (!currentScreen || !currentRoute) {
    return null;
  }

  const Component = currentScreen.component;
  const mergedOptions = resolveScreenOptions(screenOptions, currentScreen.options, currentRoute);

  return (
    <View ref={ref} testID={testID} style={[styles.container, spacing, style]}>
      {mergedOptions.headerShown !== false && (
        <StackHeader
          route={currentRoute}
          options={mergedOptions}
          canGoBack={navigation.canGoBack()}
          onGoBack={navigation.goBack}
        />
      )}
      <View style={styles.content}>
        <Component route={currentRoute} navigation={navigation} />
      </View>
    </View>
  );
}, { displayName: 'StackNavigator', memo: false });

interface StackHeaderProps {
  route: Route;
  options: StackOptions;
  canGoBack: boolean;
  onGoBack: () => void;
}

function StackHeader({ route, options, canGoBack, onGoBack }: StackHeaderProps) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const title = options.headerTitle || options.title || route.name;

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {canGoBack && (
          <Pressable
            onPress={onGoBack}
            style={styles.backButton}
            {...a11yProps({
              role: 'button',
              label: options.headerBackTitle ? `Back, ${options.headerBackTitle}` : 'Go back',
            })}
          >
            <Icon name="chevron-left" size="md" color={theme.text.link} decorative />
            {isIOS && options.headerBackTitle && (
              <Text style={styles.backTitle}>{options.headerBackTitle}</Text>
            )}
          </Pressable>
        )}
        {options.headerLeft && options.headerLeft()}
      </View>

      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle} numberOfLines={1} {...a11yProps({ role: 'heading', level: 1 })}>
          {title}
        </Text>
      </View>

      <View style={styles.headerRight}>
        {options.headerRight && options.headerRight()}
      </View>
    </View>
  );
}

/**
 * Declares a screen for the stack. Renders nothing itself: the navigator reads
 * its props and renders the active screen.
 */
function StackScreen(_props: StackScreenProps): null {
  return null;
}

export function createStackNavigator<ParamList = Record<string, object | undefined>>(): StackNavigatorConfig {
  return {
    Navigator: StackNavigator,
    Screen: StackScreen,
  };
}
