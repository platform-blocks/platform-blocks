import type { ImageSourcePropType, ViewStyle } from 'react-native';

import type { BaseProps } from '../../core/types/base';

export interface GalleryItem {
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

export interface GalleryProps extends BaseProps<ViewStyle> {
  /** Array of images to display in the gallery. */
  images: GalleryItem[];
  /**
   * Index of the image shown when the gallery first opens.
   * @default 0
   */
  initialIndex?: number;
  /** Called when the gallery is closed. */
  onClose?: () => void;
  /** Called when the active image changes, receiving the new index and image. */
  onImageChange?: (index: number, image: GalleryItem) => void;
  /** Called when the download action is triggered for the current image. */
  onDownload?: (image: GalleryItem) => void;
  /**
   * Whether to display the metadata panel for the current image.
   * @default false
   */
  showMetadata?: boolean;
  /**
   * Whether to display the thumbnail strip for navigating between images.
   * @default true
   */
  showThumbnails?: boolean;
  /**
   * Whether to display the download button in the gallery controls.
   * @default true
   */
  showDownloadButton?: boolean;
  /**
   * Whether the arrow keys move between images (web). Escape always closes the
   * gallery, and the thumbnail strip always supports arrow keys.
   * @default true
   */
  allowKeyboardNavigation?: boolean;
  /**
   * Whether swipe gestures can be used to move between images.
   * @default true
   */
  allowSwipeNavigation?: boolean;
  /**
   * Opacity of the backdrop behind the gallery, from 0 to 1 — applied to the
   * theme scrim's color (`theme.backgrounds.scrim`).
   * @default 0.9
   */
  overlayOpacity?: number;
  /**
   * `0` opens and closes the gallery without animation; any other value uses
   * the platform's modal fade. Reduced motion also turns the fade off.
   * @default 250
   */
  animationDuration?: number;
  /** Accessible name of the gallery dialog. @default 'Image gallery' */
  accessibilityLabel?: string;
}

export interface GalleryModalProps extends GalleryProps {
  /** Whether the gallery is open. */
  opened?: boolean;
  /** @deprecated Use `opened`. */
  visible?: boolean;
}

export interface GalleryThumbnailProps {
  images: GalleryItem[];
  currentIndex: number;
  /** Called when a thumbnail is pressed, or focused with the arrow keys. */
  onThumbnailPress: (index: number) => void;
  thumbnailSize?: number;
}

export interface GalleryImageProps {
  image: GalleryItem;
  onLoad?: () => void;
  onError?: () => void;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
}

export interface GalleryControlsProps {
  currentIndex: number;
  totalImages: number;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
  onDownload?: () => void;
  showDownloadButton?: boolean;
  image?: GalleryItem;
}

export interface GalleryMetadataProps {
  image: GalleryItem;
  visible: boolean;
}

export type GalleryNavigationDirection = 'previous' | 'next';

export interface GalleryGestureState {
  translationX: number;
  translationY: number;
  velocityX: number;
  velocityY: number;
  scale: number;
}
