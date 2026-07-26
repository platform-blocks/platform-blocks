import { Block, ShimmerText } from '@platform-blocks/ui';

export default function Demo() {
  return (
    <Block align="flex-start">
      <ShimmerText shimmerColor="#facc15" spread={3} weight="bold" size="xl">
        Golden spotlight offer
      </ShimmerText>
      <ShimmerText
        color="#475569"
        shimmerColor="#38bdf8"
        spread={1.2}
        duration={1.2}
        repeatDelay={0.2}
      >
        Fast pulse notification
      </ShimmerText>
      <ShimmerText direction="rtl" repeatDelay={0.8}>
        Shimmer sweeps from right to left
      </ShimmerText>
      <ShimmerText once repeat={false} delay={0.5}>
        Single pass announcement
      </ShimmerText>
    </Block>
  );
}
