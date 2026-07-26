import { ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../core/theme';
import { resolveSurface } from '../../core/theme/surfaces';

export interface ColorInputSizeMetrics {
  inputHeight: number;
  paddingHorizontal: number;
  paddingVertical: number;
  previewSize: number;
  previewBorderRadius: number;
  previewMarginRight: number;
  textFontSize: number;
  textInputHeight: number;
  dropdownIconSize: number;
  dropdownIconMarginLeft: number;
  swatchSize: number;
  swatchGap: number;
}

export function useColorInputStyles(metrics: ColorInputSizeMetrics) {
  const theme = useTheme();

  const container: ViewStyle = {
    width: '100%',
  };

  const label: TextStyle = {
    fontSize: parseInt(theme.fontSizes.sm),
    fontWeight: '500',
    color: theme.text.primary,
    marginBottom: 4,
  };

  const wrapper: ViewStyle = {
    position: 'relative',
  };

  const input: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray[3],
    borderRadius: parseInt(theme.radii.md),
    backgroundColor: theme.backgrounds.surface,
    paddingHorizontal: metrics.paddingHorizontal,
    paddingVertical: metrics.paddingVertical,
    minHeight: metrics.inputHeight,
  };

  const inputFocused: ViewStyle = {
    // Border-only focus: no outer glow (matches Input/TextArea).
    borderColor: theme.colors.primary[5],
  };

  const inputDisabled: ViewStyle = {
    backgroundColor: theme.colors.gray[1],
    opacity: 0.6,
  };

  const inputError: ViewStyle = {
    borderColor: theme.colors.error[5],
  };

  const previewWrapper: ViewStyle = {
    marginRight: metrics.previewMarginRight,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const preview: ViewStyle = {
    width: metrics.previewSize,
    height: metrics.previewSize,
    borderRadius: metrics.previewBorderRadius,
    borderWidth: 1,
    borderColor: theme.colors.gray[3],
  };

  const textInput: TextStyle = {
    flex: 1,
    fontSize: metrics.textFontSize,
    color: theme.text.primary,
    fontFamily: 'monospace',
    height: metrics.textInputHeight,
    borderWidth: 0,
    outlineWidth: 0,
    outlineColor: 'transparent',
    backgroundColor: 'transparent',
  };

  const dropdownIcon: TextStyle = {
    fontSize: metrics.dropdownIconSize,
    color: theme.text.secondary,
    marginLeft: metrics.dropdownIconMarginLeft,
  };

  const clearButton: ViewStyle = {
    padding: Math.max(4, Math.round(metrics.paddingVertical * 0.6)),
    borderRadius: Math.max(6, Math.round(metrics.previewBorderRadius + 2)),
  };

  const clearButtonPressed: ViewStyle = {
    backgroundColor: theme.colors.gray[2],
  };

  const dropdownTrigger: ViewStyle = {
    padding: Math.max(4, Math.round(metrics.paddingVertical * 0.75)),
    borderRadius: parseInt(theme.radii.sm),
  };

  const dropdownTriggerPressed: ViewStyle = {
    backgroundColor: theme.colors.gray[2],
  };

  // Level 2 — the same step menus, select dropdowns and popovers sit at.
  const dropdownSurface = resolveSurface(theme, 2);

  const dropdown: ViewStyle = {
    backgroundColor: dropdownSurface.background,
    borderRadius: parseInt(theme.radii.md),
    borderWidth: 1,
    borderColor: dropdownSurface.border,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    elevation: 8,
    padding: 16,
    minWidth: 320,
  };

  const colorPalette: ViewStyle = {};

  const paletteTitle: TextStyle = {
    fontSize: parseInt(theme.fontSizes.sm),
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 8,
  };

  const swatchGrid: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: metrics.swatchGap,
  };

  const swatch: ViewStyle = {
    width: metrics.swatchSize,
    height: metrics.swatchSize,
    borderRadius: Math.max(4, Math.round(metrics.previewBorderRadius)),
    borderWidth: 2,
    borderColor: 'transparent',
  };

  const swatchSelected: ViewStyle = {
    borderColor: theme.colors.success[5],
    borderWidth: 2,
  };

  const customSection: ViewStyle = {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[2],
    paddingTop: 16,
  };

  const hexInput: ViewStyle = {
    borderWidth: 1,
    borderColor: theme.colors.gray[3],
    borderRadius: parseInt(theme.radii.sm),
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: theme.backgrounds.surface,
  };

  const hexInputText: TextStyle = {
    fontSize: parseInt(theme.fontSizes.sm),
    fontFamily: 'monospace',
    color: theme.text.primary,
  };

  const error: TextStyle = {
    fontSize: parseInt(theme.fontSizes.xs),
    color: theme.colors.error[6],
    marginTop: 4,
  };

  const description: TextStyle = {
    fontSize: parseInt(theme.fontSizes.xs),
    color: theme.text.secondary,
    marginTop: 4,
  };

  const buttonRow: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Math.max(8, metrics.swatchGap),
    marginTop: 16,
  };

  const button: ViewStyle = {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: parseInt(theme.radii.sm),
    borderWidth: 1,
  };

  const primaryButton: ViewStyle = {
    backgroundColor: theme.colors.primary[5],
    borderColor: theme.colors.primary[5],
  };

  const secondaryButton: ViewStyle = {
    backgroundColor: 'transparent',
    borderColor: theme.colors.gray[3],
  };

  const buttonText: TextStyle = {
    fontSize: parseInt(theme.fontSizes.sm),
    fontWeight: '500',
  };

  const primaryButtonText: TextStyle = {
    color: '#ffffff',
  };

  const secondaryButtonText: TextStyle = {
    color: theme.text.primary,
  };

  return {
    container,
    label,
    wrapper,
    input,
    inputFocused,
    inputDisabled,
    inputError,
    previewWrapper,
    preview,
    textInput,
    dropdownIcon,
    clearButton,
    clearButtonPressed,
    dropdownTrigger,
    dropdownTriggerPressed,
    dropdown,
    colorPalette,
    paletteTitle,
    swatchGrid,
    swatch,
    swatchSelected,
    customSection,
    hexInput,
    hexInputText,
    error,
    description,
    buttonRow,
    button,
    primaryButton,
    secondaryButton,
    buttonText,
    primaryButtonText,
    secondaryButtonText,
  };
}
