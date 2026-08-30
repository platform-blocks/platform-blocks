import type { GalleryItem } from '@platform-blocks/react-ui-library';

/**
 * A short two-image set — enough to exercise navigation without burying the
 * feature each gallery on this page is meant to demonstrate.
 */
export const SAMPLE_IMAGES: GalleryItem[] = [
  {
    id: 'scene1',
    uri: require('../../../../assets/images/scene-ocean.png'),
    title: 'Coastal Sunrise',
    description: 'First light over the breakwater',
    metadata: {
      size: '1.5 MB',
      dimensions: { width: 1600, height: 1200 },
      dateCreated: 'March 8, 2024',
      camera: 'Fujifilm X-T5',
      location: 'Half Moon Bay',
    },
  },
  {
    id: 'scene2',
    uri: require('../../../../assets/images/scene-city.png'),
    title: 'City at Dusk',
    description: 'Skyline windows lighting up one by one',
    metadata: {
      size: '1.8 MB',
      dimensions: { width: 1400, height: 1050 },
      dateCreated: 'March 12, 2024',
      camera: 'Leica Q3',
      location: 'Downtown rooftop',
    },
  },
];
