import type { ImageSourcePropType } from 'react-native';

/**
 * Image props accept either a remote URI string or a bundled asset from
 * `require('./photo.png')`. Normalize both into an RN `source` value.
 */
export function resolveImageSource(
  src: string | ImageSourcePropType | undefined,
): ImageSourcePropType | undefined {
  if (src == null || src === '') return undefined;
  return typeof src === 'string' ? { uri: src } : src;
}
