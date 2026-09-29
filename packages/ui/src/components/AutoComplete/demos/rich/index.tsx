import { AutoComplete, Block, Column, Icon, MenuItemButton, Row, Text } from '@platform-blocks/ui';

interface RichSportOption {
  label: string;
  value: string;
  emoji: string;
  color: string;
  price: number;
  duration: string;
}

const sports: RichSportOption[] = [
  { label: 'Soccer', value: 'soccer', emoji: '⚽', color: '#22c55e', price: 75.5, duration: '90 min' },
  { label: 'Basketball', value: 'basketball', emoji: '🏀', color: '#f97316', price: 120.0, duration: '48 min' },
  { label: 'Football', value: 'football', emoji: '🏈', color: '#92400e', price: 180.0, duration: '60 min' },
  { label: 'Volleyball', value: 'volleyball', emoji: '🏐', color: '#fbbf24', price: 60.0, duration: 'Best of 5' },
  { label: 'Baseball', value: 'baseball', emoji: '⚾', color: '#ef4444', price: 85.0, duration: '9 innings' },
  { label: 'Golf', value: 'golf', emoji: '⛳', color: '#15803d', price: 110.0, duration: '4 hrs' },
];

const tint = (hex: string, alpha: string) => `${hex}${alpha}`;

const renderTile = (sport: RichSportOption, size: number) => (
  <Block
    w={size}
    h={size}
    radius="lg"
    align="center"
    justify="center"
    bg={tint(sport.color, '26')}
    borderWidth={1}
    borderColor={tint(sport.color, '59')}
  >
    <Text size={size >= 40 ? 'xl' : 'md'}>{sport.emoji}</Text>
  </Block>
);

export function Demo() {
  return (
    <Block fullWidth>
      <AutoComplete
        label="Search sports"
        placeholder="Search sports..."
        data={sports}
        refocusAfterSelect={false}
        renderItem={(item, _index, helpers) => {
          const sport = item as RichSportOption;

          return (
            <MenuItemButton
              rounded={false}
              compact
              fullWidth
              active={helpers.isHighlighted || helpers.isSelected}
              onPress={() => helpers.onSelect(sport)}
              style={{ alignItems: 'stretch', gap: 0 }}
            >
              <Row align="center" gap="md" px="md" py="sm" fullWidth>
                {renderTile(sport, 40)}

                <Column grow={1} gap="xs">
                  <Text size="sm" fw="semibold" numberOfLines={1}>
                    {sport.label}
                  </Text>
                  <Text size="xs" c="secondary" numberOfLines={1}>
                    {sport.duration}
                  </Text>
                </Column>

                <Column align="flex-end" gap="xs">
                  <Text size="sm" fw="semibold">
                    ${sport.price.toFixed(2)}
                  </Text>
                  <Text size="xs" c="secondary">
                    avg ticket
                  </Text>
                </Column>

                {helpers.isSelected ? (
                  <Icon name="check" size={16} stroke={3} color={sport.color} />
                ) : (
                  <Block w={16} />
                )}
              </Row>
            </MenuItemButton>
          );
        }}
        renderValue={(item) => {
          const sport = item as RichSportOption;

          return (
            <Row align="center" gap="sm" grow={1}>
              {renderTile(sport, 24)}
              <Text size="sm" fw="semibold">{sport.label}</Text>
              <Text size="xs" c="secondary">
                {sport.duration}
              </Text>
              <Block grow={1} />
              <Text size="sm" fw="semibold">
                ${sport.price.toFixed(2)}
              </Text>
            </Row>
          );
        }}
        minSearchLength={1}
        fullWidth
      />
    </Block>
  );
}
