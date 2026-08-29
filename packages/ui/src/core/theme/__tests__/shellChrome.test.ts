import { Platform } from 'react-native';

import {
  createThemeColorVariablesCss,
  shellChrome,
  shellChromeColors,
  withCssVariableColors,
} from '../cssVariableTheme';
import { BUILT_IN_DARK_THEME } from '../PlatformBlocksProvider';
import { DEFAULT_THEME } from '../defaultTheme';

/**
 * The app shell used to dress its chrome straight off the gray ramp, behind a
 * `theme.colorScheme` branch. A branch is resolved wherever it runs — in Node,
 * at prerender, where the scheme is always light — so the static markup carried
 * a light hex per chrome surface and no stylesheet could correct it. The rest
 * of the page was already dark at first paint, leaving the header and navbar
 * flashing light until hydration re-ran the branch.
 */

const originalOS = Platform.OS;
const setPlatform = (os: string) => {
  (Platform as unknown as { OS: string }).OS = os;
};
afterAll(() => setPlatform(originalOS));

describe('shellChromeColors', () => {
  beforeEach(() => setPlatform('web'));

  it('reads each scheme off its own end of the ramp', () => {
    const light = shellChromeColors(DEFAULT_THEME as any);
    const dark = shellChromeColors(BUILT_IN_DARK_THEME as any);

    expect(light.background).toBe(DEFAULT_THEME.colors.gray[0]);
    expect(dark.background).toBe(BUILT_IN_DARK_THEME.colors.gray[1]);
    expect(light.border).toBe(DEFAULT_THEME.colors.gray[1]);
    expect(dark.border).toBe(BUILT_IN_DARK_THEME.colors.gray[2]);
  });

  it('gives every chrome token a different value per scheme', () => {
    const light = shellChromeColors(DEFAULT_THEME as any);
    const dark = shellChromeColors(BUILT_IN_DARK_THEME as any);

    (Object.keys(light) as Array<keyof typeof light>).forEach(token => {
      expect(dark[token]).not.toBe(light[token]);
    });
  });
});

describe('shellChrome', () => {
  beforeEach(() => setPlatform('web'));

  it('emits var() references once colors are CSS variables', () => {
    const chrome = shellChrome(withCssVariableColors(DEFAULT_THEME as any));

    expect(chrome.background).toBe(
      `var(--platform-blocks-shell-chrome-bg, ${DEFAULT_THEME.colors.gray[0]})`
    );
    expect(chrome.border).toBe(
      `var(--platform-blocks-shell-chrome-border, ${DEFAULT_THEME.colors.gray[1]})`
    );
    expect(chrome.canvas).toBe(
      `var(--platform-blocks-shell-canvas-bg, ${DEFAULT_THEME.colors.gray[0]})`
    );
  });

  /**
   * The regression itself. What the prerender emits has to be answerable by the
   * cascade — a bare hex is not, whichever scheme it came from.
   */
  it('never bakes a literal into the scheme the prerender guesses', () => {
    const prerendered = shellChrome(withCssVariableColors(DEFAULT_THEME as any));

    expect(prerendered.background).not.toBe(DEFAULT_THEME.colors.gray[0]);
    expect(prerendered.background).toMatch(/^var\(/);
  });

  it('keeps native on literals, where var() means nothing', () => {
    setPlatform('ios');
    const chrome = shellChrome(DEFAULT_THEME as any);

    expect(chrome.background).toBe(DEFAULT_THEME.colors.gray[0]);
    expect(chrome.veilStrong).toBe(shellChromeColors(DEFAULT_THEME as any).veilStrong);
  });

  it('keeps an app that has not opted in on literals', () => {
    const chrome = shellChrome(DEFAULT_THEME as any);

    expect(chrome.background).toBe(DEFAULT_THEME.colors.gray[0]);
  });

  it('leaves the native-only veil unpublished, so it stays a literal', () => {
    const chrome = shellChrome(withCssVariableColors(DEFAULT_THEME as any));

    expect(chrome.veil).toMatch(/^var\(/);
    expect(chrome.veilStrong).toBe(shellChromeColors(DEFAULT_THEME as any).veilStrong);
  });
});

describe('createThemeColorVariablesCss', () => {
  const light = shellChromeColors(DEFAULT_THEME as any);
  const dark = shellChromeColors(BUILT_IN_DARK_THEME as any);
  const css = createThemeColorVariablesCss(DEFAULT_THEME as any, BUILT_IN_DARK_THEME as any);

  const PUBLISHED = [
    ['--platform-blocks-shell-chrome-bg', 'background'],
    ['--platform-blocks-shell-chrome-border', 'border'],
    ['--platform-blocks-shell-canvas-bg', 'canvas'],
    ['--platform-blocks-shell-chrome-veil', 'veil'],
    ['--platform-blocks-shell-nav-active-bg', 'navActive'],
  ] as const;

  it.each(PUBLISHED)('defines %s for the light scheme', (name, token) => {
    expect(css).toContain(`${name}: ${light[token]};`);
  });

  // Without a matching definition in the dark block the media query changes
  // nothing, and the shell is back to painting light.
  it.each(PUBLISHED)('redefines %s for the dark scheme', (name, token) => {
    const darkBlock = css.slice(css.indexOf('@media (prefers-color-scheme: dark)'));
    expect(darkBlock).toContain(`${name}: ${dark[token]};`);
  });

  it('leaves the native-only veil out of the stylesheet', () => {
    expect(css).not.toContain('--platform-blocks-shell-chrome-veil-strong');
  });
});
