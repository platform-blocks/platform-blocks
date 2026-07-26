import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { render } from '@testing-library/react-native';

import { Stepper } from '../Stepper';

const mockTheme = {
  colors: {
    primary: ['#E6F0FF', '#D0E2FF', '#A6C8FF', '#78A9FF', '#4589FF', '#0F62FE', '#0043CE', '#002D9C'],
    gray: ['#F9FAFB', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151'],
  },
  text: {
    primary: '#111111',
    secondary: '#555555',
    muted: '#888888',
    disabled: '#cccccc',
  },
  fontFamily: 'System',
};

jest.mock('../../../core/theme/ThemeProvider', () => ({
  useTheme: () => mockTheme,
}));

const getStyle = (node: any) => StyleSheet.flatten(node?.props?.style) || {};
const getChild = (element: any, index: number) => React.Children.toArray(element?.props?.children || [])[index];

describe('Stepper - rendering', () => {
  it('scales icon container when size tokens change', () => {
    const renderIconMetrics = (size: 'sm' | 'lg') => {
      const utils = render(
        <Stepper active={0} size={size}>
          <Stepper.Step label={`Size ${size}`} />
        </Stepper>
      );

      const iconContainer = utils.UNSAFE_getAllByType(View).find(node => {
        const style = getStyle(node);
        return style.borderWidth === 2 && style.width && style.height;
      });

      const styles = getStyle(iconContainer);
      utils.unmount();
      return styles;
    };

    const small = renderIconMetrics('sm');
    const large = renderIconMetrics('lg');

    expect(large.width).toBeGreaterThan(small.width);
    expect(large.height).toBeGreaterThan(small.height);
    expect(large.borderRadius).toBeCloseTo(large.width / 2, 5);
  });

  it('highlights active labels with accent color', () => {
    const { getByText } = render(
      <Stepper active={1}>
        <Stepper.Step label="One" />
        <Stepper.Step label="Two" />
      </Stepper>
    );

    const activeLabel = getByText('Two');
    const labelStyles = getStyle(activeLabel);

    expect(labelStyles.color).toBe(mockTheme.colors.primary[5]);
    expect(labelStyles.fontWeight).toBe('600');
  });

  it('colors connectors for completed segments and hides the outer edges', () => {
    const utils = render(
      <Stepper active={1} aria-label="progress-stepper">
        <Stepper.Step label="One" />
        <Stepper.Step label="Two" />
        <Stepper.Step label="Three" />
      </Stepper>
    );

    // Each step owns the connector half on either side of its indicator, so the
    // segments read leading/trailing per step, in document order.
    const segments = utils.UNSAFE_getAllByType(View)
      .map(getStyle)
      .filter(style => style.flex === 1 && style.height === 2);

    const accent = mockTheme.colors.primary[5];
    expect(segments.map(style => style.backgroundColor)).toEqual([
      'transparent', // step one, leading (first step)
      accent,        // step one, trailing (completed)
      accent,        // step two, leading (reaches the active step)
      expect.not.stringMatching(accent),
      expect.not.stringMatching(accent),
      'transparent', // step three, trailing (last step)
    ]);
  });

  it('keeps the indicator centered above its label in horizontal orientation', () => {
    const { getByLabelText } = render(
      <Stepper active={0} aria-label="centered-stepper">
        <Stepper.Step label="One" description="First" />
        <Stepper.Step label="Two" description="Second" />
      </Stepper>
    );

    const stepsContainer = getChild(getByLabelText('centered-stepper'), 0);
    expect(getStyle(stepsContainer).flexDirection).toBe('row');

    // The rail row stretches across the step so the two half-connectors center the indicator.
    const railRow = getChild(getChild(getByLabelText('One'), 0), 0);
    expect(getStyle(railRow)).toMatchObject({
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'stretch',
    });
  });

  it('stretches the vertical connector so it reaches the next indicator', () => {
    const { getByLabelText } = render(
      <Stepper active={1} orientation="vertical">
        <Stepper.Step label="Top" aria-label="top-step" description="Lots of supporting copy" />
        <Stepper.Step label="Bottom" aria-label="bottom-step" />
      </Stepper>
    );

    const railColumn = getChild(getChild(getByLabelText('top-step'), 0), 0);
    const connector = getChild(railColumn, 1);
    const connectorStyles = getStyle(connector);

    expect(connectorStyles.flex).toBe(1);
    expect(connectorStyles.width).toBe(2);
    expect(connectorStyles.backgroundColor).toBe(mockTheme.colors.primary[5]);

    // The last step must not draw a trailing line.
    const lastRailColumn = getChild(getChild(getByLabelText('bottom-step'), 0), 0);
    expect(getChild(lastRailColumn, 1)).toBeUndefined();
  });

  it('numbers steps by step order, ignoring completed content and empty children', () => {
    const showOptional = false;
    const { getByText } = render(
      <Stepper active={0}>
        <Stepper.Completed>Done</Stepper.Completed>
        <Stepper.Step label="One" />
        {showOptional && <Stepper.Step label="Optional" />}
        <Stepper.Step label="Two" />
      </Stepper>
    );

    expect(getByText('1')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
  });

  it('switches to column layout for vertical orientation', () => {
    const { getByLabelText } = render(
      <Stepper active={0} orientation="vertical" aria-label="vertical-stepper">
        <Stepper.Step label="Top" />
        <Stepper.Step label="Bottom" />
      </Stepper>
    );

    const root = getByLabelText('vertical-stepper');
    const stepsContainer = getChild(root, 0);
    const containerStyles = getStyle(stepsContainer);

    expect(containerStyles.flexDirection).toBe('column');
  });

  it('reverses row layout when iconPosition="right" in vertical mode', () => {
    const { getByLabelText } = render(
      <Stepper active={0} orientation="vertical" iconPosition="right">
        <Stepper.Step label="Right" aria-label="right-step" />
      </Stepper>
    );

    const stepButton = getByLabelText('right-step');
    const wrapper = getChild(stepButton, 0);
    const wrapperStyles = getStyle(wrapper);

    expect(wrapperStyles.flexDirection).toBe('row-reverse');
  });
});
