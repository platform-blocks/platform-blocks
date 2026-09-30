import React from 'react';
import { View } from 'react-native';
import { factory } from '../../core/factory/factory';
import { createThemedStyles } from '../../core/hooks/useThemedStyles';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveRadius, resolveShadow, resolveSpacing } from '../../core/theme/tokens';
import type { PlocksTheme } from '../../core/theme/types';
import { resolveStyleProps, extractStyleProps } from '../../core/utils/spacing';
import type { FormLayoutProps } from './types';

const getLayoutStyles = createThemedStyles(
  (theme: PlocksTheme, variant: NonNullable<FormLayoutProps['variant']>, spacing: NonNullable<FormLayoutProps['spacing']>) => {
    const gap = resolveSpacing(theme, spacing) as number;
    const padding = resolveSpacing(theme, 'xl') as number;
    const base = { width: '100%' as const, alignSelf: 'center' as const, gap };
    if (variant === 'card') {
      return {
        ...base,
        backgroundColor: theme.backgrounds.subtle,
        borderRadius: resolveRadius(theme, 'lg'),
        padding,
        borderWidth: 1,
        borderColor: theme.backgrounds.border,
      };
    }
    if (variant === 'modal') {
      return {
        ...base,
        backgroundColor: theme.backgrounds.surface,
        borderRadius: resolveRadius(theme, 'xl'),
        padding,
        ...resolveShadow(theme, 'md'),
      };
    }
    return { ...base, backgroundColor: 'transparent', padding: 0 };
  }
);

/** Centered column for a form (`maw` 600 by default), with spacing between its sections/fields. */
export const FormLayout = factory<{ props: FormLayoutProps; ref: View }>(
  (props, ref) => {
    const { styleProps, otherProps } = extractStyleProps(props);
    const { children, spacing = 'lg', variant = 'default', style, testID } = otherProps;
    const theme = useTheme();
    const boxStyle = resolveStyleProps({ ...styleProps, maw: styleProps.maw ?? 600 }, theme);

    return (
      <View ref={ref} testID={testID} style={[getLayoutStyles(theme, variant, spacing), boxStyle, style]}>
        {children}
      </View>
    );
  },
  { displayName: 'FormLayout' }
);
