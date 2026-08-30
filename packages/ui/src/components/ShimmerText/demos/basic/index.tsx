import { Block, ShimmerText } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <Block align="flex-start">
      <ShimmerText size="xl" weight="bold">
        Weekly highlights go live
      </ShimmerText>
      <ShimmerText>
        New arrivals shimmer into view every Friday at noon.
      </ShimmerText>
    </Block>
  );
}