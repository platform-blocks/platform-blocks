import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { AppShell, useAppShell, useAppShellApi } from '../AppShell';
import { MobileMenu } from '../MobileMenu';
import { createAppShellCss } from '../shellCssVars';
import { resolveResponsiveValue } from '../hooks/useResponsiveValue';
import { resetViewportStore } from '../../../core/responsive/viewportStore';
import { DEFAULT_Z_INDICES } from '../../../core/theme/zIndices';
import { __resetLayerStackForTests } from '../../../core/overlay/layerStack';

// Flip the platform flags per test: native (the default here) is always
// "mobile"; with `mockIsWeb` the shell follows the (mocked) viewport width.
let mockIsWeb = false;
jest.mock('../../../core/platform/flags', () => ({
  get isWeb() {
    return mockIsWeb;
  },
  get isNative() {
    return !mockIsWeb;
  },
  isIOS: false,
  isAndroid: false,
  hasDOM: false,
}));

// The real viewport store follows the platform flags, so with `mockIsWeb` (and
// no DOM) it would sit on its static-rendering default. These tests drive the
// viewport through the mocked `Dimensions` on both "platforms" instead.
jest.mock('../../../core/responsive/viewportStore', () => {
  const { Dimensions: RNDimensions } = jest.requireActual<typeof import('react-native')>('react-native');
  type MockSize = { width: number; height: number };
  const SERVER_VIEWPORT: MockSize = Object.freeze({ width: 1200, height: 800 });
  const listeners = new Set<() => void>();
  let snapshot: MockSize | null = null;
  let subscription: { remove: () => void } | null = null;
  const refresh = (): boolean => {
    const { width, height } = RNDimensions.get('window');
    if (snapshot && snapshot.width === width && snapshot.height === height) return false;
    snapshot = { width, height };
    return true;
  };
  return {
    SERVER_VIEWPORT,
    subscribeViewport: (listener: () => void) => {
      listeners.add(listener);
      if (!subscription) {
        subscription = RNDimensions.addEventListener('change', () => {
          if (refresh()) listeners.forEach((notify) => notify());
        });
        refresh();
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          subscription?.remove();
          subscription = null;
        }
      };
    },
    getViewportSnapshot: (): MockSize => {
      if (!subscription || !snapshot) refresh();
      return snapshot as MockSize;
    },
    getServerViewportSnapshot: () => SERVER_VIEWPORT,
    resetViewportStore: () => {
      subscription?.remove();
      subscription = null;
      snapshot = null;
      listeners.clear();
    },
  };
});

jest.mock('react-native-safe-area-context', () => {
  const ReactActual = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  const SafeAreaInsetsContext = ReactActual.createContext(insets);
  return {
    SafeAreaInsetsContext,
    SafeAreaProvider: ({ children }: { children?: React.ReactNode }) => children,
    SafeAreaView: ReactActual.forwardRef<unknown, object>((props, ref) =>
      ReactActual.createElement(View, { ...props, ref } as React.ComponentProps<typeof View>)
    ),
    useSafeAreaInsets: () => insets,
  };
});

type ChangeHandler = () => void;
let size = { width: 390, height: 844 };
let handlers: ChangeHandler[] = [];

beforeEach(() => {
  mockIsWeb = false;
  size = { width: 390, height: 844 };
  handlers = [];
  resetViewportStore();
  __resetLayerStackForTests();
  jest.spyOn(Dimensions, 'get').mockImplementation(() => ({ ...size, scale: 2, fontScale: 1 }));
  jest.spyOn(Dimensions, 'addEventListener').mockImplementation(((_type: string, handler: ChangeHandler) => {
    handlers.push(handler);
    return { remove: () => (handlers = handlers.filter((h) => h !== handler)) };
  }) as never);
});

afterEach(() => {
  jest.restoreAllMocks();
  resetViewportStore();
});

const resize = (width: number, height = 800) => {
  size = { width, height };
  act(() => handlers.forEach((handler) => handler()));
};

const styleOf = (testID: string, options?: { includeHiddenElements?: boolean }) =>
  StyleSheet.flatten(screen.getByTestId(testID, options).props.style);

