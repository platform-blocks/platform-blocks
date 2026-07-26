import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Modal,
  Image,
  Dimensions,
  StatusBar,
  Platform,
  StyleSheet,
  Pressable,
  PanResponder,
} from 'react-native';
import { Text } from '../Text';
import { GalleryControls } from './GalleryControls';
import { GalleryThumbnails } from './GalleryThumbnails';
import { GalleryMetadata } from './GalleryMetadata';
import type { GalleryModalProps } from './types';
import { resolveImageSource } from '../../utils/imageSource';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GESTURE_THRESHOLD = screenWidth * 0.25;
const SWIPE_VELOCITY_THRESHOLD = 500;

export const Gallery: React.FC<GalleryModalProps> = ({
  visible,
  images,
  initialIndex = 0,
  onClose,
  onImageChange,
  onDownload,
  showMetadata = false,
  showThumbnails = true,
  showDownloadButton = true,
  allowKeyboardNavigation = true,
  allowSwipeNavigation = true,
  overlayOpacity = 0.9,
  animationDuration = 250,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [metadataVisible, setMetadataVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset to initial index when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      setImageLoaded(false);
    }
  }, [visible, initialIndex]);

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    setControlsVisible(true);
    controlsTimeout.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (visible) {
      resetControlsTimeout();
    }
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [visible, resetControlsTimeout]);

  // Navigation functions
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onImageChange?.(newIndex, images[newIndex]);
      resetControlsTimeout();
    }
  }, [currentIndex, images, onImageChange, resetControlsTimeout]);

  const goToNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onImageChange?.(newIndex, images[newIndex]);
      resetControlsTimeout();
    }
  }, [currentIndex, images, onImageChange, resetControlsTimeout]);

  const goToImage = useCallback((index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
      onImageChange?.(index, images[index]);
      resetControlsTimeout();
    }
  }, [images, onImageChange, resetControlsTimeout]);

  // Pan responder for gesture handling
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return allowSwipeNavigation && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        resetControlsTimeout();
      },
      onPanResponderMove: (_, gestureState) => {
        // Handle movement if needed
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!allowSwipeNavigation) return;

        const { dx, vx } = gestureState;
        const shouldSwipe = Math.abs(dx) > GESTURE_THRESHOLD || Math.abs(vx) > SWIPE_VELOCITY_THRESHOLD;
        
        if (shouldSwipe) {
          if (dx > 0 && currentIndex > 0) {
            // Swipe right - previous image
            goToPrevious();
          } else if (dx < 0 && currentIndex < images.length - 1) {
            // Swipe left - next image
            goToNext();
          }
        }
      },
    })
  ).current;

  // Keyboard navigation
  useEffect(() => {
    if (!visible || !allowKeyboardNavigation || Platform.OS !== 'web') return;

    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNext();
          break;
        case 'Escape':
          event.preventDefault();
          onClose?.();
          break;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [visible, allowKeyboardNavigation, goToPrevious, goToNext, onClose]);

  const handleDownload = useCallback(() => {
    const currentImage = images[currentIndex];
    onDownload?.(currentImage);
  }, [currentIndex, images, onDownload]);

  const toggleMetadata = useCallback(() => {
    setMetadataVisible(!metadataVisible);
    resetControlsTimeout();
  }, [metadataVisible, resetControlsTimeout]);

  const handlePress = useCallback(() => {
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  if (!visible || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <StatusBar hidden />
      <View style={styles.container}>
        <View style={[styles.overlay, { backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }]}>
          
          {/* Main Image */}
          <View style={styles.imageContainer} {...panResponder.panHandlers}>
            <Pressable style={styles.imageWrapper} onPress={handlePress}>
              <Image
                source={resolveImageSource(currentImage.uri)}
                style={styles.image}
                resizeMode="contain"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(false)}
              />
            </Pressable>
          </View>

          {/* Controls */}
          {controlsVisible && (
            <GalleryControls
              currentIndex={currentIndex}
              totalImages={images.length}
              onPrevious={goToPrevious}
              onNext={goToNext}
              onClose={handleClose}
              onDownload={showDownloadButton ? handleDownload : undefined}
              showDownloadButton={showDownloadButton}
              image={currentImage}
            />
          )}

          {/* Thumbnails */}
          {showThumbnails && controlsVisible && (
            <View style={styles.thumbnailsContainer}>
              <GalleryThumbnails
                images={images}
                currentIndex={currentIndex}
                onThumbnailPress={goToImage}
              />
            </View>
          )}

          {/* Metadata */}
          {showMetadata && (
            <GalleryMetadata
              image={currentImage}
              visible={metadataVisible}
            />
          )}

          {/* Metadata Toggle */}
          {showMetadata && controlsVisible && currentImage.metadata && (
            <Pressable
              style={styles.metadataToggle}
              onPress={toggleMetadata}
            >
              <Text style={styles.metadataToggleText}>
                {metadataVisible ? 'Hide Info' : 'Show Info'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    height: screenHeight * 0.8,
    width: screenWidth,
  },
  imageContainer: {
    alignItems: 'center',
    height: screenHeight,
    justifyContent: 'center',
    width: screenWidth,
  },
  imageWrapper: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  metadataToggle: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    bottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
    right: 20,
  },
  metadataToggleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  overlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  thumbnailsContainer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
});
