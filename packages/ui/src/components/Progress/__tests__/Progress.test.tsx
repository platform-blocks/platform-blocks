import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, View } from 'react-native';
import { Progress, ProgressRoot, ProgressSection, ProgressLabel } from '../Progress';

const palette = ['#111111', '#222222', '#333333', '#444444', '#555555', '#666666', '#777777', '#888888', '#999999', '#aaaaaa'];
const mockTheme = {
  colors: {
    primary: palette,
    secondary: palette,
    success: palette,
    warning: palette,
    error: palette,
    gray: palette,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 40,
    '3xl': 48,
  },
  radius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
  },
  // Consumed by the shared FieldHeader/Input styles behind the label block
  fontSizes: { xs: 10, sm: 12, md: 14, lg: 16, xl: 18, '2xl': 20, '3xl': 24 },
  text: { primary: '#111111', muted: '#666666', disabled: '#aaaaaa' },
  backgrounds: { border: '#dddddd', surface: '#ffffff' },
  fontFamily: 'System',
  colorScheme: 'light',
};

jest.mock('../../../core/theme/ThemeProvider', () => ({
  useTheme: () => mockTheme,
}));

describe('Progress - behavior', () => {
  it('clamps the value and exposes it via accessibility props', () => {
    const { getByTestId } = render(<Progress value={150} testID="progress-bar" />);

    const track = getByTestId('progress-bar');
    expect(track.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 100 });
  });

  it('uses a custom hex color when provided', () => {
    const { getByTestId } = render(
      <Progress value={42} color="#123456" testID="progress-color" />
    );

    const track = getByTestId('progress-color');
    const fill = track.props.children;
    const baseStyle = Array.isArray(fill.props.style) ? fill.props.style[0] : fill.props.style;

    expect(baseStyle.backgroundColor).toBe('#123456');
  });

  it('composes sections with the provided values inside Progress.Root', () => {
    const { UNSAFE_getAllByType } = render(
      <ProgressRoot testID="segmented-progress">
        <ProgressSection value={30}>
          <ProgressLabel>30%</ProgressLabel>
        </ProgressSection>
        <ProgressSection value={70}>
          <ProgressLabel>70%</ProgressLabel>
        </ProgressSection>
      </ProgressRoot>
    );

    const sections = UNSAFE_getAllByType(View).filter(
      (instance) => instance.props.accessibilityRole === 'progressbar'
    );
    expect(sections).toHaveLength(2);
    expect(sections[0].props.accessibilityValue.now).toBe(30);
    expect(sections[1].props.accessibilityValue.now).toBe(70);
  });

  it('exposes the sub-components as statics on Progress', () => {
    expect(Progress.Root).toBe(ProgressRoot);
    expect(Progress.Section).toBe(ProgressSection);
    expect(Progress.Label).toBe(ProgressLabel);
  });
});

describe('Progress - label field', () => {
  it('renders the label and description above the bar', () => {
    const { getByText, getByTestId } = render(
      <Progress value={40} label="Upload" description="3 of 8 files" testID="labelled" />
    );

    expect(getByText('Upload')).toBeTruthy();
    expect(getByText('3 of 8 files')).toBeTruthy();
    // The label doubles as the accessibility label when no aria-label is set
    expect(getByTestId('labelled').props.accessibilityLabel).toBe('Upload');
  });

  it('replaces the description with the error message', () => {
    const { getByText, queryByText } = render(
      <Progress value={40} label="Upload" description="3 of 8 files" error="Upload failed" />
    );

    expect(getByText('Upload failed')).toBeTruthy();
    expect(queryByText('3 of 8 files')).toBeNull();
  });

  it('renders an asterisk only when required', () => {
    const optional = render(<Progress value={40} label="Upload" />);
    expect(optional.queryByText(' *')).toBeNull();

    const mandatory = render(<Progress value={40} label="Upload" required />);
    expect(mandatory.getByText(' *')).toBeTruthy();

    const withoutMarker = render(<Progress value={40} label="Upload" required withAsterisk={false} />);
    expect(withoutMarker.queryByText(' *')).toBeNull();
  });

  it('moves spacing props to the wrapper when labelled and keeps them on the bar otherwise', () => {
    const labelled = render(<Progress value={40} label="Upload" mt={24} testID="labelled-bar" />);
    expect(StyleSheet.flatten(labelled.getByTestId('labelled-bar').props.style).marginTop).toBeUndefined();

    const plain = render(<Progress value={40} mt={24} testID="plain-bar" />);
    expect(StyleSheet.flatten(plain.getByTestId('plain-bar').props.style).marginTop).toBe(24);
  });

  it('supports labels on Progress.Root', () => {
    const { getByText } = render(
      <ProgressRoot label="Storage" description="Across all devices">
        <ProgressSection value={30} />
      </ProgressRoot>
    );

    expect(getByText('Storage')).toBeTruthy();
    expect(getByText('Across all devices')).toBeTruthy();
  });
});

