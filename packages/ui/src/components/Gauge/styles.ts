import { useMemo } from 'react';
import type { ViewStyle } from 'react-native';

import type { GaugeStyleProps } from './types';

/** The gauge's root box: a square of `size`, dimmed while disabled. */
export const useGaugeStyles = ({ size, disabled }: GaugeStyleProps) =>
  useMemo(() => {
    const container: ViewStyle = {
      position: 'relative',
      width: size,
      height: size,
      opacity: disabled ? 0.5 : 1,
    };
    return { container };
  }, [size, disabled]);
