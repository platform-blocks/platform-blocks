import { Platform } from 'react-native';

export interface PlatformShadowOptions {
  color?: string;
  opacity?: number;
  offsetX?: number;
  offsetY?: number;
  radius?: number;
  spread?: number;
  elevation?: number;
}

const clampOpacity = (value: number): number => {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
};

const hexToRgba = (hex: string, opacity: number): string | null => {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((char) => char + char).join('');
  }
  if (clean.length !== 6) {
    return null;
  }

  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);

  if ([r, g, b].some((component) => Number.isNaN(component))) {
    return null;
  }

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const ensureColorFormats = (color: string | undefined, opacity: number) => {
  const nextOpacity = clampOpacity(opacity);
  if (!color) {
    return {
      boxShadowColor: `rgba(0, 0, 0, ${nextOpacity})`,
      nativeColor: '#000',
      nativeOpacity: nextOpacity,
    };
  }

  const normalized = color.trim();

  if (normalized.startsWith('rgba(')) {
    return {
      boxShadowColor: normalized,
      nativeColor: normalized,
      nativeOpacity: 1,
    };
  }

  if (normalized.startsWith('rgb(')) {
    const boxShadowColor = normalized.replace('rgb(', 'rgba(').replace(')', `, ${nextOpacity})`);
    return {
      boxShadowColor,
      nativeColor: normalized,
      nativeOpacity: nextOpacity,
    };
  }

  if (normalized.startsWith('#')) {
    const rgba = hexToRgba(normalized, nextOpacity);
    return {
      boxShadowColor: rgba || `rgba(0, 0, 0, ${nextOpacity})`,
      nativeColor: normalized,
      nativeOpacity: nextOpacity,
    };
  }

  return {
    boxShadowColor: normalized,
    nativeColor: normalized,
    nativeOpacity: nextOpacity,
  };
};

export const platformShadow = (options: PlatformShadowOptions = {}) => {
  const {
    color = '#000',
    opacity = 0.15,
    offsetX = 0,
    offsetY = 2,
    radius = 8,
    spread = 0,
    elevation,
  } = options;

  const { boxShadowColor, nativeColor, nativeOpacity } = ensureColorFormats(color, opacity);

  if (Platform.OS === 'web') {
    const spreadPart = spread ? `${spread}px ` : '';
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${radius}px ${spreadPart}${boxShadowColor}`.trim(),
    };
  }

  return {
    shadowColor: nativeColor,
    shadowOpacity: nativeOpacity,
    shadowRadius: radius,
    shadowOffset: { width: offsetX, height: offsetY },
    ...(elevation !== undefined ? { elevation } : {}),
  };
};

export default platformShadow;
