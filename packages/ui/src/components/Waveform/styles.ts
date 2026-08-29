import { StyleSheet } from 'react-native';
import { WaveformStyleProps } from './types';
import { PlatformBlocksTheme } from '../../core/theme/types';
import { resolveAccentColor } from '../../core/theme/resolveColors';

export const useWaveformStyles = (props: WaveformStyleProps & { theme: PlatformBlocksTheme }) => {
  const { 
    width, 
    height, 
    color, 
    backgroundColor, 
    variant, 
    interactive,
    theme 
  } = props;

  // The shared resolver covers every palette the theme defines — not just the
  // six this used to hard-code — plus `primary.6` shade syntax.
  const resolvedColor = resolveAccentColor(theme, color) ?? theme.colors.primary[5];

  const resolvedBackgroundColor = backgroundColor || 'transparent';

  return StyleSheet.create({
    bar: {
      backgroundColor: resolvedColor,
      ...(variant === 'rounded' && {
        borderRadius: props.barWidth / 2,
      }),
    },
    
    barContainer: {
      alignItems: 'center',
      height: '100%',
      justifyContent: 'center',
    },
    
    container: {
      backgroundColor: resolvedBackgroundColor,
      height,
      overflow: 'hidden',
      position: 'relative',
      width,
      ...(interactive && {
        cursor: 'pointer' as any, // Web only
      }),
    },
    
    gradientOverlay: {
      bottom: 0,
      left: 0,
      pointerEvents: 'none',
      position: 'absolute',
      right: 0,
      top: 0,
    },
    
    lineWaveform: {
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    
    progressBar: {
      backgroundColor: props.theme.colors.primary[6], // Slightly darker for progress
    },
    
    reflection: {
      opacity: 0.3,
      transform: [{ scaleY: -1 }],
    },
    
    waveformContainer: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
    },
  });
};
