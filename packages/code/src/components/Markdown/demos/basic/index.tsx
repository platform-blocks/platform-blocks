import { Block } from '@plocks/ui';
import { Markdown } from '@plocks/code';
import content from './content.md';

export function Demo() {
  return (
    <Block fullWidth>
      <Markdown>{content}</Markdown>
    </Block>
  );
}
