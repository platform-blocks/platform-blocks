import { Avatar, Block } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block align="flex-start">
     <Avatar
        fallback="AB"
        backgroundColor="#FF6B6B"
        label="Custom Red Background"
      />
    </Block>
  )
}
