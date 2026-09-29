/**
 * Platform flags for tests.
 *
 * `isWeb`, `isNative`, `isIOS`, `isAndroid` and `hasDOM` in
 * `core/platform/flags.ts` are module constants, computed once from
 * `Platform.OS` when the module first loads. A test that sets `Platform.OS`
 * afterwards doesn't move them, so mock the flags module with one of these.
 *
 * Tests that flip `Platform.OS` between cases — flags follow it at read time:
 *
 *   jest.mock('../../../core/platform/flags', () =>
 *     require('../../../__test-utils__/platformFlags').livePlatformFlags()
 *   );
 *
 * A fixed platform, e.g. to load a module graph as web in isolation:
 *
 *   jest.isolateModules(() => {
 *     jest.doMock('../../../core/platform/flags', () =>
 *       require('../../../__test-utils__/platformFlags').mockPlatformFlags('web')
 *     );
 *     ({ Knob } = require('../Knob'));
 *   });
 *
 * (`require` rather than `import` inside the factory: Jest hoists `jest.mock`
 * above the imports.) `hasDOM` is only true on web with a `document`, which
 * the node test environment doesn't have — pass `{ hasDOM: true }` to fake one.
 */
import { Platform } from 'react-native';
import type { PlatformOSType } from 'react-native';

export type PlatformFlags = typeof import('../core/platform/flags');

export interface PlatformFlagsOptions {
  /** Force `hasDOM` (default: web and a global `document` exists). */
  hasDOM?: boolean;
}

function flagsFor(getOS: () => PlatformOSType, { hasDOM }: PlatformFlagsOptions): PlatformFlags {
  return {
    get isWeb() {
      return getOS() === 'web';
    },
    get isNative() {
      return getOS() !== 'web';
    },
    get isIOS() {
      return getOS() === 'ios';
    },
    get isAndroid() {
      return getOS() === 'android';
    },
    get hasDOM() {
      return hasDOM ?? (getOS() === 'web' && typeof document !== 'undefined');
    },
  };
}

/** Flags that read `Platform.OS` on every access. */
export function livePlatformFlags(options: PlatformFlagsOptions = {}): PlatformFlags {
  return flagsFor(() => Platform.OS, options);
}

/** Flags for a fixed platform, whatever `Platform.OS` says. */
export function mockPlatformFlags(os: PlatformOSType, options: PlatformFlagsOptions = {}): PlatformFlags {
  return flagsFor(() => os, options);
}
