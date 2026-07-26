import { StyleSheet } from 'react-native';
import { PlatformBlocksTheme } from '../../core/theme/types';

export const useControlFieldStyles = (theme: PlatformBlocksTheme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      width: '100%',
    },
    labelBlock: {
      flex: 1,
      minWidth: 0,
    },
    // Indicator is visual-only; the whole row is the tap target, so the inner
    // control must not intercept presses (which would double-toggle the state).
    indicator: {
      flexShrink: 0,
    },
    error: {
      color: theme.colors.error[6],
      marginTop: 4,
      fontSize: 12,
    },
  });
