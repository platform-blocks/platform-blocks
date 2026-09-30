import { Image } from '@plocks/ui';

export function Demo() {
  return (
    <Image
      src={require('../../../../assets/images/scene-mountains.png')}
      alt="Mountain landscape"
      w={300}
      h={200}
    />
  );
}
