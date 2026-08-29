import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';

import { Checkbox } from '../Checkbox';

jest.mock('../../../core/theme', () => ({
  useTheme: () => ({
    colors: {
      primary: ['#EEE', '#DDD', '#CCC', '#BBB', '#AAA', '#999'],
      gray: ['#f8f8f8', '#f0f0f0', '#d9d9d9', '#bfbfbf', '#a6a6a6', '#8c8c8c', '#737373'],
      error: ['#fee', '#fdd', '#fbb', '#f99', '#f77', '#f55', '#d00'],
    },
    text: {
      primary: '#111',
      secondary: '#666',
      disabled: '#aaa',
      onPrimary: '#fff',
    },
  }),
}));

jest.mock('../styles', () => ({
  useCheckboxStyles: () => ({
    checkboxContainer: {},
    checkbox: {},
    checkboxInner: {},
    container: {},
    labelContainer: {},
    error: {},
  }),
}));

jest.mock('../../_internal/FieldHeader', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const resolveWeight = (w?: any) => {
    if (!w) return undefined;
    if (typeof w === 'number') return String(w);
    const map: Record<string, string> = {
      light: '300', normal: '400', medium: '500', semibold: '600', bold: '700', black: '900',
    };
    return map[w] ?? w;
  };
  const propsToStyle = (props: any) => {
    if (!props) return undefined;
    const { style, weight, size, ff, fontFamily, tracking, uppercase, color } = props;
    const synth: any = {};
    if (weight) synth.fontWeight = resolveWeight(weight);
    if (typeof size === 'number') synth.fontSize = size;
    if (ff || fontFamily) synth.fontFamily = ff ?? fontFamily;
    if (typeof tracking === 'number') synth.letterSpacing = tracking;
    if (uppercase) synth.textTransform = 'uppercase';
    if (color) synth.color = color;
    return [synth, style].filter(Boolean);
  };
  const MockFieldHeader = ({
    label,
    description,
    labelProps,
    descriptionProps,
  }: {
    label: React.ReactNode;
    description?: React.ReactNode;
    labelProps?: any;
    descriptionProps?: any;
  }) => (
    React.createElement(
      React.Fragment,
      null,
      React.createElement(Text, { accessibilityRole: 'text', style: propsToStyle(labelProps) }, label),
      description
        ? React.createElement(Text, { accessibilityRole: 'text', style: propsToStyle(descriptionProps) }, description)
        : null
    )
  );
  return { FieldHeader: MockFieldHeader };
});

jest.mock('../../Icon', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const MockIcon = ({ name }: { name: string }) => React.createElement(Text, null, name);
  return { Icon: MockIcon };
});

jest.mock('../../Layout', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockContainer = ({ children }: { children: React.ReactNode }) => React.createElement(View, null, children);
  return {
    Row: MockContainer,
    Column: MockContainer,
  };
});

jest.mock('../../../core/providers/DirectionProvider', () => ({
  useDirection: () => ({ isRTL: false }),
}));

describe('Checkbox rendering', () => {
  it('renders label and description text when provided', () => {
    const { getByText } = render(
      <Checkbox label="Marketing" description="Choose if you agree" />
    );

    expect(getByText('Marketing')).toBeTruthy();
    expect(getByText('Choose if you agree')).toBeTruthy();
  });

  it('shows error text inline when error prop is set', () => {
    const { getByText } = render(
      <Checkbox label="Terms" error="Required field" />
    );

    expect(getByText('Required field')).toBeTruthy();
  });

  it('renders custom children in place of label content', () => {
    const { getByTestId, queryByText } = render(
      <Checkbox>
        <Text testID="custom-label">Custom Label</Text>
      </Checkbox>
    );

    expect(getByTestId('custom-label')).toBeTruthy();
    expect(queryByText('Custom Label')).toBeTruthy();
  });

  it('renders custom indeterminate icon when provided', () => {
    const { getByTestId } = render(
      <Checkbox
        indeterminate
        indeterminateIcon={<Text testID="dash">-</Text>}
      />
    );

    expect(getByTestId('dash')).toBeTruthy();
  });

  it('forwards labelProps to the label Text via FieldHeader', () => {
    const { getByText } = render(
      <Checkbox
        label="Custom"
        labelProps={{ weight: '700', style: { letterSpacing: 2 } }}
      />
    );
    const flat = StyleSheet.flatten((getByText('Custom') as any).props.style) || {};
    expect(flat).toMatchObject({ fontWeight: '700', letterSpacing: 2 });
  });

  it('forwards descriptionProps to the description Text via FieldHeader', () => {
    const { getByText } = render(
      <Checkbox
        label="Custom"
        description="Helpful copy"
        descriptionProps={{ style: { fontStyle: 'italic' } }}
      />
    );
    const flat = StyleSheet.flatten((getByText('Helpful copy') as any).props.style) || {};
    expect(flat).toMatchObject({ fontStyle: 'italic' });
  });
});
