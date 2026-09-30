import React from 'react';
import { Pressable, Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';

import { AppShell, useAppShellApi } from '../AppShell';
import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { resetViewportStore } from '../../../core/responsive/viewportStore';
import { __resetLayerStackForTests } from '../../../core/overlay/layerStack';

function setWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
}

beforeEach(() => {
  resetViewportStore();
  __resetLayerStackForTests();
  setWidth(1024);
});

afterEach(() => resetViewportStore());

function MenuButton() {
  const { openNavbar } = useAppShellApi();
  return (
    <Pressable role="button" aria-label="Open navigation" onPress={openNavbar}>
      <Text>Menu</Text>
    </Pressable>
  );
}

type ShellProps = Partial<React.ComponentProps<typeof AppShell>>;

function Shell({ direction, ...props }: ShellProps & { direction?: 'ltr' | 'rtl' }) {
  return (
    <PlocksProvider direction={direction ? { initialDirection: direction } : undefined}>
      <AppShell
        withSafeArea={false}
        header={{ height: 60 }}
        navbar={{ width: 240 }}
        aside={{ width: 200 }}
        footer={{ height: 40 }}
        testID="shell"
        {...props}
      >
        <AppShell.Header>
          <MenuButton />
        </AppShell.Header>
        <AppShell.Navbar testID="navbar">
          <Pressable role="link" aria-label="Home">
            <Text>Home</Text>
          </Pressable>
        </AppShell.Navbar>
        <AppShell.Aside accessibilityLabel="Details">
          <Text>Aside</Text>
        </AppShell.Aside>
        <AppShell.Main testID="main">
          <Text>Content</Text>
        </AppShell.Main>
        <AppShell.Footer>
          <Text>Footer</Text>
        </AppShell.Footer>
      </AppShell>
    </PlocksProvider>
  );
}

describe('AppShell (react-native-web DOM)', () => {
  it('exposes the page landmarks on desktop', () => {
    render(<Shell />);

    const banner = screen.getByRole('banner');
    expect(banner.tagName).toBe('HEADER');
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav.tagName).toBe('NAV');
    expect(screen.getByRole('main').tagName).toBe('MAIN');
    expect(screen.getByRole('complementary', { name: 'Details' }).tagName).toBe('ASIDE');
    expect(screen.getByRole('contentinfo').tagName).toBe('FOOTER');
    // The inline rail is in the accessibility tree.
    expect(nav.getAttribute('aria-hidden')).toBeNull();
    expect(screen.getByRole('link', { name: 'Home' })).toBeTruthy();
  });

  it('turns the navbar into a drawer below md: hidden until opened, closed by Escape', () => {
    setWidth(600);
    render(<Shell />);

    // Closed drawer: out of the accessibility tree.
    expect(screen.queryByRole('navigation')).toBeNull();
    const hiddenNav = screen.getByTestId('navbar');
    expect(hiddenNav.getAttribute('aria-hidden')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav.getAttribute('aria-hidden')).toBeNull();

    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.getByTestId('navbar').getAttribute('aria-hidden')).toBe('true');
  });

  it('treats the smallest widths (base, below xs) as mobile too', () => {
    setWidth(400);
    render(<Shell />);
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('hands the direction to react-native-web so logical insets flip in RTL', () => {
    const view = render(<Shell direction="rtl" />);
    expect(screen.getByTestId('shell').getAttribute('dir')).toBe('rtl');
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav.style.right).toBe('0px');
    expect(nav.style.left).toBe('');
    view.unmount();

    render(<Shell direction="ltr" />);
    const ltrNav = screen.getByRole('navigation', { name: 'Main' });
    expect(ltrNav.style.left).toBe('0px');
    expect(ltrNav.style.right).toBe('');
  });

  it('pushes the content while the collapsed rail is hovered (push mode)', () => {
    render(
      <Shell
        navbar={{ width: 240, collapsedWidth: 60, startCollapsedDesktop: true, expandOnHoverPush: true }}
        transitionDuration={0}
      />
    );
    const main = screen.getByTestId('main');
    expect(main.style.left).toBe('60px');

    fireEvent.mouseEnter(screen.getByRole('navigation', { name: 'Main' }));
    expect(screen.getByTestId('main').style.left).toBe('240px');

    fireEvent.mouseLeave(screen.getByRole('navigation', { name: 'Main' }));
    expect(screen.getByTestId('main').style.left).toBe('60px');
  });

  it('emits CSS-variable geometry under cssGeometry', () => {
    render(<Shell cssGeometry />);
    const main = screen.getByTestId('main');
    expect(main.getAttribute('data-plocks-shell-main')).toBe('true');
    expect(main.style.left).toContain('var(--plocks-shell-navbar-w');
    expect(screen.getByRole('navigation', { name: 'Main' }).getAttribute('data-plocks-shell-navbar')).toBe('true');
  });

  it('prerenders the desktop layout regardless of the client width (hydration-safe)', () => {
    setWidth(400);
    const container = document.createElement('div');
    container.innerHTML = renderToString(<Shell />);
    // The server snapshot is desktop: the inline rail, not a hidden drawer.
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    expect(nav?.getAttribute('aria-label')).toBe('Main');
    expect(nav?.getAttribute('aria-hidden')).toBeNull();
  });
});
