import React from 'react';
import { Text, View } from 'react-native';
import { render } from '@testing-library/react-native';

import { Accordion } from '../Accordion';
import { Icon } from '../../Icon';

const mockTheme = {
  colors: {
    gray: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5f5', '#94a3b8', '#64748b', '#475569'],
  },
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    disabled: '#94a3b8',
  },
  backgrounds: {
    base: '#ffffff',
    subtle: '#f8fafc',
    surface: '#ffffff',
    elevated: '#ffffff',
    border: '#e2e8f0',
  },
};

jest.mock('../../../core/theme', () => {
  const actual = jest.requireActual('../../../core/theme');
  return {
    ...actual,
    useTheme: () => mockTheme,
  };
});

jest.mock('../../Text', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Text: ({ children, ...rest }: any) => React.createElement(Text, rest, children),
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

jest.mock('../../Collapse', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Collapse: ({ isCollapsed, children, contentStyle }: any) => (
      isCollapsed ? null : React.createElement(View, { style: contentStyle }, children)
    ),
  };
});

describe('Accordion - rendering', () => {
  beforeEach(() => {
    delete (globalThis as any).__PLATFORM_BLOCKS_ACCORDION_PERSIST__;
  });

  const baseItems = [
    { key: 'one', title: 'Overview', content: <Text>High level summary</Text>, icon: <Icon name="info" /> },
    { key: 'two', title: 'Details', content: <Text>Deep dive copy</Text>, icon: <Icon name="layers" /> },
    { key: 'three', title: 'Notes', content: <Text>Action items</Text> },
  ];

  it('matches snapshot for default accordion with icons and comfortable density', () => {
    const { toJSON } = render(
      <Accordion
        items={baseItems}
        defaultExpanded={[baseItems[0].key]}
        variant="default"
        size="lg"
        density="comfortable"
      />
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot for separated compact accordion without chevrons', () => {
    const { toJSON } = render(
      <View style={{ padding: 12 }}>
        <Accordion
          items={baseItems}
          type="multiple"
          variant="separated"
          density="compact"
          showChevron={false}
          chevronPosition="start"
          defaultExpanded={['two', 'three']}
        />
      </View>
    );

    expect(toJSON()).toMatchSnapshot();
  });
});
