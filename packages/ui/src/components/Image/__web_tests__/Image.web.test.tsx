import React from 'react';
import { render, screen } from '@testing-library/react';

import { Image } from '../Image';

const SRC = 'https://example.com/photo.png';

describe('Image (react-native-web DOM)', () => {
  it('exposes alt text as the accessible name', () => {
    render(<Image src={SRC} alt="Mountain landscape" />);
    expect(screen.getAllByRole('img', { name: 'Mountain landscape' }).length).toBeGreaterThan(0);
  });

  it('hides decorative images from assistive technology', () => {
    render(<Image src={SRC} alt="" testID="decorative" />);
    const image = screen.getByTestId('decorative-image');
    expect(image.getAttribute('aria-hidden')).toBe('true');
    expect(screen.queryByRole('img')).toBeNull();
  });
});
