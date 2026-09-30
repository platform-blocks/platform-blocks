import { Block, SegmentedControl, Text, useThemeMode, type ColorSchemeMode } from '@plocks/ui';

const MODES: { label: string; value: ColorSchemeMode }[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'Auto', value: 'auto' },
];

export function Demo() {
  const { mode, setMode, actualColorScheme } = useThemeMode();

  return (
    <Block align="center">
      <SegmentedControl data={MODES} value={mode} onChange={(value) => setMode(value as ColorSchemeMode)} />
      <Text size="sm" c="muted">
        actualColorScheme: {actualColorScheme}
      </Text>
    </Block>
  );
}
