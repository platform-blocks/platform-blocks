import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react';

import { useHover } from '../useHover';

function HoverView() {
  const [hovered, handlers] = useHover();
  return (
    <View testID="target" {...handlers}>
      <Text>{hovered ? 'hovered' : 'idle'}</Text>
    </View>
  );
}

function HoverPressable() {
  const [hovered, handlers] = useHover();
  return (
    <Pressable testID="target" role="button" {...handlers}>
      <Text>{hovered ? 'hovered' : 'idle'}</Text>
    </Pressable>
  );
}

describe('useHover (web)', () => {
  it('tracks hover on a plain View through the DOM mouse events', () => {
    render(<HoverView />);
    const target = screen.getByTestId('target');
    fireEvent.mouseEnter(target);
    expect(screen.getByText('hovered')).toBeTruthy();
    fireEvent.mouseLeave(target);
    expect(screen.getByText('idle')).toBeTruthy();
  });

  it('works when spread onto a Pressable', () => {
    render(<HoverPressable />);
    const target = screen.getByRole('button');
    fireEvent.mouseEnter(target);
    expect(screen.getByText('hovered')).toBeTruthy();
    fireEvent.mouseLeave(target);
    expect(screen.getByText('idle')).toBeTruthy();
  });
});
