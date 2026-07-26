import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, StyleSheet } from 'react-native';
import { AudioPlayer } from '../AudioPlayer';
import { Card } from '../Card';
import { Button } from '../Button';
import { Divider } from '../Divider';
import { useTheme } from '../../core/theme';
import { DESIGN_TOKENS } from '../../core';
import type { AudioPlayerRef, PlaybackState } from '../AudioPlayer';
import { Block } from '../Block';

// Short bundled clips so the demo plays offline and without a third-party host.
const SAMPLE_AUDIO_FILES = [
  {
    id: '1',
    title: 'Chime',
    artist: 'Demo Tones',
    uri: require('../../assets/sounds/chime.mp3'),
    duration: 2600,
  },
  {
    id: '2',
    title: 'Arpeggio',
    artist: 'Demo Tones',
    uri: require('../../assets/sounds/melody.mp3'),
    duration: 3860,
  },
  {
    id: '3',
    title: 'Rainfall',
    artist: 'Ambient Collection',
    uri: require('../../assets/sounds/rain.mp3'),
    duration: 6000,
  },
];

// Generate sample waveform data
const generateSampleWaveform = (samples = 200): number[] => {
  return Array.from({ length: samples }, (_, i) => {
    // Create a more realistic waveform pattern
    const x = (i / samples) * Math.PI * 4;
    const base = Math.sin(x) * 0.5 + 0.5;
    const noise = (Math.random() - 0.5) * 0.3;
    const envelope = Math.sin((i / samples) * Math.PI); // Fade in/out effect
    return Math.max(0.1, Math.min(0.9, (base + noise) * envelope));
  });
};

