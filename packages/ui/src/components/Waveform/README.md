# Waveform Component

An advanced, interactive audio waveform visualization component for React Native with comprehensive features for modern audio applications.

## Features

- **Visual Variants**: Bars, line, and gradient styles
- **Interactive Controls**: Touch/click to seek, drag to scrub, keyboard support
- **Responsive Layout**: Full-width support with proper scaling
- **Performance Optimized**: Virtual rendering for large datasets
- **Progress Visualization**: Customizable progress line and highlighting
- **Time Navigation**: Timestamp markers with configurable intervals
- **Data Normalization**: Optional height normalization for consistent display
- **Accessibility**: Full accessibility support with proper labels
- **Theming**: Integration with design system colors and themes

## Basic Usage

```tsx
import { Waveform } from '@platform-blocks/react-ui-library';

// Simple waveform
<Waveform
  peaks={audioData}
  width={300}
  height={60}
  color="primary"
/>

// Interactive waveform with progress
<Waveform
  peaks={audioData}
  width={300}
  height={80}
  color="primary"
  interactive
  progress={0.4}
  progressColor="secondary"
  onSeek={(position) => console.log('Seek to:', position)}
/>
```

## Props

### Basic Configuration
- **peaks** (number[]): Array of peak values for the waveform
- **width** (number): Fixed width in pixels (default: 300)
- **height** (number): Height in pixels (default: 60)
- **color** (string): Theme color key or hex color (default: 'primary')
- **fullWidth** (boolean): Whether to use responsive full width

### Visual Styling
- **variant** ('bars' | 'rounded' | 'line' | 'gradient'): Visual style (default: 'bars')
- **size** ('xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | number): Scales height, bar width/gap, stroke width, and label type together (default: 'md'). A number is read as the height. Any of the props below override the value the token supplies.
- **barWidth** (number): Width of each bar in pixels (default: 2)
- **barGap** (number): Gap between bars in pixels (default: 1)
- **strokeWidth** (number): Line width for line variant (default: 2)
- **minBarHeight** (number): Minimum bar height (default: 1)
- **gradientColors** (string[]): Colors for gradient variant (defaults to a ramp derived from `color`)

### Interactive Features
- **interactive** (boolean): Enable touch/drag interactions
- **onSeek** (position: number) => void: Called when user seeks to position (0-1)
- **onDragStart** (position: number) => void: Called when drag starts
- **onDrag** (position: number) => void: Called during drag
- **onDragEnd** (position: number) => void: Called when drag ends

### Progress Visualization
- **progress** (number): Current progress position (0-1)
- **progressColor** (string): Color for progress highlighting
- **showProgressLine** (boolean): Show vertical progress line
- **progressLineStyle** (object): Custom progress line styling
  - **color** (string): Line color
  - **width** (number): Line width
  - **opacity** (number): Line opacity

### Performance & Data
- **normalize** (boolean): Normalize peak heights to 0-1 range
- **maxVisibleBars** (number): Limit visible bars for performance (virtual rendering)

### Timestamps
- **showTimeStamps** (boolean): Show timestamp markers
- **duration** (number): Total duration in seconds
- **timeStampInterval** (number): Interval between timestamps in seconds

### Accessibility
- **accessibilityLabel** (string): Accessibility label for screen readers

## Advanced Examples

### Virtual Rendering for Large Datasets
```tsx
// Efficiently render large waveforms (5000+ peaks)
<Waveform
  peaks={largePeaksArray} // 5000 peaks
  width={350}
  height={80}
  color="primary"
  maxVisibleBars={200} // Only render 200 bars for performance
  interactive
  onSeek={handleSeek}
/>
```

### Progress Line with Custom Styling
```tsx
<Waveform
  peaks={audioData}
  width={350}
  height={100}
  color="tertiary"
  interactive
  progress={currentProgress}
  showProgressLine
  progressLineStyle={{
    color: '#FF6B35',
    width: 3,
    opacity: 0.9
  }}
  onSeek={handleSeek}
/>
```

### Timestamp Markers
```tsx
<Waveform
  peaks={audioData}
  width={350}
  height={80}
  color="success"
  variant="line"
  interactive
  progress={progress}
  showTimeStamps
  duration={180} // 3 minutes
  timeStampInterval={30} // Every 30 seconds
  onSeek={handleSeek}
/>
```

### Full-Width Responsive with All Features
```tsx
<Waveform
  peaks={audioData}
  height={120}
  color="purple"
  variant="gradient"
  gradientColors={['purple', 'pink', 'tertiary']}
  fullWidth
  interactive
  normalize
  maxVisibleBars={300}
  progress={progress}
  progressColor="highlight"
  showProgressLine
  progressLineStyle={{ color: '#FFD700', width: 2 }}
  showTimeStamps
  duration={duration}
  timeStampInterval={60}
  onSeek={handleSeek}
/>
```

### Keyboard Navigation
When the waveform is focused and interactive, users can:
- Press **Space** to trigger a custom 'waveformSpacePress' event
- Your app can listen for this event to implement play/pause functionality

```tsx
// Listen for space bar events
useEffect(() => {
  const handleSpacePress = () => {
    setIsPlaying(prev => !prev);
  };

  document.addEventListener('waveformSpacePress', handleSpacePress);
  return () => document.removeEventListener('waveformSpacePress', handleSpacePress);
}, []);
```

## Performance Considerations

### Virtual Rendering
For large datasets (1000+ peaks), use the `maxVisibleBars` prop to enable virtual rendering:
- Automatically downsamples data to the specified number of visible bars
- Maintains visual fidelity while improving performance
- Recommended: 200-500 visible bars for optimal performance

### Memory Optimization
- Use `normalize` to reduce memory usage for large datasets
- Consider using `useMemo` for peaks data in parent components
- The component is already optimized with `React.memo`

## Error Handling

The component includes comprehensive error handling:
- Invalid touch coordinates are gracefully handled
- Division by zero protection in normalization
- Warnings for insufficient width to render bars
- Fallback rendering for empty datasets

## Accessibility Features

- Proper `accessibilityRole` and `accessibilityLabel`
- Keyboard navigation support when interactive
- Focus management for interactive elements
- Screen reader compatible progress information

## Browser Compatibility

- **Web**: Full support with keyboard events
- **React Native**: Touch events only (no keyboard support)
- **SVG**: Uses react-native-svg for cross-platform compatibility

## Migration from Basic Version

If upgrading from a basic waveform component:

1. **Interactive**: Add `interactive={true}` and `onSeek` handler
2. **Performance**: Add `maxVisibleBars` for large datasets
3. **Progress**: Use `progress` and `progressColor` props
4. **Responsive**: Add `fullWidth={true}` for responsive layouts

## Related Components

- **Audio Player**: Often used together for complete audio experiences
- **Progress Bar**: Can be synchronized with waveform progress
- **Volume Control**: Complementary audio interface component