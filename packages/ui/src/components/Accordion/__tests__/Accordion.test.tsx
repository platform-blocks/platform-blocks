import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import { Accordion } from '../Accordion';

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

describe('Accordion - behavior', () => {
  beforeEach(() => {
    delete (globalThis as any).__PLATFORM_BLOCKS_ACCORDION_PERSIST__;
  });

  const baseItems = [
    { key: 'alpha', title: 'Alpha', content: <Text>Panel alpha</Text> },
    { key: 'beta', title: 'Beta', content: <Text>Panel beta</Text> },
    { key: 'gamma', title: 'Gamma', content: <Text>Panel gamma</Text> },
  ];

  it('toggles items in single mode and emits expanded change events', () => {
    const onExpandedChange = jest.fn();
    const onItemToggle = jest.fn();

    const { getAllByRole, getByText, queryByText } = render(
      <Accordion items={baseItems} onExpandedChange={onExpandedChange} onItemToggle={onItemToggle} />
    );

    const triggers = getAllByRole('button');
    fireEvent.press(triggers[0]);
    expect(getByText('Panel alpha')).toBeTruthy();
    expect(onExpandedChange).toHaveBeenLastCalledWith(['alpha']);
    expect(onItemToggle).toHaveBeenCalledWith(expect.objectContaining({ itemKey: 'alpha', expanded: true }));

    fireEvent.press(triggers[1]);
    expect(queryByText('Panel alpha')).toBeNull();
    expect(getByText('Panel beta')).toBeTruthy();
    expect(onExpandedChange).toHaveBeenLastCalledWith(['beta']);
  });

  it('keeps independent state when type="multiple"', () => {
    const { getAllByRole, getByText } = render(
      <Accordion items={baseItems} type="multiple" />
    );

    const triggers = getAllByRole('button');
    fireEvent.press(triggers[0]);
    fireEvent.press(triggers[1]);

    expect(getByText('Panel alpha')).toBeTruthy();
    expect(getByText('Panel beta')).toBeTruthy();

    fireEvent.press(triggers[0]);
    expect(getByText('Panel beta')).toBeTruthy();
  });

  it('does not toggle disabled items', () => {
    const onExpandedChange = jest.fn();
    const items = [
      baseItems[0],
      { ...baseItems[1], disabled: true },
    ];

    const { getAllByRole } = render(
      <Accordion items={items} defaultExpanded={['beta']} onExpandedChange={onExpandedChange} />
    );

    fireEvent.press(getAllByRole('button')[1]);
    expect(onExpandedChange).not.toHaveBeenCalled();
  });

  it('respects controlled expanded prop by delegating state outward', () => {
    const Controlled: React.FC = () => {
      const [expanded, setExpanded] = React.useState<string[]>(['alpha']);
      return (
        <Accordion
          items={baseItems}
          expanded={expanded}
          onExpandedChange={setExpanded}
          type="single"
        />
      );
    };

    const { getAllByRole, queryByText, getByText } = render(<Controlled />);

    const triggers = getAllByRole('button');
    fireEvent.press(triggers[1]);

    expect(queryByText('Panel alpha')).toBeNull();
    expect(getByText('Panel beta')).toBeTruthy();
  });
});
