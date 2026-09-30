import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, StyleSheet } from 'react-native';

import { Tabs } from '../Tabs';

jest.mock('../../../core/providers/DirectionProvider', () => ({
  useDirection: () => ({
    dir: 'ltr',
    isRTL: false,
    setDirection: jest.fn(),
    toggleDirection: jest.fn(),
  }),
}));

describe('Tabs', () => {
  const createItems = (examplesCount = 6) => ([
    {
      key: 'examples',
      label: `Examples (${examplesCount})`,
      content: <Text>Examples content</Text>,
    },
    {
      key: 'properties',
      label: 'Properties (21)',
      content: <Text>Properties content</Text>,
    },
  ]);

  const emitLayout = (
    node: any,
    layout: { x: number; y: number; width: number; height: number }
  ) => {
    fireEvent(node, 'layout', { nativeEvent: { layout } });
  };

  it('calls onChange when a new tab is pressed', () => {
    const onChange = jest.fn();
    const { getAllByRole } = render(
      <Tabs items={createItems()} onChange={onChange} />
    );

    const tabs = getAllByRole('tab');
    fireEvent.press(tabs[1]);

    expect(onChange).toHaveBeenCalledWith('properties');
  });

  it('supports defaultValue when uncontrolled', () => {
    const { getByText } = render(
      <Tabs items={createItems()} defaultValue="properties" autoPersist={false} />
    );
    expect(getByText('Properties content')).toBeTruthy();
  });

  it('does not fire onChange when the active tab is pressed again', () => {
    const onChange = jest.fn();
    const { getAllByRole } = render(<Tabs items={createItems()} onChange={onChange} autoPersist={false} />);
    fireEvent.press(getAllByRole('tab')[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('invokes onDisabledTabPress instead of onChange for disabled tabs', () => {
    const onChange = jest.fn();
    const onDisabled = jest.fn();
    const items = [
      { key: 'examples', label: 'Examples', content: <Text>Examples</Text> },
      { key: 'blocked', label: 'Blocked', disabled: true, content: <Text>Blocked</Text> },
    ];

    const { getAllByRole } = render(
      <Tabs items={items} onChange={onChange} onDisabledTabPress={onDisabled} />
    );

    const tabs = getAllByRole('tab');
    fireEvent.press(tabs[1]);

    expect(onChange).not.toHaveBeenCalled();
    expect(onDisabled).toHaveBeenCalledWith('blocked', expect.objectContaining({ key: 'blocked' }));
  });

  it('recalculates chip indicator position when preceding labels change size', () => {
    const { getAllByRole, getByTestId, rerender } = render(
      <Tabs variant="chip" items={createItems(6)} />
    );

    const measureTabs = (examplesWidth: number, propertiesX: number) => {
      const [examplesTab, propertiesTab] = getAllByRole('tab');
      emitLayout(examplesTab, { x: 0, y: 0, width: examplesWidth, height: 44 });
      emitLayout(propertiesTab, { x: propertiesX, y: 0, width: 160, height: 44 });
      return propertiesTab;
    };

    const propertiesTab = measureTabs(120, 120);
    fireEvent.press(propertiesTab);

    const indicatorBefore = StyleSheet.flatten(getByTestId('tabs-indicator', { includeHiddenElements: true }).props.style);
    expect(indicatorBefore.left).toBe(120);

    rerender(<Tabs variant="chip" items={createItems(12)} />);
    measureTabs(150, 150);

    const indicatorAfter = StyleSheet.flatten(getByTestId('tabs-indicator', { includeHiddenElements: true }).props.style);
    expect(indicatorAfter.left).toBe(150);
  });

  it('forwards labelProps to every tab label Text', () => {
    const { getByText } = render(
      <Tabs
        items={createItems(6)}
        labelProps={{ fw: '700', style: { letterSpacing: 1.5 } }}
      />
    );
    const flat = StyleSheet.flatten((getByText('Examples (6)') as any).props.style) || {};
    expect(flat).toMatchObject({ fontWeight: '700', letterSpacing: 1.5 });
  });

  it('renders a count beside a navigation-only tab', () => {
    const { getByText } = render(
      <Tabs
        navigationOnly
        items={[{ key: 'saved', label: 'Saved', subLabel: '3', content: null }]}
      />
    );

    expect(getByText('Saved')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
  });
});
