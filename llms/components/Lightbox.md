# Lightbox

Lightbox displays images in a full-screen viewer with navigation and optional metadata.

## Metadata

- Import: `import { Lightbox } from '@plocks/ui';`
- Status: experimental
- Tags: lightbox, gallery, images, thumbnails, media
- Docs: https://plocks.dev/components/Lightbox
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Lightbox

## Props

- `images` (required): LightboxItem[] — Array of images to display in the lightbox.
- `initialIndex`: number = 0 — Index of the image shown when the lightbox first opens.
- `onClose`: () => void — Called when the lightbox is closed.
- `onImageChange`: (index: number, image: LightboxItem) => void — Called when the active image changes, receiving the new index and image.
- `onDownload`: (image: LightboxItem) => void — Called when the download action is triggered for the current image.
- `showMetadata`: boolean = false — Whether to display the metadata panel for the current image.
- `showThumbnails`: boolean = true — Whether to display the thumbnail strip for navigating between images.
- `showDownloadButton`: boolean = true — Whether to display the download button in the lightbox controls.
- `allowKeyboardNavigation`: boolean = true — Whether the arrow keys move between images (web). Escape always closes the lightbox, and the thumbnail strip always supports arrow keys.
- `allowSwipeNavigation`: boolean = true — Whether swipe gestures can be used to move between images.
- `overlayOpacity`: number = 0.9 — Opacity of the backdrop behind the lightbox, from 0 to 1 — applied to the theme scrim's color (`theme.backgrounds.scrim`).
- `animationDuration`: number = 250 — `0` opens and closes the lightbox without animation; any other value uses the platform's modal fade. Reduced motion also turns the fade off.
- `accessibilityLabel`: string = 'Image gallery' — Accessible name of the lightbox dialog. @default 'Image gallery'
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface LightboxItem {
  id: string;
  /** Remote image URI, or a bundled asset from `require('./photo.png')` */
  uri: string | ImageSourcePropType;
  title?: string;
  description?: string;
  metadata?: {
    size?: string;
    dimensions?: {
      width: number;
      height: number;
    };
    dateCreated?: string;
    camera?: string;
    location?: string;
    /** Extra fields are listed in the metadata panel as `Key: String(value)`. */
    [key: string]: unknown;
  };
}
```

## Examples

### Basics

Basic lightbox with navigation and metadata.

```tsx
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Block, Lightbox, Image, Row } from '@plocks/ui';

import { SAMPLE_IMAGES } from './data';

export function Demo() {
  // `null` closes the lightbox; any index opens it on that image.
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Block>
      <Row gap="sm" wrap="wrap">
        {SAMPLE_IMAGES.map((image, index) => (
          <TouchableOpacity key={image.id} onPress={() => setOpenIndex(index)}>
            <Image src={image.uri} w={120} h={90} rounded resizeMode="cover" />
          </TouchableOpacity>
        ))}
      </Row>

      <Lightbox
        opened={openIndex !== null}
        images={SAMPLE_IMAGES}
        initialIndex={openIndex ?? 0}
        onClose={() => setOpenIndex(null)}
        showMetadata
      />
    </Block>
  );
}
```

`data.ts`

```ts
import type { LightboxItem } from '@plocks/ui';

/**
 * Three bundled scenes with full metadata, so the viewer's info panel has something
 * to show for every slide.
 */
export const SAMPLE_IMAGES: LightboxItem[] = [
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
```

### Advanced

Advanced lightbox configurations with custom handlers.

```tsx
import { useState } from 'react';
import { Block, Button, Lightbox, Row, Text } from '@plocks/ui';
import type { LightboxItem } from '@plocks/ui';

import { SAMPLE_IMAGES } from './data';

export function Demo() {
  const [active, setActive] = useState<'minimal' | 'custom' | null>(null);
  const [downloaded, setDownloaded] = useState<string | null>(null);

  return (
    <Block>
      <Row gap="sm" wrap="wrap">
        <Button variant="outline" onPress={() => setActive('minimal')}>
          Minimal
        </Button>
        <Button variant="outline" onPress={() => setActive('custom')}>
          Custom download
        </Button>
      </Row>

      {/* Chrome stripped back to the image itself — swipe and arrow keys still navigate. */}
      <Lightbox
        opened={active === 'minimal'}
        images={SAMPLE_IMAGES}
        onClose={() => setActive(null)}
        showThumbnails={false}
        showDownloadButton={false}
      />

      {/* `onDownload` replaces the built-in behaviour, so the host app decides what saving means. */}
      <Lightbox
        opened={active === 'custom'}
        images={SAMPLE_IMAGES}
        onClose={() => setActive(null)}
        onDownload={(image: LightboxItem) => setDownloaded(image.title ?? image.id)}
        showMetadata
      />

      {downloaded ? (
        <Text size="sm" c="secondary">
          Downloaded {downloaded}
        </Text>
      ) : null}
    </Block>
  );
}
```

`data.ts`

```ts
import type { LightboxItem } from '@plocks/ui';

/**
 * A short two-image set — enough to exercise navigation without burying the
 * feature each lightbox on this page is meant to demonstrate.
 */
export const SAMPLE_IMAGES: LightboxItem[] = [
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
```
