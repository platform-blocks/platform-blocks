import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Row, Text, extractStyleProps, useStyleProps } from '@plocks/ui';
import type { StyleProps } from '@plocks/ui';

type TagProps = StyleProps & { children: ReactNode };

function Tag(props: TagProps) {
  const { styleProps, otherProps } = extractStyleProps(props);
  const style = useStyleProps(styleProps);

  return (
    <View style={[styles.tag, style]}>
      <Text>{otherProps.children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { borderRadius: 8 },
});

export function Demo() {
  return (
    <Row gap="sm" align="center">
      <Tag p="xs" bg="primary">xs</Tag>
      <Tag p="md" bg="success">md</Tag>
      <Tag px="xl" py="sm" bg="warning">xl</Tag>
    </Row>
  );
}
