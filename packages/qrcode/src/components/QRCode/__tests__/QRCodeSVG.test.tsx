import React from 'react';
import { StyleSheet, View } from 'react-native';
import { render } from '@testing-library/react-native';

import { QRCodeSVG } from '../QRCodeSVG';

const mockEncode = jest.fn();
const mockBuildMatrix = jest.fn();
const mockSvgElements: Array<{ name: string; props: any }> = [];

jest.mock('../core/encoder', () => ({
  encode: (...args: any[]) => mockEncode(...args),
}));

jest.mock('../core/buildMatrix', () => ({
  buildMatrix: (...args: any[]) => mockBuildMatrix(...args),
}));

const mockTheme = {
  colors: {
    gray: ['#f5f5f5', '#e5e5e5', '#d5d5d5', '#c5c5c5'],
  },
  backgrounds: { subtle: '#f5f5f5' },
};

jest.mock('@plocks/ui', () => ({
  ...jest.requireActual('@plocks/ui'),
  useTheme: () => mockTheme,
}));

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');

  const createSvgComponent = (name: string) => {
    const Component = ({ children, ...props }: any) => {
      mockSvgElements.push({ name, props });
      return React.createElement(View, props, children);
    };
    return Component;
  };

  return {
    __esModule: true,
    default: createSvgComponent('Svg'),
    Path: createSvgComponent('Path'),
    Rect: createSvgComponent('Rect'),
    Defs: createSvgComponent('Defs'),
    LinearGradient: createSvgComponent('LinearGradient'),
    Stop: createSvgComponent('Stop'),
    RadialGradient: createSvgComponent('RadialGradient'),
    ClipPath: createSvgComponent('ClipPath'),
  };
});

const buildMatrixWithDataModules = () => {
  // 9x9 matrix with data outside finder patterns
  return Array.from({ length: 9 }, (_, r) => (
    Array.from({ length: 9 }, (_, c) => (r === c || (r === 8 && c === 4) ? 1 : 0))
  ));
};

const getSvgElementsByName = (name: string) => mockSvgElements.filter(el => el.name === name);

describe('QRCodeSVG', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSvgElements.length = 0;
    mockEncode.mockReturnValue({ segments: [] });
    mockBuildMatrix.mockReturnValue(buildMatrixWithDataModules());
  });

  it('sizes its container with the box props; an explicit `w` wins over `fullWidth`', () => {
    const { getByTestId } = render(<QRCodeSVG value="x" size={100} testID="qr-svg" fullWidth w={150} maw="100%" />);
    expect(StyleSheet.flatten(getByTestId('qr-svg').props.style)).toMatchObject({ width: 150, height: 100, maxWidth: '100%' });
  });

  it('resolves a `bg` token for the code background', () => {
    const { getByTestId } = render(<QRCodeSVG value="x" size={100} testID="qr-svg" bg="subtle" />);
    const fill = mockTheme.backgrounds.subtle;
    expect(getSvgElementsByName('Rect')[0].props.fill).toBe(fill);
    const layers = [getByTestId('qr-svg').props.style].flat(Infinity).filter(Boolean);
    expect(layers.filter((s: { backgroundColor?: string }) => s.backgroundColor !== undefined)).toHaveLength(1);
  });

  it('renders square modules path with provided color when no gradient is set', () => {
    render(<QRCodeSVG value="hello" size={120} color="#112233" testID="qr" quietZone={0} />);

    const paths = getSvgElementsByName('Path');
    expect(paths.length).toBeGreaterThan(0);
    expect(paths[0].props.fill).toBe('#112233');
  });

  it('applies linear gradient fills when gradient type is linear', () => {
    render(
      <QRCodeSVG
        value="gradient"
        gradient={{ type: 'linear', from: '#000000', to: '#ffffff', rotation: 90 }}
      />
    );

    const gradients = getSvgElementsByName('LinearGradient');
    expect(gradients.length).toBe(1);
    expect(gradients[0].props).toEqual(expect.objectContaining({ x1: '50%', y1: '0%', x2: '50%', y2: '100%' }));

    const paths = getSvgElementsByName('Path');
    expect(paths[0].props.fill).toBe('url(#qrGradient)');
  });

  it('applies radial gradients when gradient type is radial', () => {
    render(
      <QRCodeSVG
        value="radial"
        gradient={{ type: 'radial', from: '#ff0000', to: '#00ff00' }}
      />
    );

    const gradients = getSvgElementsByName('RadialGradient');
    expect(gradients.length).toBe(1);

    const paths = getSvgElementsByName('Path');
    expect(paths[0].props.fill).toBe('url(#qrGradient)');
  });

  it('renders additional module paths when moduleShape is diamond', () => {
    render(
      <QRCodeSVG
        value="diamond"
        moduleShape="diamond"
        quietZone={0}
      />
    );

    const paths = getSvgElementsByName('Path');
    expect(paths.length).toBeGreaterThan(1);
  });

  it('renders a custom logo element overlay when provided', () => {
    const { getByTestId } = render(
      <QRCodeSVG
        value="logo"
        logo={{ uri: 'https://example.com/logo.png', element: <View testID="custom-logo" />, size: 32 }}
      />
    );

    expect(getByTestId('custom-logo')).toBeTruthy();
  });

  it('renders fallback error view and notifies onError when encoding fails', () => {
    const onError = jest.fn();

    const { getByText } = render(<QRCodeSVG value=" " onError={onError} />);

    expect(onError).toHaveBeenCalled();
    expect(mockEncode).not.toHaveBeenCalled();
    expect(getByText(/Generation\s+Error/)).toBeTruthy();
    expect(mockSvgElements.length).toBe(0);
  });

  it('exposes the code as a named image and forwards the ref', () => {
    const ref = React.createRef<View>();
    const { getByTestId, rerender } = render(<QRCodeSVG ref={ref} value="https://example.com" testID="qr" />);
    const root = getByTestId('qr');
    expect(ref.current).not.toBeNull();
    expect(root.props.role).toBe('img');
    expect(root.props['aria-label']).toBe('QR code: https://example.com');

    rerender(<QRCodeSVG value="https://example.com" testID="qr" accessibilityLabel="Ticket code" />);
    expect(getByTestId('qr').props['aria-label']).toBe('Ticket code');
  });

  it('summarizes long values in the default label', () => {
    const value = 'x'.repeat(100);
    const { getByTestId } = render(<QRCodeSVG value={value} testID="qr" />);
    const label = getByTestId('qr').props['aria-label'] as string;
    expect(label.startsWith('QR code: xxx')).toBe(true);
    expect(label.endsWith('…')).toBe(true);
    expect(label.length).toBeLessThan(60);
  });
});
