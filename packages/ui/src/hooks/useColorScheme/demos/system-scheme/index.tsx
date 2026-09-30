import { Icon, Row, Text, useColorScheme } from '@plocks/ui';

export function Demo() {
  const scheme = useColorScheme();

  return (
    <Row gap="sm" align="center">
      <Icon name={scheme === 'dark' ? 'moon' : 'sun'} size="lg" />
      <Text fw="600">System: {scheme}</Text>
    </Row>
  );
}
