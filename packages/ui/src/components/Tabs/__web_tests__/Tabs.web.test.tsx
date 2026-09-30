import React, { useState } from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { DirectionProvider } from '../../../core/providers/DirectionProvider';
import { Tabs } from '../Tabs';
import type { TabsProps } from '../types';

const ITEMS: TabsProps['items'] = [
  { key: 'one', label: 'One', content: <Text>Panel one</Text> },
  { key: 'two', label: 'Two', content: <Text>Panel two</Text> },
  { key: 'three', label: 'Three', content: <Text>Panel three</Text> },
];

function renderTabs(props: Partial<TabsProps> = {}) {
  return render(
    <PlocksProvider>
      <Tabs items={ITEMS} autoPersist={false} {...props} />
    </PlocksProvider>
  );
}

describe('Tabs (react-native-web DOM)', () => {
  it('renders the tablist / tab / tabpanel pattern with aria wiring', () => {
    renderTabs();
    const tablist = screen.getByRole('tablist');
    expect(tablist.getAttribute('aria-orientation')).toBe('horizontal');

    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.textContent)).toEqual(['One', 'Two', 'Three']);
    expect(tabs.map((t) => t.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
    // One tab stop for the whole list.
    expect(tabs.map((t) => t.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);

    const panel = screen.getByRole('tabpanel');
    expect(panel.textContent).toBe('Panel one');
    expect(tabs[0].getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-labelledby')).toBe(tabs[0].id);
    expect(screen.getByRole('tabpanel', { name: 'One' })).toBe(panel);
  });

  it('moves focus and selection with the arrow keys, Home and End (automatic activation)', () => {
    const onChange = jest.fn();
    renderTabs({ onChange });
    const tabs = screen.getAllByRole('tab');

    act(() => tabs[0].focus());
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(screen.getAllByRole('tab')[1]);
    expect(onChange).toHaveBeenLastCalledWith('two');
    expect(screen.getAllByRole('tab')[1].getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel').textContent).toBe('Panel two');

    fireEvent.keyDown(document.activeElement!, { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith('three');

    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith('one');

    // Wraps around from the first tab.
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith('three');
  });

  it('flips horizontal arrows under RTL', () => {
    const onChange = jest.fn();
    render(
      <PlocksProvider>
        <DirectionProvider initialDirection="rtl">
          <Tabs items={ITEMS} autoPersist={false} onChange={onChange} />
        </DirectionProvider>
      </PlocksProvider>
    );
    const tabs = screen.getAllByRole('tab');
    act(() => tabs[0].focus());
    fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith('two');
    document.documentElement.dir = 'ltr';
  });

  it('uses up/down arrows and aria-orientation="vertical" for vertical tabs', () => {
    const onChange = jest.fn();
    renderTabs({ orientation: 'vertical', onChange });
    expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe('vertical');
    const tabs = screen.getAllByRole('tab');
    act(() => tabs[0].focus());
    fireEvent.keyDown(tabs[0], { key: 'ArrowDown' });
    expect(onChange).toHaveBeenLastCalledWith('two');
  });

  it('manual activation moves focus only; Enter/Space selects', () => {
    const onChange = jest.fn();
    renderTabs({ activationMode: 'manual', onChange });
    const tabs = screen.getAllByRole('tab');
    act(() => tabs[0].focus());
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(screen.getAllByRole('tab')[1]);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getAllByRole('tab')[1].getAttribute('tabindex')).toBe('0');

    fireEvent.keyDown(document.activeElement!, { key: ' ' });
    expect(onChange).toHaveBeenCalledWith('two');
  });

  it('skips disabled tabs and marks them aria-disabled', () => {
    const onChange = jest.fn();
    renderTabs({ disabledKeys: ['two'], onChange });
    const tabs = screen.getAllByRole('tab');
    expect(tabs[1].getAttribute('aria-disabled')).toBe('true');
    act(() => tabs[0].focus());
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('three');
  });

  it('selects on click and works controlled', () => {
    function Controlled() {
      const [value, setValue] = useState('one');
      return (
        <PlocksProvider>
          <Tabs items={ITEMS} value={value} onChange={setValue} />
        </PlocksProvider>
      );
    }
    render(<Controlled />);
    fireEvent.click(screen.getByRole('tab', { name: 'Three' }));
    expect(screen.getByRole('tab', { name: 'Three' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel').textContent).toBe('Panel three');
  });

  it('navigationOnly renders no tabpanel and no aria-controls', () => {
    renderTabs({ navigationOnly: true });
    expect(screen.queryByRole('tabpanel')).toBeNull();
    expect(screen.getAllByRole('tab')[0].getAttribute('aria-controls')).toBeNull();
  });
});
