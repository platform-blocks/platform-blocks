import React, { createContext, useContext } from 'react';
import { View } from 'react-native';
import { factory, withStatics } from '../../core/factory';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveAccentColor } from '../../core/theme/resolveColors';
import { withAlpha } from '../../core/theme/colorUtils';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { Text } from '../Text';
import type { EmptyStateActionsProps, EmptyStateDescriptionProps, EmptyStateIndicatorProps, EmptyStateProps, EmptyStateTitleProps } from './types';

const sizes = { xs: [48, 8, 16, 13], sm: [56, 10, 18, 14], md: [64, 12, 20, 15], lg: [76, 16, 23, 16], xl: [88, 20, 26, 18] } as const;
type State = Pick<EmptyStateProps, 'align' | 'variant' | 'color' | 'withIndicatorBackground' | 'size'>;
const Context = createContext<State>({ align: 'center', size: 'md' });

export const EmptyStateIndicator = factory<{ props: EmptyStateIndicatorProps; ref: View }>((all, ref) => {
  const { styleProps, otherProps: { children, style, testID } } = extractStyleProps(all);
  const spacing = useStyleProps(styleProps);
  const { variant, color, withIndicatorBackground, size = 'md', align } = useContext(Context);
  const theme = useTheme();
  const diameter = sizes[size][0];
  const accent = resolveAccentColor(theme, color || 'primary') || theme.colors.primary[5];
  const backgroundColor = variant === 'filled' ? accent : variant === 'light' ? withAlpha(accent, 0.14) : withIndicatorBackground ? theme.backgrounds.subtle : undefined;
  return <View ref={ref} testID={testID} style={[{ width: diameter, height: diameter, borderRadius: diameter / 2, alignItems: 'center', justifyContent: 'center', alignSelf: align === 'center' ? 'center' : align === 'end' ? 'flex-end' : 'flex-start', backgroundColor }, spacing, style]}>{children}</View>;
}, { displayName: 'EmptyState.Indicator' });

export const EmptyStateTitle = factory<{ props: EmptyStateTitleProps; ref: View }>((all, ref) => {
  const { styleProps, otherProps: { children, order, style, testID } } = extractStyleProps(all);
  const spacing = useStyleProps(styleProps);
  const { size = 'md', align } = useContext(Context);
  const theme = useTheme();
  return <Text ref={ref as never} testID={testID} role={order ? 'heading' : undefined} aria-level={order} style={[{ fontSize: sizes[size][2], fontWeight: '600', color: theme.text.primary, textAlign: align === 'center' ? 'center' : align === 'end' ? 'right' : 'left' }, spacing, style]}>{children}</Text>;
}, { displayName: 'EmptyState.Title' });

export const EmptyStateDescription = factory<{ props: EmptyStateDescriptionProps; ref: View }>((all, ref) => {
  const { styleProps, otherProps: { children, style, testID } } = extractStyleProps(all);
  const spacing = useStyleProps(styleProps);
  const { size = 'md', align } = useContext(Context);
  const theme = useTheme();
  return <Text ref={ref as never} testID={testID} style={[{ fontSize: sizes[size][3], color: theme.text.secondary, textAlign: align === 'center' ? 'center' : align === 'end' ? 'right' : 'left' }, spacing, style]}>{children}</Text>;
}, { displayName: 'EmptyState.Description' });

export const EmptyStateActions = factory<{ props: EmptyStateActionsProps; ref: View }>((all, ref) => {
  const { styleProps, otherProps: { children, style, testID } } = extractStyleProps(all);
  const spacing = useStyleProps(styleProps);
  const { align } = useContext(Context);
  return <View ref={ref} testID={testID} style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: align === 'center' ? 'center' : align === 'end' ? 'flex-end' : 'flex-start' }, spacing, style]}>{children}</View>;
}, { displayName: 'EmptyState.Actions' });

const Root = factory<{ props: EmptyStateProps; ref: View }>((all, ref) => {
  const { styleProps, otherProps: { icon, title, description, children, align = 'center', variant, color, withIndicatorBackground, size = 'md', style, testID } } = extractStyleProps(all);
  const spacing = useStyleProps(styleProps);
  const gap = sizes[size][1];
  return <Context.Provider value={{ align, variant, color, withIndicatorBackground, size }}><View ref={ref} testID={testID} style={[{ alignItems: align === 'center' ? 'center' : align === 'end' ? 'flex-end' : 'flex-start', gap, width: '100%' }, spacing, style]}>
    {icon != null && <EmptyStateIndicator>{icon}</EmptyStateIndicator>}
    {title != null && <EmptyStateTitle>{title}</EmptyStateTitle>}
    {description != null && <EmptyStateDescription>{description}</EmptyStateDescription>}
    {children}
  </View></Context.Provider>;
}, { displayName: 'EmptyState' });
export const EmptyState = withStatics(Root, { Indicator: EmptyStateIndicator, Title: EmptyStateTitle, Description: EmptyStateDescription, Actions: EmptyStateActions });
