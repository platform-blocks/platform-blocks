import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { Lightbox } from '../Lightbox';
import type { LightboxItem } from '../types';

const IMAGES: LightboxItem[] = [
  { id: 'a', uri: 'https://example.com/a.jpg', title: 'Lake' },
  { id: 'b', uri: 'https://example.com/b.jpg', title: 'Forest' },
  { id: 'c', uri: 'https://example.com/c.jpg' },
];

/** Pressable turns aria-* state into accessibilityState on the host view. */
function a11yState(node: { props: Record<string, unknown> }, key: 'selected' | 'disabled' | 'expanded'): unknown {
  const state = node.props.accessibilityState as Record<string, unknown> | undefined;
  return state?.[key] ?? node.props[`aria-${key}`];
}

describe('Lightbox', () => {
  it('renders nothing while closed', () => {
    render(<Lightbox opened={false} images={IMAGES} testID="lightbox" />);
    expect(screen.queryByTestId('lightbox')).toBeNull();
  });

  it('is a labelled modal dialog showing a named image', () => {
    render(<Lightbox opened images={IMAGES} testID="lightbox" />);
    const dialog = screen.getByTestId('lightbox');
    expect(dialog.props.role).toBe('dialog');
    expect(dialog.props['aria-label']).toBe('Image gallery');
    expect(screen.getByRole('image', { name: 'Lake' })).toBeTruthy();
  });

  it('labels the controls and navigates', () => {
    const onImageChange = jest.fn();
    const onClose = jest.fn();
    render(<Lightbox opened images={IMAGES} onImageChange={onImageChange} onClose={onClose} onDownload={jest.fn()} />);

    expect(a11yState(screen.getByRole('button', { name: 'Previous image' }), 'disabled')).toBe(true);
    fireEvent.press(screen.getByRole('button', { name: 'Next image' }));
    expect(onImageChange).toHaveBeenCalledWith(1, IMAGES[1]);
    expect(screen.getByRole('image', { name: 'Forest' })).toBeTruthy();

    expect(screen.getByRole('button', { name: 'Download image' })).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Close gallery' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('exposes the thumbnails as tabs with the current one selected', () => {
    const onImageChange = jest.fn();
    render(<Lightbox opened images={IMAGES} onImageChange={onImageChange} />);
    const first = screen.getByRole('tab', { name: 'Image 1 of 3: Lake' });
    expect(a11yState(first, 'selected')).toBe(true);

    fireEvent.press(screen.getByRole('tab', { name: 'Image 3 of 3' }));
    expect(onImageChange).toHaveBeenCalledWith(2, IMAGES[2]);
    expect(a11yState(screen.getByRole('tab', { name: 'Image 3 of 3' }), 'selected')).toBe(true);
    // Untitled image falls back to its position.
    expect(screen.getByRole('image', { name: 'Image 3 of 3' })).toBeTruthy();
  });

  it('toggles the metadata panel with an expanded state', () => {
    const images: LightboxItem[] = [{ id: 'm', uri: 'https://example.com/m.jpg', metadata: { camera: 'X100' } }];
    render(<Lightbox opened images={images} showMetadata />);
    const toggle = screen.getByRole('button', { name: 'Show Info' });
    expect(a11yState(toggle, 'expanded')).toBe(false);
    fireEvent.press(toggle);
    expect(screen.getByText('X100')).toBeTruthy();
    expect(a11yState(screen.getByRole('button', { name: 'Hide Info' }), 'expanded')).toBe(true);
  });
});
