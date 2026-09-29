/**
 * Navigation (NavigationContainer + stack / drawer navigators) behavioral tests
 */

import React from 'react';
import { Pressable, Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

import { __resetLayerStackForTests, handleBackPress } from '../../../core/overlay/layerStack';
import { createDrawerNavigator } from '../DrawerNavigator';
import { NavigationContainer } from '../NavigationContainer';
import { useRoute } from '../NavigationContext';
import { createStackNavigator } from '../StackNavigator';
import type { NavigationScreenProps } from '../types';

beforeEach(() => __resetLayerStackForTests());

function Home({ navigation }: NavigationScreenProps) {
  return (
    <Pressable role="button" aria-label="Open details" onPress={() => navigation.navigate('Details', { id: 7 })}>
      <Text>Home screen</Text>
    </Pressable>
  );
}

function Details({ route }: NavigationScreenProps) {
  return <Text>Details {String(route.params?.id)}</Text>;
}

function RouteName() {
  const route = useRoute();
  return <Text>{`route:${route.name}`}</Text>;
}

describe('NavigationContainer + StackNavigator', () => {
  const Stack = createStackNavigator();

  const renderStack = (onStateChange?: jest.Mock) =>
    render(
      <NavigationContainer onStateChange={onStateChange} testID="nav-root">
        <Stack.Navigator>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Details" component={Details} options={{ title: 'Detail view' }} />
        </Stack.Navigator>
      </NavigationContainer>
    );

  it('starts on the first screen, navigates with params, and goes back', () => {
    const onStateChange = jest.fn();
    const { getByText, getByLabelText, queryByLabelText, getByTestId } = renderStack(onStateChange);

    expect(getByTestId('nav-root')).toBeTruthy();
    expect(getByText('Home screen')).toBeTruthy();
    // The first screen has nowhere to go back to.
    expect(queryByLabelText('Go back')).toBeNull();

    fireEvent.press(getByLabelText('Open details'));
    expect(getByText('Details 7')).toBeTruthy();
    expect(getByText('Detail view')).toBeTruthy();
    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ index: 1, routes: expect.arrayContaining([expect.objectContaining({ name: 'Details' })]) })
    );

    const back = getByLabelText('Go back');
    expect(back.props.role).toBe('button');
    fireEvent.press(back);
    expect(getByText('Home screen')).toBeTruthy();
    expect(onStateChange).toHaveBeenLastCalledWith(expect.objectContaining({ index: 0 }));
  });

  it('marks the header title as a heading', () => {
    const { getByText } = renderStack();
    expect(getByText('Home').props.role).toBe('heading');
  });

  it('honours initialRouteName and exposes the route through useRoute', () => {
    const Probe = () => <RouteName />;
    const { getByText } = render(
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Second" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="First" component={Probe} />
          <Stack.Screen name="Second" component={Probe} />
        </Stack.Navigator>
      </NavigationContainer>
    );
    expect(getByText('route:Second')).toBeTruthy();
  });

  it('forwards its ref to the root view', () => {
    const ref = React.createRef<React.ElementRef<typeof NavigationContainer>>();
    render(
      <NavigationContainer ref={ref}>
        <Text>content</Text>
      </NavigationContainer>
    );
    expect(ref.current).toBeTruthy();
  });
});

describe('DrawerNavigator', () => {
  const Drawer = createDrawerNavigator();

  function Inbox() {
    return <Text>Inbox screen</Text>;
  }
  function Settings() {
    return <Text>Settings screen</Text>;
  }

  const renderDrawer = () =>
    render(
      <NavigationContainer>
        <Drawer.Navigator drawerAccessibilityLabel="Main menu" testID="drawer">
          <Drawer.Screen name="Inbox" component={Inbox} />
          <Drawer.Screen name="Settings" component={Settings} options={{ drawerLabel: 'Preferences' }} />
        </Drawer.Navigator>
      </NavigationContainer>
    );

  // While the drawer is open it is a modal (`accessibilityViewIsModal`), so the
  // screen behind it — menu button included — is hidden from assistive tech.
  const menuButton = (utils: ReturnType<typeof renderDrawer>) =>
    utils.getByLabelText('Open navigation menu', { includeHiddenElements: true });

  it('opens from the menu button and navigates from a drawer item, closing itself', () => {
    const utils = renderDrawer();
    expect(utils.getByText('Inbox screen')).toBeTruthy();

    // Closed: the panel is out of the layout and the accessibility tree.
    expect(menuButton(utils).props.accessibilityState.expanded).toBe(false);
    expect(utils.queryByLabelText('Preferences')).toBeNull();

    fireEvent.press(menuButton(utils));
    expect(menuButton(utils).props.accessibilityState.expanded).toBe(true);

    const panel = utils.getByLabelText('Main menu');
    expect(panel.props.accessibilityViewIsModal).toBe(true);
    expect(utils.queryByText('Inbox screen')).toBeNull();
    // The active screen's item reads as selected on native.
    expect(utils.getByLabelText('Inbox').props.accessibilityState.selected).toBe(true);

    fireEvent.press(utils.getByLabelText('Preferences'));
    expect(utils.getByText('Settings screen')).toBeTruthy();
    expect(menuButton(utils).props.accessibilityState.expanded).toBe(false);
    expect(utils.queryByLabelText('Preferences')).toBeNull();
  });

  it('closes on a backdrop press', () => {
    const utils = renderDrawer();
    fireEvent.press(menuButton(utils));
    expect(menuButton(utils).props.accessibilityState.expanded).toBe(true);

    expect(utils.getByTestId('drawer')).toBeTruthy();
    fireEvent.press(utils.getByTestId('drawer-backdrop', { includeHiddenElements: true }));
    expect(menuButton(utils).props.accessibilityState.expanded).toBe(false);
    expect(utils.queryByTestId('drawer-backdrop', { includeHiddenElements: true })).toBeNull();
  });

  it('closes on the hardware back button (layer stack)', () => {
    const utils = renderDrawer();
    fireEvent.press(menuButton(utils));

    let handled = false;
    act(() => {
      handled = handleBackPress();
    });
    expect(handled).toBe(true);
    expect(menuButton(utils).props.accessibilityState.expanded).toBe(false);
  });

  it('closes on the iOS escape gesture', () => {
    const utils = renderDrawer();
    fireEvent.press(menuButton(utils));

    fireEvent(utils.getByLabelText('Main menu'), 'accessibilityEscape');
    expect(menuButton(utils).props.accessibilityState.expanded).toBe(false);
  });

  it('hands custom drawer content the screens, the route and a closer', () => {
    const { getByLabelText, getByText } = render(
      <NavigationContainer>
        <Drawer.Navigator
          drawerContent={({ screens, currentRoute, closeDrawer }) => (
            <Pressable role="button" aria-label="Custom close" onPress={closeDrawer}>
              <Text>{`${screens.map((s) => s.name).join(',')} @ ${currentRoute.name}`}</Text>
            </Pressable>
          )}
        >
          <Drawer.Screen name="Inbox" component={Inbox} />
          <Drawer.Screen name="Settings" component={Settings} />
        </Drawer.Navigator>
      </NavigationContainer>
    );

    fireEvent.press(getByLabelText('Open navigation menu'));
    expect(getByText('Inbox,Settings @ Inbox')).toBeTruthy();
    fireEvent.press(getByLabelText('Custom close'));
    expect(getByLabelText('Open navigation menu').props.accessibilityState.expanded).toBe(false);
    expect(getByText('Inbox screen')).toBeTruthy();
  });
});