export const AudioPlayerDemo: React.FC = () => {
  const theme = useTheme();
  const [currentTrack, setCurrentTrack] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showMetadata, setShowMetadata] = useState(true);
  const [interactive, setInteractive] = useState(true);
  const [controlsPosition, setControlsPosition] = useState<'top' | 'bottom'>('bottom');
  const [variant, setVariant] = useState<'minimal' | 'compact' | 'full'>('full');
  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null);

  const playerRef = React.useRef<AudioPlayerRef>(null);

  const currentAudio = SAMPLE_AUDIO_FILES[currentTrack];
  const samplePeaks = generateSampleWaveform(150);

  const handlePlaybackStateChange = (state: PlaybackState) => {
    setPlaybackState(state);
  };

  const handleError = (error: any) => {
    console.warn('Audio player error:', error);
    // In production, you might show a user-friendly error message
  };

  const switchTrack = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setCurrentTrack((prev) => (prev + 1) % SAMPLE_AUDIO_FILES.length);
    } else {
      setCurrentTrack((prev) => (prev - 1 + SAMPLE_AUDIO_FILES.length) % SAMPLE_AUDIO_FILES.length);
    }
  };

  return (
    <Block>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.colors.gray[9] }]}>
          AudioPlayer Component Demo
        </Text>
        
        <Text style={[styles.subtitle, { color: theme.colors.gray[6] }]}>
          Advanced audio player with waveform visualization, playback controls, and SoundCloud-like features.
        </Text>

        <Divider style={{ marginVertical: DESIGN_TOKENS.spacing.lg }} />

        {/* Controls Configuration */}
        <Card style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.gray[8] }]}>
            Configuration
          </Text>
          
          <View style={styles.configRow}>
            <Text style={[styles.configLabel, { color: theme.colors.gray[7] }]}>
              Show Controls
            </Text>
            <Switch
              value={showControls}
              onValueChange={setShowControls}
              trackColor={{ false: theme.colors.gray[3], true: theme.colors.primary[4] }}
              thumbColor={showControls ? theme.colors.primary[6] : theme.colors.gray[5]}
            />
          </View>

          <View style={styles.configRow}>
            <Text style={[styles.configLabel, { color: theme.colors.gray[7] }]}>
              Show Metadata
            </Text>
            <Switch
              value={showMetadata}
              onValueChange={setShowMetadata}
              trackColor={{ false: theme.colors.gray[3], true: theme.colors.primary[4] }}
              thumbColor={showMetadata ? theme.colors.primary[6] : theme.colors.gray[5]}
            />
          </View>

          <View style={styles.configRow}>
            <Text style={[styles.configLabel, { color: theme.colors.gray[7] }]}>
              Interactive Waveform
            </Text>
            <Switch
              value={interactive}
              onValueChange={setInteractive}
              trackColor={{ false: theme.colors.gray[3], true: theme.colors.primary[4] }}
              thumbColor={interactive ? theme.colors.primary[6] : theme.colors.gray[5]}
            />
          </View>

          <View style={styles.configButtons}>
            <Button
              size="sm"
              variant={controlsPosition === 'top' ? 'filled' : 'outline'}
              onPress={() => setControlsPosition('top')}
            >
              Controls Top
            </Button>
            <Button
              size="sm"
              variant={controlsPosition === 'bottom' ? 'filled' : 'outline'}
              onPress={() => setControlsPosition('bottom')}
            >
              Controls Bottom
            </Button>
          </View>

          <View style={styles.configButtons}>
            <Button
              size="sm"
              variant={variant === 'minimal' ? 'filled' : 'outline'}
              onPress={() => setVariant('minimal')}
            >
              Minimal
            </Button>
            <Button
              size="sm"
              variant={variant === 'compact' ? 'filled' : 'outline'}
              onPress={() => setVariant('compact')}
            >
              Compact
            </Button>
            <Button
              size="sm"
              variant={variant === 'full' ? 'filled' : 'outline'}
              onPress={() => setVariant('full')}
            >
              Full
            </Button>
          </View>
        </Card>

        {/* Track Selection */}
        <Card style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.gray[8] }]}>
            Track Selection
          </Text>
          
          <View style={styles.trackInfo}>
            <Text style={[styles.trackTitle, { color: theme.colors.gray[9] }]}>
              {currentAudio.title}
            </Text>
            <Text style={[styles.trackArtist, { color: theme.colors.gray[6] }]}>
              {currentAudio.artist}
            </Text>
          </View>

          <View style={styles.trackControls}>
            <Button
              size="sm"
              variant="outline"
              onPress={() => switchTrack('prev')}
              disabled={currentTrack === 0}
            >
              Previous
            </Button>
            <Text style={[styles.trackCounter, { color: theme.colors.gray[6] }]}>
              {currentTrack + 1} of {SAMPLE_AUDIO_FILES.length}
            </Text>
            <Button
              size="sm"
              variant="outline"
              onPress={() => switchTrack('next')}
              disabled={currentTrack === SAMPLE_AUDIO_FILES.length - 1}
            >
              Next
            </Button>
          </View>
        </Card>

        {/* Audio Player */}
        <Card style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.gray[8] }]}>
            Audio Player
          </Text>
          
          <AudioPlayer
            ref={playerRef}
            source={currentAudio.uri}
            peaks={samplePeaks}
            w={280}
            h={80}
            color="primary"
            showControls={showControls}
            controls={{
              playPause: true,
              volume: true,
              speed: variant === 'full',
              waveform: true,
            }}
            controlsPosition={controlsPosition}
            variant={variant}
            interactive={interactive}
            showTime={true}
            timeFormat="mm:ss"
            showMetadata={showMetadata}
            metadata={showMetadata ? {
              title: currentAudio.title,
              artist: currentAudio.artist,
            } : undefined}
            onPlaybackStateChange={handlePlaybackStateChange}
            onError={handleError}
            onSeek={(position) => {
              console.log('Seeked to position:', position);
            }}
            style={{
              marginVertical: DESIGN_TOKENS.spacing.md,
            }}
          />
        </Card>

        {/* Playback State */}
        {playbackState && (
          <Card style={{ marginBottom: DESIGN_TOKENS.spacing.lg }}>
            <Text style={[styles.sectionTitle, { color: theme.colors.gray[8] }]}>
              Playback State
            </Text>
            
            <View style={styles.stateGrid}>
              <View style={styles.stateItem}>
                <Text style={[styles.stateLabel, { color: theme.colors.gray[6] }]}>
                  Status
                </Text>
                <Text style={[styles.stateValue, { color: theme.colors.gray[8] }]}>
                  {playbackState.isPlaying ? 'Playing' : 'Paused'}
                </Text>
              </View>
              
              <View style={styles.stateItem}>
                <Text style={[styles.stateLabel, { color: theme.colors.gray[6] }]}>
                  Current Time
                </Text>
                <Text style={[styles.stateValue, { color: theme.colors.gray[8] }]}>
                  {Math.round(playbackState.currentTime / 1000)}s
                </Text>
              </View>
              
              <View style={styles.stateItem}>
                <Text style={[styles.stateLabel, { color: theme.colors.gray[6] }]}>
                  Duration
                </Text>
                <Text style={[styles.stateValue, { color: theme.colors.gray[8] }]}>
                  {Math.round(playbackState.duration / 1000)}s
                </Text>
              </View>
              
              <View style={styles.stateItem}>
                <Text style={[styles.stateLabel, { color: theme.colors.gray[6] }]}>
                  Volume
                </Text>
                <Text style={[styles.stateValue, { color: theme.colors.gray[8] }]}>
                  {Math.round(playbackState.volume * 100)}%
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Feature Information */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.gray[8] }]}>
            Features
          </Text>
          
          <View style={styles.featureList}>
            <Text style={[styles.featureItem, { color: theme.colors.gray[7] }]}>
              • Interactive waveform visualization
            </Text>
            <Text style={[styles.featureItem, { color: theme.colors.gray[7] }]}>
              • Playback controls (play, pause, volume, speed)
            </Text>
            <Text style={[styles.featureItem, { color: theme.colors.gray[7] }]}>
              • Time display and seeking
            </Text>
            <Text style={[styles.featureItem, { color: theme.colors.gray[7] }]}>
              • Metadata display (title, artist)
            </Text>
            <Text style={[styles.featureItem, { color: theme.colors.gray[7] }]}>
              • Sound system integration for UI feedback
            </Text>
            <Text style={[styles.featureItem, { color: theme.colors.gray[7] }]}>
              • Graceful fallback when expo-av is not available
            </Text>
            <Text style={[styles.featureItem, { color: theme.colors.gray[7] }]}>
              • Multiple layout variants (minimal, compact, full)
            </Text>
            <Text style={[styles.featureItem, { color: theme.colors.gray[7] }]}>
              • Accessibility support with screen reader labels
            </Text>
          </View>
        </Card>
      </ScrollView>
    </Block>
  );
};

