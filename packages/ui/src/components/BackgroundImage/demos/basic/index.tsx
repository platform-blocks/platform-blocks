import { BackgroundImage, Text } from '@plocks/ui';

const image =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAALklEQVR42mNITvsIR409P+CIAasokMuAVRQqgSkKksAqiiKB5goGrKJQCawuBgC2Wnfh+zNA9wAAAABJRU5ErkJggg==';

export function Demo() {
  return (
    <BackgroundImage
      src={image}
      alt="Abstract color field"
      h={140}
      p="md"
      justify="center"
      radius="lg"
    >
      <Text fw="bold">Content over an image</Text>
    </BackgroundImage>
  );
}
