import { resolveImageSource } from '../imageSource';

describe('resolveImageSource', () => {
  it('wraps a URI string in a source object', () => {
    expect(resolveImageSource('https://example.com/photo.png')).toEqual({
      uri: 'https://example.com/photo.png',
    });
  });

  it('passes bundled assets through untouched', () => {
    // Metro represents `require('./photo.png')` as an opaque asset id
    const asset = 42 as unknown as number;
    expect(resolveImageSource(asset)).toBe(asset);
  });

  it('passes source objects through untouched', () => {
    const source = { uri: 'https://example.com/photo.png', width: 100, height: 50 };
    expect(resolveImageSource(source)).toBe(source);
  });

  it('returns undefined for empty values', () => {
    expect(resolveImageSource(undefined)).toBeUndefined();
    expect(resolveImageSource('')).toBeUndefined();
  });
});
