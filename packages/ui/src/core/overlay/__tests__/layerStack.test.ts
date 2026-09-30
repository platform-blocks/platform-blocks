import { BackHandler } from 'react-native';

import {
  __resetLayerStackForTests,
  dismissTopLayerOnEscape,
  getLayerStackSnapshot,
  handleBackPress,
  handleModalRequestClose,
  isTopLayer,
  registerLayer,
  setLayerParent,
  subscribeLayerStack,
} from '../layerStack';
import type { LayerBehavior } from '../layerStack';

function behavior(overrides: Partial<LayerBehavior> = {}): () => LayerBehavior {
  const value: LayerBehavior = {
    closeOnEscape: true,
    closeOnBack: true,
    closeOnOutsidePress: false,
    modal: false,
    trapFocus: false,
    getContainer: () => null,
    ...overrides,
  };
  return () => value;
}

describe('layerStack (native)', () => {
  let backHandlers: Array<() => boolean | null | undefined>;
  let addListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    __resetLayerStackForTests();
    backHandlers = [];
    addListenerSpy = jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, handler) => {
      backHandlers.push(handler as () => boolean);
      return {
        remove: () => {
          backHandlers = backHandlers.filter((h) => h !== handler);
        },
      };
    });
  });

  afterEach(() => {
    __resetLayerStackForTests();
    addListenerSpy.mockRestore();
  });

  it('orders layers by registration and removes them on unregister', () => {
    const a = registerLayer('a', null, behavior());
    const b = registerLayer('b', null, behavior());
    expect(getLayerStackSnapshot()).toEqual(['a', 'b']);
    expect(isTopLayer('b')).toBe(true);

    b();
    expect(getLayerStackSnapshot()).toEqual(['a']);
    expect(isTopLayer('a')).toBe(true);
    a();
    expect(getLayerStackSnapshot()).toEqual([]);
  });

  it('keeps a child above its parent when the parent registers second', () => {
    setLayerParent('child', 'parent');
    const child = registerLayer('child', 'parent', behavior());
    const parent = registerLayer('parent', null, behavior());
    expect(getLayerStackSnapshot()).toEqual(['parent', 'child']);
    child();
    parent();
  });

  it('notifies subscribers on changes', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeLayerStack(listener);
    const off = registerLayer('a', null, behavior());
    off();
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it('Escape dismisses only the topmost layer', () => {
    const onDismissA = jest.fn();
    const onDismissB = jest.fn();
    registerLayer('a', null, behavior({ onDismiss: onDismissA }));
    registerLayer('b', null, behavior({ onDismiss: onDismissB }));

    expect(dismissTopLayerOnEscape()).toBe(true);
    expect(onDismissB).toHaveBeenCalledWith('escape-key');
    expect(onDismissA).not.toHaveBeenCalled();
  });

  it('Escape skips a non-escapable layer but stops at a modal barrier', () => {
    const below = jest.fn();
    const tooltip = jest.fn();
    registerLayer('below', null, behavior({ onDismiss: below }));
    registerLayer('tooltip', null, behavior({ closeOnEscape: false, onDismiss: tooltip }));
    expect(dismissTopLayerOnEscape()).toBe(true);
    expect(below).toHaveBeenCalledTimes(1);
    expect(tooltip).not.toHaveBeenCalled();

    __resetLayerStackForTests();
    const underModal = jest.fn();
    registerLayer('under', null, behavior({ onDismiss: underModal }));
    registerLayer('modal', null, behavior({ closeOnEscape: false, closeOnBack: false, modal: true }));
    expect(dismissTopLayerOnEscape()).toBe(false);
    expect(underModal).not.toHaveBeenCalled();
  });

  it('attaches one BackHandler listener while layers are open and dismisses the topmost', () => {
    const onDismissA = jest.fn();
    const onDismissB = jest.fn();
    const offA = registerLayer('a', null, behavior({ onDismiss: onDismissA }));
    const offB = registerLayer('b', null, behavior({ onDismiss: onDismissB }));
    expect(backHandlers).toHaveLength(1);

    expect(backHandlers[0]()).toBe(true);
    expect(onDismissB).toHaveBeenCalledWith('back-button');
    expect(onDismissA).not.toHaveBeenCalled();

    offB();
    offA();
    expect(backHandlers).toHaveLength(0);
  });

  it('back returns false when no layer wants it, and true (swallowed) for a non-dismissible modal', () => {
    registerLayer('passive', null, behavior({ closeOnBack: false }));
    expect(handleBackPress()).toBe(false);

    registerLayer('modal', null, behavior({ closeOnBack: false, modal: true }));
    expect(handleBackPress()).toBe(true);
  });

  it('routes a native Modal onRequestClose to the topmost layer', () => {
    const onDismiss = jest.fn();
    registerLayer('sheet', null, behavior({ onDismiss }));
    handleModalRequestClose();
    expect(onDismiss).toHaveBeenCalledWith('back-button');
  });

  it('survives an onDismiss that throws', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    registerLayer('bad', null, behavior({ onDismiss: () => { throw new Error('boom'); } }));
    expect(() => dismissTopLayerOnEscape()).not.toThrow();
    warn.mockRestore();
  });
});
