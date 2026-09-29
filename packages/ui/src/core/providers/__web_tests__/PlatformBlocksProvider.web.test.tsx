import React from 'react';
import { Text } from 'react-native';
import { renderToString } from 'react-dom/server';
import { act, render, screen } from '@testing-library/react';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { PlatformBlocksProvider } from '../../theme/PlatformBlocksProvider';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/I18nContext';
import { useDirection } from '../DirectionProvider';
import { useReducedMotion } from '../../motion/useReducedMotion';
import { useAnnouncer, useFocus } from '../../accessibility/hooks';
import { useHapticsSettings } from '../../haptics/HapticsProvider';
import { useOverlayApi } from '../OverlayProvider';

const renders = { count: 0 };

/** Memoized: it re-renders only when a context it reads publishes a new value. */
const Consumer = React.memo(function Consumer() {
  renders.count += 1;
  useTheme();
  useI18n();
  useDirection();
  useReducedMotion();
  useAnnouncer();
  useFocus('consumer');
  useHapticsSettings();
  useOverlayApi();
  return null;
});

const consumer = <Consumer />;

describe('PlatformBlocksProvider', () => {
  beforeEach(() => {
    renders.count = 0;
  });

  it('does not re-render consumers when the app root re-renders with the same props', () => {
    const resources = { en: { translation: { hi: 'Hi' } } };
    const App = ({ tick }: { tick: number }) => (
      // A new `children` element every render, like a real app root.
      <PlatformBlocksProvider locale="en" i18nResources={resources}>
        <Text>{`tick ${tick}`}</Text>
        {consumer}
      </PlatformBlocksProvider>
    );
    const { rerender } = render(<App tick={0} />);
    const initial = renders.count;
    expect(initial).toBeGreaterThan(0);

    rerender(<App tick={1} />);
    rerender(<App tick={2} />);
    expect(screen.getByText('tick 2')).toBeTruthy();
    expect(renders.count).toBe(initial);
  });

  it('forces reduced motion from its prop without remounting the app', () => {
    let reduced: boolean | null = null;
    const mounts = { count: 0 };
    const Probe = () => {
      reduced = useReducedMotion();
      React.useEffect(() => {
        mounts.count += 1;
      }, []);
      return null;
    };
    const { rerender } = render(
      <PlatformBlocksProvider>
        <Probe />
      </PlatformBlocksProvider>
    );
    expect(reduced).toBe(false);
    rerender(
      <PlatformBlocksProvider reducedMotion>
        <Probe />
      </PlatformBlocksProvider>
    );
    expect(reduced).toBe(true);
    expect(mounts.count).toBe(1);
  });

  it('works with direction={false} (useDirection no longer throws)', () => {
    let dir = '';
    const Probe = () => {
      dir = useDirection().dir;
      return null;
    };
    expect(() =>
      render(
        <PlatformBlocksProvider direction={false}>
          <Probe />
        </PlatformBlocksProvider>
      )
    ).not.toThrow();
    expect(dir).toBe('ltr');
  });

  it('follows the locale prop', () => {
    const resources = {
      en: { translation: { hi: 'Hi' } },
      fr: { translation: { hi: 'Salut' } },
    };
    const Greeting = () => <Text>{useI18n().t('hi')}</Text>;
    const { rerender } = render(
      <PlatformBlocksProvider locale="en" i18nResources={resources}>
        <Greeting />
      </PlatformBlocksProvider>
    );
    expect(screen.getByText('Hi')).toBeTruthy();
    act(() => {
      rerender(
        <PlatformBlocksProvider locale="fr" i18nResources={resources}>
          <Greeting />
        </PlatformBlocksProvider>
      );
    });
    expect(screen.getByText('Salut')).toBeTruthy();
  });

  // A SafeAreaProvider with no starting insets renders nothing until it has
  // measured, which never happens during a static export.
  it('renders its children into server markup', () => {
    const html = renderToString(
      <PlatformBlocksProvider>
        <Text>prerendered</Text>
      </PlatformBlocksProvider>
    );
    expect(html).toContain('prerendered');
  });

  it('provides safe-area insets on web', () => {
    let insets: unknown = null;
    const Probe = () => {
      insets = React.useContext(SafeAreaInsetsContext);
      return null;
    };
    render(
      <PlatformBlocksProvider>
        <Probe />
      </PlatformBlocksProvider>
    );
    expect(insets).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });
});
