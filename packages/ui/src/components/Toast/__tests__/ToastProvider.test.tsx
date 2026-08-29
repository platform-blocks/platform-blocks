/**
 * ToastProvider — the queue lifecycle behind a multi-toast stack: when a toast
 * leaves, when it is actually removed, and what a crowded stack does with the
 * toasts it can no longer show.
 */

import React from 'react';
import { render, act, fireEvent, screen } from '@testing-library/react-native';
import { Button } from 'react-native';

jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    __esModule: true,
    default: {
      View,
      Text: View,
      ScrollView: View,
      createAnimatedComponent: (Component: any) => Component,
    },
    // Stable across renders, like the real hook — a fresh object each render
    // would make every effect that lists a shared value re-run.
    useSharedValue: (initial: any) => require('react').useRef({ value: initial }).current,
    useAnimatedStyle: (cb: any) => cb(),
    // Deliberately never invokes the completion callback, so these tests
    // exercise the path where the `onExited` handshake does not arrive.
    withTiming: (value: any) => value,
    withSpring: (value: any) => value,
    withRepeat: (value: any) => value,
    withSequence: (...values: any[]) => values[0],
    cancelAnimation: () => {},
    interpolate: (_value: any, _input: any, output: any) => output[0],
    Easing: {
      linear: (t: number) => t,
      ease: (t: number) => t,
      cubic: (t: number) => t,
      back: () => (t: number) => t,
      bezier: () => (t: number) => t,
      inOut: () => (t: number) => t,
      out: () => (t: number) => t,
      in: () => (t: number) => t,
    },
    runOnJS: (fn: any) => fn,
    runOnUI: (fn: any) => fn,
  };
});

const mockNotifySuccess = jest.fn();
jest.mock('../../../hooks/useHaptics', () => ({
  useHaptics: () => ({
    notifySuccess: () => mockNotifySuccess(),
    notifyWarning: jest.fn(),
    notifyError: jest.fn(),
  }),
}));

jest.mock('../../Icon', () => ({
  Icon: ({ name, testID }: any) => {
    const MockIcon = require('react-native').View;
    return <MockIcon testID={testID || `icon-${name}`} />;
  },
}));

jest.mock('../../../core/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      primary: { 5: '#0066CC' },
      secondary: { 5: '#6B7280' },
      success: { 5: '#10B981' },
      warning: { 5: '#F59E0B' },
      error: { 5: '#EF4444' },
      gray: { 5: '#6B7280' },
    },
    text: { primary: '#111827', secondary: '#6B7280', muted: '#9CA3AF' },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
    radius: { sm: 4, md: 8, lg: 12, xl: 16 },
  }),
}));

import { ToastProvider, useToast, type ToastOptions } from '../ToastProvider';

/** Fires `show` with the given options and nothing else. */
function Trigger({ options, label = 'show' }: { options: ToastOptions; label?: string }) {
  const toast = useToast();
  return <Button title={label} onPress={() => toast.show(options)} />;
}

const renderWithProvider = (
  ui: React.ReactNode,
  providerProps: React.ComponentProps<typeof ToastProvider> extends infer P
    ? Partial<Omit<P, 'children'>>
    : never = {},
) =>
  render(<ToastProvider {...(providerProps as any)}>{ui}</ToastProvider>);

const press = (label: string) => act(() => { fireEvent.press(screen.getByText(label)); });
const advance = (ms: number) => act(() => { jest.advanceTimersByTime(ms); });

