import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, Image, ScrollView, StyleSheet } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { useRovingFocus } from '../../core/accessibility/useRovingFocus';
import { useTheme } from '../../core/theme/ThemeProvider';
import { withAlpha } from '../../core/theme/colorUtils';
import { resolveRadius } from '../../core/theme/tokens';
import { Text } from '../Text';
import type { GalleryThumbnailProps } from './types';
import { resolveImageSource } from '../../utils/imageSource';

const SCROLL_PADDING = 8;
const THUMBNAIL_MARGIN = 4;

/** Accessible name of a thumbnail: "Image 2 of 5: Sunset". */
export function getGalleryImageLabel(index: number, total: number, title?: string): string {
  return `Image ${index + 1} of ${total}${title ? `: ${title}` : ''}`;
}

/**
 * The gallery's thumbnail strip: a tab list (one tab stop; arrow keys, Home and
 * End move between thumbnails and select them), scrolled to keep the current
 * thumbnail centered.
 */
export const GalleryThumbnails: React.FC<GalleryThumbnailProps> = ({
  images,
  currentIndex,
  onThumbnailPress,
  thumbnailSize = 60,
}) => {
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const hasInitializedScroll = useRef(false);

  // Selection follows focus, as in automatic-activation tabs.
  const { getItemProps } = useRovingFocus({
    count: images.length,
    orientation: 'horizontal',
    activeIndex: currentIndex,
    onActiveChange: onThumbnailPress,
    loop: false,
  });

  useEffect(() => {
    if (!containerWidth || !scrollViewRef.current) return;

    const itemSpacing = thumbnailSize + THUMBNAIL_MARGIN * 2;
    const totalContentWidth = SCROLL_PADDING * 2 + images.length * itemSpacing;
    const maxScroll = Math.max(0, totalContentWidth - containerWidth);

    const itemCenter = SCROLL_PADDING + THUMBNAIL_MARGIN + currentIndex * itemSpacing + thumbnailSize / 2;
    const target = Math.min(Math.max(itemCenter - containerWidth / 2, 0), maxScroll);

    scrollViewRef.current.scrollTo({ x: target, animated: hasInitializedScroll.current });
    hasInitializedScroll.current = true;
  }, [containerWidth, currentIndex, images.length, thumbnailSize]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  if (images.length <= 1) return null;

  const accent = theme.colors.primary[5];
  const radius = resolveRadius(theme, 'lg');

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.row} {...a11yProps({ role: 'tablist', label: 'Thumbnails', orientation: 'horizontal' })}>
          {images.map((image, index) => {
            const selected = index === currentIndex;
            return (
              <Pressable
                key={image.id}
                style={[
                  styles.thumbnail,
                  {
                    width: thumbnailSize,
                    height: thumbnailSize,
                    borderRadius: radius + 2,
                    borderColor: selected ? accent : 'transparent',
                  },
                ]}
                onPress={() => onThumbnailPress(index)}
                {...getItemProps(index)}
                {...a11yProps({
                  role: 'tab',
                  label: getGalleryImageLabel(index, images.length, image.title),
                  selected,
                })}
              >
                <Image
                  source={resolveImageSource(image.uri)}
                  style={[styles.thumbnailImage, { borderRadius: radius }]}
                  resizeMode="cover"
                  {...a11yProps({ hidden: true, accessible: false })}
                />
                {selected && (
                  <View
                    style={[styles.activeIndicator, { backgroundColor: withAlpha(accent, 0.2), borderRadius: radius }]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      {/* The tabs already announce "n of N"; this is the visual counter. */}
      <Text style={styles.counter} aria-hidden>
        {currentIndex + 1} of {images.length}
      </Text>
    </View>
  );
};

// Media chrome: light text on a dark scrim over the photo, not theme roles.
const styles = StyleSheet.create({
  activeIndicator: {
    bottom: 0,
    end: 0,
    position: 'absolute',
    start: 0,
    top: 0,
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  counter: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  scrollContainer: {
    alignItems: 'center',
    paddingHorizontal: SCROLL_PADDING,
  },
  thumbnail: {
    borderWidth: 2,
    marginHorizontal: THUMBNAIL_MARGIN,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    height: '100%',
    width: '100%',
  },
});
