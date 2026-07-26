import { useRef, useState } from 'react';
import { Asset } from 'expo-asset';
import { Block, Text, Video, Waveform } from '@platform-blocks/ui';
import type { VideoRef, VideoState } from '@platform-blocks/ui';

import { CLIP_PEAKS } from '../data';

// `Video` takes a URL, so resolve the bundled clip to one. `Image.resolveAssetSource`
// is native-only, whereas expo-asset works on web too.
const CLIP_URL = Asset.fromModule(require('../../../../assets/video/demo-clip.mp4')).uri;

export default function Demo() {
  const videoRef = useRef<VideoRef>(null);
  const [playback, setPlayback] = useState({ currentTime: 0, duration: 0 });

  const progress = playback.duration > 0 ? Math.min(1, playback.currentTime / playback.duration) : 0;

  // `duration` is 0 until metadata loads, so keep the last known value.
  const track = (state: VideoState) =>
    setPlayback((prev) => ({
      currentTime: state.currentTime,
      duration: state.duration || prev.duration,
    }));

  return (
    <Block gap="sm" w="100%" maxW={640}>
      <Video
        ref={videoRef}
        source={{ url: CLIP_URL }}
        w="100%"
        aspectRatio={640 / 426}
        controls
        muted={false}
        onLoad={track}
        onTimeUpdate={track}
        onDurationChange={(duration) => setPlayback((prev) => ({ ...prev, duration }))}
      />

      <Waveform
        peaks={CLIP_PEAKS}
        progress={progress}
        h={72}
        fullWidth
        color="primary"
        interactive
        onSeek={(position) => videoRef.current?.seek(position * playback.duration)}
        showProgressLine
        showTimeStamps
        duration={playback.duration}
        accessibilityLabel="Waveform of the clip audio"
        accessibilityHint="Tap or drag to seek the video"
      />

      <Text variant="small" colorVariant="muted">
        The peaks were measured from this clip's audio track. `onTimeUpdate` feeds `progress`, and
        scrubbing the waveform calls `seek()` on the video ref — so the two stay in step in both
        directions.
      </Text>
    </Block>
  );
}
