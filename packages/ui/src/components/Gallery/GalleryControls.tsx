import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { isIOS } from '../../core/platform';
import { Text } from '../Text';
import { Icon } from '../Icon';
import type { GalleryControlsProps } from './types';

// Media chrome: white on a translucent black scrim reads over any photo.
const CHROME = '#FFFFFF';
const CHROME_DISABLED = 'rgba(255, 255, 255, 0.5)';

/**
 * The gallery's overlay chrome: close, title + counter, download, and the
 * previous / next buttons (at the start / end edge, so they swap in RTL).
 */
export const GalleryControls: React.FC<GalleryControlsProps> = ({
  currentIndex,
  totalImages,
  onPrevious,
  onNext,
  onClose,
  onDownload,
  showDownloadButton = true,
  image,
}) => {
  const atStart = currentIndex === 0;
  const atEnd = currentIndex === totalImages - 1;

  return (
    <>
      {/* Top Controls */}
      <View style={styles.topControls}>
        <Pressable style={styles.controlButton} onPress={onClose} {...a11yProps({ role: 'button', label: 'Close gallery' })}>
          <Icon name="x" size={24} color={CHROME} />
        </Pressable>

        <View style={styles.titleContainer}>
          {image?.title ? (
            <Text style={styles.title} role="heading">
              {image.title}
            </Text>
          ) : null}
          <Text style={styles.counter}>
            {currentIndex + 1} / {totalImages}
          </Text>
        </View>

        {showDownloadButton && onDownload ? (
          <Pressable
            style={styles.controlButton}
            onPress={onDownload}
            {...a11yProps({ role: 'button', label: 'Download image' })}
          >
            <Icon name="download" size={24} color={CHROME} />
          </Pressable>
        ) : (
          // Keeps the title centered when there's no download button.
          <View style={styles.controlButtonPlaceholder} />
        )}
      </View>

      {/* Navigation Controls */}
      {totalImages > 1 && (
        <>
          <Pressable
            style={[styles.navButton, styles.prevButton]}
            onPress={onPrevious}
            disabled={atStart}
            {...a11yProps({ role: 'button', label: 'Previous image', disabled: atStart })}
          >
            <Icon name="chevron-left" size={32} color={atStart ? CHROME_DISABLED : CHROME} />
          </Pressable>

          <Pressable
            style={[styles.navButton, styles.nextButton]}
            onPress={onNext}
            disabled={atEnd}
            {...a11yProps({ role: 'button', label: 'Next image', disabled: atEnd })}
          >
            <Icon name="chevron-right" size={32} color={atEnd ? CHROME_DISABLED : CHROME} />
          </Pressable>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  controlButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  controlButtonPlaceholder: {
    height: 44,
    width: 44,
  },
  counter: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  navButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -30 }],
    width: 60,
    zIndex: 10,
  },
  nextButton: {
    end: 20,
  },
  prevButton: {
    start: 20,
  },
  title: {
    color: CHROME,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  topControls: {
    alignItems: 'center',
    end: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    position: 'absolute',
    start: 0,
    top: isIOS ? 50 : 30,
    zIndex: 10,
  },
});
