import { StyleSheet, Platform } from 'react-native';
import { createInputStyles } from '../Input/styles';
import { TextAreaProps } from './types';
import { PlatformBlocksTheme, SizeValue } from '../../core/theme/types';
import { DESIGN_TOKENS } from '../../core/design-tokens';
import { resolveComponentSize, type ComponentSize } from '../../core/theme/componentSize';

interface TextAreaStyleProps {
  size: SizeValue;
  rows?: number;
  disabled?: boolean;
  error?: boolean;
  focused?: boolean;
}

export const useTextAreaStyles = (props: TextAreaProps & { theme: PlatformBlocksTheme }) => {
  const { theme } = props;
  
  const getSizeStyles = (size: SizeValue, rows: number = 3) => {
    const fontSizeMap: Partial<Record<ComponentSize, number>> = {
      xs: DESIGN_TOKENS.typography.fontSize.xs,
      sm: DESIGN_TOKENS.typography.fontSize.sm,
      md: DESIGN_TOKENS.typography.fontSize.md,
      lg: DESIGN_TOKENS.typography.fontSize.lg,
      xl: DESIGN_TOKENS.typography.fontSize.xl,
      '2xl': DESIGN_TOKENS.typography.fontSize['2xl'],
      '3xl': DESIGN_TOKENS.typography.fontSize['3xl'],
    };

    const paddingMap: Partial<Record<ComponentSize, number>> = {
      xs: DESIGN_TOKENS.spacing.xs,
      sm: DESIGN_TOKENS.spacing.sm,
      md: DESIGN_TOKENS.spacing.md,
      lg: DESIGN_TOKENS.spacing.lg,
      xl: DESIGN_TOKENS.spacing.xl,
      '2xl': DESIGN_TOKENS.spacing['2xl'],
      '3xl': DESIGN_TOKENS.spacing['3xl'],
    };

    const minHeightMap: Partial<Record<ComponentSize, number>> = {
      xs: 32,
      sm: 36,
      md: 40,
      lg: 44,
      xl: 48,
      '2xl': 52,
      '3xl': 56,
    };

    const lineHeightMap: Partial<Record<ComponentSize, number>> = {
      xs: DESIGN_TOKENS.typography.lineHeight.xs,
      sm: DESIGN_TOKENS.typography.lineHeight.sm,
      md: DESIGN_TOKENS.typography.lineHeight.md,
      lg: DESIGN_TOKENS.typography.lineHeight.lg,
      xl: DESIGN_TOKENS.typography.lineHeight.xl,
      '2xl': DESIGN_TOKENS.typography.lineHeight['2xl'],
      '3xl': DESIGN_TOKENS.typography.lineHeight['3xl'],
    };

    const fontSize = resolveComponentSize(size, fontSizeMap, { fallback: 'md' });
    const padding = resolveComponentSize(size, paddingMap, { fallback: 'md' });
    const minHeight = resolveComponentSize(size, minHeightMap, { fallback: 'md' });
    const lineHeight = resolveComponentSize(size, lineHeightMap, { fallback: 'md' });

    return {
      fontSize: typeof fontSize === 'number' ? fontSize : fontSizeMap.md!,
      padding: typeof padding === 'number' ? padding : paddingMap.md!,
      minHeight: (typeof minHeight === 'number' ? minHeight : minHeightMap.md!) * rows,
      lineHeight: typeof lineHeight === 'number' ? lineHeight : lineHeightMap.md!,
    };
  };

  const getTextAreaStyles = (styleProps: TextAreaStyleProps) => {
    const baseStyles = getSizeStyles(styleProps.size, styleProps.rows);
    
    return StyleSheet.create({
      charCounter: {
        color: theme.text.secondary,
        fontSize: DESIGN_TOKENS.typography.fontSize.xs,
        marginTop: DESIGN_TOKENS.spacing.xs,
        textAlign: 'right',
      },
      
      charCounterError: {
        color: theme.colors.error[5],
      },
      
      container: {
        marginBottom: DESIGN_TOKENS.spacing.xs,
      },
      
      errorText: {
        color: theme.colors.error[5],
        fontSize: DESIGN_TOKENS.typography.fontSize.xs,
        marginTop: DESIGN_TOKENS.spacing.xs
      },
      
      helperText: {
        color: theme.text.secondary,
        fontSize: DESIGN_TOKENS.typography.fontSize.xs,
        marginTop: DESIGN_TOKENS.spacing.xs
      },
      
      inputContainer: {
        backgroundColor: styleProps.disabled
          ? (theme.colorScheme === 'dark' ? '#2C2C2E' : theme.colors.gray[0])
          : theme.backgrounds.surface,
        borderColor: styleProps.error
          ? theme.colors.error[5]
          : styleProps.focused
            ? theme.colors.primary[5]
            : theme.backgrounds.border,
        borderRadius: DESIGN_TOKENS.radius.lg,
        borderWidth: 1,
        paddingHorizontal: DESIGN_TOKENS.spacing.sm,
        paddingVertical: DESIGN_TOKENS.spacing.xs,
        // Match Input: flat on the surface with no focus ring or glow — focus is
        // carried entirely by `borderColor` turning the primary theme color.
        opacity: styleProps.disabled ? DESIGN_TOKENS.opacity.disabled : 1,
      },
      
      label: {
        color: styleProps.disabled ? theme.text.disabled : theme.text.primary,
        fontSize: DESIGN_TOKENS.typography.fontSize.sm,
        fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold as any,
        marginBottom: DESIGN_TOKENS.spacing.xs
      },
      
      required: {
        color: theme.colors.error[5]
      },
      
      textInput: {
        color: styleProps.disabled ? theme.text.disabled : theme.text.primary,
        flex: 1,
        fontSize: baseStyles.fontSize,
        lineHeight: baseStyles.lineHeight,
        maxHeight: styleProps.rows ? baseStyles.minHeight : undefined,
        minHeight: baseStyles.minHeight,
        paddingBottom: 0,
        paddingHorizontal: 0,
        paddingTop: 0,
        textAlignVertical: 'top',
        // Web-specific styles
        ...(Platform.OS === 'web' && {
          outlineStyle: 'none',
          resize: 'none',
        } as any),
      }
    });
  };

  return {
    getTextAreaStyles,
    getSizeStyles
  };
};