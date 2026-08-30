import { Avatar, Block } from '@platform-blocks/react-ui-library';
import type { AvatarProps } from '@platform-blocks/react-ui-library';

type StatusAvatar = Pick<AvatarProps, 'size' | 'src' | 'online' | 'indicatorColor'> & {
  key: string;
  label: string;
  description: string;
};

const STATUS_AVATARS: StatusAvatar[] = [
  {
    key: 'online',
    label: 'Josh',
    description: 'Online',
    src: require('../../../../assets/avatars/avatar-1.png')
  },
  {
    key: 'available',
    label: 'Alice',
    description: 'Available',
    src: require('../../../../assets/avatars/avatar-2.png')
  },
  {
    key: 'focus',
    label: 'Mike',
    description: 'Focus time',
    src: require('../../../../assets/avatars/avatar-3.png'),
    indicatorColor: '#f59e0b'
  },
  {
    key: 'offline',
    label: 'Tori',
    description: 'Last active 5m ago',
    src: require('../../../../assets/avatars/avatar-4.png'),
    online: false
  }
];

export function Demo() {
  return (
    <Block direction="row" justify="space-evenly" fullWidth>
      {STATUS_AVATARS.map(({ key, indicatorColor, online = true, ...avatar }) => (
        <Avatar
          key={key}
          {...avatar}
          fallback={avatar.label.slice(0, 2).toUpperCase()}
          online={online}
          indicatorColor={indicatorColor}
        />
      ))}
    </Block>
  );
}
