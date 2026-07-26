import { brandIcons, deprecatedBrandNames, resolveBrandName } from '../brands';

describe('brand name registry', () => {
  it('uses kebab-case for every multi-word brand name', () => {
    const camelCased = Object.keys(brandIcons).filter((name) => /[A-Z]/.test(name));
    expect(camelCased).toEqual([]);
  });

  it('resolves every deprecated camelCase alias onto a registered brand', () => {
    for (const [alias, canonical] of Object.entries(deprecatedBrandNames)) {
      expect([alias, resolveBrandName(alias)]).toEqual([alias, canonical]);
      expect(brandIcons).toHaveProperty([canonical]);
    }
  });

  it('passes canonical names through unchanged', () => {
    expect(resolveBrandName('app-store')).toBe('app-store');
    expect(resolveBrandName('github')).toBe('github');
  });
});
