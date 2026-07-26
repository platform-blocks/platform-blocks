import React from 'react';
import { StyleSheet, View } from 'react-native';
import { render } from '@testing-library/react-native';

import { Breadcrumbs } from '../Breadcrumbs';
import { Icon } from '../../Icon';

const mockTheme = {
  text: {
    primary: '#111111',
    secondary: '#666666',
    muted: '#999999',
  },
};

const mockIconRender = jest.fn();
let mockIsRTL = false;

jest.mock('../../../core/theme', () => {
  const actual = jest.requireActual('../../../core/theme');
  return {
    ...actual,
    useTheme: () => mockTheme,
  };
});

jest.mock('../../../core/providers/DirectionProvider', () => ({
  useDirection: () => ({ isRTL: mockIsRTL }),
}));

jest.mock('../../Text', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Text: ({ size, colorVariant, weight, style, children, ...rest }: any) => (
      React.createElement(
        Text,
        {
          ...rest,
          style: [
            {
              fontSize: size,
              color: typeof colorVariant === 'string'
                ? (mockTheme.text as Record<string, string>)[colorVariant] ?? colorVariant
                : colorVariant,
              fontWeight: weight,
            },
            style,
          ].filter(Boolean),
        },
        children
      )
    ),
  };
});

jest.mock('../../Icon', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Icon: ({ name, size, color }: any) => {
      mockIconRender({ name, size, color });
      return React.createElement(View, {
        testID: `icon-${name}`,
        style: { width: size, height: size, backgroundColor: color },
      });
    },
  };
});

describe('Breadcrumbs - behavior', () => {
  beforeEach(() => {
    mockIsRTL = false;
    mockIconRender.mockClear();
  });

  it('renders separators and highlights the current item with primary text color', () => {
    const items = [
      { label: 'Home', onPress: jest.fn() },
      { label: 'Projects', onPress: jest.fn() },
      { label: 'Current' },
    ];

    const { getAllByText, getByText } = render(
      <Breadcrumbs items={items} separator="/" showIcons={false} />
    );

    expect(getAllByText('/')).toHaveLength(items.length - 1);

    const currentStyles = StyleSheet.flatten(getByText('Current').props.style);
    const previousStyles = StyleSheet.flatten(getByText('Home').props.style);
    expect(currentStyles.color).toBe(mockTheme.text.primary);
    expect(previousStyles.color).toBe(mockTheme.text.secondary);
  });

  it('collapses middle items when maxItems is exceeded', () => {
    const items = [
      { label: 'Home', onPress: jest.fn() },
      { label: 'Products', onPress: jest.fn() },
      { label: 'Furniture', onPress: jest.fn() },
      { label: 'Office', onPress: jest.fn() },
      { label: 'Desks' },
    ];

    const { getByText, queryByText } = render(
      <Breadcrumbs items={items} maxItems={3} showIcons={false} />
    );

    expect(getByText('...')).toBeTruthy();
    expect(queryByText('Furniture')).toBeNull();
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Desks')).toBeTruthy();
  });

  it('reverses item order when direction context is RTL', () => {
    const items = [
      { label: 'Home', onPress: jest.fn() },
      { label: 'Library', onPress: jest.fn() },
      { label: 'Chapter' },
    ];

    const collectLabelSequence = (tree: any, labels: Set<string>, acc: string[] = []) => {
      if (!tree) return acc;
      if (typeof tree === 'string') {
        if (labels.has(tree)) acc.push(tree);
        return acc;
      }
      const children = Array.isArray(tree.children) ? tree.children : [];
      children.forEach((child: any) => collectLabelSequence(child, labels, acc));
      return acc;
    };

    const labelSet = new Set(items.map(item => item.label));

    const renderSequence = () => collectLabelSequence(
      render(
        <Breadcrumbs
          items={items}
          showIcons={false}
          separator={<View testID="custom-separator" />}
        />
      ).toJSON(),
      labelSet,
    );

    mockIsRTL = false;
    const ltr = renderSequence();
    mockIsRTL = true;
    const rtl = renderSequence();

    expect(ltr).toEqual(['Home', 'Library', 'Chapter']);
    expect(rtl).toEqual(['Chapter', 'Library', 'Home']);
  });

  it('omits icon rendering when showIcons=false and supports numeric sizing', () => {
    const items = [
      { label: 'Home', onPress: jest.fn(), icon: <Icon name="home" /> },
      { label: 'Details' },
    ];

    const { getByText } = render(
      <Breadcrumbs items={items} showIcons={false} size={22} />
    );

    expect(mockIconRender).not.toHaveBeenCalled();
    const textStyles = StyleSheet.flatten(getByText('Home').props.style);
    expect(textStyles.fontSize).toBe(22);
  });
});
