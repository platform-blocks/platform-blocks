import React from 'react';
import { Pressable, useWindowDimensions } from 'react-native';
import { Block, Title } from 'platform-blocks/components';
import { Waveform, Card, Text, useTheme, Video, Gallery, Slider, Button, Image } from '@platform-blocks/ui';
import { Asset } from 'expo-asset';

// Stable mock waveform peaks — generated once at module load so the Math.random
// call stays out of the render path (react-hooks/purity forbids it there, even
// inside useMemo).
const WAVEFORM_PEAKS = (() => {
  const len = 220;
  const arr: number[] = [];
  for (let i = 0; i < len; i++) {
    const sine = Math.sin(i / 18);
    const noise = (Math.random() - 0.5) * 0.6;
    arr.push(Math.max(-1, Math.min(1, sine * 0.8 + noise)));
  }
  return arr;
})();

export function MediaShowcase() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isSmall = width < 768;

  const peaks = WAVEFORM_PEAKS;

  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    if (typeof requestAnimationFrame !== 'function' || typeof cancelAnimationFrame !== 'function') {
      return undefined;
    }

    let frame: number;
    const getNow = () => (typeof performance !== 'undefined' && typeof performance.now === 'function')
      ? performance.now()
      : Date.now();

    const start = getNow();

    const loop = (t: number) => {
      const timestamp = Number.isFinite(t) ? t : getNow();
      const elapsed = (timestamp - start) / 4000;
      setProgress((elapsed % 1 + 1) % 1);
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  const videoChapters = React.useMemo(() => ([
    {
      id: 'intro',
      time: 2,
      type: 'chapter' as const,
      data: { label: 'Intro', description: 'Welcome sequence with title card' },
    },
    {
      id: 'feature',
      time: 8,
      type: 'chapter' as const,
      data: { label: 'Feature Highlight', description: 'Showcases hero capabilities' },
    },
    {
      id: 'cta',
      time: 15,
      type: 'chapter' as const,
      data: { label: 'Call to Action', description: 'Closes with product CTA' },
    },
  ]), []);
  const [lastTimelineMarker, setLastTimelineMarker] = React.useState<string | null>(null);

  const galleryImages = React.useMemo(() => ([
    {
      id: 'aurora',
      uri: require('../../assets/images/scene-aurora.png'),
      title: 'Aurora Over Ridge',
      description: 'Icelandic night sky awash in greens and violets.',
      metadata: {
        size: '8.2 MB',
        dimensions: { width: 3840, height: 2160 },
        camera: 'Sony A7 III',
        location: 'Vík, Iceland',
        dateCreated: '2024-02-18',
      },
    },
    {
      id: 'desert-dunes',
      uri: require('../../assets/images/scene-desert.png'),
      title: 'Desert Dunes',
      description: 'Golden dunes sculpted by wind at sunrise.',
      metadata: {
        size: '6.4 MB',
        dimensions: { width: 4000, height: 2667 },
        camera: 'Canon EOS R5',
        location: 'Rub’ al Khali, UAE',
        dateCreated: '2023-11-02',
      },
    },
    {
      id: 'city-lights',
      uri: require('../../assets/images/scene-city.png'),
      title: 'City Lights',
      description: 'Nighttime skyline reflecting across the river.',
      metadata: {
        size: '9.5 MB',
        dimensions: { width: 5120, height: 3413 },
        camera: 'Nikon Z7 II',
        location: 'Tokyo, Japan',
        dateCreated: '2024-05-14',
      },
    },
    {
      id: 'forest-trail',
      uri: require('../../assets/images/scene-forest.png'),
      title: 'Forest Trail',
      description: 'Soft morning light filtering through evergreens.',
      metadata: {
        size: '7.1 MB',
        dimensions: { width: 4240, height: 2832 },
        camera: 'Fujifilm X-T5',
        location: 'Whistler, Canada',
        dateCreated: '2024-03-09',
      },
    },
    {
      id: 'coastline',
      uri: require('../../assets/images/scene-ocean.png'),
      title: 'Coastal Vista',
      description: 'Crashing turquoise waves along sheer cliffs.',
      metadata: {
        size: '8.9 MB',
        dimensions: { width: 4032, height: 3024 },
        camera: 'DJI Mavic 3',
        location: 'Big Sur, USA',
        dateCreated: '2024-06-22',
      },
    },
  ]), []);

  const [galleryOpen, setGalleryOpen] = React.useState(false);
  const [galleryIndex, setGalleryIndex] = React.useState(0);
  const openGalleryAt = React.useCallback((index: number) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  }, []);
  const closeGallery = React.useCallback(() => setGalleryOpen(false), []);

  const [manualProgress, setManualProgress] = React.useState(0.35);

  return (
    <Block direction="column" gap="xl">
            <Title afterline>Waveform</Title>

      <Block direction={isSmall ? 'column' : 'row'} gap="lg" wrap="wrap">
        <Card p={16} style={{ flexGrow: 1, minWidth: 320 }}>
            <Text weight="semibold">Bars (Rounded) Variant</Text>
            <Waveform
              peaks={peaks}
              fullWidth
              h={80}
              variant="rounded"
              // barWidth={30}
              barGap={2}
              color="primary"
              progress={progress}
              progressColor="success"
            />
            <Text size="xs" color="muted">Rounded bars with animated playback progress.</Text>
        </Card>
     
        <Card style={{ flexGrow: 1, minWidth: 320 }} p={16}>
          <Block direction="column" gap={12}>
            <Text weight="semibold">Line Variant</Text>
            <Waveform
              peaks={peaks}
              fullWidth
              h={80}
              variant="line"
              strokeWidth={2}
              color="primary"
              progress={progress}
              progressColor="warning"
            />
            <Text size="xs" color="muted">Continuous line waveform with animated progress overlay.</Text>
          </Block>
        </Card>
      </Block>

      <Title afterline>Video</Title>
      <Block direction={isSmall ? 'column' : 'row'} gap="lg" wrap="wrap">
        <Card style={{ flexGrow: 1, minWidth: 320 }} p={16}>
            <Text weight="semibold">Inline MP4 Player</Text>
            <Video
              source={{ url: Asset.fromModule(require('../../assets/video/demo-clip.mp4')).uri }}
              w="100%"
              h={isSmall ? 200 : 220}
              poster="/images/scene-lake.png"
              controls
              timeline={videoChapters}
              onTimelineEvent={(event) => setLastTimelineMarker(event.data?.label ?? event.id)}
            />
            <Text size="xs" color="muted">
              {lastTimelineMarker
                ? `Latest chapter marker: ${lastTimelineMarker}`
                : 'Timeline markers surface product chapters while playback runs.'}
            </Text>
        </Card>
        <Card style={{ flexGrow: 1, minWidth: 320 }} p={16}>
            <Text weight="semibold">YouTube Embed</Text>
            <Video
              source={{ youtube: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' }}
              w="100%"
              h={isSmall ? 200 : 220}
              controls={{ playbackRate: true, quality: true }}
              autoPlay={false}
              muted
            />
            <Text size="xs" color="muted">
              Supports native playback controls plus YouTube quality and speed options.
            </Text>
        </Card>
      </Block>

      <Title afterline>Gallery</Title>
      <Block direction={isSmall ? 'column' : 'row'} gap="lg" wrap="wrap">
        <Card style={{ flexGrow: 1, minWidth: 320 }} p={16}>
          <Block direction="column" gap={12}>
            <Text weight="semibold">Interactive Lightbox</Text>
            <Block gap="sm" wrap="wrap">
              {galleryImages.slice(0, 4).map((image, index) => (
                <Pressable
                  key={image.id}
                  onPress={() => openGalleryAt(index)}
                  style={{
                    width: isSmall ? '48%' : 140,
                    height: 100,
                    borderRadius: 12,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: theme.colorScheme === 'dark'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <Image
                    source={{ uri: image.uri }}
                    src={image.uri}
                    style={{ width: '100%', height: '100%' }}
                    imageStyle={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </Pressable>
              ))}
            </Block>
            <Block gap="sm" align="center" wrap="wrap">
              <Button size="sm" onPress={() => openGalleryAt(0)}>Open Gallery</Button>
              <Text size="xs" color="muted">
                Tap a thumbnail or use the button to launch the full-screen gallery.
              </Text>
            </Block>
          </Block>
        </Card>
      </Block>

      <Gallery
        visible={galleryOpen}
        images={galleryImages}
        initialIndex={galleryIndex}
        onClose={closeGallery}
        onImageChange={(index) => setGalleryIndex(index)}
        showThumbnails
        showMetadata
        allowKeyboardNavigation
        allowSwipeNavigation
      />
    </Block>
  );
}
