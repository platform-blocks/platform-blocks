import React, { useMemo } from 'react';
import { View } from 'react-native';

import { factory } from '../../core/factory/factory';
import { extractLayoutProps, getLayoutStyles } from '../../core/utils/layout';
import { extractShadowProps } from '../../core/utils/shadow';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';

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
    // `bg` replaces the level's fill in `useSurfaceStyles`, so it stays out of
    // the style props (one background, resolved once).
    const { bg, ...propsWithoutBg } = allProps;
    const { styleProps, otherProps: propsAfterSpacing } = extractStyleProps(propsWithoutBg);
    const { shadowProps, otherProps: propsAfterShadow } = extractShadowProps(propsAfterSpacing);
    const { layoutProps, otherProps } = extractLayoutProps(propsAfterShadow);

    const {
      children,
      level,
      raised,
      withBorder,
      borderColor,
      borderWidth,
      padding,
      radius = 'md',
      style,
      testID,
      ...rest
    } = otherProps;

    const spacingStyle = useStyleProps(styleProps);

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
            spacingStyle,
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
