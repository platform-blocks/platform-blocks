import { Block, ShimmerText } from '@plocks/ui';

export function Demo() {
  return (
    <Block align="flex-start">
      <ShimmerText size="xl" fw="bold">
        Weekly highlights go live
      </ShimmerText>
      <ShimmerText>
        New arrivals shimmer into view every Friday at noon.
      </ShimmerText>
    </Block>
  );
}