const styles = StyleSheet.create({
  configButtons: {
    flexDirection: 'row',
    gap: DESIGN_TOKENS.spacing.sm,
    marginTop: DESIGN_TOKENS.spacing.sm,
  },
  configLabel: {
    fontSize: DESIGN_TOKENS.typography.fontSize.md,
  },
  configRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: DESIGN_TOKENS.spacing.sm,
  },
  container: {
    flex: 1,
    padding: DESIGN_TOKENS.spacing.md,
  },
  featureItem: {
    fontSize: DESIGN_TOKENS.typography.fontSize.sm,
    lineHeight: 20,
  },
  featureList: {
    gap: DESIGN_TOKENS.spacing.xs,
  },
  sectionTitle: {
    fontSize: DESIGN_TOKENS.typography.fontSize.lg,
    fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold,
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  stateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DESIGN_TOKENS.spacing.md,
  },
  stateItem: {
    flex: 1,
    minWidth: '45%',
  },
  stateLabel: {
    fontSize: DESIGN_TOKENS.typography.fontSize.sm,
    marginBottom: 2,
  },
  stateValue: {
    fontSize: DESIGN_TOKENS.typography.fontSize.md,
    fontWeight: DESIGN_TOKENS.typography.fontWeight.medium,
  },
  subtitle: {
    fontSize: DESIGN_TOKENS.typography.fontSize.md,
    lineHeight: 22,
  },
  title: {
    fontSize: DESIGN_TOKENS.typography.fontSize.xl,
    fontWeight: DESIGN_TOKENS.typography.fontWeight.bold,
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  trackArtist: {
    fontSize: DESIGN_TOKENS.typography.fontSize.md,
    marginTop: 2,
  },
  trackControls: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trackCounter: {
    fontSize: DESIGN_TOKENS.typography.fontSize.sm,
  },
  trackInfo: {
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  trackTitle: {
    fontSize: DESIGN_TOKENS.typography.fontSize.lg,
    fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold,
  },
});