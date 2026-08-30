import React from 'react';
import { Text, View } from 'react-native';
import { render } from '@testing-library/react-native';

import { Card } from '../Card';

const mockTheme = {
  backgrounds: {
    surface: '#FFFFFF',
    border: '#E4E7EC',
    subtle: '#F8FAFC',
    elevated: '#F4F6FB',
  },
  colors: {
    primary: ['#EEF2FF', '#E0E7FF', '#C7D2FE', '#A5B4FC', '#818CF8', '#6366F1', '#4F46E5', '#4338CA'],
  },
  primaryColor: '#6366F1',
  semantic: {
    borderSubtle: '#CBD5F5',
  },
  shadows: {
    xs: '0px 1px 2px rgba(16, 24, 40, 0.1)',
    sm: '0px 1px 3px rgba(16, 24, 40, 0.1)',
    md: '0px 4px 6px rgba(16, 24, 40, 0.1)',
    lg: '0px 10px 15px rgba(16, 24, 40, 0.05)',
    none: 'none',
  },
};

jest.mock('../../../core/theme', () => {
  const actual = jest.requireActual('../../../core/theme');
  return {
    ...actual,
    useTheme: () => mockTheme,
  };
});

jest.mock('../../../utils/optionalDependencies', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    resolveLinearGradient: () => ({
      LinearGradient: ({ children, ...rest }: any) => (
        React.createElement(View, { testID: 'card-gradient', ...rest }, children)
      ),
      hasLinearGradient: true,
    }),
  };
});

describe('Card - rendering', () => {
  it('matches snapshot for filled card with vertical stack', () => {
    const { toJSON } = render(
      <Card {...({ testID: 'filled-card' } as any)} p="lg" style={{ gap: 8 }}>
        <Text accessibilityRole="header">Project Alpha</Text>
        <Text>Craft delightful experiences with React UI Library components.</Text>
      </Card>
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot for gradient showcase within container', () => {
    const { toJSON } = render(
      <View style={{ padding: 24 }}>
        <Card
          {...({ testID: 'gradient-card' } as any)}
          variant="gradient"
          radius="lg"
          style={{ minHeight: 120 }}
        >
          <Text accessibilityRole="header" style={{ color: '#FFFFFF', fontWeight: '600' }}>
            Inspiration Mode
          </Text>
          <Text style={{ color: '#EEF2FF' }}>
            Blend gradients and shadows for elevated storytelling layouts.
          </Text>
        </Card>
      </View>
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('Card.Section escapes the parent padding via negative margins', () => {
    const flatten = (node: any) => {
      const styles = Array.isArray(node.props.style) ? node.props.style : [node.props.style];
      return styles.reduce((acc: any, s: any) => ({ ...acc, ...(s || {}) }), {});
    };
    const { getByTestId, getByText } = render(
      <Card padding={20} testID="card-with-sections" withBorder>
        <Card.Section testID="section-first">
          <Text>banner</Text>
        </Card.Section>
        <Text>middle content</Text>
        <Card.Section withBorder testID="section-last">
          <Text>footer</Text>
        </Card.Section>
      </Card>
    );

    // First section escapes top + horizontal padding
    const first = getByTestId('section-first');
    const firstStyle = flatten(first);
    expect(firstStyle.marginLeft).toBe(-20);
    expect(firstStyle.marginRight).toBe(-20);
    expect(firstStyle.marginTop).toBe(-20);
    expect(firstStyle.marginBottom).toBe(0);

    // Last section escapes bottom + horizontal, and has a top divider (withBorder + not first)
    const last = getByTestId('section-last');
    const lastStyle = flatten(last);
    expect(lastStyle.marginLeft).toBe(-20);
    expect(lastStyle.marginRight).toBe(-20);
    expect(lastStyle.marginTop).toBe(0);
    expect(lastStyle.marginBottom).toBe(-20);
    expect(lastStyle.borderTopWidth).toBe(1);

    // Sanity — content rendered
    expect(getByText('banner')).toBeTruthy();
    expect(getByText('middle content')).toBeTruthy();
    expect(getByText('footer')).toBeTruthy();
  });

  it('Card.Section in the middle escapes only horizontal padding', () => {
    const flatten = (node: any) => {
      const styles = Array.isArray(node.props.style) ? node.props.style : [node.props.style];
      return styles.reduce((acc: any, s: any) => ({ ...acc, ...(s || {}) }), {});
    };
    // Three sections so the middle one is neither first nor last
    const { getByTestId } = render(
      <Card padding={16} testID="card">
        <Card.Section testID="s1"><Text>a</Text></Card.Section>
        <Card.Section testID="s2"><Text>b</Text></Card.Section>
        <Card.Section testID="s3"><Text>c</Text></Card.Section>
      </Card>
    );
    const mid = flatten(getByTestId('s2'));
    expect(mid.marginLeft).toBe(-16);
    expect(mid.marginRight).toBe(-16);
    expect(mid.marginTop).toBe(0);
    expect(mid.marginBottom).toBe(0);
  });
});