beforeEach(() => {
  jest.useFakeTimers();
  mockNotifySuccess.mockClear();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('ToastProvider lifecycle', () => {
  it('shows a toast and auto-hides it once its time is up', () => {
    renderWithProvider(<Trigger options={{ title: 'Saved', autoHide: 1000 }} />);

    press('show');
    expect(screen.getByText('Saved')).toBeTruthy();

    // The toast is still mounted the moment it starts leaving — that is what
    // gives it something to animate out of.
    advance(1000);
    expect(screen.queryByText('Saved')).toBeTruthy();

    // ...and it is gone once the exit has had time to play.
    advance(600);
    expect(screen.queryByText('Saved')).toBeNull();
  });

  it('keeps a persistent toast on screen indefinitely', () => {
    renderWithProvider(<Trigger options={{ title: 'Needs you', persistent: true }} />);

    press('show');
    advance(30_000);
    expect(screen.queryByText('Needs you')).toBeTruthy();
  });

  it('respects a per-toast autoHide over the provider default', () => {
    renderWithProvider(
      <Trigger options={{ title: 'Quick', autoHide: 500 }} />,
      { autoHide: 10_000 }
    );

    press('show');
    // Advanced in two steps because the removal is armed by an effect that runs
    // after the hide re-render, not from inside the same timer flush.
    advance(500);
    advance(600);
    expect(screen.queryByText('Quick')).toBeNull();
  });

  it('lets an over-limit toast animate out instead of deleting it', () => {
    renderWithProvider(
      <>
        <Trigger options={{ title: 'First', persistent: true }} label="first" />
        <Trigger options={{ title: 'Second', persistent: true }} label="second" />
      </>,
      { limit: 1 }
    );

    press('first');
    press('second');

    // Both are mounted: the retired toast is leaving, not gone.
    expect(screen.queryByText('First')).toBeTruthy();
    expect(screen.queryByText('Second')).toBeTruthy();

    advance(600);
    expect(screen.queryByText('First')).toBeNull();
    expect(screen.queryByText('Second')).toBeTruthy();
  });

  it('does not count leaving toasts against the limit', () => {
    renderWithProvider(
      <>
        <Trigger options={{ title: 'One', persistent: true }} label="one" />
        <Trigger options={{ title: 'Two', persistent: true }} label="two" />
      </>,
      { limit: 2 }
    );

    press('one');
    press('two');
    advance(600);

    expect(screen.queryByText('One')).toBeTruthy();
    expect(screen.queryByText('Two')).toBeTruthy();
  });

  it('waits out a longer transitionDuration before unmounting', () => {
    renderWithProvider(
      <Trigger options={{ title: 'Slow', autoHide: 100, transitionDuration: 800 }} />
    );

    press('show');
    advance(100);
    // A fixed 300ms removal used to cut a long exit short mid-flight.
    advance(500);
    expect(screen.queryByText('Slow')).toBeTruthy();

    advance(600);
    expect(screen.queryByText('Slow')).toBeNull();
  });

  it('does not replay a toast\u2019s entrance when the stack changes around it', () => {
    renderWithProvider(
      <>
        <Trigger options={{ title: 'One', persistent: true }} label="one" />
        <Trigger options={{ title: 'Two', persistent: true }} label="two" />
      </>
    );

    press('one');
    mockNotifySuccess.mockClear();

    // The arrival haptic fires from the same effect as the entrance animation,
    // so it is a proxy for it: adding, hiding and removing other toasts used to
    // re-run that effect on every toast on screen, restarting their transitions
    // and their auto-hide timers on every single provider render.
    press('two');
    advance(600);
    expect(mockNotifySuccess).toHaveBeenCalledTimes(1);
  });

  it('un-pauses when the hovered toast is removed without a leave event', () => {
    function LeakTrigger() {
      const toast = useToast();
      const held = React.useRef('');
      return (
        <>
          <Button
            title="showA"
            onPress={() => { held.current = toast.show({ title: 'A', persistent: true, testID: 'toast-a' }); }}
          />
          <Button title="showB" onPress={() => toast.show({ title: 'B', autoHide: 1000 })} />
          <Button title="hideA" onPress={() => toast.hide(held.current)} />
        </>
      );
    }

    renderWithProvider(<LeakTrigger />);
    press('showA');
    press('showB');

    act(() => { fireEvent(screen.getByTestId('toast-a'), 'mouseEnter'); });
    advance(1500);
    expect(screen.queryByText('B')).toBeTruthy();

    // A goes away under the pointer, so it never fires a leave event. The stack
    // has to release the pause on its own or nothing ever auto-hides again.
    press('hideA');
    advance(600);
    advance(1000);
    advance(600);
    expect(screen.queryByText('B')).toBeNull();
  });

  it('pauses the countdown while the pointer rests on the stack', () => {
    renderWithProvider(
      <Trigger options={{ title: 'Read me', autoHide: 1000, testID: 'toast' }} />
    );

    press('show');
    advance(600);

    act(() => { fireEvent(screen.getByTestId('toast'), 'mouseEnter'); });
    advance(10_000);
    expect(screen.queryByText('Read me')).toBeTruthy();

    // Leaving resumes with the time that was left, not a fresh countdown.
    act(() => { fireEvent(screen.getByTestId('toast'), 'mouseLeave'); });
    advance(399);
    expect(screen.queryByText('Read me')).toBeTruthy();
    advance(1 + 600);
    expect(screen.queryByText('Read me')).toBeNull();
  });
});

describe('ToastProvider queue API', () => {
  function GroupTrigger() {
    const toast = useToast();
    return (
      <>
        <Button
          title="batch"
          onPress={() => toast.batch([
            { title: 'Batch A', groupId: 'g', persistent: true },
            { title: 'Batch B', groupId: 'g', persistent: true },
          ])}
        />
        <Button title="hideGroup" onPress={() => toast.hideGroup('g')} />
        <Button title="hideAll" onPress={() => toast.hideAll()} />
      </>
    );
  }

  it('hides a group together and removes it when the exit lands', () => {
    renderWithProvider(<GroupTrigger />);

    press('batch');
    expect(screen.getByText('Batch A')).toBeTruthy();
    expect(screen.getByText('Batch B')).toBeTruthy();

    press('hideGroup');
    expect(screen.queryByText('Batch A')).toBeTruthy();

    advance(600);
    expect(screen.queryByText('Batch A')).toBeNull();
    expect(screen.queryByText('Batch B')).toBeNull();
  });

  it('hideAll clears every stack', () => {
    renderWithProvider(<GroupTrigger />);
    press('batch');
    press('hideAll');
    advance(600);
    expect(screen.queryByText('Batch A')).toBeNull();
  });
});

describe('toast.promise', () => {
  function PromiseTrigger({ promiseFactory }: { promiseFactory: () => Promise<string> }) {
    const toast = useToast();
    return (
      <Button
        title="run"
        onPress={() => {
          toast
            .promise(promiseFactory(), {
              pending: { message: 'Uploading…', testID: 'promise-toast' },
              success: (data) => `Done: ${data}`,
              error: () => 'Failed',
            })
            .catch(() => {});
        }}
      />
    );
  }

  it('settles the pending toast in place rather than swapping in a second one', async () => {
    let resolve: (value: string) => void = () => {};
    const promise = new Promise<string>(r => { resolve = r; });
    renderWithProvider(<PromiseTrigger promiseFactory={() => promise} />);

    press('run');
    expect(screen.getByText('Uploading…')).toBeTruthy();

    // A slow promise must not lose its pending toast to the default timeout.
    advance(10_000);
    expect(screen.getByText('Uploading…')).toBeTruthy();

    await act(async () => {
      resolve('ok');
      await promise;
    });

    expect(screen.queryByText('Uploading…')).toBeNull();
    expect(screen.getByText('Done: ok')).toBeTruthy();
    // One toast the whole way through.
    expect(screen.getAllByTestId('promise-toast')).toHaveLength(1);
  });

  it('starts the countdown again once the promise settles', async () => {
    let reject: (reason: any) => void = () => {};
    const promise = new Promise<string>((_, r) => { reject = r; });
    renderWithProvider(<PromiseTrigger promiseFactory={() => promise} />);

    press('run');
    await act(async () => {
      reject(new Error('nope'));
      await promise.catch(() => {});
    });

    expect(screen.getByText('Failed')).toBeTruthy();
    advance(4000);
    advance(600);
    expect(screen.queryByText('Failed')).toBeNull();
  });
});
