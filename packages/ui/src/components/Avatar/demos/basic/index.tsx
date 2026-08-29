import { Avatar } from '@platform-blocks/ui'

export function Demo() {
  return (
    <Avatar
      src={require('../../../../assets/avatars/avatar-1.png')}
      fallback="JD"
      size="xl"
    />
  )
}
