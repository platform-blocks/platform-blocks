import type { ReactNode } from 'react';
import { Block, Indicator, Row, Text } from '@platform-blocks/ui';

const cornerPlacements = [
  { label: 'Top left', placement: 'top-left', color: '#F59E0B' },
  { label: 'Top right', placement: 'top-right', color: '#10B981' },
  { label: 'Bottom left', placement: 'bottom-left', color: '#6366F1' },
  { label: 'Bottom right', placement: 'bottom-right', color: '#EF4444' },
] as const;

const offsetPlacements = [
  { label: '9 unread', placement: 'top-right', color: '#6366F1', value: '9', offset: 6 },
  { label: '2 new', placement: 'bottom-right', color: '#10B981', value: '2', offset: 4 },
] as const;

const Tile = ({ children }: { children: ReactNode }) => (
  <Block
    w={88}
    h={88}
    radius="lg"
    bg="#f5f5f7"
    position="relative"
    align="center"
    justify="center"
  >
    {children}
  </Block>
);

export function Demo() {
  return (
    <Block>
      <Block>
        <Text size="sm" weight="medium">
          Corner placements
        </Text>

        <Row gap="md" wrap="wrap">
          {cornerPlacements.map((placement) => (
            <Tile key={placement.placement}>
              <Text size="xs" color="secondary">
                {placement.label}
              </Text>
              <Indicator placement={placement.placement} color={placement.color} />
            </Tile>
          ))}
        </Row>
      </Block>

      <Block>
        <Text size="sm" weight="medium">
          Offset and content
        </Text>

        <Row gap="md" wrap="wrap">
          {offsetPlacements.map((placement) => (
            <Tile key={placement.label}>
              <Text size="xs" color="secondary">
                {placement.label}
              </Text>
              <Indicator
                placement={placement.placement}
                color={placement.color}
                size={22}
                offset={placement.offset}
              >
                <Text size="xs" weight="bold" color="white">
                  {placement.value}
                </Text>
              </Indicator>
            </Tile>
          ))}
        </Row>
      </Block>
    </Block>
  );
}
