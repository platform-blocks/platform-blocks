/**
 * Select — persistent (closeOnSelect={false}) dropdown on the anchored-overlay
 * path used by desktop web.
 *
 * The menu there lives in the OverlayProvider, not in the Select subtree, so it
 * only repaints when Select pushes fresh content into its overlay. These tests
 * cover that push surviving repeated selections: picking a second option has to
 * move the check mark, and the Select has to stay "open" so the trigger and the
 * menu don't disagree.
 *
 * Only the DOM measurement is faked (`usePopoverPositioning`) — the real
 * OverlayProvider and useDropdownPositioning run, because the bug this guards
 * against lived in how those two exchange overlay ids.
 */

import React, { useState } from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { View } from 'react-native';

import { OverlayProvider, useOverlays } from '../../../core/providers/OverlayProvider';
import { Select } from '../Select';

// Anchored-overlay presentation (desktop web) rather than the native modal.
jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useOverlayMode: () => ({
    deviceInfo: {},
    isWeb: true,
    isMobileExperience: false,
    isDesktopExperience: true,
    shouldUseModal: false,
    shouldUseOverlay: true,
    shouldUsePortal: true,
  }),
}));

// Real layout measurement needs a DOM; hand back a fixed, already-resolved box.
jest.mock('../../../core/hooks/usePopoverPositioning', () => {
  const { useRef } = require('react');
  return {
    usePopoverPositioning: () => ({
      position: {
        x: 0,
        y: 40,
        placement: 'bottom-start',
        finalWidth: 200,
        finalHeight: 120,
        maxHeight: 260,
      },
      updatePosition: jest.fn().mockResolvedValue(undefined),
      isPositioning: false,
      anchorRef: useRef(null),
      popoverRef: useRef(null),
    }),
  };
});

// Surfaces which glyph rendered, so the check mark and chevron are queryable.
jest.mock('../../Icon', () => ({
  Icon: ({ name }: any) => {
    const MockedView = require('react-native').View;
    return <MockedView accessibilityLabel={`icon-${name}`} />;
  },
}));

const options = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Beta', value: 'beta' },
  { label: 'Gamma', value: 'gamma' },
];

/** Renders whatever the provider is holding, the way the app shell does. */
function OverlayOutlet() {
  const overlays = useOverlays();
  return <View testID="overlay-outlet">{overlays.map(o => <View key={o.id}>{o.content}</View>)}</View>;
}

function Harness({ closeOnSelect = false }: { closeOnSelect?: boolean }) {
  const [value, setValue] = useState<string | null>(null);
  return (
    <OverlayProvider>
      <Select
        label="Persistent menu"
        options={options}
        value={value ?? undefined}
        onChange={val => setValue(val as string)}
        closeOnSelect={closeOnSelect}
      />
      <OverlayOutlet />
    </OverlayProvider>
  );
}

/** Lets OverlayProvider's setTimeout-deferred onClose callbacks run. */
const flushTimers = async () => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};

/** The option rows carry a check icon only while selected. */
const checkCount = (screen: any) => screen.queryAllByLabelText('icon-check').length;

const OPTION_LABELS = options.map(o => o.label);

/**
 * Which row currently owns the check mark. Each row renders its icon slot ahead
 * of its label, so in tree order the check is immediately followed by the label
 * it belongs to.
 */
const checkedOption = (root: any): string | undefined => {
  const markers: string[] = [];
  for (const node of root.findAllByProps({})) {
    if (node.props?.accessibilityLabel === 'icon-check') markers.push('__check__');
    const child = node.props?.children;
    if (typeof child === 'string' && OPTION_LABELS.includes(child)) markers.push(child);
  }
  const at = markers.indexOf('__check__');
  return at === -1 ? undefined : markers.slice(at + 1).find(m => m !== '__check__');
};

/**
 * The chevron is one glyph spun by an animated transform, so the open state is
 * read off the trigger's `expanded` a11y state rather than the icon name.
 */
const triggerExpanded = (screen: any) =>
  screen.getByLabelText('Persistent menu').props.accessibilityState?.expanded;

describe('Select — persistent menu on the overlay path', () => {
  it('moves the check mark when a second option is picked without closing', async () => {
    const screen = render(<Harness />);

    fireEvent.press(screen.getByLabelText('Persistent menu'));
    await flushTimers();

    // Menu is up, nothing chosen yet.
    expect(screen.queryAllByText('Beta').length).toBeGreaterThan(0);
    expect(checkCount(screen)).toBe(0);

    fireEvent.press(screen.getAllByText('Beta')[0]);
    await flushTimers();

    expect(checkedOption(screen.UNSAFE_root)).toBe('Beta');

    // Second pick, menu still open — this is what used to freeze.
    fireEvent.press(screen.getAllByText('Gamma')[0]);
    await flushTimers();

    // Still exactly one check, and it has moved to Gamma's row.
    expect(checkCount(screen)).toBe(1);
    expect(checkedOption(screen.UNSAFE_root)).toBe('Gamma');
  });

  it('keeps exactly one overlay mounted across repeated selections', async () => {
    const screen = render(<Harness />);

    fireEvent.press(screen.getByLabelText('Persistent menu'));
    await flushTimers();

    fireEvent.press(screen.getAllByText('Beta')[0]);
    await flushTimers();
    fireEvent.press(screen.getAllByText('Gamma')[0]);
    await flushTimers();

    // One live menu — an orphaned overlay would leave a second copy behind.
    expect(screen.getAllByText('Alpha').length).toBe(1);
  });

  it('leaves the trigger showing an open menu after selecting', async () => {
    const screen = render(<Harness />);

    fireEvent.press(screen.getByLabelText('Persistent menu'));
    await flushTimers();
    expect(triggerExpanded(screen)).toBe(true);

    fireEvent.press(screen.getAllByText('Beta')[0]);
    await flushTimers();

    // The trigger tracks `open`; if it reported collapsed while the menu was
    // still painted, Select and its overlay had gone out of sync.
    expect(triggerExpanded(screen)).toBe(true);
  });

  it('still tears the menu down when closeOnSelect is left on', async () => {
    const screen = render(<Harness closeOnSelect />);

    fireEvent.press(screen.getByLabelText('Persistent menu'));
    await flushTimers();
    expect(screen.queryAllByText('Beta').length).toBeGreaterThan(0);

    fireEvent.press(screen.getAllByText('Beta')[0]);
    await flushTimers();

    // Only the trigger's own label survives; the option rows are gone.
    expect(screen.queryAllByText('Alpha').length).toBe(0);
    expect(triggerExpanded(screen)).toBe(false);
  });
});
