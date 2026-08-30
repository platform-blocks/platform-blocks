import React, { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Skeleton, Text, Card, Row, Block } from '@platform-blocks/react-ui-library';
import { Title } from '@platform-blocks/react-ui-library';

export default function SkeletonShowcase() {
  const { width } = useWindowDimensions();
  const isSmall = width < 768;
  return (
    <View>
      <Title afterline>Skeleton Component Playground</Title>
      <Block direction={isSmall ? 'column' : 'row'} gap={20} wrap={isSmall ? undefined : 'wrap'}>
        <Card>
          <Text>Default Skeleton</Text>
          <Skeleton />
        </Card>

        {/* YouTube Card Skeleton */}
        <Card p={16}>
          <Skeleton shape="rectangle" h={120} mb={12} />
          <Row gap={12} mb={16}>
            <Skeleton shape="avatar" size="lg" />
            <Block direction="column" gap={6} grow={1}>
              <Skeleton shape="text" w="100%" mb={6} />
              <Skeleton shape="text" w="80%" mb={12} />
            </Block>
          </Row>

          <Row gap={8}>
            <Skeleton shape="chip" />
            <Skeleton shape="chip" />
            <Skeleton shape="chip" />
          </Row>
        </Card>

        {/* Instagram Card */}
        <Card p={16} w={300}>
          <Row gap={12} mb={16} align="center">
            <Skeleton shape="avatar" size="md" />
            <Block direction="column" gap={6} grow={1}>
              <Skeleton shape="text" w="30%" />
              <Skeleton shape="text" w="50%" />
            </Block>
          </Row>

          <Skeleton shape="rectangle" h={200} mb={12} />

          <Skeleton shape="text" w="100%" mb={6} />
          <Skeleton shape="text" w="80%" mb={12} />

          <Block direction="column" gap={12}>
            {/* Small avatars aligned to left */}
            <Row gap={8} justify="flex-start">
              <Skeleton shape="avatar" size="sm" />
              <Skeleton shape="avatar" size="sm" />
              <Skeleton shape="avatar" size="sm" />
            </Row>
            
            {/* Small chips aligned to right */}
            <Row gap={8} justify="flex-end">
              <Skeleton shape="chip" size="sm" />
              <Skeleton shape="chip" size="sm" />
              <Skeleton shape="chip" size="sm" />
            </Row>
          </Block>
        </Card>

      </Block>
    </View>
  );
}
