import { Block, Rating, Row, Text } from '@platform-blocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export default function Demo() {
  return (
    <Block fullWidth direction="row" align="center" justify="space-evenly">
      {SIZES.map((size) => (
        <Rating
          key={size}
          size={size}
          value={1}
          readOnly
          count={1}
          label={size}
          labelPosition="left"
        />
      ))}
    </Block>
  );
}
