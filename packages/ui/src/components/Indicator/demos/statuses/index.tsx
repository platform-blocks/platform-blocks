import { Avatar, Block, Indicator, Row, Text } from '@plocks/ui';

const presenceStatuses = [
  { label: 'Online', palette: 'success', avatar: require('../../../../assets/avatars/avatar-1.png') },
  { label: 'Idle', palette: 'warning', avatar: require('../../../../assets/avatars/avatar-2.png') },
  { label: 'Busy', palette: 'error', avatar: require('../../../../assets/avatars/avatar-3.png') },
  { label: 'Offline', palette: 'gray', avatar: require('../../../../assets/avatars/avatar-4.png') },
] as const;

export function Demo() {
  return (
    <Row gap="lg" wrap="wrap">
      {presenceStatuses.map((status) => (
        <Block key={status.label} align="center">
          <Block position="relative">
            <Avatar
              size={56}
              fallback={status.label.charAt(0)}
              src={status.avatar}
            />
            <Indicator size={14} color={status.palette} accessibilityLabel={status.label} />
          </Block>
          <Text size="xs" c="secondary">
            {status.label}
          </Text>
        </Block>
      ))}
    </Row>
  );
}