function NavbarToggle() {
  const { toggleNavbar } = useAppShellApi();
  return (
    <Pressable testID="toggle" onPress={toggleNavbar}>
      <Text>Toggle</Text>
    </Pressable>
  );
}

function OpenState() {
  const { navbarOpen, isMobile } = useAppShell();
  return <Text testID="state">{`${navbarOpen ? 'open' : 'closed'}:${isMobile ? 'mobile' : 'desktop'}`}</Text>;
}

type ShellProps = Partial<React.ComponentProps<typeof AppShell>>;

function Shell(props: ShellProps) {
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 240 }}
      aside={{ width: 200, collapsed: { mobile: false } }}
      footer={{ height: 40 }}
      {...props}
    >
      <AppShell.Header testID="header">
        <Text>Header</Text>
        <NavbarToggle />
      </AppShell.Header>
      <AppShell.Navbar testID="navbar">
        <Text>Nav</Text>
      </AppShell.Navbar>
      <AppShell.Aside testID="aside" accessibilityLabel="Details">
        <Text>Aside</Text>
      </AppShell.Aside>
      <AppShell.Main testID="main">
        <Text>Content</Text>
        <OpenState />
      </AppShell.Main>
      <AppShell.Footer testID="footer">
        <Text>Footer</Text>
      </AppShell.Footer>
    </AppShell>
  );
}

