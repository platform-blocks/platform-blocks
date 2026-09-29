/**
 * Knob - box props size the root: the wrapper View without a label, the label
 * layout with one. The knob surface keeps its own `size`.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';

import { Knob } from '../Knob';

const stylesOf = (element: React.ReactElement) => {
  const { toJSON, getByTestId } = render(element);
  return {
    root: StyleSheet.flatten((toJSON() as any).props.style),
    surface: StyleSheet.flatten(getByTestId('knob').props.style),
  };
};

describe('Knob - box props', () => {
  it('sizes the wrapper, not the surface; an explicit `w` wins over `fullWidth`', () => {
    const { root, surface } = stylesOf(<Knob testID="knob" defaultValue={10} fullWidth w={240} />);
    expect(root.width).toBe(240);
    expect(surface.width).not.toBe(240);
  });

  it('sizes the label layout when there is a label', () => {
    const { root } = stylesOf(<Knob testID="knob" label="Volume" defaultValue={10} fullWidth w={240} />);
    expect(root.width).toBe(240);
  });
});
