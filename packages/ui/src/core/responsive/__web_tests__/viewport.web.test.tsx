import React from 'react';
import { Text, View } from 'react-native';
import { act, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';

import { factory } from '../../factory/factory';
import { useBreakpoint, useViewport } from '../index';
import { resetViewportStore } from '../viewportStore';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

function setWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
}

beforeEach(() => {
  resetViewportStore();
  setWidth(1024);
});

afterEach(() => resetViewportStore());

function Probe() {
  const { width, breakpoint } = useViewport();
  const bp = useBreakpoint();
  return <Text testID="probe">{`${width}:${breakpoint}:${bp}`}</Text>;
}

describe('viewport store on web', () => {
  it('renders the desktop server snapshot during static rendering', () => {
    setWidth(400);
    const markup = renderToString(<Probe />);
    expect(markup).toContain('1200:xl:xl');
  });

  it('hydrates without mismatches, then updates to the real viewport', async () => {
    setWidth(400);
    const container = document.createElement('div');
    container.innerHTML = renderToString(<Probe />);
    document.body.appendChild(container);

    const recoverable = jest.fn();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, <Probe />, { onRecoverableError: recoverable });
    });
    expect(recoverable).not.toHaveBeenCalled();
    expect(container.textContent).toBe('400:base:base');
    act(() => root?.unmount());
    container.remove();
  });

  it('coalesces resize events into one update per animation frame', async () => {
    let renders = 0;
    function Counter() {
      renders += 1;
      return <Text>{useViewport().width}</Text>;
    }
    const view = render(<Counter />);
    const before = renders;
    await act(async () => {
      setWidth(700);
      window.dispatchEvent(new Event('resize'));
      setWidth(710);
      window.dispatchEvent(new Event('resize'));
      setWidth(720);
      window.dispatchEvent(new Event('resize'));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(view.container.textContent).toBe('720');
    expect(renders - before).toBe(1);
  });

  it('drives factory visibility props', async () => {
    const Box = factory<{ props: { testID?: string }; ref: View }>((props, ref) => (
      <View ref={ref} testID={props.testID} />
    ));
    const view = render(<Box testID="box" hiddenFrom="md" />);
    expect(view.queryByTestId('box')).toBeNull(); // 1024 >= md (768)
    await act(async () => {
      setWidth(600);
      window.dispatchEvent(new Event('resize'));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(view.queryByTestId('box')).not.toBeNull();
  });

  it('useMediaQuery renders its initial value on the server', () => {
    function Query() {
      return <Text>{String(useMediaQuery('(min-width: 1px)', false))}</Text>;
    }
    expect(renderToString(<Query />)).toContain('false');
  });
});
