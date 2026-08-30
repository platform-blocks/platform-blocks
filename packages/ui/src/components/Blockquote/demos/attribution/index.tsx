import { Block, Blockquote, Text } from '@platform-blocks/react-ui-library';

import { AUTHOR, QUOTE, SOURCE } from './data';

export function Demo() {
  return (
    <Block>
      <Block>
        <Text variant="h5" weight="semibold">
          Right (default)
        </Text>
        <Blockquote
          variant="testimonial"
          shadow
          author={AUTHOR}
          source={SOURCE}
        >
          {QUOTE}
        </Blockquote>
      </Block>

      <Block>
        <Text variant="h5" weight="semibold">
          Left
        </Text>
        <Blockquote
          variant="testimonial"
          shadow
          attributionAlignment="left"
          author={AUTHOR}
          source={SOURCE}
        >
          {QUOTE}
        </Blockquote>
      </Block>

    </Block>
  );
}