describe('Progress - orientation', () => {
  it('renders vertical bars with the thickness on the cross axis and a default length', () => {
    const { getByTestId } = render(
      <Progress value={40} orientation="vertical" testID="vertical-progress" />
    );

    const style = StyleSheet.flatten(getByTestId('vertical-progress').props.style);
    expect(style.height).toBe(160);
    expect(style.width).toBeLessThanOrEqual(48);
    // Vertical bars grow upward from the bottom edge
    expect(style.justifyContent).toBe('flex-end');
  });

  it('honors an explicit length and stacks vertical sections from the bottom', () => {
    const { getByTestId } = render(
      <ProgressRoot orientation="vertical" length={240} testID="vertical-root">
        <ProgressSection value={25} />
      </ProgressRoot>
    );

    const style = StyleSheet.flatten(getByTestId('vertical-root').props.style);
    expect(style.height).toBe(240);
    expect(style.flexDirection).toBe('column-reverse');
  });
});

describe('Progress.Section - interaction', () => {
  it('renders a pressable host when hover handlers are supplied, as Tooltip does', () => {
    const onHoverIn = jest.fn();
    const withHover = render(
      <ProgressRoot>
        <ProgressSection value={30} onHoverIn={onHoverIn} testID="hover-section" />
      </ProgressRoot>
    );
    // Pressable renders as a View wired up to the responder system
    expect(withHover.getByTestId('hover-section').props.onStartShouldSetResponder).toBeDefined();

    const plain = render(
      <ProgressRoot>
        <ProgressSection value={30} testID="plain-section" />
      </ProgressRoot>
    );
    // Non-interactive sections stay plain views, out of the touch tree
    expect(plain.getByTestId('plain-section').props.onStartShouldSetResponder).toBeUndefined();
  });

  it('keeps the section itself as the sized flex item when a tooltip is used', () => {
    const { getByTestId } = render(
      <ProgressRoot testID="tooltip-root">
        <ProgressSection value={35} tooltip="Documents — 35%" testID="tooltip-section" />
      </ProgressRoot>
    );

    // The tooltip's own wrapper (the only `position: relative` ancestor between the
    // section host and the sized section) must fill the section rather than shrink to
    // its content, otherwise the section's percentage width collapses.
    let node: typeof View | any = getByTestId('tooltip-section').parent;
    while (node && StyleSheet.flatten(node.props?.style)?.position !== 'relative') {
      node = node.parent;
    }
    const wrapperStyle = StyleSheet.flatten(node?.props?.style);
    expect(wrapperStyle.width).toBe('100%');
    expect(wrapperStyle.height).toBe('100%');

    // The tooltip label doubles as the section's accessibility label
    expect(getByTestId('tooltip-section').props.accessibilityLabel).toBe('Documents — 35%');
  });

  it('becomes pressable when onPress is provided', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ProgressRoot>
        <ProgressSection value={30} onPress={onPress} testID="pressable-section" />
      </ProgressRoot>
    );

    fireEvent.press(getByTestId('pressable-section'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
