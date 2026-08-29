import { Blockquote } from '@platform-blocks/ui';

const AUTHOR = {
  name: 'Jamie Ortega',
  title: 'Principal Product Designer',
};

export function Demo() {
  return (
    <Blockquote author={AUTHOR}>
      The Blockquote component keeps editorial typography consistent so our brand voice always feels elevated.
    </Blockquote>
  );
}