describe('AppShell (native)', () => {
  it('renders header, navbar, aside, main and footer as landmarks', () => {
    render(<Shell />);

    expect(screen.getByText('Header')).toBeTruthy();
    expect(screen.getByText('Aside')).toBeTruthy();
    expect(screen.getByText('Content')).toBeTruthy();
    expect(screen.getByText('Footer')).toBeTruthy();

    expect(screen.getByTestId('header').props.role).toBe('banner');
    expect(screen.getByTestId('main').props.role).toBe('main');
    expect(screen.getByTestId('aside').props.role).toBe('complementary');
    expect(screen.getByTestId('aside').props['aria-label']).toBe('Details');
    expect(screen.getByTestId('footer').props.role).toBe('contentinfo');
    const navbar = screen.getByTestId('navbar', { includeHiddenElements: true });
    expect(navbar.props.role).toBe('navigation');
    expect(navbar.props['aria-label']).toBe('Main');
  });

  it('paints bg on the shell root', () => {
    render(<Shell testID="shell" bg="#123456" withSafeArea={false} />);
    expect(styleOf('shell').backgroundColor).toBe('#123456');
  });

  it('caps the main content column with maw, not the main area', () => {
    render(
      <AppShell withSafeArea={false}>
        <AppShell.Main testID="main" maw={960}>
          <Text testID="page">Content</Text>
        </AppShell.Main>
      </AppShell>
    );
    expect(styleOf('main').maxWidth).toBeUndefined();
    expect(StyleSheet.flatten(screen.getByTestId('page').parent?.parent?.props.style).maxWidth).toBe(960);
  });

  it('uses logical start/end insets instead of left/right', () => {
    render(<Shell />);
    const aside = styleOf('aside');
    expect(aside.end).toBe(0);
    expect(aside.right).toBeUndefined();
    expect(aside.borderStartWidth).toBe(1);
    const drawer = styleOf('navbar', { includeHiddenElements: true });
    expect(drawer.start).toBe(0);
    expect(drawer.left).toBeUndefined();
  });

  it('stacks sections on theme z-index layers; an explicit zIndex wins', () => {
    render(
      <AppShell header={{ height: 60 }} footer={{ height: 40, zIndex: 7 }} navbar={{ width: 240 }}>
        <AppShell.Header testID="header">
          <Text>Header</Text>
        </AppShell.Header>
        <AppShell.Navbar testID="navbar" zIndex={3}>
          <Text>Nav</Text>
        </AppShell.Navbar>
        <AppShell.Main>
          <Text>Content</Text>
        </AppShell.Main>
        <AppShell.Footer testID="footer">
          <Text>Footer</Text>
        </AppShell.Footer>
      </AppShell>
    );
    expect(styleOf('header').zIndex).toBe(DEFAULT_Z_INDICES.header);
    expect(styleOf('footer').zIndex).toBe(7);
    expect(styleOf('navbar', { includeHiddenElements: true }).zIndex).toBe(3);
  });

  it('is always mobile on native: the navbar is a closed drawer that the api toggles', () => {
    render(<Shell />);
    expect(screen.getByTestId('state').props.children).toBe('closed:mobile');
    // Closed drawer is hidden from assistive technology.
    expect(screen.queryByText('Nav')).toBeNull();
    expect(styleOf('main').start).toBe(0);

    fireEvent.press(screen.getByTestId('toggle'));
    expect(screen.getByTestId('state').props.children).toBe('open:mobile');
    expect(screen.getByText('Nav')).toBeTruthy();
    // Drawer mode reserves no space.
    expect(styleOf('main').start).toBe(0);
    // The open drawer stacks above the header.
    expect(styleOf('navbar').zIndex).toBe(DEFAULT_Z_INDICES.overlay);

    fireEvent.press(screen.getByTestId('navbar-backdrop', { includeHiddenElements: true }));
    expect(screen.getByTestId('state').props.children).toBe('closed:mobile');
    expect(screen.queryByText('Nav')).toBeNull();
  });

  it('follows the viewport on web: inline rail on desktop, drawer below md', () => {
    mockIsWeb = true;
    size = { width: 1024, height: 800 };
    render(<Shell />);

    expect(screen.getByTestId('state').props.children).toBe('open:desktop');
    expect(screen.getByText('Nav')).toBeTruthy();
    expect(styleOf('main').start).toBe(240);
    expect(styleOf('main').end).toBe(200);
    expect(styleOf('navbar').zIndex).toBe(DEFAULT_Z_INDICES.sticky);

    resize(600);
    expect(screen.getByTestId('state').props.children).toBe('closed:mobile');
    expect(screen.queryByText('Nav')).toBeNull();
    expect(styleOf('main').start).toBe(0);

    // `base` (below 480) is mobile too.
    resize(400);
    expect(screen.getByTestId('state').props.children).toBe('closed:mobile');
  });

  it('collapses the desktop navbar to its rail and toggles it', () => {
    mockIsWeb = true;
    size = { width: 1024, height: 800 };
    render(<Shell navbar={{ width: 240, collapsedWidth: 64, startCollapsedDesktop: true }} />);

    expect(screen.getByTestId('state').props.children).toBe('closed:desktop');
    expect(styleOf('main').start).toBe(64);

    fireEvent.press(screen.getByTestId('toggle'));
    expect(screen.getByTestId('state').props.children).toBe('open:desktop');
    expect(styleOf('main').start).toBe(240);
  });

  it('auto-expands the rail from autoExpandBreakpoint and resets when the viewport crosses it', () => {
    mockIsWeb = true;
    size = { width: 1024, height: 800 };
    render(<Shell navbar={{ width: 240, startCollapsedDesktop: true, autoExpandBreakpoint: 'xl' }} />);
    expect(screen.getByTestId('state').props.children).toBe('closed:desktop');

    resize(1300);
    expect(screen.getByTestId('state').props.children).toBe('open:desktop');
    resize(1100);
    expect(screen.getByTestId('state').props.children).toBe('closed:desktop');
  });

  it('keeps the navbar state across parent re-renders with a new config object', () => {
    mockIsWeb = true;
    size = { width: 1024, height: 800 };
    const view = render(<Shell navbar={{ width: 240 }} />);
    fireEvent.press(screen.getByTestId('toggle'));
    expect(screen.getByTestId('state').props.children).toBe('closed:desktop');
    view.rerender(<Shell navbar={{ width: 240 }} />);
    expect(screen.getByTestId('state').props.children).toBe('closed:desktop');
  });

  it('honours navbar.breakpoint for the drawer cutoff', () => {
    mockIsWeb = true;
    size = { width: 900, height: 800 };
    render(<Shell navbar={{ width: 240, breakpoint: 'lg' }} />);
    expect(screen.queryByText('Nav')).toBeNull();
    expect(styleOf('main').start).toBe(0);
  });

  it('hides a collapsed header and starts content at the top', () => {
    render(<Shell header={{ height: 60, collapsed: true }} />);
    expect(screen.queryByText('Header')).toBeNull();
    expect(styleOf('main').top).toBe(0);
  });

  it('lets content run under the header with header.offset false', () => {
    render(<Shell header={{ height: 60, offset: false }} />);
    expect(screen.getByText('Header')).toBeTruthy();
    expect(styleOf('main').top).toBe(0);
  });

  it('resolves padding tokens through the theme spacing scale', () => {
    render(
      <AppShell padding="lg">
        <AppShell.Main>
          <Text testID="child">Content</Text>
        </AppShell.Main>
      </AppShell>
    );
    const column = screen.getByTestId('child').parent?.parent;
    expect(StyleSheet.flatten(column?.props.style).padding).toBe(16);
  });

  it('places the header between navbar and aside in the alt layout', () => {
    mockIsWeb = true;
    size = { width: 1024, height: 800 };
    render(<Shell layout="alt" />);
    const header = styleOf('header');
    expect(header.start).toBe(240);
    expect(header.end).toBe(200);
    expect(styleOf('navbar').top).toBe(0);
  });

  it('renders in autoLayout mode from content props', () => {
    render(
      <AppShell
        autoLayout
        header={{ height: 56 }}
        navbar={{ width: 240 }}
        headerContent={() => <Text>Auto header</Text>}
        navbarContent={<Text>Auto nav</Text>}
      >
        <Text>Body</Text>
      </AppShell>
    );
    expect(screen.getByText('Auto header')).toBeTruthy();
    expect(screen.getByText('Body')).toBeTruthy();
    // Native: the navbar is a closed drawer.
    expect(screen.queryByText('Auto nav')).toBeNull();
  });
});

