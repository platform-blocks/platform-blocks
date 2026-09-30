type PlatformModule = typeof import('../index');

/** Loads a fresh copy of core/platform with `Platform.OS` set to `os`. */
function loadFor(os: string): PlatformModule {
  let mod: PlatformModule | undefined;
  jest.isolateModules(() => {
    const { Platform } = require('react-native');
    const original = Platform.OS;
    Platform.OS = os;
    try {
      mod = require('../index') as PlatformModule;
    } finally {
      Platform.OS = original;
    }
  });
  return mod as PlatformModule;
}

describe('platform flags', () => {
  it('derives the flags from Platform.OS', () => {
    const ios = loadFor('ios');
    expect([ios.isWeb, ios.isNative, ios.isIOS, ios.isAndroid]).toEqual([false, true, true, false]);
    expect(ios.hasDOM).toBe(false);
    const android = loadFor('android');
    expect([android.isWeb, android.isNative, android.isIOS, android.isAndroid]).toEqual([false, true, false, true]);
    const web = loadFor('web');
    expect([web.isWeb, web.isNative]).toEqual([true, false]);
    // No DOM in the node test environment: hasDOM stays false even on web
    // (this is the static-rendering case).
    expect(web.hasDOM).toBe(typeof document !== 'undefined');
  });
});

describe('webStyle', () => {
  it('passes web-only styles through on web', () => {
    const web = loadFor('web');
    const style = web.webStyle({ cursor: 'not-allowed', userSelect: 'none', position: 'fixed', transition: 'opacity 150ms' });
    expect(style).toEqual({ cursor: 'not-allowed', userSelect: 'none', position: 'fixed', transition: 'opacity 150ms' });
  });

  it('drops them on native', () => {
    const ios = loadFor('ios');
    expect(ios.webStyle({ cursor: 'pointer', outlineStyle: 'none' })).toEqual({});
    expect(ios.nativeStyle({ elevation: 2 })).toEqual({ elevation: 2 });
    expect(loadFor('web').nativeStyle({ elevation: 2 })).toEqual({});
  });
});

describe('webProps', () => {
  it('returns the defined web-only props on web', () => {
    const web = loadFor('web');
    const onKeyDown = jest.fn();
    expect(web.webProps({ onKeyDown, tabIndex: 0, dataSet: { plocksInput: 'true' }, id: undefined })).toEqual({
      onKeyDown,
      tabIndex: 0,
      dataSet: { plocksInput: 'true' },
    });
  });

  it('returns nothing on native', () => {
    const android = loadFor('android');
    expect(android.webProps({ onKeyDown: jest.fn(), tabIndex: 0 })).toEqual({});
  });
});
