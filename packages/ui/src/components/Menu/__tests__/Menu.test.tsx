import React from 'react';
import { Platform, Text } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Menu, MenuDropdown, MenuItem } from '../Menu';

type OverlayCallConfig = Record<string, any>;

const mockTheme = {
  colorScheme: 'light',
  colors: {
    surface: ['#ffffff', '#f8f8f8', '#f0f0f0', '#e0e0e0', '#d0d0d0'],
    gray: ['#fafafa', '#f0f0f0', '#e0e0e0'],
    error: ['#fee', '#fcc', '#faa', '#f88', '#f66', '#f44', '#f22'],
    primary: ['#e6f0ff', '#cce0ff', '#99c2ff', '#66a3ff', '#3385ff', '#0066ff', '#0052cc', '#003d99'],
    success: ['#e6f9f0', '#ccf3e1', '#99e7c3', '#66dca5', '#33d087', '#00c469', '#009853', '#006c3a'],
    warning: ['#fff9e6', '#fff3cc', '#ffe699', '#ffd966', '#ffcc33', '#ffbf00', '#cc9900', '#996b00'],
  },
  backgrounds: {
    surface: '#ffffff',
    base: '#fdfdfd',
    elevated: '#f2f2f2',
  },
  text: {
    primary: '#111111',
    onPrimary: '#ffffff',
    disabled: '#999999',
  },
  radii: {
    sm: 6,
    md: 10,
  },
};

const mockOpenOverlay = jest.fn<string, [OverlayCallConfig]>(() => 'overlay-1');
const mockCloseOverlay = jest.fn();
const mockUpdateOverlay = jest.fn();

const mockMeasureElement = jest.fn().mockResolvedValue({
  x: 20,
  y: 30,
  width: 120,
  height: 40,
});

const mockCalculateOverlay = jest.fn().mockReturnValue({
  x: 24,
  y: 70,
});

jest.mock('../../../core/theme', () => ({
  useTheme: () => mockTheme,
}));

jest.mock('../../../core/providers/OverlayProvider', () => ({
  useOverlay: () => ({
    openOverlay: mockOpenOverlay,
    closeOverlay: mockCloseOverlay,
    updateOverlay: mockUpdateOverlay,
    overlays: [],
  }),
  useOverlayApi: () => ({
    openOverlay: mockOpenOverlay,
    closeOverlay: mockCloseOverlay,
    updateOverlay: mockUpdateOverlay,
  }),
}));

jest.mock('../../../core/utils/positioning-enhanced', () => ({
  measureElement: (...args: any[]) => mockMeasureElement(...args),
  calculateOverlayPositionEnhanced: (...args: any[]) => mockCalculateOverlay(...args),
}));

/** Every `maxHeight` present in a rendered tree's styles, flattened. */
function collectMaxHeights(node: any, found: number[] = []): number[] {
  if (!node || typeof node !== 'object') return found;

  const styles = [node.props?.style].flat(Infinity).filter(Boolean);
  for (const style of styles) {
    if (typeof style?.maxHeight === 'number') found.push(style.maxHeight);
  }

  for (const child of node.children ?? []) collectMaxHeights(child, found);
  return found;
}

