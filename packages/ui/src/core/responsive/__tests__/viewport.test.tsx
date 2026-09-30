import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { Dimensions } from 'react-native';

import { ThemeScope } from '../../theme/ThemeProvider';
import { mergeTheme } from '../../theme/utils';
import { DEFAULT_THEME } from '../../theme/defaultTheme';
import {
  BREAKPOINTS,
  BreakpointProvider,
  getBreakpointForWidth,
  useBreakpoint,
  useViewport,
} from '../index';
import {
  SERVER_VIEWPORT,
  getServerViewportSnapshot,
  getViewportSnapshot,
  resetViewportStore,
  subscribeViewport,
} from '../viewportStore';

type ChangeHandler = () => void;

let size = { width: 800, height: 600 };
let handlers: ChangeHandler[] = [];
let removeCount = 0;

beforeEach(() => {
  resetViewportStore();
  size = { width: 800, height: 600 };
  handlers = [];
  removeCount = 0;
  jest.spyOn(Dimensions, 'get').mockImplementation(() => ({ ...size, scale: 2, fontScale: 1 }));
  jest.spyOn(Dimensions, 'addEventListener').mockImplementation(((_type: string, handler: ChangeHandler) => {
    handlers.push(handler);
    return {
      remove: () => {
        removeCount += 1;
        handlers = handlers.filter((h) => h !== handler);
      },
    };
  }) as never);
});

afterEach(() => {
  jest.restoreAllMocks();
  resetViewportStore();
});

const resize = (width: number, height = 600) => {
  size = { width, height };
  act(() => {
    handlers.forEach((handler) => handler());
  });
};

describe('viewport store', () => {
  it('has a desktop server snapshot', () => {
    expect(getServerViewportSnapshot()).toBe(SERVER_VIEWPORT);
    expect(SERVER_VIEWPORT.width).toBe(1200);
    expect(getBreakpointForWidth(SERVER_VIEWPORT.width)).toBe('xl');
  });

  it('shares one Dimensions listener and detaches with the last subscriber', () => {
    const a = subscribeViewport(() => {});
    const b = subscribeViewport(() => {});
    expect(handlers).toHaveLength(1);
    a();
    expect(removeCount).toBe(0);
    b();
    expect(removeCount).toBe(1);
  });

  it('returns a stable snapshot until the size changes', () => {
    const first = getViewportSnapshot();
    expect(getViewportSnapshot()).toBe(first);
    size = { width: 500, height: 600 };
    expect(getViewportSnapshot()).not.toBe(first);
    expect(getViewportSnapshot().width).toBe(500);
  });
});

describe('getBreakpointForWidth', () => {
  it('uses the theme table (xs 480, sm 576, md 768, lg 992, xl 1200)', () => {
    expect(BREAKPOINTS).toEqual({ base: 0, xs: 480, sm: 576, md: 768, lg: 992, xl: 1200 });
    expect(getBreakpointForWidth(479)).toBe('base');
    expect(getBreakpointForWidth(480)).toBe('xs');
    expect(getBreakpointForWidth(767)).toBe('sm');
    expect(getBreakpointForWidth(768)).toBe('md');
    expect(getBreakpointForWidth(1199)).toBe('lg');
    expect(getBreakpointForWidth(1200)).toBe('xl');
  });
});

describe('useViewport / useBreakpoint', () => {
  it('reports the viewport and follows Dimensions changes', () => {
    const { result } = renderHook(() => useViewport());
    expect(result.current).toEqual({ width: 800, height: 600, breakpoint: 'md' });
    resize(400, 700);
    expect(result.current).toEqual({ width: 400, height: 700, breakpoint: 'base' });
  });

  it('only re-renders useBreakpoint consumers when the breakpoint changes', () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useBreakpoint();
    });
    expect(result.current).toBe('md');
    const before = renders;
    resize(900);
    expect(result.current).toBe('md');
    expect(renders).toBe(before);
    resize(1000);
    expect(result.current).toBe('lg');
  });

  it('reads breakpoints from the theme', () => {
    const theme = mergeTheme(DEFAULT_THEME, { breakpoints: { ...DEFAULT_THEME.breakpoints, md: '900px' } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeScope theme={theme}>{children}</ThemeScope>
    );
    const { result } = renderHook(() => useBreakpoint(), { wrapper });
    expect(result.current).toBe('sm');
  });

  it('lets BreakpointProvider override the table', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <BreakpointProvider breakpoints={{ lg: 700 }}>{children}</BreakpointProvider>
    );
    const { result } = renderHook(() => useViewport(), { wrapper });
    expect(result.current.breakpoint).toBe('lg');
  });
});
