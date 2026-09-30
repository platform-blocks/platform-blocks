import type { ImageSourcePropType, ViewStyle } from 'react-native';

import type { BaseProps } from '../../core/types/base';

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

export interface LightboxProps extends BaseProps<ViewStyle> {
  /** Array of images to display in the lightbox. */
  images: LightboxItem[];
  /**
   * Index of the image shown when the lightbox first opens.
   * @default 0
   */
  initialIndex?: number;
  /** Called when the lightbox is closed. */
  onClose?: () => void;
  /** Called when the active image changes, receiving the new index and image. */
  onImageChange?: (index: number, image: LightboxItem) => void;
  /** Called when the download action is triggered for the current image. */
  onDownload?: (image: LightboxItem) => void;
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
   * Whether to display the download button in the lightbox controls.
   * @default true
   */
  showDownloadButton?: boolean;
  /**
   * Whether the arrow keys move between images (web). Escape always closes the
   * lightbox, and the thumbnail strip always supports arrow keys.
   * @default true
   */
  allowKeyboardNavigation?: boolean;
  /**
   * Whether swipe gestures can be used to move between images.
   * @default true
   */
  allowSwipeNavigation?: boolean;
  /**
   * Opacity of the backdrop behind the lightbox, from 0 to 1 — applied to the
   * theme scrim's color (`theme.backgrounds.scrim`).
   * @default 0.9
   */
  overlayOpacity?: number;
  /**
   * `0` opens and closes the lightbox without animation; any other value uses
   * the platform's modal fade. Reduced motion also turns the fade off.
   * @default 250
   */
  animationDuration?: number;
  /** Accessible name of the lightbox dialog. @default 'Image gallery' */
  accessibilityLabel?: string;
}

export interface LightboxModalProps extends LightboxProps {
  /** Whether the lightbox is open. */
  opened?: boolean;
}

export interface LightboxThumbnailProps {
  images: LightboxItem[];
  currentIndex: number;
  /** Called when a thumbnail is pressed, or focused with the arrow keys. */
  onThumbnailPress: (index: number) => void;
  thumbnailSize?: number;
}

export interface LightboxImageProps {
  image: LightboxItem;
  onLoad?: () => void;
  onError?: () => void;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
}

export interface LightboxControlsProps {
  currentIndex: number;
  totalImages: number;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
  onDownload?: () => void;
  showDownloadButton?: boolean;
  image?: LightboxItem;
}

export interface LightboxMetadataProps {
  image: LightboxItem;
  visible: boolean;
}

export type LightboxNavigationDirection = 'previous' | 'next';

export interface LightboxGestureState {
  translationX: number;
  translationY: number;
  velocityX: number;
  velocityY: number;
  scale: number;
}
