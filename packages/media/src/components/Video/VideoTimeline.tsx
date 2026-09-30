import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import {
  a11yProps,
  isNative,
  resolveFontSize,
  useTheme,
  Text,
} from '@plocks/ui';
import { formatTime } from './utils';
import type { VideoTimelineEvent } from './types';

export interface VideoTimelineProps {
  timeline: VideoTimelineEvent[];
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Marker colors per event type — a categorical data palette drawn on the
 * video's media chrome, not UI chrome, so it is fixed rather than themed.
 */
const EVENT_TYPE_COLORS: Record<VideoTimelineEvent['type'], string> = {
  marker: '#FF6B6B',
  chapter: '#4ECDC4',
  annotation: '#45B7D1',
  cue: '#FFA07A',
  custom: '#98D8C8',
};

/** Press target around each thin marker: ≥44pt on native, 24px on web. */
const HIT = isNative ? 44 : 24;

const styles = StyleSheet.create({
  activeMarker: {
    borderRadius: 2,
    height: 8,
    width: 4,
  },
  // As tall as the press targets (so Android delivers touches to them); only
  // the 6px track is drawn, and the rest of the band passes touches through.
  container: {
    end: 0,
    height: HIT,
    position: 'absolute',
    start: 0,
    top: 0,
  },
  track: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    end: 0,
    height: 6,
    position: 'absolute',
    start: 0,
    top: 0,
  },
  hit: {
    alignItems: 'center',
    height: HIT,
    marginStart: -HIT / 2,
    position: 'absolute',
    top: 0,
    width: HIT,
  },
  marker: {
    borderRadius: 1.5,
    height: 6,
    width: 3,
  },
  markerTooltip: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 4,
    minWidth: 60,
    padding: 4,
    position: 'absolute',
    top: 10,
  },
});

/** Human label for a marker: "Jump to chapter “Intro” at 1:05". */
function markerLabel(event: VideoTimelineEvent): string {
  const title = event.data?.title ?? event.data?.label;
  return `Jump to ${event.type}${title ? ` “${title}”` : ''} at ${formatTime(event.time)}`;
}

export function VideoTimeline({ timeline, duration, currentTime, onSeek, style }: VideoTimelineProps) {
  const theme = useTheme();

  if (duration === 0 || timeline.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]} pointerEvents="box-none">
      <View style={styles.track} pointerEvents="none" />
      {timeline.map((event, index) => {
        const position = `${Math.max(0, Math.min(100, (event.time / duration) * 100))}%` as const;
        const isActive = Math.abs(currentTime - event.time) < 1; // Within 1 second
        const color = EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS.custom;

        return (
          <Pressable
            key={`${event.id}-${index}`}
            style={[styles.hit, { start: position }]}
            onPress={() => onSeek(event.time)}
            {...a11yProps({ role: 'button', label: markerLabel(event) })}
          >
            <View style={[styles.marker, isActive && styles.activeMarker, { backgroundColor: color }]} />
            {isActive && event.data?.title ? (
              <View style={styles.markerTooltip} pointerEvents="none">
                <Text style={{ color: '#FFFFFF', fontSize: resolveFontSize(theme, 'xs'), textAlign: 'center' }}>
                  {event.data.title}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
