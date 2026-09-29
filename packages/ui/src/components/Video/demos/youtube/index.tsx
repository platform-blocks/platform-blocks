import { Block, Video } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Video source={{ youtube: 'dQw4w9WgXcQ' }} />
    </Block>
  );
}
