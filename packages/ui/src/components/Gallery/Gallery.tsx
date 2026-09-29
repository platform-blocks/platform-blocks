import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Modal, Image, StatusBar, StyleSheet, Pressable, PanResponder } from 'react-native';

import { factory } from '../../core/factory/factory';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { announce } from '../../core/accessibility/announce';
import { useScreenReaderEnabled } from '../../core/accessibility/context';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { useReducedMotion } from '../../core/motion/useReducedMotion';
import { handleModalRequestClose } from '../../core/overlay/layerStack';
import { LayerScope, useLayer } from '../../core/overlay/useLayer';
import { OverlayHost } from '../../core/overlay/OverlayHost';
import { webProps } from '../../core/platform';
import type { WebKeyboardEvent } from '../../core/platform';
import { useDirection } from '../../core/providers/DirectionProvider';
import { useViewport } from '../../core/responsive';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveScrim } from '../../core/theme/tokens';
import { useStyleProps } from '../../core/utils/spacing';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { warnOnce } from '../../core/utils/logger';
import { Text } from '../Text';
import { GalleryControls } from './GalleryControls';
import { GalleryThumbnails, getGalleryImageLabel } from './GalleryThumbnails';
import { GalleryMetadata } from './GalleryMetadata';
import type { GalleryModalProps } from './types';
import { resolveImageSource } from '../../utils/imageSource';

const SWIPE_DISTANCE_RATIO = 0.25;
const SWIPE_VELOCITY_THRESHOLD = 500;
const CONTROLS_HIDE_DELAY = 3000;

/**
 * Full-screen image viewer in a modal: swipe, arrow keys (web) and on-screen
 * buttons move between images; a thumbnail strip (tab list) jumps to one.
 *
 * It is a modal layer: focus moves into it and is trapped while open and
 * restored on close; Escape (web) and the Android back button close only the
 * topmost layer. Image changes are announced to screen readers, and the
 * controls don't auto-hide while focus is inside them or a screen reader is on.
 */
