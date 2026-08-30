import React from 'react';
import { Dimensions, Platform } from 'react-native';
import { AppShell } from '../AppShell';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { useReducedMotion } from '../../../core/motion/ReducedMotionProvider';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useAppLayoutContext } from './context';
import type {
  AppLayoutRuntimeContext,
  LayoutComponentEntry,
  LayoutEntry,
  LayoutNavbarConfig,
  LayoutFooterConfig,
  LayoutBottomNavConfig,
  LayoutSection,
  LayoutAsideConfig,
} from './types';

const DEFAULT_HEADER_HEIGHT = 60;
const DEFAULT_NAVBAR_WIDTH = 240;
const DEFAULT_ASIDE_WIDTH = 320;
const DEFAULT_FOOTER_HEIGHT = 56;
const DEFAULT_BOTTOM_NAV_HEIGHT = 64;

const readIsLandscape = () => {
  const { width, height } = Dimensions.get('window');
  return width > height;
};

const useIsLandscape = () => {
  const [isLandscape, setIsLandscape] = React.useState(readIsLandscape);

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsLandscape(window.width > window.height);
    });
    return () => subscription?.remove();
  }, []);

  return isLandscape;
};

interface EvaluatedEntry {
  visible: boolean;
  node: React.ReactNode | null;
  key?: string;
  target?: 'shell' | 'root' | 'root-before' | 'root-after';
}

const isRenderEntry = (entry: LayoutEntry): entry is Exclude<LayoutEntry, LayoutComponentEntry> => {
  return 'render' in entry;
};

const evaluateEntry = (entry: LayoutEntry | undefined, ctx: AppLayoutRuntimeContext): EvaluatedEntry => {
  if (!entry) {
    return { visible: false, node: null };
  }

  const target = entry.target ?? 'shell';
  const show = entry.show ? entry.show(ctx) : true;
  if (!show) {
    return { visible: false, node: null, key: entry.key, target };
  }

  if (isRenderEntry(entry)) {
    return {
      visible: true,
      node: entry.render(ctx),
      key: entry.key,
      target,
    };
  }

  const props = typeof entry.props === 'function' ? entry.props(ctx) : entry.props;
  const Component = entry.component as React.ComponentType<any>;

  return {
    visible: true,
    node: <Component {...(props as any)} />,
    key: entry.key,
    target,
  };
};

const mergeVisibility = (
  section: LayoutSection,
  visible: boolean,
  ctx: AppLayoutRuntimeContext
): boolean => {
  if (!visible) return false;
  const extra = ctx.blueprint.visibility?.[section];
  return extra ? extra(ctx) : true;
};

const renderEvaluatedEntry = (evaluated: EvaluatedEntry, fallbackKey: React.Key) => {
  if (!evaluated.visible || evaluated.node == null) {
    return null;
  }

  const key = evaluated.key ?? fallbackKey;
  if (React.isValidElement(evaluated.node)) {
    return React.cloneElement(evaluated.node, { key });
  }

  return <React.Fragment key={key}>{evaluated.node}</React.Fragment>;
};

export interface AppLayoutRendererProps {
  children: React.ReactNode;
}

