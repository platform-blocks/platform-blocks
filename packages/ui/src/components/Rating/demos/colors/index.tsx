import { useState } from 'react';
import { Block, Rating, Text, useTheme } from '@platform-blocks/react-ui-library';

const COLOR_CONFIG = [
  {
    key: 'primary',
    label: 'Primary accent',
    getColors: (palette: string[]) => ({
      color: palette[5],
      emptyColor: palette[1],
      hoverColor: palette[6]
    })
  },
  {
    key: 'success',
    label: 'Success feedback',
    getColors: (palette: string[]) => ({
      color: palette[5],
      emptyColor: palette[1],
      hoverColor: palette[6]
    })
  },
  {
    key: 'warning',
    label: 'Warning feedback',
    getColors: (palette: string[]) => ({
      color: palette[5],
      emptyColor: palette[1],
      hoverColor: palette[6]
    })
  }
] as const;

type PaletteKey = (typeof COLOR_CONFIG)[number]['key'];

export function Demo() {
  const theme = useTheme();
  const [values, setValues] = useState<Record<PaletteKey, number>>({
    primary: 4,
    success: 3.5,
    warning: 2.5
  });

  return (
    <Block>
      {COLOR_CONFIG.map(({ key, label, getColors }) => {
        const palette = theme.colors[key as keyof typeof theme.colors] ?? theme.colors.gray;
        const { color, emptyColor, hoverColor } = getColors(palette);

        return (
          <Block key={key}>
            <Rating
              value={values[key]}
              onChange={(next) =>
                setValues((prev) => ({ ...prev, [key]: next }))
              }
              color={color}
              emptyColor={emptyColor}
              hoverColor={hoverColor}
              size="lg"
              labelPosition="right"
              label={
            <Text variant="small" color="muted">
              {label}
            </Text>
            }
            />
          </Block>
        );
      })}
    </Block>
  );
}
