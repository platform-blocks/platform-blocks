import { Avatar, Block, Indicator, Row, Text, useTheme } from '@platform-blocks/react-ui-library';

const presenceStatuses = [
  { label: 'Online', palette: 'success', avatar: require('../../../../assets/avatars/avatar-1.png') },
  { label: 'Idle', palette: 'warning', avatar: require('../../../../assets/avatars/avatar-2.png') },
  { label: 'Busy', palette: 'error', avatar: require('../../../../assets/avatars/avatar-3.png') },
  { label: 'Offline', palette: 'gray', avatar: require('../../../../assets/avatars/avatar-4.png') },
] as const;

const notificationCounts = [3, 47, 99, 134, 1005];

export function Demo() {
  const theme = useTheme();

  const resolveColor = (palette: (typeof presenceStatuses)[number]['palette']) => {
    const swatch = (theme.colors as any)[palette];
    return Array.isArray(swatch) ? swatch[5] : swatch;
  };

  return (
    <Block>
      <Block>
        <Text size="sm" weight="medium">
          Presence indicators
        </Text>

        <Row gap="lg" wrap="wrap">
          {presenceStatuses.map((status) => (
            <Block key={status.label} align="center">
              <Block position="relative">
                <Avatar
                  size={56}
                  fallback={status.label.charAt(0)}
                  src={status.avatar}
                />
                <Indicator placement="bottom-right" size={14} color={resolveColor(status.palette)} />
              </Block>
              <Text size="xs" color="secondary">
                {status.label}
              </Text>
            </Block>
          ))}
        </Row>
      </Block>

      <Block>
        <Text size="sm" weight="medium">
          Max count handling
        </Text>

        <Row gap="md" wrap="wrap">
          {notificationCounts.map((count) => {
            const display = count > 99 ? '99+' : `${count}`;
            return (
              <Block key={count} w={72} h={72} position="relative" align="center" justify="center">
                <Indicator placement="top-right" size={24} offset={4} color={theme.colors.error[5]}>
                  <Text size="xs" weight="bold" color="white">
                    {display}
                  </Text>
                </Indicator>
                <Text size="xs" color="secondary">
                  {count}
                </Text>
              </Block>
            );
          })}
        </Row>
      </Block>
    </Block>
  );
}
