import { Block, Loader, Row, Text, useTheme } from '@platform-blocks/ui';

interface LoaderSwatch {
  label: string;
  color: string;
}

export default function Demo() {
  const theme = useTheme();

  const swatches: LoaderSwatch[] = [
    { label: 'Primary', color: theme.colors.primary[5] },
    { label: 'Success', color: theme.colors.success[5] },
    { label: 'Warning', color: theme.colors.warning[5] },
    { label: 'Error', color: theme.colors.error[5] }
  ];

  return (
    <Block>
      {swatches.map(({ label, color }) => (
        <Row key={label} gap="md" align="center">
          <Block minW={88}>
            <Text variant="small" colorVariant="muted">
              {label}
            </Text>
          </Block>
          <Loader variant="oval" color={color} />
          <Loader variant="bars" color={color} />
          <Loader variant="dots" color={color} />
        </Row>
      ))}
    </Block>
  );
}
