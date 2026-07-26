import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { render } from '@testing-library/react-native';

import { Surface } from '../Surface';
import { useSurfaceLevel } from '../SurfaceContext';

const LIGHT_SURFACES = {
  0: { background: '#F7F8FA', border: '#F0F1F4', shadow: 'none' },
  1: { background: '#FFFFFF', border: '#E5E7EB', shadow: 'xs' },
  2: { background: '#FFFFFF', border: '#E5E7EB', shadow: 'md' },
  3: { background: '#FFFFFF', border: '#E5E7EB', shadow: 'xl' },
};

const DARK_SURFACES = {
  0: { background: '#0E0E11', border: '#1F1F23', shadow: 'none' },
  1: { background: '#1C1C1F', border: '#2A2A2E', shadow: 'xs' },
  2: { background: '#26262A', border: '#313136', shadow: 'md' },
  3: { background: '#2F2F34', border: '#3A3A40', shadow: 'xl' },
};

const baseTheme = {
  colorScheme: 'light',
  surfaces: LIGHT_SURFACES,
  backgrounds: {
    base: '#F7F8FA',
    subtle: '#EDEFF3',
    surface: '#FFFFFF',
    elevated: '#FFFFFF',
    border: '#E5E7EB',
  },
  colors: { primary: ['#EEF2FF', '#E0E7FF'] },
  shadows: {
    xs: '0px 1px 2px rgba(0,0,0,0.1)',
    sm: '0px 1px 3px rgba(0,0,0,0.1)',
    md: '0px 4px 6px rgba(0,0,0,0.1)',
    lg: '0px 10px 15px rgba(0,0,0,0.05)',
    xl: '0px 20px 25px rgba(0,0,0,0.05)',
  },
};

let mockTheme: any = baseTheme;

jest.mock('../../../core/theme', () => {
  const actual = jest.requireActual('../../../core/theme');
  return { ...actual, useTheme: () => mockTheme };
});

const flatten = (node: any) => StyleSheet.flatten(node.props.style) as any;

describe('Surface', () => {
  beforeEach(() => {
    mockTheme = baseTheme;
  });

  it('resolves background and border from the level rather than a palette', () => {
    const { getByTestId } = render(<Surface testID="s" level={2} />);
    expect(flatten(getByTestId('s')).backgroundColor).toBe('#FFFFFF');
  });

  it('defaults to level 1 when neither level nor raised is given', () => {
    const { getByTestId } = render(<Surface testID="s" />);
    expect(flatten(getByTestId('s')).backgroundColor).toBe(LIGHT_SURFACES[1].background);
  });

  describe('nesting', () => {
    it('steps up one level from the enclosing Surface when raised', () => {
      mockTheme = { ...baseTheme, colorScheme: 'dark', surfaces: DARK_SURFACES };

      const { getByTestId } = render(
        <Surface testID="outer" level={0}>
          <Surface testID="inner" raised />
        </Surface>,
      );

      expect(flatten(getByTestId('outer')).backgroundColor).toBe(DARK_SURFACES[0].background);
      expect(flatten(getByTestId('inner')).backgroundColor).toBe(DARK_SURFACES[1].background);
    });

    it('saturates at the top of the ladder instead of wrapping', () => {
      mockTheme = { ...baseTheme, colorScheme: 'dark', surfaces: DARK_SURFACES };

      const { getByTestId } = render(
        <Surface level={3}>
          <Surface testID="inner" raised />
        </Surface>,
      );

      expect(flatten(getByTestId('inner')).backgroundColor).toBe(DARK_SURFACES[3].background);
    });

    it('reports the current level to descendants via useSurfaceLevel', () => {
      const Probe = () => <Text testID="probe">{String(useSurfaceLevel())}</Text>;

      const { getByTestId } = render(
        <Surface level={2}>
          <Probe />
        </Surface>,
      );

      expect(getByTestId('probe').props.children).toBe('2');
    });
  });

  describe('borders', () => {
    it('omits the hairline in light mode by default', () => {
      const { getByTestId } = render(<Surface testID="s" level={1} />);
      expect(flatten(getByTestId('s')).borderWidth).toBeUndefined();
    });

    it('draws the hairline in dark mode by default, where shadow cannot convey elevation', () => {
      mockTheme = { ...baseTheme, colorScheme: 'dark', surfaces: DARK_SURFACES };

      const { getByTestId } = render(<Surface testID="s" level={2} />);
      const style = flatten(getByTestId('s'));

      expect(style.borderWidth).toBe(1);
      expect(style.borderColor).toBe(DARK_SURFACES[2].border);
    });

    it('honours an explicit withBorder={false} in dark mode', () => {
      mockTheme = { ...baseTheme, colorScheme: 'dark', surfaces: DARK_SURFACES };

      const { getByTestId } = render(<Surface testID="s" level={2} withBorder={false} />);
      expect(flatten(getByTestId('s')).borderWidth).toBeUndefined();
    });
  });

  describe('overrides', () => {
    it('lets bg win over the level fill', () => {
      const { getByTestId } = render(<Surface testID="s" level={1} bg="#123456" />);
      expect(flatten(getByTestId('s')).backgroundColor).toBe('#123456');
    });

    it('resolves bg through theme background keys', () => {
      const { getByTestId } = render(<Surface testID="s" level={1} bg="subtle" />);
      expect(flatten(getByTestId('s')).backgroundColor).toBe('#EDEFF3');
    });

    it('applies padding tokens', () => {
      const { getByTestId } = render(<Surface testID="s" padding="md" />);
      expect(typeof flatten(getByTestId('s')).padding).toBe('number');
    });
  });

  describe('shadow resolution', () => {
    it('takes the level default when no shadow is given', () => {
      const { getByTestId } = render(<Surface testID="s" level={3} />);
      // level 3 → 'xl' → 0px 20px 25px
      expect(flatten(getByTestId('s')).shadowOffset).toEqual({ width: 0, height: 20 });
    });

    it('lets an explicit shadow win over the level default', () => {
      const { getByTestId } = render(<Surface testID="s" level={3} shadow="xs" />);
      expect(flatten(getByTestId('s')).shadowOffset).toEqual({ width: 0, height: 1 });
    });

    it('drops the shadow entirely for shadow="none"', () => {
      const { getByTestId } = render(<Surface testID="s" level={3} shadow="none" />);
      expect(flatten(getByTestId('s')).shadowOffset).toBeUndefined();
    });
  });

  describe('theme fallback', () => {
    it('derives a ladder from backgrounds when the theme omits surfaces', () => {
      const { surfaces, ...withoutSurfaces } = baseTheme as any;
      mockTheme = withoutSurfaces;

      const { getByTestId } = render(
        <View>
          <Surface testID="page" level={0} />
          <Surface testID="resting" level={1} />
          <Surface testID="floating" level={2} />
        </View>,
      );

      expect(flatten(getByTestId('page')).backgroundColor).toBe('#F7F8FA');
      expect(flatten(getByTestId('resting')).backgroundColor).toBe('#FFFFFF');
      expect(flatten(getByTestId('floating')).backgroundColor).toBe('#FFFFFF');
    });
  });
});
