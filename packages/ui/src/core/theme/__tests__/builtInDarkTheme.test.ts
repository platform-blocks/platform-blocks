import { BUILT_IN_DARK_THEME } from '../PlatformBlocksProvider';
import { DARK_THEME } from '../darkTheme';
import { DEFAULT_THEME } from '../defaultTheme';
import { resolveSurface } from '../surfaces';

/**
 * The built-in dark theme used to be assembled by copying a hand-picked set of
 * keys off DARK_THEME. Every scheme-dependent group that wasn't on that list
 * kept its light value — most visibly `surfaces`, so a dark-mode dropdown
 * (level 2) painted white behind near-white text.
 */
describe('BUILT_IN_DARK_THEME', () => {
  it('carries every scheme-dependent group from the dark theme', () => {
    (['colors', 'text', 'backgrounds', 'surfaces', 'states', 'semantic', 'shadows', 'other'] as const)
      .forEach(key => {
        expect(BUILT_IN_DARK_THEME[key]).toEqual(DARK_THEME[key]);
      });
  });

  it('keeps keys the dark theme does not define', () => {
    expect(BUILT_IN_DARK_THEME.designTokens).toBe(DEFAULT_THEME.designTokens);
    expect(BUILT_IN_DARK_THEME.colorScheme).toBe('dark');
  });

  it('resolves every elevation level to a dark fill', () => {
    ([0, 1, 2, 3] as const).forEach(level => {
      const { background } = resolveSurface(BUILT_IN_DARK_THEME as any, level);
      const light = resolveSurface(DEFAULT_THEME as any, level).background;
      expect(background).toBe(DARK_THEME.surfaces[level].background);
      expect(background).not.toBe(light);
    });
  });
});