export const Gallery = factory<{ props: GalleryModalProps; ref: View }>((props, ref) => {
  const {
    opened: openedProp,
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
    accessibilityLabel,
    style,
    testID,
  } = props;

  if (visible !== undefined) {
    warnOnce('Gallery.visible', 'Gallery: `visible` is deprecated; use `opened`.');
  }
  const opened = openedProp ?? visible ?? false;

  const theme = useTheme();
  const spacingStyles = useStyleProps(props);
  const { width: screenWidth, height: screenHeight } = useViewport();
  const { isRTL } = useDirection();
  const reducedMotion = useReducedMotion();
  const screenReaderEnabled = useScreenReaderEnabled();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [metadataVisible, setMetadataVisible] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);

  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<View>(null);
  const mergedDialogRef = useMergedRef<View>(dialogRef, ref);

  const handleClose = useLatestCallback(onClose);
  const emitImageChange = useLatestCallback(onImageChange);

  const { id: layerId } = useLayer({
    active: opened && images.length > 0,
    onDismiss: () => handleClose(),
    modal: true,
    containerRef: dialogRef,
  });

  // Reset to initial index when modal opens
  useEffect(() => {
    if (opened) {
      setCurrentIndex(initialIndex);
    }
  }, [opened, initialIndex]);

  // Auto-hide controls — never while a screen reader is on or focus is inside.
  const keepControls = screenReaderEnabled || focusWithin;
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    setControlsVisible(true);
    controlsTimeout.current = setTimeout(() => {
      setControlsVisible(false);
    }, CONTROLS_HIDE_DELAY);
  }, []);

  useEffect(() => {
    if (opened) {
      resetControlsTimeout();
    }
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [opened, resetControlsTimeout]);

  const goToImage = useCallback((index: number) => {
    if (index < 0 || index >= images.length) return;
    setCurrentIndex(index);
    emitImageChange(index, images[index]);
    announce(getGalleryImageLabel(index, images.length, images[index].title));
    resetControlsTimeout();
  }, [images, emitImageChange, resetControlsTimeout]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) goToImage(currentIndex - 1);
  }, [currentIndex, goToImage]);

  const goToNext = useCallback(() => {
    if (currentIndex < images.length - 1) goToImage(currentIndex + 1);
  }, [currentIndex, images.length, goToImage]);

  // Pan responder for gesture handling. Created once; reads the latest
  // handlers and settings through these stable callbacks.
  const swipeEnabled = useLatestCallback(() => allowSwipeNavigation);
  const swipeThreshold = useLatestCallback(() => screenWidth * SWIPE_DISTANCE_RATIO);
  const swipe = useLatestCallback((swipedRight: boolean) => {
    // LTR: a rightward swipe reveals the previous image. RTL lays images out
    // right-to-left, so there a rightward swipe goes forward.
    if (swipedRight !== isRTL) goToPrevious();
    else goToNext();
  });
  const touchControls = useLatestCallback(resetControlsTimeout);
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => !!swipeEnabled() && Math.abs(gestureState.dx) > 10,
        onPanResponderGrant: () => {
          touchControls();
        },
        onPanResponderRelease: (_, gestureState) => {
          if (!swipeEnabled()) return;
          const { dx, vx } = gestureState;
          if (Math.abs(dx) > (swipeThreshold() ?? 0) || Math.abs(vx) > SWIPE_VELOCITY_THRESHOLD) {
            swipe(dx > 0);
          }
        },
      }),
    [swipeEnabled, swipeThreshold, swipe, touchControls]
  );

  // Arrow keys (web), scoped to the dialog. The thumbnail strip handles its own
  // arrows (and stops them), so this only sees keys from elsewhere in the dialog.
  const handleKeyDown = useCallback((event: WebKeyboardEvent) => {
    if (!allowKeyboardNavigation || event.defaultPrevented) return;
    const back = isRTL ? 'ArrowRight' : 'ArrowLeft';
    const forward = isRTL ? 'ArrowLeft' : 'ArrowRight';
    if (event.key === back) {
      event.preventDefault();
      goToPrevious();
    } else if (event.key === forward) {
      event.preventDefault();
      goToNext();
    }
  }, [allowKeyboardNavigation, isRTL, goToPrevious, goToNext]);

  const handleDownload = useCallback(() => {
    onDownload?.(images[currentIndex]);
  }, [currentIndex, images, onDownload]);

  const toggleMetadata = useCallback(() => {
    setMetadataVisible(prev => !prev);
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const currentImage = images[currentIndex];
  const currentUri = currentImage?.uri;
  const currentImageSource = useMemo(() => (currentUri ? resolveImageSource(currentUri) : undefined), [currentUri]);

  if (!opened || images.length === 0 || !currentImage || !currentImageSource) {
    return null;
  }

  const showControls = controlsVisible || keepControls;
  const imageLabel = currentImage.title ?? currentImage.description ?? getGalleryImageLabel(currentIndex, images.length);
  const noAnimation = reducedMotion || animationDuration === 0;

  return (
    <Modal
      visible={opened}
      transparent
      animationType={noAnimation ? 'none' : 'fade'}
      // Android back goes to the layer stack (topmost layer only); on web the
      // stack already handled Escape on keydown.
      onRequestClose={handleModalRequestClose}
      statusBarTranslucent
    >
      <StatusBar hidden />
      <OverlayHost>
        <LayerScope id={layerId}>
          <View
            ref={mergedDialogRef}
            style={[styles.container, spacingStyles, style]}
            testID={testID}
            {...a11yProps({ role: 'dialog', modal: true, label: accessibilityLabel ?? 'Image gallery' })}
            onFocus={() => setFocusWithin(true)}
            onBlur={() => setFocusWithin(false)}
            {...webProps({ onKeyDown: handleKeyDown })}
          >
            {/* The theme scrim's color at `overlayOpacity` (dark enough for the light media chrome). */}
            <View style={[styles.overlay, { backgroundColor: resolveScrim(theme, overlayOpacity) }]}>
              {/* Main Image */}
              <View style={{ width: screenWidth, height: screenHeight }} {...panResponder.panHandlers}>
                <Pressable style={styles.imageWrapper} onPress={resetControlsTimeout} accessible={false}>
                  <Image
                    source={currentImageSource}
                    style={{ width: screenWidth, height: screenHeight * 0.8 }}
                    resizeMode="contain"
                    {...a11yProps({ role: 'img', label: imageLabel, accessible: true })}
                  />
                </Pressable>
              </View>

              {/* Controls */}
              {showControls && (
                <GalleryControls
                  currentIndex={currentIndex}
                  totalImages={images.length}
                  onPrevious={goToPrevious}
                  onNext={goToNext}
                  onClose={() => handleClose()}
                  onDownload={showDownloadButton ? handleDownload : undefined}
                  showDownloadButton={showDownloadButton}
                  image={currentImage}
                />
              )}

              {/* Thumbnails */}
              {showThumbnails && showControls && (
                <View style={styles.thumbnailsContainer}>
                  <GalleryThumbnails images={images} currentIndex={currentIndex} onThumbnailPress={goToImage} />
                </View>
              )}

              {/* Metadata */}
              {showMetadata && <GalleryMetadata image={currentImage} visible={metadataVisible} />}

              {/* Metadata Toggle */}
              {showMetadata && showControls && currentImage.metadata && (
                <Pressable
                  style={styles.metadataToggle}
                  onPress={toggleMetadata}
                  {...a11yProps({ role: 'button', expanded: metadataVisible })}
                >
                  <Text style={styles.metadataToggleText}>{metadataVisible ? 'Hide Info' : 'Show Info'}</Text>
                </Pressable>
              )}
            </View>
          </View>
        </LayerScope>
      </OverlayHost>
    </Modal>
  );
}, { displayName: 'Gallery' });

// Media chrome: the photo sits on a dark scrim with light controls.
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    end: 20,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
  },
  metadataToggleText: {
    color: '#FFFFFF',
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
    end: 0,
    position: 'absolute',
    start: 0,
  },
});
