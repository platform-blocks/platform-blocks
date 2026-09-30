import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import { createThemedStyles } from '../../core/hooks/useThemedStyles';
import { getControlSize, resolveFontSize, resolveSpacing } from '../../core/theme/tokens';
import type { PlocksTheme, SizeValue } from '../../core/theme/types';

/**
 * TextArea-specific styles on top of the shared field frame. `rowHeight` is
 * the line height one `rows` step adds. Cached per theme + size.
 */
export const getTextAreaStyles = createThemedStyles((theme: PlocksTheme, size: SizeValue) => {
  const metrics = getControlSize(theme, size);
  const rowHeight = Math.round(metrics.fontSize * 1.7);
  const inset = resolveSpacing(theme, 'xs') as number;

  const styles = StyleSheet.create({
    root: { marginBottom: inset } as ViewStyle,
    // Multi-line content and sections sit at the top of the box.
    frame: { alignItems: 'flex-start' } as ViewStyle,
    input: {
      lineHeight: rowHeight,
      textAlignVertical: 'top',
      paddingTop: 0,
      paddingBottom: 0,
    } as TextStyle,
    clearButton: { position: 'absolute', top: inset, end: inset, margin: 0 } as ViewStyle,
    counter: {
      color: theme.text.secondary,
      fontSize: resolveFontSize(theme, 'xs'),
      marginTop: inset,
      // Trailing edge in either reading direction.
      alignSelf: 'flex-end',
    } as TextStyle,
    counterError: { color: theme.colors.error[5] } as TextStyle,
  });

  return { rowHeight, styles };
});
