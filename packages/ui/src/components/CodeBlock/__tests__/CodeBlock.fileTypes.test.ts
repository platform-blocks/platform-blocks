import { resolveCodeBorder, resolveCodeSurface } from '../styles';
import { brandFromFileName, iconFromFileName, languageFromFileName } from '../utils';

/**
 * File-name derivation and surface resolution — the two places where a wrong
 * answer is invisible in review but obvious on screen (a `.ts` tab highlighted
 * as plain text, or a code panel painted outside the theme).
 */

const theme: any = {
  colorScheme: 'light',
  backgrounds: { base: '#F7F8FA', subtle: '#EDEFF3', surface: '#FFFFFF', elevated: '#FFFFFF', border: '#E5E7EB' },
  surfaces: {
    0: { background: '#F7F8FA', border: '#F0F1F4', shadow: 'none' },
    1: { background: '#FFFFFF', border: '#E5E7EB', shadow: 'xs' },
    2: { background: '#FFFFFF', border: '#E5E7EB', shadow: 'md' },
    3: { background: '#FFFFFF', border: '#E5E7EB', shadow: 'xl' },
  },
  text: { primary: '#111', secondary: '#666' },
  colors: { primary: ['#E6F4FF', '#CDE8FF', '#9CD3FF', '#6BBEFF', '#3AA9FF', '#1890FF'] },
};

describe('languageFromFileName', () => {
  it.each([
    ['data.ts', 'tsx'],
    ['index.tsx', 'tsx'],
    ['setup.js', 'jsx'],
    ['theme.json', 'json'],
    ['notes.md', 'markdown'],
    ['run.sh', 'bash'],
  ])('maps %s to %s', (fileName, expected) => {
    expect(languageFromFileName(fileName)).toBe(expected);
  });

  it('falls back to tsx when there is no extension', () => {
    expect(languageFromFileName('Makefile')).toBe('tsx');
  });

  it('reads the last extension of a multi-dot name', () => {
    expect(languageFromFileName('demo.config.json')).toBe('json');
  });

  it('ignores extension casing', () => {
    expect(languageFromFileName('DATA.TS')).toBe('tsx');
  });
});

describe('file tab icons', () => {
  it('uses language logos where the brand registry has one', () => {
    expect(brandFromFileName('data.ts')).toBe('typescript');
    expect(brandFromFileName('index.tsx')).toBe('typescript');
    expect(brandFromFileName('quote.css')).toBe('css');
    expect(brandFromFileName('theme.scss')).toBe('css');
  });

  it('has no logo for extensions without one', () => {
    expect(brandFromFileName('theme.json')).toBeUndefined();
    expect(brandFromFileName('setup.js')).toBeUndefined();
    expect(brandFromFileName('LICENSE')).toBeUndefined();
  });

  it('groups the rest onto glyphs', () => {
    expect(iconFromFileName('setup.js')).toBe('code');
    expect(iconFromFileName('theme.json')).toBe('database');
    expect(iconFromFileName('notes.md')).toBe('markdown');
    expect(iconFromFileName('LICENSE')).toBe('file');
  });
});

describe('code surface', () => {
  it('paints code on the theme\'s recessed band', () => {
    expect(resolveCodeSurface(theme, 'code')).toBe(theme.backgrounds.subtle);
    expect(resolveCodeBorder(theme, 'code')).toBe(theme.backgrounds.border);
  });

  it('drops a terminal one step deeper on the ladder', () => {
    expect(resolveCodeSurface(theme, 'terminal')).toBe(theme.surfaces[0].background);
  });

  it('pins the hacker skin regardless of theme', () => {
    const dark = { ...theme, colorScheme: 'dark', backgrounds: { ...theme.backgrounds, subtle: '#161619' } };
    expect(resolveCodeSurface(theme, 'hacker')).toBe(resolveCodeSurface(dark as any, 'hacker'));
    expect(resolveCodeSurface(theme, 'hacker')).not.toBe(theme.backgrounds.subtle);
  });

  it('lets colors overrides win for every variant', () => {
    const overrides = { background: '#123456', border: '#654321' };
    for (const variant of ['code', 'terminal', 'hacker'] as const) {
      expect(resolveCodeSurface(theme, variant, overrides)).toBe('#123456');
      expect(resolveCodeBorder(theme, variant, overrides)).toBe('#654321');
    }
  });

  it('survives a theme with no backgrounds scale', () => {
    const bare: any = { colorScheme: 'light', text: theme.text, colors: theme.colors };
    expect(resolveCodeSurface(bare, 'code')).toBeTruthy();
    expect(resolveCodeBorder(bare, 'code')).toBeTruthy();
  });
});
