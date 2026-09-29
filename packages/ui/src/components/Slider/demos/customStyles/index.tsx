import { Block, RangeSlider, Slider } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Slider
        label="Success palette"
        defaultValue={65}
        color="success"
        trackSize={12}
        thumbSize={30}
        trackStyle={{ opacity: 0.25 }}
        activeTrackStyle={{
          shadowColor: '#34C759',
          shadowOpacity: 0.35,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }}
        thumbStyle={{ borderColor: '#1F5520', borderWidth: 3 }}
      />
      <RangeSlider
        label="Warning palette"
        defaultValue={[20, 80]}
        color="warning"
        trackSize={10}
        thumbSize={26}
        trackStyle={{ opacity: 0.2 }}
        activeTrackStyle={{ opacity: 0.55 }}
        thumbStyle={{ borderColor: '#B45309', borderWidth: 2 }}
      />
    </Block>
  );
}
