import React, { useMemo } from 'react';
import { View } from 'react-native';

import { factory } from '../../core/factory';
import {
  extractLayoutProps,
  extractShadowProps,
  extractSpacingProps,
  getLayoutStyles,
  getSpacingStyles,
} from '../../core/utils';

import { SurfaceContext } from './SurfaceContext';
import { useSurfaceStyles } from './useSurfaceStyles';
import type { SurfaceProps } from './types';

/**
 * The base container every other elevated component is built from — the
 * "paper" primitive.
 *
 * A Surface owns exactly one decision: how far off the page it sits. Level
 * drives background, border color and default shadow as a set, which is what
 * stops individual components from reaching into the palette and picking a
 * background that belongs to no elevation at all (the reason Menu dropdowns
 * used to render mid-grey).
 *
 * @example
 * ```tsx
 * // A panel on the page
 * <Surface level={1} padding="md" radius="lg">…</Surface>
 *
 * // A dropdown floating over that panel — no hard-coded level needed
 * <Surface raised>…</Surface>
 * ```
 */
export const Surface = factory<{ props: SurfaceProps; ref: View }>(
  (allProps, ref) => {
    const { spacingProps, otherProps: propsAfterSpacing } = extractSpacingProps(allProps as any);
    const { shadowProps, otherProps: propsAfterShadow } = extractShadowProps(propsAfterSpacing);
    const { layoutProps, otherProps } = extractLayoutProps(propsAfterShadow);

    const {
      children,
      level,
      raised,
      withBorder,
      borderColor,
      borderWidth,
      bg,
      padding,
      radius = 'md',
      style,
      testID,
      ...rest
    } = otherProps as SurfaceProps;

    const surface = useSurfaceStyles({
      level,
      raised,
      withBorder,
      borderColor,
      borderWidth,
      bg,
      padding,
      radius,
      shadow: shadowProps.shadow,
    });

    const contextValue = useMemo(() => ({ level: surface.level }), [surface.level]);

    return (
      <SurfaceContext.Provider value={contextValue}>
        <View
          ref={ref}
          testID={testID}
          {...rest}
          style={[
            surface.style,
            surface.shadowStyle,
            getSpacingStyles(spacingProps),
            getLayoutStyles(layoutProps),
            style,
          ]}
        >
          {children}
        </View>
      </SurfaceContext.Provider>
    );
  },
  { displayName: 'Surface' }
);
