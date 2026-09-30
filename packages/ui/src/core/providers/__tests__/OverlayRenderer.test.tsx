import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

import { useEscapeKey } from '../../../hooks/useEscapeKey';
import { __resetLayerStackForTests, dismissTopLayerOnEscape, handleBackPress } from '../../overlay/layerStack';
import { DEFAULT_Z_INDICES } from '../../theme/zIndices';
import { OverlayProvider, useOverlayApi, useOverlays } from '../OverlayProvider';
import type { OverlayConfig } from '../OverlayProvider';
import { OverlayRenderer } from '../OverlayRenderer';

function Opener({ config }: { config: Omit<OverlayConfig, 'id'> }) {
  const { openOverlay } = useOverlayApi();
  useEffect(() => {
    openOverlay(config);
  }, [openOverlay, config]);
  return null;
}

function Count() {
  return <Text testID="count">{useOverlays().length}</Text>;
}

/** Runs the provider's setTimeout-deferred onClose callbacks. */
async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

const baseConfig = (overrides: Partial<OverlayConfig> = {}): Omit<OverlayConfig, 'id'> => ({
  content: <Text>Overlay body</Text>,
  anchor: { x: 10, y: 20, width: 100, height: 30 },
  strategy: 'fixed',
  ...overrides,
});

describe('OverlayRenderer', () => {
  beforeEach(() => __resetLayerStackForTests());

  it('puts floatingId and role on the content container so aria-controls resolves', () => {
    const config = baseConfig({ floatingId: 'listbox-1', role: 'listbox' });
    const screen = render(
      <OverlayProvider>
        <Opener config={config} />
        <OverlayRenderer />
      </OverlayProvider>
    );
    const withId = screen.UNSAFE_root.findAll((node) => node.props?.nativeID === 'listbox-1');
    expect(withId.length).toBeGreaterThan(0);
    expect(withId[0].props.role).toBe('listbox');
  });

  it('defaults the z-index to the theme popover layer', () => {
    const config = baseConfig({ floatingId: 'z' });
    const screen = render(
      <OverlayProvider>
        <Opener config={config} />
        <OverlayRenderer />
      </OverlayProvider>
    );
    const [node] = screen.UNSAFE_root.findAll((n) => n.props?.nativeID === 'z' && typeof n.type === 'string');
    const style = Array.isArray(node.props.style) ? Object.assign({}, ...node.props.style) : node.props.style;
    expect(style.zIndex).toBe(DEFAULT_Z_INDICES.popover);
  });

  it('one Escape closes only the overlay above a dialog, not the dialog too', async () => {
    const onDialogEscape = jest.fn();
    const onOverlayClose = jest.fn();

    function DialogLike({ children }: { children: React.ReactNode }) {
      useEscapeKey(onDialogEscape, true);
      return <View>{children}</View>;
    }

    const config = baseConfig({ onClose: onOverlayClose });
    const screen = render(
      <OverlayProvider>
        <DialogLike>
          <Opener config={config} />
        </DialogLike>
        <Count />
        <OverlayRenderer />
      </OverlayProvider>
    );
    expect(screen.getByTestId('count').props.children).toBe(1);

    act(() => {
      dismissTopLayerOnEscape();
    });
    await flush();
    expect(onOverlayClose).toHaveBeenCalledTimes(1);
    expect(onDialogEscape).not.toHaveBeenCalled();
    expect(screen.getByTestId('count').props.children).toBe(0);

    act(() => {
      dismissTopLayerOnEscape();
    });
    expect(onDialogEscape).toHaveBeenCalledTimes(1);
  });

  it('closes overlays on Android back, but skips hover overlays that opted out of Escape', async () => {
    const onClose = jest.fn();
    const tooltip = baseConfig({ trigger: 'hover', layer: { closeOnEscape: false, closeOnOutsidePress: false } });
    const menu = baseConfig({ onClose });
    const screen = render(
      <OverlayProvider>
        <Opener config={menu} />
        <Opener config={tooltip} />
        <Count />
        <OverlayRenderer />
      </OverlayProvider>
    );
    expect(screen.getByTestId('count').props.children).toBe(2);

    act(() => {
      expect(handleBackPress()).toBe(true);
    });
    await flush();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('count').props.children).toBe(1);
  });

  it('asks the owner via onDismissRequest instead of closing when provided', () => {
    const onDismissRequest = jest.fn();
    const config = baseConfig({ onDismissRequest });
    const screen = render(
      <OverlayProvider>
        <Opener config={config} />
        <Count />
        <OverlayRenderer />
      </OverlayProvider>
    );
    act(() => {
      dismissTopLayerOnEscape();
    });
    expect(onDismissRequest).toHaveBeenCalledWith('escape-key');
    expect(screen.getByTestId('count').props.children).toBe(1);
  });

  it('closes on a native backdrop tap', async () => {
    const onClose = jest.fn();
    const config = baseConfig({ onClose });
    const screen = render(
      <OverlayProvider>
        <Opener config={config} />
        <Count />
        <OverlayRenderer />
      </OverlayProvider>
    );
    fireEvent.press(screen.getByLabelText('Close overlay'));
    await flush();
    expect(onClose).toHaveBeenCalled();
    expect(screen.getByTestId('count').props.children).toBe(0);
  });
});
