import React from 'react';
import type { View } from 'react-native';

import { factory } from '../../core/factory/factory';
import { resolveLinearGradient } from '../../utils/optionalDependencies';
import { Block } from '../Block';
import type { BlockProps } from '../Block';

const { LinearGradient } = resolveLinearGradient();

export interface GradientProps extends Omit<BlockProps, 'component' | 'start' | 'end'> {
  colors: readonly string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  locations?: readonly number[];
}

/** A gradient surface with Block's named layout and spacing props. */
export const Gradient = factory<{ props: GradientProps; ref: View }>((props, ref) => {
  const { colors, start, end, locations, ...blockProps } = props;
  return <Block {...{ ...blockProps, colors, start, end, locations } as BlockProps}
    component={LinearGradient} ref={ref} gap={blockProps.gap ?? 0} />;
}, { displayName: 'Gradient' });
