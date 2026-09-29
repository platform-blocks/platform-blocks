import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { Text } from '../Text';
import type { GalleryMetadataProps } from './types';

const KNOWN_KEYS = new Set(['size', 'dimensions', 'dateCreated', 'camera', 'location']);

const formatDimensions = (dimensions?: { width: number; height: number }): string => {
  if (!dimensions) return 'Unknown';
  return `${dimensions.width} × ${dimensions.height}`;
};

export const GalleryMetadata: React.FC<GalleryMetadataProps> = ({
  image,
  visible,
}) => {
  if (!visible || !image.metadata) return null;

  const metadata = image.metadata;

  return (
    <View style={styles.container} {...a11yProps({ role: 'region', label: 'Image details' })}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {image.title && (
            <View style={styles.section}>
              <Text style={styles.label}>Title</Text>
              <Text style={styles.value}>{image.title}</Text>
            </View>
          )}

          {image.description && (
            <View style={styles.section}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.value}>{image.description}</Text>
            </View>
          )}

          {metadata.dimensions && (
            <View style={styles.section}>
              <Text style={styles.label}>Dimensions</Text>
              <Text style={styles.value}>{formatDimensions(metadata.dimensions)}</Text>
            </View>
          )}

          {metadata.size && (
            <View style={styles.section}>
              <Text style={styles.label}>File Size</Text>
              <Text style={styles.value}>{metadata.size}</Text>
            </View>
          )}

          {metadata.dateCreated && (
            <View style={styles.section}>
              <Text style={styles.label}>Date Created</Text>
              <Text style={styles.value}>{metadata.dateCreated}</Text>
            </View>
          )}

          {metadata.camera && (
            <View style={styles.section}>
              <Text style={styles.label}>Camera</Text>
              <Text style={styles.value}>{metadata.camera}</Text>
            </View>
          )}

          {metadata.location && (
            <View style={styles.section}>
              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>{metadata.location}</Text>
            </View>
          )}

          {/* Additional metadata */}
          {Object.entries(metadata)
            .filter(([key]) => !KNOWN_KEYS.has(key))
            .map(([key, value]) => (
              <View key={key} style={styles.section}>
                <Text style={styles.label}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                <Text style={styles.value}>{String(value)}</Text>
              </View>
            ))}
        </View>
      </ScrollView>
    </View>
  );
};

// Media chrome: light text on a dark scrim over the photo, not theme roles.
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    bottom: 100,
    padding: 16,
    end: 20,
    position: 'absolute',
    top: 100,
    width: 250,
    zIndex: 5,
  },
  content: {
    paddingBottom: 16,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 12,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 18,
  },
});