export const AppLayoutRenderer: React.FC<AppLayoutRendererProps> = ({ children }) => {
  const { blueprint, runtime } = useAppLayoutContext();
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const breakpoint = useBreakpoint();

  const isLandscape = useIsLandscape();

  const isMobile = React.useMemo(() => {
    if (Platform.OS !== 'web') {
      return true;
    }
    return breakpoint === 'base' || breakpoint === 'xs' || breakpoint === 'sm';
  }, [breakpoint]);

  const ctx = React.useMemo<AppLayoutRuntimeContext>(() => ({
    blueprint,
    query: runtime.query,
    pathname: runtime.pathname,
    navigation: runtime.navigation,
    platform: runtime.platform,
    breakpoint,
    isMobile,
    isLandscape,
    orientation: isLandscape ? 'landscape' : 'portrait',
    theme,
    colorScheme: theme?.colorScheme,
    reducedMotion,
    meta: runtime.meta,
  }), [blueprint, runtime, breakpoint, isMobile, isLandscape, theme, reducedMotion]);

  React.useEffect(() => {
    if (!blueprint.effects || blueprint.effects.length === 0) {
      return;
    }

    const cleanups = blueprint.effects
      .map((effect) => effect?.(ctx))
      .filter((cleanup): cleanup is () => void => typeof cleanup === 'function');

    return () => {
      cleanups.forEach((cleanup) => {
        try {
          cleanup();
        } catch (error) {
          if (__DEV__) {
            console.warn('AppLayout effect cleanup failed', error);
          }
        }
      });
    };
  }, [blueprint.effects, ctx]);

  const headerEntry = blueprint.header;
  const navbarEntry = blueprint.navbar as LayoutNavbarConfig | undefined;
  const asideEntry = blueprint.aside as LayoutAsideConfig | undefined;
  const footerEntry = blueprint.footer as LayoutFooterConfig | undefined;
  const bottomNavEntry = blueprint.bottomNav as LayoutBottomNavConfig | undefined;
  const mainConfig = blueprint.main;

  const headerEvaluated = headerEntry ? evaluateEntry(headerEntry, ctx) : { visible: false, node: null };
  const headerVisible = mergeVisibility('header', headerEvaluated.visible, ctx);

  const navbarEvaluated = navbarEntry ? evaluateEntry(navbarEntry, ctx) : { visible: false, node: null };
  const navbarVisible = mergeVisibility('navbar', navbarEvaluated.visible, ctx);

  const asideEvaluated = asideEntry ? evaluateEntry(asideEntry, ctx) : { visible: false, node: null };
  const asideVisible = mergeVisibility('aside', asideEvaluated.visible, ctx);

  const footerEvaluated = footerEntry ? evaluateEntry(footerEntry, ctx) : { visible: false, node: null };
  const footerVisible = mergeVisibility('footer', footerEvaluated.visible, ctx);

  const bottomNavEvaluated = bottomNavEntry ? evaluateEntry(bottomNavEntry, ctx) : { visible: false, node: null };
  const bottomNavVisible = mergeVisibility('bottomNav', bottomNavEvaluated.visible, ctx);

  const tableOfContentsEvaluated = mainConfig?.tableOfContents
    ? evaluateEntry(mainConfig.tableOfContents, ctx)
    : { visible: false, node: null };

  const mainExtraProps = mainConfig?.props
    ? (typeof mainConfig.props === 'function' ? mainConfig.props(ctx) : mainConfig.props)
    : undefined;

  const overlayBuckets = React.useMemo(() => {
    const buckets: {
      shell: React.ReactNode[];
      rootBefore: React.ReactNode[];
      rootAfter: React.ReactNode[];
    } = { shell: [], rootBefore: [], rootAfter: [] };

    if (!blueprint.overlays) {
      return buckets;
    }

    blueprint.overlays.forEach((entry, index) => {
      const evaluated = evaluateEntry(entry, ctx);
      const element = renderEvaluatedEntry(evaluated, evaluated.key ?? index);
      if (!element) {
        return;
      }

      switch (evaluated.target ?? 'shell') {
        case 'root-after':
          buckets.rootAfter.push(element);
          break;
        case 'root':
        case 'root-before':
          buckets.rootBefore.push(element);
          break;
        default:
          buckets.shell.push(element);
      }
    });

    return buckets;
  }, [blueprint.overlays, ctx]);

  const shellOverlays = overlayBuckets.shell;
  const rootOverlaysBefore = overlayBuckets.rootBefore;
  const rootOverlaysAfter = overlayBuckets.rootAfter;

  const headerConfig = headerVisible
    ? {
      height: blueprint.breakpoints?.headerHeight ?? DEFAULT_HEADER_HEIGHT,
    }
    : undefined;

  const navbarConfig = navbarVisible
    ? {
      width: navbarEntry?.width ?? blueprint.breakpoints?.navbarWidth ?? DEFAULT_NAVBAR_WIDTH,
      collapsedWidth: navbarEntry?.collapsedWidth ?? 72,
      expandOnHover: navbarEntry?.expandOnHover ?? true,
      expandOnHoverPush: navbarEntry?.expandOnHoverPush ?? false,
      autoExpandBreakpoint: navbarEntry?.autoExpandBreakpoint,
      startCollapsedDesktop: navbarEntry?.startCollapsedDesktop ?? true,
    }
    : undefined;

  const asideConfig = asideVisible
    ? {
      width: asideEntry?.width ?? blueprint.breakpoints?.asideWidth ?? DEFAULT_ASIDE_WIDTH,
    }
    : undefined;

  const footerConfig = footerVisible
    ? {
      height: footerEntry?.height ?? blueprint.breakpoints?.footerHeight ?? DEFAULT_FOOTER_HEIGHT,
    }
    : undefined;

  const bottomNavConfig = bottomNavVisible
    ? {
      height: bottomNavEntry?.height ?? blueprint.breakpoints?.bottomNavHeight ?? DEFAULT_BOTTOM_NAV_HEIGHT,
    }
    : undefined;

  const padding = blueprint.layout?.padding ?? blueprint.breakpoints?.padding;

  const shellChildren = (
    <>
      {shellOverlays}
      {headerVisible && headerEvaluated.node ? (
        <AppShell.Header key="header">
          {headerEvaluated.node}
        </AppShell.Header>
      ) : null}
      {navbarVisible && navbarEvaluated.node ? (
        <AppShell.Navbar key="navbar">
          {navbarEvaluated.node}
        </AppShell.Navbar>
      ) : null}
      {asideVisible && asideEvaluated.node ? (
        <AppShell.Aside key="aside">
          {asideEvaluated.node}
        </AppShell.Aside>
      ) : null}
      <AppShell.Main
        key="main"
        id={mainConfig?.id}
        role={mainConfig?.role}
        maxWidth={mainConfig?.maxWidth}
        centerContent={mainConfig?.centerContent}
        tableOfContents={tableOfContentsEvaluated.visible ? tableOfContentsEvaluated.node : undefined}
        hideTocOnMobile={mainConfig?.hideTableOfContentsOnMobile}
        tocWidth={mainConfig?.tableOfContentsWidth}
        tocWithBorder={mainConfig?.tableOfContentsWithBorder}
        {...(mainExtraProps as Record<string, any>)}
      >
        {children}
      </AppShell.Main>
      {footerVisible && footerEvaluated.node ? (
        <AppShell.Footer key="footer">
          {footerEvaluated.node}
        </AppShell.Footer>
      ) : null}
      {bottomNavVisible && bottomNavEvaluated.node ? (
        <AppShell.BottomNav key="bottom-nav">
          {bottomNavEvaluated.node}
        </AppShell.BottomNav>
      ) : null}
    </>
  );

  return (
    <>
      {rootOverlaysBefore}
      <AppShell
        header={headerConfig}
        navbar={navbarConfig as any}
        aside={asideConfig as any}
        footer={footerConfig as any}
        bottomNav={bottomNavConfig as any}
        padding={padding}
        cssGeometry={blueprint.layout?.cssGeometry}
        withSafeArea={blueprint.layout?.withSafeArea}
        withBorder={blueprint.layout?.withBorder}
        backgroundColor={blueprint.layout?.backgroundColor}
        style={blueprint.layout?.style}
        statusBar={blueprint.layout?.statusBar}
        transitionDuration={blueprint.layout?.transitionDuration}
        transitionTimingFunction={blueprint.layout?.transitionTimingFunction}
        disabled={blueprint.layout?.disabled}
        testID={blueprint.layout?.testID}
        layoutSections={{
          header: headerVisible,
          navbar: navbarVisible,
          aside: asideVisible,
          footer: footerVisible,
          bottomNav: bottomNavVisible,
        }}
        showHeader={headerVisible}
        autoLayout={false}
      >
        {shellChildren}
      </AppShell>
      {rootOverlaysAfter}
    </>
  );
};
