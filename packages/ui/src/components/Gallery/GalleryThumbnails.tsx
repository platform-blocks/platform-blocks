import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Image, ScrollView, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Text } from '../Text';
import type { GalleryThumbnailProps } from './types';
import { resolveImageSource } from '../../utils/imageSource';

const SCROLL_PADDING = 8;
const THUMBNAIL_MARGIN = 4;

export const GalleryThumbnails: React.FC<GalleryThumbnailProps> = ({
  images,
  currentIndex,
  onThumbnailPress,
  thumbnailSize = 60,
}) => {
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const hasInitializedScroll = useRef(false);

  useEffect(() => {
    if (!containerWidth || !scrollViewRef.current) return;

  const paddingHorizontal = SCROLL_PADDING;
  const marginHorizontal = THUMBNAIL_MARGIN;
  const itemSpacing = thumbnailSize + marginHorizontal * 2;
  const totalContentWidth = paddingHorizontal * 2 + images.length * itemSpacing;
    const maxScroll = Math.max(0, totalContentWidth - containerWidth);

    const itemCenter = paddingHorizontal + marginHorizontal + currentIndex * itemSpacing + thumbnailSize / 2;
    const rawTarget = itemCenter - containerWidth / 2;
    const target = Math.min(Math.max(rawTarget, 0), maxScroll);

    scrollViewRef.current.scrollTo({ x: target, animated: hasInitializedScroll.current });
    hasInitializedScroll.current = true;
  }, [containerWidth, currentIndex, images.length, thumbnailSize]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  if (images.length <= 1) return null;

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {images.map((image, index) => (
          <TouchableOpacity
            key={image.id}
            style={[
              styles.thumbnail,
              {
                width: thumbnailSize,
                height: thumbnailSize,
                borderColor: index === currentIndex ? '#007AFF' : 'transparent',
              }
            ]}
            onPress={() => onThumbnailPress(index)}
          >
            <Image
              source={resolveImageSource(image.uri)}
              style={[styles.thumbnailImage, { borderRadius: 8 }]}
              resizeMode="cover"
            />
            {index === currentIndex && (
              <View style={styles.activeIndicator} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={styles.counter}>
        {currentIndex + 1} of {images.length}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  activeIndicator: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderRadius: 8,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  counter: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  scrollContainer: {
    alignItems: 'center',
    paddingHorizontal: SCROLL_PADDING,
  },
  thumbnail: {
    borderRadius: 10,
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
