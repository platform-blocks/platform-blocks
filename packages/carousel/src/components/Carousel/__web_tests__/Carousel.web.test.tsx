import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react';

// jsdom has no layout, so the engine never mounts here; stub it anyway so the
// optional peer isn't evaluated in a DOM without gesture-handler.
jest.mock('react-native-reanimated-carousel', () => ({ __esModule: true, default: () => null }));

import { Carousel } from '../Carousel';

const slides = ['One', 'Two', 'Three'].map((label) => <Text key={label}>{label}</Text>);

describe('Carousel (react-native-web DOM)', () => {
  it('is a region with the carousel role description', () => {
    render(<Carousel accessibilityLabel="Featured">{slides}</Carousel>);
    const region = screen.getByRole('region', { name: 'Featured' });
    expect(region.getAttribute('aria-roledescription')).toBe('carousel');
  });

  it('labels the previous / next arrows', () => {
    render(<Carousel>{slides}</Carousel>);
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeTruthy();
  });

  it('labels the dots, marks the current one and gives them a 24px target', () => {
    render(<Carousel>{slides}</Carousel>);
    const first = screen.getByRole('button', { name: 'Go to slide 1' });
    const second = screen.getByRole('button', { name: 'Go to slide 2' });
    expect(first.getAttribute('aria-current')).toBe('true');
    expect(second.getAttribute('aria-current')).toBeNull();
    expect(parseFloat(second.style.width)).toBeGreaterThanOrEqual(24);
    expect(parseFloat(second.style.height)).toBeGreaterThanOrEqual(24);
  });

  it('offers a pause / play control while autoplaying', () => {
    render(
      <Carousel autoPlay reducedMotion={false}>
        {slides}
      </Carousel>
    );
    const pause = screen.getByRole('button', { name: 'Pause slideshow' });
    fireEvent.click(pause);
    expect(screen.getByRole('button', { name: 'Play slideshow' })).toBeTruthy();
  });

  it('starts paused when reduced motion is on', () => {
    render(
      <Carousel autoPlay reducedMotion>
        {slides}
      </Carousel>
    );
    expect(screen.getByRole('button', { name: 'Play slideshow' })).toBeTruthy();
  });

  it('has no autoplay control without autoplay', () => {
    render(<Carousel>{slides}</Carousel>);
    expect(screen.queryByRole('button', { name: /slideshow/ })).toBeNull();
  });
});
