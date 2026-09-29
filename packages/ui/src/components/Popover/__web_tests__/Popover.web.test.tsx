import React from 'react';
import { Pressable, Text, TextInput } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { Popover } from '../Popover';
import { OverlayProvider } from '../../../core/providers/OverlayProvider';
import { OverlayRenderer } from '../../../core/providers/OverlayRenderer';
import { __resetLayerStackForTests } from '../../../core/overlay/layerStack';

// jsdom has no layout; give every element a box so the positioner can place
// the dropdown (an unmeasurable anchor keeps it closed).
const originalRect = Element.prototype.getBoundingClientRect;
beforeAll(() => {
  Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
    return { x: 20, y: 40, top: 40, left: 20, right: 180, bottom: 80, width: 160, height: 40, toJSON: () => ({}) } as DOMRect;
  };
});
afterAll(() => {
  Element.prototype.getBoundingClientRect = originalRect;
});

beforeEach(() => __resetLayerStackForTests());

/** Lets positioning (async measure + debounced re-measure) settle. */
async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
}

function withOverlays(ui: React.ReactElement) {
  return (
    <OverlayProvider>
      {ui}
      <OverlayRenderer />
    </OverlayProvider>
  );
}

function Basic(props: Partial<React.ComponentProps<typeof Popover>>) {
  return (
    <Popover id="pop" {...props}>
      <Popover.Target>
        <Pressable accessibilityLabel="Open settings">
          <Text>Open settings</Text>
        </Pressable>
      </Popover.Target>
      <Popover.Dropdown>
        <TextInput accessibilityLabel="Name" />
        <Pressable role="button" accessibilityLabel="Save">
          <Text>Save</Text>
        </Pressable>
      </Popover.Dropdown>
    </Popover>
  );
}

async function open(label = 'Open settings') {
  const trigger = screen.getByRole('button', { name: label });
  act(() => {
    trigger.focus();
  });
  fireEvent.click(trigger);
  await settle();
  return trigger;
}

describe('Popover (react-native-web DOM)', () => {
  it('wires aria-haspopup / aria-expanded / aria-controls to the real dropdown element', async () => {
    render(withOverlays(<Basic />));
    const trigger = screen.getByRole('button', { name: 'Open settings' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');

    await open();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const controls = trigger.getAttribute('aria-controls');
    expect(controls).toBe('pop-dropdown');
    const dropdown = document.getElementById(controls!);
    expect(dropdown).not.toBeNull();
    expect(dropdown!.getAttribute('role')).toBe('dialog');
  });

  it('moves focus into the dropdown on open and returns it to the trigger on Escape', async () => {
    render(withOverlays(<Basic />));
    const trigger = await open();
    const dropdown = document.getElementById('pop-dropdown')!;
    expect(dropdown.contains(document.activeElement) || document.activeElement?.contains(dropdown)).toBe(true);

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    await settle();
    expect(document.getElementById('pop-dropdown')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('with trapFocus, focuses the first field and keeps Tab inside', async () => {
    render(withOverlays(<Basic trapFocus />));
    await open();
    const input = screen.getByLabelText('Name');
    const save = screen.getByRole('button', { name: 'Save' });
    expect(document.activeElement).toBe(input);

    act(() => {
      save.focus();
    });
    fireEvent.keyDown(save, { key: 'Tab' });
    expect(document.activeElement).toBe(input);
  });

  it('does not return focus when returnFocus is false', async () => {
    render(withOverlays(<Basic returnFocus={false} />));
    const trigger = await open();
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    await settle();
    expect(document.activeElement).not.toBe(trigger);
  });

  it('Escape closes only the innermost of two nested popovers', async () => {
    render(withOverlays(
      <Popover id="outer">
        <Popover.Target>
          <Pressable accessibilityLabel="Outer"><Text>Outer</Text></Pressable>
        </Popover.Target>
        <Popover.Dropdown>
          <Popover id="inner">
            <Popover.Target>
              <Pressable accessibilityLabel="Inner"><Text>Inner</Text></Pressable>
            </Popover.Target>
            <Popover.Dropdown>
              <Text>Inner content</Text>
            </Popover.Dropdown>
          </Popover>
        </Popover.Dropdown>
      </Popover>
    ));

    await open('Outer');
    const innerTrigger = await open('Inner');
    expect(document.getElementById('inner-dropdown')).not.toBeNull();

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    await settle();
    expect(document.getElementById('inner-dropdown')).toBeNull();
    expect(document.getElementById('outer-dropdown')).not.toBeNull();
    expect(document.activeElement).toBe(innerTrigger);

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    await settle();
    expect(document.getElementById('outer-dropdown')).toBeNull();
  });

  it('closes on an outside press without swallowing it', async () => {
    const onPress = jest.fn();
    render(withOverlays(
      <>
        <Basic />
        <Pressable role="button" accessibilityLabel="Elsewhere" onPress={onPress}><Text>Elsewhere</Text></Pressable>
      </>
    ));
    await open();
    const elsewhere = screen.getByRole('button', { name: 'Elsewhere' });
    fireEvent.pointerDown(elsewhere);
    fireEvent.click(elsewhere);
    await settle();
    expect(document.getElementById('pop-dropdown')).toBeNull();
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