describe('Menu - behavior', () => {
  let consoleSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderMenu = (extraProps: Partial<React.ComponentProps<typeof Menu>> = {}) => (
    <Menu {...extraProps}>
      <Text>Open Menu</Text>
      <MenuDropdown>
        <MenuItem testID="menu-edit">Edit</MenuItem>
        <MenuItem testID="menu-delete">Delete</MenuItem>
      </MenuDropdown>
    </Menu>
  );

  it('opens an overlay when the trigger is pressed', async () => {
    const { getByText } = render(renderMenu());

    fireEvent.press(getByText('Open Menu'));

    await waitFor(() => {
      expect(mockOpenOverlay).toHaveBeenCalledTimes(1);
    });

    expect(mockMeasureElement).toHaveBeenCalled();
    const firstCall = mockOpenOverlay.mock.calls[0];
    expect(firstCall).toBeDefined();
    const overlayConfig = firstCall![0] as OverlayCallConfig;
    expect(overlayConfig.closeOnClickOutside).toBe(true);
    expect(overlayConfig.content).toBeTruthy();
  });

  it('invokes the item handler and closes the menu', async () => {
    const onDelete = jest.fn();
    const { getByText } = render(
      <Menu>
        <Text>Open Menu</Text>
        <MenuDropdown>
          <MenuItem>Edit</MenuItem>
          <MenuItem onPress={onDelete}>Delete</MenuItem>
        </MenuDropdown>
      </Menu>
    );

    fireEvent.press(getByText('Open Menu'));

    await waitFor(() => {
      expect(mockOpenOverlay).toHaveBeenCalledTimes(1);
    });

    const itemCall = mockOpenOverlay.mock.calls[0];
    expect(itemCall).toBeDefined();
    const overlayConfig = itemCall![0] as OverlayCallConfig;
    expect(overlayConfig.content).toBeTruthy();
    const overlayRender = render(overlayConfig.content);

    fireEvent.press(overlayRender.getByText('Delete'));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(mockCloseOverlay).toHaveBeenCalledWith('overlay-1');
  });

  it('does not open when disabled', async () => {
    const { getByText } = render(renderMenu({ disabled: true }));

    fireEvent.press(getByText('Open Menu'));

    await waitFor(() => {
      expect(mockOpenOverlay).not.toHaveBeenCalled();
    });
  });

  /**
   * The menu is positioned exactly once, when it opens, and is never
   * re-measured. So the height it hands the positioner has to be right the first
   * time: a wrong one is never corrected, it just renders the overflow
   * off-screen. This used to be a flat `120` regardless of item count.
   */
  describe('height reported to the positioner', () => {
    const heightPassedToPositioner = () => {
      const call = mockCalculateOverlay.mock.calls[0];
      expect(call).toBeDefined();
      const [, overlaySize, options] = call!;
      // Both arguments have to agree, or the side choice and the size cap
      // would be made against different heights.
      expect(options.desiredHeight).toBe(overlaySize.height);
      return overlaySize.height as number;
    };

    const renderWithItems = (count: number) => (
      <Menu>
        <Text>Open Menu</Text>
        <MenuDropdown>
          {Array.from({ length: count }, (_, i) => (
            <MenuItem key={i}>{`Item ${i}`}</MenuItem>
          ))}
        </MenuDropdown>
      </Menu>
    );

    it('scales with the number of items', async () => {
      const { getByText } = render(renderWithItems(2));
      fireEvent.press(getByText('Open Menu'));
      await waitFor(() => expect(mockCalculateOverlay).toHaveBeenCalled());
      const twoItems = heightPassedToPositioner();

      jest.clearAllMocks();

      const longer = render(renderWithItems(8));
      fireEvent.press(longer.getByText('Open Menu'));
      await waitFor(() => expect(mockCalculateOverlay).toHaveBeenCalled());
      const eightItems = heightPassedToPositioner();

      expect(eightItems).toBeGreaterThan(twoItems);
    });

    it('never exceeds maxH', async () => {
      const { getByText } = render(
        <Menu maxH={150}>
          <Text>Open Menu</Text>
          <MenuDropdown>
            {Array.from({ length: 20 }, (_, i) => (
              <MenuItem key={i}>{`Item ${i}`}</MenuItem>
            ))}
          </MenuDropdown>
        </Menu>
      );

      fireEvent.press(getByText('Open Menu'));
      await waitFor(() => expect(mockCalculateOverlay).toHaveBeenCalled());

      expect(heightPassedToPositioner()).toBe(150);
    });

    it('caps the rendered menu to the space the positioner found', async () => {
      // The positioner reports only 90px available on the side it chose, well
      // under the default 300 `maxH`.
      mockCalculateOverlay.mockReturnValueOnce({ x: 24, y: 70, maxHeight: 90 });

      const { getByText } = render(renderWithItems(20));
      fireEvent.press(getByText('Open Menu'));
      await waitFor(() => expect(mockOpenOverlay).toHaveBeenCalled());

      const config = mockOpenOverlay.mock.calls[0]![0] as OverlayCallConfig;
      const heights = collectMaxHeights(render(config.content).toJSON());

      // Without the cap the menu keeps its full `maxH` and overflows the viewport.
      expect(heights).toContain(90);
      expect(heights).not.toContain(300);
    });

    it('forwards the positioner\'s edge pin to the overlay', async () => {
      mockCalculateOverlay.mockReturnValueOnce({
        x: 24, y: 70, anchorEdge: 'bottom', anchorOffset: 300,
      });

      const { getByText } = render(renderWithItems(6));
      fireEvent.press(getByText('Open Menu'));
      await waitFor(() => expect(mockOpenOverlay).toHaveBeenCalled());

      const config = mockOpenOverlay.mock.calls[0]![0] as any;
      expect(config.pinEdge).toBe('bottom');
      expect(config.pinOffset).toBe(300);
    });
  });

  /**
   * The menu is anchored to a trigger that scrolls with the page, so holding the
   * coordinates it was opened with leaves it floating where the trigger used to
   * be. Every other overlay in the library tracks; this was the last that didn't.
   */
  describe('staying docked to the trigger', () => {
    const originalOS = Platform.OS;
    let listeners: Record<string, Array<() => void>>;

    beforeEach(() => {
      // The tracking only runs on web, against a real window.
      (Platform as any).OS = 'web';
      listeners = {};
      (global as any).window = {
        innerWidth: 1024,
        innerHeight: 768,
        addEventListener: (type: string, handler: () => void) => {
          (listeners[type] ||= []).push(handler);
        },
        removeEventListener: (type: string, handler: () => void) => {
          listeners[type] = (listeners[type] || []).filter(h => h !== handler);
        },
      };
      (global as any).requestAnimationFrame = (cb: FrameRequestCallback) =>
        setTimeout(() => cb(0), 0) as unknown as number;
      (global as any).cancelAnimationFrame = (id: number) => clearTimeout(id);
    });

    // `window` has to outlive the per-test teardown: RTL's auto-cleanup unmounts
    // after our afterEach, and the tracking effect's cleanup touches
    // removeEventListener.
    afterAll(() => {
      (Platform as any).OS = originalOS;
      delete (global as any).window;
    });

    /** Fire the scroll listeners `times` over, then let the coalescing frame run. */
    const scroll = async (times = 1) => {
      await act(async () => {
        for (let i = 0; i < times; i++) {
          listeners.scroll?.forEach(handler => handler());
        }
        await new Promise(resolve => setTimeout(resolve, 20));
      });
    };

    const openMenu = async (props: Partial<React.ComponentProps<typeof Menu>> = {}) => {
      const utils = render(renderMenu(props));
      fireEvent.press(utils.getByText('Open Menu'));
      await waitFor(() => expect(mockOpenOverlay).toHaveBeenCalled());
      return utils;
    };

    it('repositions the open menu when the page scrolls', async () => {
      await openMenu();

      // The trigger moves up as the page scrolls under it.
      mockMeasureElement.mockResolvedValue({ x: 24, y: 10, width: 120, height: 40 });
      mockCalculateOverlay.mockReturnValue({ x: 24, y: 50, anchorEdge: 'top', anchorOffset: 50 });

      await scroll();

      expect(mockUpdateOverlay).toHaveBeenCalled();
      const [, updates] = mockUpdateOverlay.mock.calls.at(-1)!;
      expect(updates.anchor.y).toBe(50);
      expect(updates.pinOffset).toBe(50);
    });

    it('coalesces a burst of scroll events into a single reposition', async () => {
      await openMenu();
      mockUpdateOverlay.mockClear();

      // A capture-phase listener sees one of these per scrolling ancestor.
      await scroll(10);

      expect(mockUpdateOverlay).toHaveBeenCalledTimes(1);
    });

    it('leaves a context menu at the cursor instead of tracking an anchor', async () => {
      // A context menu is anchored to a point, not an element — there is
      // nothing for it to track.
      const utils = render(renderMenu({ trigger: 'contextmenu' }));
      fireEvent.press(utils.getByText('Open Menu'));
      mockUpdateOverlay.mockClear();

      await scroll();

      expect(mockUpdateOverlay).not.toHaveBeenCalled();
    });

    it('stops repositioning once unmounted', async () => {
      const { unmount } = await openMenu();

      unmount();
      mockUpdateOverlay.mockClear();
      await scroll();

      expect(mockUpdateOverlay).not.toHaveBeenCalled();
    });
  });
});
