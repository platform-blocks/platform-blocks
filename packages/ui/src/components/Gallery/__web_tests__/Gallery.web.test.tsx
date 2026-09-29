import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { Gallery } from '../Gallery';
import type { GalleryItem } from '../types';
import { __resetLayerStackForTests } from '../../../core/overlay/layerStack';

const IMAGES: GalleryItem[] = [
  { id: 'a', uri: 'https://example.com/a.jpg', title: 'Lake' },
  { id: 'b', uri: 'https://example.com/b.jpg', title: 'Forest' },
  { id: 'c', uri: 'https://example.com/c.jpg', title: 'Dunes' },
];

beforeEach(() => __resetLayerStackForTests());

describe('Gallery (react-native-web DOM)', () => {
  it('is a modal dialog with labelled controls', () => {
    render(<Gallery opened images={IMAGES} onDownload={jest.fn()} />);
    const dialog = screen.getByRole('dialog', { name: 'Image gallery' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    for (const name of ['Close gallery', 'Download image', 'Previous image', 'Next image']) {
      expect(screen.getByRole('button', { name })).toBeTruthy();
    }
    expect(screen.getByRole('button', { name: 'Previous image' }).getAttribute('aria-disabled')).toBe('true');
    // react-native-web's Image is a role=img box wrapping an <img alt> of the same name.
    expect(screen.getAllByRole('img', { name: 'Lake' }).length).toBeGreaterThan(0);
  });

  it('renders the thumbnails as a tab list with roving focus', () => {
    const onImageChange = jest.fn();
    render(<Gallery opened images={IMAGES} onImageChange={onImageChange} />);
    expect(screen.getByRole('tablist', { name: 'Thumbnails' })).toBeTruthy();
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((tab) => tab.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
    expect(tabs.map((tab) => tab.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);

    act(() => tabs[0].focus());
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
    expect(onImageChange).toHaveBeenLastCalledWith(1, IMAGES[1]);
    const next = screen.getByRole('tab', { name: 'Image 2 of 3: Forest' });
    expect(next.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(next);
  });

  it('moves between images with the arrow keys', () => {
    const onImageChange = jest.fn();
    render(<Gallery opened images={IMAGES} onImageChange={onImageChange} />);
    const close = screen.getByRole('button', { name: 'Close gallery' });
    fireEvent.keyDown(close, { key: 'ArrowRight' });
    expect(onImageChange).toHaveBeenLastCalledWith(1, IMAGES[1]);
    fireEvent.keyDown(close, { key: 'ArrowLeft' });
    expect(onImageChange).toHaveBeenLastCalledWith(0, IMAGES[0]);
  });

  it('closes on Escape through the layer stack', () => {
    const onClose = jest.fn();
    render(<Gallery opened images={IMAGES} onClose={onClose} />);
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