describe('MobileMenu', () => {
  it('is a modal dialog with a label and closes via onClose', () => {
    const onClose = jest.fn();
    render(
      <MobileMenu opened onClose={onClose} testID="menu" config={{ transitionDuration: 0 }}>
        <Text>Menu content</Text>
      </MobileMenu>
    );
    const dialog = screen.getByTestId('menu');
    expect(dialog.props.role).toBe('dialog');
    expect(dialog.props['aria-label']).toBe('Menu');
    expect(dialog.props.accessibilityViewIsModal).toBe(true);
    expect(screen.getByText('Menu content')).toBeTruthy();
  });

  it('unmounts once closed', () => {
    const view = render(
      <MobileMenu opened onClose={jest.fn()} config={{ transitionDuration: 0 }}>
        <Text>Menu content</Text>
      </MobileMenu>
    );
    view.rerender(
      <MobileMenu opened={false} onClose={jest.fn()} config={{ transitionDuration: 0 }}>
        <Text>Menu content</Text>
      </MobileMenu>
    );
    expect(screen.queryByText('Menu content')).toBeNull();
  });
});

describe('shell geometry helpers', () => {
  it('resolves responsive sizes down the theme breakpoint scale', () => {
    const value = { base: 50, md: 60, xl: 70 };
    expect(resolveResponsiveValue(value, 'base')).toBe(50);
    expect(resolveResponsiveValue(value, 'sm')).toBe(50);
    expect(resolveResponsiveValue(value, 'lg')).toBe(60);
    expect(resolveResponsiveValue(value, 'xl')).toBe(70);
    expect(resolveResponsiveValue('240px', 'md')).toBe(240);
  });

  it('builds media queries from the theme breakpoint table', () => {
    const css = createAppShellCss({ headerHeight: { base: 56, xs: 58, md: 60 } });
    // xs is 480 (the theme), not 0.
    expect(css).toContain('@media (min-width: 480px)');
    expect(css).toContain('@media (min-width: 768px)');
    expect(css).not.toContain('min-width: 0px');

    const custom = createAppShellCss(
      { headerHeight: { base: 56, md: 60 } },
      { theme: { breakpoints: { xs: '480px', sm: '576px', md: '800px', lg: '992px', xl: '1200px' } } }
    );
    expect(custom).toContain('@media (min-width: 800px)');
  });
});
