import { Block } from '@plocks/ui';
import { Video } from '@plocks/media';

export function Demo() {
  return (
    <Block fullWidth>
      <Video source={{ youtube: 'dQw4w9WgXcQ' }} />
    </Block>
  );
}
