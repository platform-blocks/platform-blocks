# Gallery

The Gallery component displays a collection of images or media with thumbnail navigation, keyboard controls, and optional fullscreen/modal viewing.

## Metadata

- Canonical name: `Gallery`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Gallery } from '@platform-blocks/react-ui-library';`
- Status: experimental
- Category: media
- Tags: gallery, images, thumbnails, media
- Docs: https://react-ui-library.com/components/Gallery
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Gallery

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `images` | GalleryItem[] | Yes |  | Array of images to display in the gallery. |
| `initialIndex` | number | No | 0 | Index of the image shown when the gallery first opens. |
| `onClose` | () => void | No |  | Called when the gallery is closed. |
| `onImageChange` | (index: number, image: GalleryItem) => void | No |  | Called when the active image changes, receiving the new index and image. |
| `onDownload` | (image: GalleryItem) => void | No |  | Called when the download action is triggered for the current image. |
| `showMetadata` | boolean | No | false | Whether to display the metadata panel for the current image. |
| `showThumbnails` | boolean | No | true | Whether to display the thumbnail strip for navigating between images. |
| `showDownloadButton` | boolean | No | true | Whether to display the download button in the gallery controls. |
| `allowKeyboardNavigation` | boolean | No | true | Whether arrow keys and Escape can be used to navigate and close the gallery. |
| `allowSwipeNavigation` | boolean | No | true | Whether swipe gestures can be used to move between images. |
| `overlayOpacity` | number | No | 0.9 | Opacity of the backdrop overlay behind the gallery, from 0 to 1. |
| `animationDuration` | number | No | 250 | Duration of open/close and transition animations, in milliseconds. |

## Examples

### Basic
ID: `Gallery.basic` • Tags: gallery, images, navigation, metadata • Category: basics • Status: stable • Since: 1.0.0

Basic image gallery with navigation and metadata.

```tsx
// `null` closes the gallery; any index opens it on that image.
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
      <Gallery
        visible={openIndex !== null}
        images={SAMPLE_IMAGES}
        initialIndex={openIndex ?? 0}
        onClose={() => setOpenIndex(null)}
        showMetadata
      />
    </Block>
  );
}
```

### Advanced
ID: `Gallery.advanced` • Tags: advanced, customization, handlers, minimal • Category: features • Status: stable • Since: 1.0.0

Advanced gallery configurations with custom handlers.

```tsx
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
      <Gallery
        visible={active === 'minimal'}
        images={SAMPLE_IMAGES}
        onClose={() => setActive(null)}
        showThumbnails={false}
        showDownloadButton={false}
      />
      {/* `onDownload` replaces the built-in behaviour, so the host app decides what saving means. */}
      <Gallery
        visible={active === 'custom'}
        images={SAMPLE_IMAGES}
        onClose={() => setActive(null)}
        onDownload={(image: GalleryItem) => setDownloaded(image.title ?? image.id)}
        showMetadata
      />
      {downloaded ? (
        <Text size="sm" color="secondary">
          Downloaded {downloaded}
        </Text>
      ) : null}
    </Block>
  );
}
```
