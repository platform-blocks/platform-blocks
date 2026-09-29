import React from 'react';
import { Pressable, Text } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { Popover } from '../Popover';
import { OverlayProvider } from '../../../core/providers/OverlayProvider';
import { OverlayRenderer } from '../../../core/providers/OverlayRenderer';
import { OverlayHost } from '../../../core/overlay/OverlayHost';
import {
  __resetLayerStackForTests,
  dismissTopLayerOnEscape,
  handleBackPress,
} from '../../../core/overlay/layerStack';
import { DEFAULT_Z_INDICES } from '../../../core/theme/zIndices';
import { resetWarnOnce } from '../../../core/utils/logger';
import { measureElement } from '../../../core/utils/positioning-enhanced';

jest.mock('../../../core/utils/positioning-enhanced', () => {
  const actual = jest.requireActual('../../../core/utils/positioning-enhanced');
  return { ...actual, measureElement: jest.fn() };
});

const mockedMeasure = measureElement as jest.MockedFunction<typeof measureElement>;

function withOverlays(ui: React.ReactElement) {
  return (
    <OverlayProvider>
      {ui}
      <OverlayRenderer />
    </OverlayProvider>
  );
}

function BasicPopover(props: Partial<React.ComponentProps<typeof Popover>>) {
  return (
    <Popover id="basic" {...props}>
      <Popover.Target>
        <Pressable testID="trigger">
          <Text>Toggle Popover</Text>
        </Pressable>
      </Popover.Target>
      <Popover.Dropdown testID="popover-dropdown">
        <Text>Dropdown content</Text>
      </Popover.Dropdown>
    </Popover>
  );
}

/** Lets the positioner's trailing (debounced) re-measure settle inside act(). */
async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
}

function flatStyle(style: unknown): Record<string, unknown> {
  if (!Array.isArray(style)) return (style as Record<string, unknown>) ?? {};
  return Object.assign({}, ...(style.flat(Infinity) as object[]).filter(Boolean));
}

function findStyleUp(node: any, key: string): unknown {
  let current = node;
  while (current) {
    const value = flatStyle(current.props?.style)[key];
    if (value !== undefined) return value;
    current = current.parent;
  }
  return undefined;
}

function expanded(node: any): unknown {
  return node.props['aria-expanded'] ?? node.props.accessibilityState?.expanded;
}

