import React from 'react';
import { Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { useThemedStyles } from '../../core/hooks/useThemedStyles';
import { resolveFontSize, resolveSpacing } from '../../core/theme/tokens';
import { Button } from '../Button';

export interface PickerActionsProps {
  /** Status line (e.g. "3 dates selected"); announced politely when it changes. */
  summary?: string;
  onClear?: () => void;
  clearLabel?: string;
  onDone: () => void;
  doneLabel?: string;
}

/**
 * Internal: the footer of the picker panels — a live summary on the start
 * side, Clear / Done on the end side.
 */
export function PickerActions({ summary, onClear, clearLabel = 'Clear', onDone, doneLabel = 'Done' }: PickerActionsProps) {
  const styles = useThemedStyles((theme) => {
    const gap = resolveSpacing(theme, 'md') as number;
    return {
      root: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap,
        marginTop: gap,
        paddingTop: gap,
        borderTopWidth: 1,
        borderTopColor: theme.backgrounds.border,
      } as ViewStyle,
      summary: {
        flexShrink: 1,
        fontSize: resolveFontSize(theme, 'sm'),
        fontFamily: theme.fontFamily,
        color: theme.text.secondary,
      },
      buttons: { flexDirection: 'row', gap: resolveSpacing(theme, 'sm') as number, marginStart: 'auto' } as ViewStyle,
    };
  });

  return (
    <View style={styles.root}>
      {summary !== undefined ? (
        <Text style={styles.summary} {...a11yProps({ live: 'polite' })}>
          {summary}
        </Text>
      ) : null}
      <View style={styles.buttons}>
        {onClear ? (
          <Button size="sm" variant="default" onPress={onClear}>
            {clearLabel}
          </Button>
        ) : null}
        <Button size="sm" variant="filled" onPress={onDone}>
          {doneLabel}
        </Button>
      </View>
    </View>
  );
}
