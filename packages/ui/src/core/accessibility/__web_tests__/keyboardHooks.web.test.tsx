import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { DirectionProvider } from '../../providers/DirectionProvider';
import { useAdjustable } from '../useAdjustable';
import { useRovingFocus } from '../useRovingFocus';

const Tabs = ({ labels }: { labels: string[] }) => {
  const [active, setActive] = useState(0);
  const { getItemProps } = useRovingFocus({ count: labels.length, activeIndex: active, onActiveChange: setActive });
  return (
    <View role="tablist">
      {labels.map((label, i) => (
        <Pressable key={label} role="tab" aria-selected={i === active} {...getItemProps(i)}>
          <Text>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
};

describe('useRovingFocus (DOM)', () => {
  it('keeps one tab stop and moves DOM focus with the arrows', () => {
    render(<Tabs labels={['One', 'Two', 'Three']} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);

    act(() => tabs[0].focus());
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tabs[1]);
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(screen.getAllByRole('tab').map((t) => t.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);

    fireEvent.keyDown(tabs[1], { key: 'End' });
    expect(document.activeElement).toBe(tabs[2]);
  });

  it('reads RTL from DirectionProvider and swaps horizontal arrows', () => {
    render(
      <DirectionProvider initialDirection="rtl">
        <Tabs labels={['One', 'Two', 'Three']} />
      </DirectionProvider>
    );
    const tabs = screen.getAllByRole('tab');
    act(() => tabs[0].focus());
    fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(tabs[1]);
    fireEvent.keyDown(tabs[1], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tabs[0]);
    document.documentElement.dir = 'ltr';
  });
});

const Slider = ({ onChangeEnd }: { onChangeEnd?: (v: number) => void }) => {
  const [value, setValue] = useState(5);
  const { adjustableProps } = useAdjustable({ value, min: 0, max: 10, onChange: setValue, onChangeEnd, label: 'Level' });
  return <View {...adjustableProps} />;
};

describe('useAdjustable (DOM)', () => {
  it('is a focusable slider driven by the keyboard', () => {
    const onChangeEnd = jest.fn();
    render(<Slider onChangeEnd={onChangeEnd} />);
    const slider = screen.getByRole('slider', { name: 'Level' });
    expect(slider.getAttribute('tabindex')).toBe('0');
    expect(slider.getAttribute('aria-valuenow')).toBe('5');

    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(slider.getAttribute('aria-valuenow')).toBe('6');
    fireEvent.keyDown(slider, { key: 'Home' });
    expect(slider.getAttribute('aria-valuenow')).toBe('0');
    fireEvent.keyDown(slider, { key: 'End' });
    expect(slider.getAttribute('aria-valuenow')).toBe('10');
    expect(onChangeEnd).toHaveBeenLastCalledWith(10);
  });

  it('swaps horizontal arrows under RTL', () => {
    render(
      <DirectionProvider initialDirection="rtl">
        <Slider />
      </DirectionProvider>
    );
    const slider = screen.getByRole('slider');
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(slider.getAttribute('aria-valuenow')).toBe('6');
    document.documentElement.dir = 'ltr';
  });
});
