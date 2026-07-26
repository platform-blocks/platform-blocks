import type { ImageSourcePropType } from 'react-native';

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
    [key: string]: any;
  };
}

export interface GalleryProps {
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
   * Whether arrow keys and Escape can be used to navigate and close the gallery.
   * @default true
   */
  allowKeyboardNavigation?: boolean;
  /**
   * Whether swipe gestures can be used to move between images.
   * @default true
   */
  allowSwipeNavigation?: boolean;
  /**
   * Opacity of the backdrop overlay behind the gallery, from 0 to 1.
   * @default 0.9
   */
  overlayOpacity?: number;
  /**
   * Duration of open/close and transition animations, in milliseconds.
   * @default 250
   */
  animationDuration?: number;
}

export interface GalleryModalProps extends GalleryProps {
  visible: boolean;
}

export interface GalleryThumbnailProps {
  images: GalleryItem[];
  currentIndex: number;
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
