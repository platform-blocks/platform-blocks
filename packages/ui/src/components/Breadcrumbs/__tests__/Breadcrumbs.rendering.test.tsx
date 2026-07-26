import React from 'react';
import { View } from 'react-native';
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

jest.mock('../../../core/theme', () => {
  const actual = jest.requireActual('../../../core/theme');
  return {
    ...actual,
    useTheme: () => mockTheme,
  };
});

jest.mock('../../../core/providers/DirectionProvider', () => ({
  useDirection: () => ({ isRTL: false }),
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
    Icon: ({ name, size, color }: any) => (
      React.createElement(View, {
        testID: `icon-${name}`,
        style: { width: size, height: size, backgroundColor: color },
      })
    ),
  };
});

describe('Breadcrumbs - rendering', () => {
  it('matches snapshot for breadcrumb trail with icons', () => {
    const items = [
      { label: 'Home', onPress: () => {}, icon: <Icon name="home" /> },
      { label: 'Projects', onPress: () => {}, icon: <Icon name="folder" /> },
      { label: 'Current' },
    ];

    const { toJSON } = render(
      <Breadcrumbs items={items} separator=">" />
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot for condensed breadcrumbs with custom separator', () => {
    const items = [
      { label: 'Home', onPress: () => {} },
      { label: 'Catalog', onPress: () => {} },
      { label: 'Apparel', onPress: () => {} },
      { label: 'Outerwear', onPress: () => {} },
      { label: 'Parka' },
    ];

    const { toJSON } = render(
      <View style={{ padding: 8 }}>
        <Breadcrumbs
          items={items}
          maxItems={3}
          showIcons={false}
          separator={<View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#D0D5DD' }} />}
        />
      </View>
    );

    expect(toJSON()).toMatchSnapshot();
  });
});
