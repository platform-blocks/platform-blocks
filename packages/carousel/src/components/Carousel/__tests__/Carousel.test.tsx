import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

// A stand-in engine: renders every page and records props / imperative calls.
type MockRenderItem = (entry: { item: unknown; index: number }) => React.ReactNode;
const mockEngine = {
  props: null as Record<string, unknown> | null,
  next: jest.fn(),
  prev: jest.fn(),
  scrollTo: jest.fn(),
};
jest.mock('react-native-reanimated-carousel', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  const Engine = ReactModule.forwardRef((props: Record<string, unknown>, ref: unknown) => {
    mockEngine.props = props;
    ReactModule.useImperativeHandle(ref, () => ({
      next: mockEngine.next,
      prev: mockEngine.prev,
      scrollTo: mockEngine.scrollTo,
    }));
    const data = props.data as unknown[];
    const renderItem = props.renderItem as MockRenderItem;
    return ReactModule.createElement(
      View,
      { testID: 'engine' },
      data.map((item, index) => ReactModule.createElement(ReactModule.Fragment, { key: index }, renderItem({ item, index })))
    );
  });
  return { __esModule: true, default: Engine };
});

import { Carousel } from '../Carousel';

const slides = ['One', 'Two', 'Three'].map((label) => <Text key={label}>{label}</Text>);

/** Pressable turns aria-* state into accessibilityState on the host view. */
function a11yState(node: { props: Record<string, unknown> }, key: 'selected'): unknown {
  const state = node.props.accessibilityState as Record<string, unknown> | undefined;
  return state?.[key] ?? node.props[`aria-${key}`];
}

function layout(width = 300, height = 200) {
  fireEvent(screen.getByTestId('carousel-viewport'), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width, height } },
  });
}

function renderCarousel(props: Partial<React.ComponentProps<typeof Carousel>> = {}) {
  const utils = render(
    <Carousel testID="carousel" {...props}>
      {slides}
    </Carousel>
  );
  act(() => layout());
  return utils;
}

describe('Carousel', () => {
  beforeEach(() => {
    mockEngine.props = null;
    mockEngine.next.mockClear();
    mockEngine.prev.mockClear();
    mockEngine.scrollTo.mockClear();
  });

  it('is a labelled region with "n of N" slide groups', () => {
    renderCarousel({ accessibilityLabel: 'Featured products' });
    const root = screen.getByTestId('carousel');
    expect(root.props.role).toBe('region');
    expect(root.props['aria-label']).toBe('Featured products');
    expect(screen.getByLabelText('1 of 3').props.role).toBe('group');
    expect(screen.getByLabelText('3 of 3')).toBeTruthy();
  });

  it('labels the arrows and drives the engine', () => {
    renderCarousel();
    fireEvent.press(screen.getByRole('button', { name: 'Next slide' }));
    expect(mockEngine.next).toHaveBeenCalled();
    fireEvent.press(screen.getByRole('button', { name: 'Previous slide' }));
    expect(mockEngine.prev).toHaveBeenCalled();
  });

  it('labels the dots and marks the current one', () => {
    renderCarousel();
    const first = screen.getByRole('button', { name: 'Go to slide 1' });
    const third = screen.getByRole('button', { name: 'Go to slide 3' });
    expect(a11yState(first, 'selected')).toBe(true);
    expect(a11yState(third, 'selected')).toBeFalsy();

    fireEvent.press(third);
    // Looping: page 0 → 2 is one step back.
    expect(mockEngine.scrollTo).toHaveBeenCalledWith({ count: -1, animated: true });
  });

  it('gives the dots a minimum touch target', () => {
    renderCarousel();
    const dot = screen.getByRole('button', { name: 'Go to slide 2' });
    const flat = StyleSheet.flatten(dot.props.style);
    expect(flat.width).toBeGreaterThanOrEqual(24);
    expect(flat.height).toBeGreaterThanOrEqual(44);
  });

  it('shows a pause / play control while autoplaying', () => {
    renderCarousel({ autoPlay: true, reducedMotion: false });
    expect(mockEngine.props?.autoPlay).toBe(true);

    fireEvent.press(screen.getByRole('button', { name: 'Pause slideshow' }));
    expect(mockEngine.props?.autoPlay).toBe(false);

    fireEvent.press(screen.getByRole('button', { name: 'Play slideshow' }));
    expect(mockEngine.props?.autoPlay).toBe(true);
  });

  it('keeps autoplay paused under reduced motion until the user presses play', () => {
    renderCarousel({ autoPlay: true, reducedMotion: true });
    expect(mockEngine.props?.autoPlay).toBe(false);
    fireEvent.press(screen.getByRole('button', { name: 'Play slideshow' }));
    expect(mockEngine.props?.autoPlay).toBe(true);
  });

  it('pauses autoplay while touched (autoPlayPauseOnTouch)', () => {
    renderCarousel({ autoPlay: true, reducedMotion: false });
    fireEvent(screen.getByTestId('carousel'), 'touchStart');
    expect(mockEngine.props?.autoPlay).toBe(false);
    fireEvent(screen.getByTestId('carousel'), 'touchEnd');
    expect(mockEngine.props?.autoPlay).toBe(true);
  });

  it('implements scrollEnabled and arrowPosition', () => {
    renderCarousel({ scrollEnabled: false, arrowPosition: 'outside' });
    expect(mockEngine.props?.enabled).toBe(false);
    const viewport = StyleSheet.flatten(screen.getByTestId('carousel-viewport').props.style);
    expect(viewport.marginHorizontal).toBeGreaterThan(0);
  });

  it('applies spacing props to the root', () => {
    renderCarousel({ mt: 12 });
    expect(StyleSheet.flatten(screen.getByTestId('carousel').props.style).marginTop).toBe(12);
  });

  it('gives `h` to the slides, not the root, when horizontal', () => {
    renderCarousel({ h: 300 });
    expect(mockEngine.props?.height).toBe(300);
    expect(StyleSheet.flatten(screen.getByTestId('carousel').props.style).height).toBeUndefined();
  });

  it('gives `h` to the root when vertical (the dots sit beside the slides)', () => {
    renderCarousel({ h: 280, orientation: 'vertical' });
    expect(StyleSheet.flatten(screen.getByTestId('carousel').props.style).height).toBe(280);
  });
});