describe('Popover', () => {
  beforeEach(() => {
    __resetLayerStackForTests();
    resetWarnOnce();
    mockedMeasure.mockResolvedValue({ x: 20, y: 100, width: 160, height: 40 });
  });

  it('opens the dropdown in the overlay renderer when the target is pressed', async () => {
    const onOpen = jest.fn();
    const screen = render(withOverlays(<BasicPopover onOpen={onOpen} />));
    expect(screen.queryByText('Dropdown content')).toBeNull();

    fireEvent.press(screen.getByText('Toggle Popover'));
    expect(await screen.findByText('Dropdown content')).toBeTruthy();
    await settle();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('gives the dropdown its role and the id the target points at', async () => {
    const screen = render(withOverlays(<BasicPopover />));
    fireEvent.press(screen.getByText('Toggle Popover'));
    const dropdown = await screen.findByTestId('popover-dropdown');
    await settle();

    expect(dropdown.props.nativeID).toBe('basic-dropdown');
    expect(dropdown.props.role).toBe('dialog');
    expect(expanded(screen.getByTestId('trigger'))).toBe(true);
  });

  it('uses a custom dropdown role', async () => {
    const screen = render(withOverlays(
      <Popover>
        <Popover.Target>
          <Pressable><Text>Open</Text></Pressable>
        </Popover.Target>
        <Popover.Dropdown testID="dd" role="menu">
          <Text>Items</Text>
        </Popover.Dropdown>
      </Popover>
    ));
    fireEvent.press(screen.getByText('Open'));
    const dropdown = await screen.findByTestId('dd');
    await settle();
    expect(dropdown.props.role).toBe('menu');
  });

  it('closes when toggled again, calling onClose but not onDismiss', async () => {
    const onClose = jest.fn();
    const onDismiss = jest.fn();
    const screen = render(withOverlays(<BasicPopover onClose={onClose} onDismiss={onDismiss} />));

    fireEvent.press(screen.getByText('Toggle Popover'));
    await screen.findByText('Dropdown content');
    await settle();

    fireEvent.press(screen.getByText('Toggle Popover'));
    await waitFor(() => expect(screen.queryByText('Dropdown content')).toBeNull());
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onDismiss).not.toHaveBeenCalled();
    expect(expanded(screen.getByTestId('trigger'))).toBe(false);
  });

  it('closes on Escape and on Android back, reporting a dismiss', async () => {
    const onDismiss = jest.fn();
    const screen = render(withOverlays(<BasicPopover onDismiss={onDismiss} />));

    fireEvent.press(screen.getByText('Toggle Popover'));
    await screen.findByText('Dropdown content');
    await settle();
    act(() => {
      dismissTopLayerOnEscape();
    });
    await waitFor(() => expect(screen.queryByText('Dropdown content')).toBeNull());
    expect(onDismiss).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByText('Toggle Popover'));
    await screen.findByText('Dropdown content');
    await settle();
    act(() => {
      expect(handleBackPress()).toBe(true);
    });
    await waitFor(() => expect(screen.queryByText('Dropdown content')).toBeNull());
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });

  it('Escape closes only the innermost of two nested popovers', async () => {
    const outerDismiss = jest.fn();
    const innerDismiss = jest.fn();
    const screen = render(withOverlays(
      <Popover onDismiss={outerDismiss}>
        <Popover.Target>
          <Pressable><Text>Outer</Text></Pressable>
        </Popover.Target>
        <Popover.Dropdown>
          <Text>Outer content</Text>
          <Popover onDismiss={innerDismiss}>
            <Popover.Target>
              <Pressable><Text>Inner</Text></Pressable>
            </Popover.Target>
            <Popover.Dropdown>
              <Text>Inner content</Text>
            </Popover.Dropdown>
          </Popover>
        </Popover.Dropdown>
      </Popover>
    ));

    fireEvent.press(screen.getByText('Outer'));
    await screen.findByText('Outer content');
    await settle();
    fireEvent.press(screen.getByText('Inner'));
    await screen.findByText('Inner content');
    await settle();

    act(() => {
      dismissTopLayerOnEscape();
    });
    await waitFor(() => expect(screen.queryByText('Inner content')).toBeNull());
    expect(screen.getByText('Outer content')).toBeTruthy();
    expect(innerDismiss).toHaveBeenCalledTimes(1);
    expect(outerDismiss).not.toHaveBeenCalled();

    act(() => {
      dismissTopLayerOnEscape();
    });
    await waitFor(() => expect(screen.queryByText('Outer content')).toBeNull());
    expect(outerDismiss).toHaveBeenCalledTimes(1);
  });

  it('keeps Escape when closeOnEscape is false', async () => {
    const screen = render(withOverlays(<BasicPopover closeOnEscape={false} />));
    fireEvent.press(screen.getByText('Toggle Popover'));
    await screen.findByText('Dropdown content');
    await settle();
    act(() => {
      expect(dismissTopLayerOnEscape()).toBe(false);
    });
    expect(screen.getByText('Dropdown content')).toBeTruthy();
  });

  it('passes an explicit width to the dropdown', async () => {
    const screen = render(withOverlays(<BasicPopover w={260} />));
    fireEvent.press(screen.getByText('Toggle Popover'));
    const dropdown = await screen.findByTestId('popover-dropdown');
    await settle();
    expect(flatStyle(dropdown.props.style).width).toBe(260);
  });

  it('sizes the dropdown with w="target" / miw / mah, never the root', async () => {
    const screen = render(withOverlays(<BasicPopover testID="root" w="target" miw={120} mah={200} m={4} />));
    const root = flatStyle(screen.getByTestId('root').props.style);
    expect(root.marginTop).toBe(4);
    expect(root.width).toBeUndefined();
    expect(root.minWidth).toBeUndefined();
    expect(root.maxHeight).toBeUndefined();
    fireEvent.press(screen.getByText('Toggle Popover'));
    await screen.findByTestId('popover-dropdown');
    await settle();
    // The target's measured width (160).
    expect(flatStyle(screen.getByTestId('popover-dropdown').props.style).width).toBe(160);
    expect(findStyleUp(screen.getByText('Dropdown content'), 'minWidth')).toBe(120);
  });

  it('stacks above the app header by default (theme popover layer)', async () => {
    const screen = render(withOverlays(<BasicPopover />));
    fireEvent.press(screen.getByText('Toggle Popover'));
    const dropdown = await screen.findByTestId('popover-dropdown');
    await settle();
    const zIndex = findStyleUp(dropdown, 'zIndex');
    expect(zIndex).toBe(DEFAULT_Z_INDICES.popover);
    expect(zIndex as number).toBeGreaterThan(DEFAULT_Z_INDICES.header);
  });

  it('honours an explicit zIndex', async () => {
    const screen = render(withOverlays(<BasicPopover zIndex={4242} />));
    fireEvent.press(screen.getByText('Toggle Popover'));
    const dropdown = await screen.findByTestId('popover-dropdown');
    await settle();
    expect(findStyleUp(dropdown, 'zIndex')).toBe(4242);
  });

  it('does not open when disabled', async () => {
    const screen = render(withOverlays(<BasicPopover disabled />));
    fireEvent.press(screen.getByText('Toggle Popover'));
    await settle();
    expect(screen.queryByText('Dropdown content')).toBeNull();
  });

  it('works controlled', async () => {
    const onChange = jest.fn();
    const screen = render(withOverlays(<BasicPopover opened onChange={onChange} />));
    expect(await screen.findByText('Dropdown content')).toBeTruthy();
    await settle();
    act(() => {
      dismissTopLayerOnEscape();
    });
    expect(onChange).toHaveBeenCalledWith(false);
    // Controlled: stays open until the parent says otherwise.
    expect(screen.getByText('Dropdown content')).toBeTruthy();
  });

  it('renders inside an OverlayHost (e.g. inside a Dialog) rather than the app root', async () => {
    const screen = render(withOverlays(
      <OverlayHost>
        <BasicPopover />
      </OverlayHost>
    ));
    fireEvent.press(screen.getByText('Toggle Popover'));
    await screen.findByText('Dropdown content');
    await settle();
    // Two renderers are mounted; the popover's layer lives in the inner one.
    expect(screen.getAllByText('Dropdown content')).toHaveLength(1);
  });

  it('renders inline without an OverlayProvider instead of throwing', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const screen = render(<BasicPopover />);
    fireEvent.press(screen.getByText('Toggle Popover'));
    expect(await screen.findByText('Dropdown content')).toBeTruthy();
    expect(warn.mock.calls.some(([message]) => String(message).includes('OverlayProvider'))).toBe(true);
    act(() => {
      dismissTopLayerOnEscape();
    });
    await waitFor(() => expect(screen.queryByText('Dropdown content')).toBeNull());
    warn.mockRestore();
  });
});

describe('Popover - target ref', () => {
  it("forwards the target child's ref without touching element.ref on React 19", () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const childRef = React.createRef<any>();

    render(
      <Popover>
        <Popover.Target>
          <Text ref={childRef}>Target</Text>
        </Popover.Target>
        <Popover.Dropdown><Text>Dropdown content</Text></Popover.Dropdown>
      </Popover>
    );

    expect(childRef.current).not.toBeNull();
    const refWarnings = errorSpy.mock.calls.filter((args) =>
      String(args[0]).includes('Accessing element.ref')
    );
    expect(refWarnings).toHaveLength(0);
    errorSpy.mockRestore();
  });
});
