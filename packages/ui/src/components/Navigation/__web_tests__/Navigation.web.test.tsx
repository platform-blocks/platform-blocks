import React from 'react';
import { Pressable, Text } from 'react-native';
import { act, fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { __resetLayerStackForTests } from '../../../core/overlay/layerStack';
import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { createDrawerNavigator } from '../DrawerNavigator';
import { NavigationContainer } from '../NavigationContainer';
import { createStackNavigator } from '../StackNavigator';
import type { LinkingOptions, NavigationScreenProps } from '../types';

// Reduced motion makes the drawer open / close instantly, so the DOM can be
// asserted right after each step.
const render = (ui: React.ReactElement) =>
  rtlRender(<PlatformBlocksProvider reducedMotion>{ui}</PlatformBlocksProvider>);

beforeEach(() => __resetLayerStackForTests());

// Browsers refuse focus to an element inside a `display: none` subtree; jsdom
// doesn't. ReactDOM's post-commit focus restore relies on that when content is
// hidden (not unmounted) in the same commit that closes a layer.
const nativeFocus = HTMLElement.prototype.focus;
const hiddenByDisplay = (element: HTMLElement): boolean => {
  for (let el: HTMLElement | null = element; el; el = el.parentElement) {
    if (window.getComputedStyle(el).display === 'none') return true;
  }
  return false;
};
beforeAll(() => {
  HTMLElement.prototype.focus = function focus(this: HTMLElement, options?: FocusOptions) {
    if (hiddenByDisplay(this)) return;
    nativeFocus.call(this, options);
  };
});
afterAll(() => {
  HTMLElement.prototype.focus = nativeFocus;
});

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const Inbox = () => <Text>Inbox screen</Text>;
const Settings = () => <Text>Settings screen</Text>;

function Home({ navigation }: NavigationScreenProps) {
  return (
    <Pressable role="button" aria-label="Open details" onPress={() => navigation.navigate('Details', { id: '3' })}>
      <Text>Home screen</Text>
    </Pressable>
  );
}

function Details({ route, navigation }: NavigationScreenProps) {
  return (
    <Pressable role="button" aria-label="Home link" onPress={() => navigation.navigate('Home')}>
      <Text>{`Details ${String(route.params?.id)}`}</Text>
    </Pressable>
  );
}

describe('DrawerNavigator (react-native-web DOM)', () => {
  const renderDrawer = () =>
    render(
      <NavigationContainer>
        <Drawer.Navigator drawerAccessibilityLabel="Main menu">
          <Drawer.Screen name="Inbox" component={Inbox} />
          <Drawer.Screen name="Settings" component={Settings} options={{ drawerLabel: 'Preferences' }} />
        </Drawer.Navigator>
      </NavigationContainer>
    );

  it('wires the menu button to a labelled modal dialog', () => {
    renderDrawer();
    const menu = screen.getByRole('button', { name: 'Open navigation menu' });
    expect(menu.getAttribute('aria-expanded')).toBe('false');
    expect(menu.getAttribute('aria-haspopup')).toBe('dialog');
    // Closed: out of the accessibility tree entirely.
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(menu);

    const dialog = screen.getByRole('dialog', { name: 'Main menu' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(menu.getAttribute('aria-expanded')).toBe('true');
    expect(menu.getAttribute('aria-controls')).toBe(dialog.id);
    // The active screen's item is the current page.
    expect(screen.getByRole('button', { name: 'Inbox' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('button', { name: 'Preferences' }).hasAttribute('aria-current')).toBe(false);
  });

  it('closes on Escape, and when an item navigates', () => {
    renderDrawer();
    const menu = screen.getByRole('button', { name: 'Open navigation menu' });

    act(() => menu.focus());
    fireEvent.click(menu);
    // Focus moves into the modal panel…
    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);
    act(() => {
      fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(menu.getAttribute('aria-expanded')).toBe('false');
    // …and returns to the menu button when it closes.
    expect(document.activeElement).toBe(menu);

    fireEvent.click(menu);
    fireEvent.click(screen.getByRole('button', { name: 'Preferences' }));
    expect(screen.getByText('Settings screen')).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('StackNavigator (react-native-web DOM)', () => {
  it('renders the title as a heading and a named back button once there is history', () => {
    render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Details" component={Details} options={{ title: 'Detail view' }} />
        </Stack.Navigator>
      </NavigationContainer>
    );

    expect(screen.getByRole('heading', { name: 'Home' }).getAttribute('aria-level')).toBe('1');
    expect(screen.queryByRole('button', { name: 'Go back' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Open details' }));
    expect(screen.getByRole('heading', { name: 'Detail view' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(screen.getByText('Home screen')).toBeTruthy();
  });
});

describe('NavigationContainer linking (web)', () => {
  const linking: LinkingOptions = {
    config: { screens: { Home: '/', Details: { path: '/details/:id' } } },
  };

  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('starts on the route the URL names, pushes navigations, and follows back / forward', () => {
    window.history.replaceState({}, '', '/details/5');
    const onStateChange = jest.fn();

    render(
      <NavigationContainer linking={linking} onStateChange={onStateChange}>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Details" component={Details} />
        </Stack.Navigator>
      </NavigationContainer>
    );
    expect(screen.getByText('Details 5')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Home link' }));
    expect(screen.getByText('Home screen')).toBeTruthy();
    expect(window.location.pathname).toBe('/');

    act(() => {
      window.history.pushState({}, '', '/details/9');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(screen.getByText('Details 9')).toBeTruthy();
    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ routes: [expect.objectContaining({ name: 'Details', params: { id: '9' } })] })
    );
  });
});
