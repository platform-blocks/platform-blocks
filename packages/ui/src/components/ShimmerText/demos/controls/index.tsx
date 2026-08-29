import { useState } from 'react';
import { Block, Row, ShimmerText, Slider, Switch, Text } from '@platform-blocks/ui';

const MIN_SPREAD = 1;
const MAX_SPREAD = 4;
const SPREAD_STEP = 0.1;

export function Demo() {
  const [spread, setSpread] = useState(2);
  const [repeat, setRepeat] = useState(true);
  const [once, setOnce] = useState(false);

  const handleRepeatChange = (value: boolean) => {
    setRepeat(value);
    if (value) {
      setOnce(false);
    }
  };

  const handleOnceChange = (value: boolean) => {
    setOnce(value);
    if (value) {
      setRepeat(false);
    }
  };

  return (
    <Block align="flex-start" fullWidth>
      <ShimmerText
        spread={spread}
        repeat={repeat}
        once={once}
        repeatDelay={0.6}
        duration={1.6}
        shimmerColor="#38bdf8"
        weight="bold"
        size="lg"
      >
        Interactive shimmer headline
      </ShimmerText>

      <Block w="100%">
        <Text variant="small" weight="medium">
          Spread: {spread.toFixed(1)}
        </Text>
        <Slider
          value={spread}
          onChange={setSpread}
          min={MIN_SPREAD}
          max={MAX_SPREAD}
          step={SPREAD_STEP}
        />
      </Block>

      <Block w="100%">
        <Row align="center" justify="space-between">
          <Text variant="small">Repeat animation</Text>
          <Switch checked={repeat} onChange={handleRepeatChange} />
        </Row>
        <Row align="center" justify="space-between">
          <Text variant="small">Run once</Text>
          <Switch checked={once} onChange={handleOnceChange} />
        </Row>
      </Block>
    </Block>
  );
}
