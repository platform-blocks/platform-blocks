import { brandIcons } from '../brands';
import { ALL_BRANDS } from '../demos/data';

describe('brand name registry', () => {
  it('uses kebab-case for every multi-word brand name', () => {
    const camelCased = Object.keys(brandIcons).filter((name) => /[A-Z]/.test(name));
    expect(camelCased).toEqual([]);
  });

});

// The all-brands demo bills itself as the complete catalog, so it has to track
// the registry exactly — it silently drifted in both directions before this.
describe('ALL_BRANDS demo catalog', () => {
  it('lists every registered brand', () => {
    const missing = Object.keys(brandIcons).filter((name) => !ALL_BRANDS.includes(name as never));
    expect(missing).toEqual([]);
  });

  it('lists nothing the registry does not have', () => {
    const unknown = ALL_BRANDS.filter((name) => !(name in brandIcons));
    expect(unknown).toEqual([]);
  });

  it('lists each brand once', () => {
    const dupes = ALL_BRANDS.filter((name, i) => ALL_BRANDS.indexOf(name) !== i);
    expect(dupes).toEqual([]);
  });
});
