import type { GalleryItem } from '../../types';

/**
 * Three bundled scenes with full metadata, so the viewer's info panel has something
 * to show for every slide.
 */
export const SAMPLE_IMAGES: GalleryItem[] = [
  {
    id: '1',
    uri: require('../../../../assets/images/scene-mountains.png'),
    title: 'Mountain Landscape',
    description: 'Beautiful mountain view with snow-capped peaks',
    metadata: {
      size: '2.4 MB',
      dimensions: { width: 1920, height: 1080 },
      dateCreated: 'March 15, 2024',
      camera: 'Canon EOS R5',
      location: 'Swiss Alps',
    },
  },
  {
    id: '2',
    uri: require('../../../../assets/images/scene-forest.png'),
    title: 'Forest Path',
    description: 'A serene path through the forest',
    metadata: {
      size: '1.8 MB',
      dimensions: { width: 1600, height: 1200 },
      dateCreated: 'April 2, 2024',
      camera: 'Sony A7 III',
      location: 'Pacific Northwest',
    },
  },
  {
    id: '3',
    uri: require('../../../../assets/images/scene-lake.png'),
    title: 'Alpine Lake',
    description: 'Still water beneath the ridgeline',
    metadata: {
      size: '3.1 MB',
      dimensions: { width: 2048, height: 1536 },
      dateCreated: 'May 18, 2024',
      camera: 'Nikon D850',
      location: 'Banff National Park',
    },
  },
];
