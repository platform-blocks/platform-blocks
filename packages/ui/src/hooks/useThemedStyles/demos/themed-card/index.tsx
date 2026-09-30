import { useState } from 'react';
import { Text, View } from 'react-native';
import { Block, Switch, resolveRadius, resolveSpacing, useThemedStyles } from '@plocks/ui';

export function Demo() {
  const [compact, setCompact] = useState(false);

  const styles = useThemedStyles(
    (theme) => ({
      card: {
        padding: resolveSpacing(theme, compact ? 'sm' : 'lg'),
        borderRadius: resolveRadius(theme, 'md'),
        borderWidth: 1,
        borderColor: theme.backgrounds.border,
        backgroundColor: theme.backgrounds.subtle,
      },
      title: { color: theme.text.primary, fontSize: 16 },
      meta: { color: theme.text.muted, fontSize: 13 },
    }),
    [compact]
  );

  return (
    <Block fullWidth maw={360}>
      <Switch label="Compact" checked={compact} onChange={setCompact} />
      <View style={styles.card}>
        <Text style={styles.title}>Weekly report</Text>
        <Text style={styles.meta}>Updated 2 hours ago</Text>
      </View>
    </Block>
  );
}
