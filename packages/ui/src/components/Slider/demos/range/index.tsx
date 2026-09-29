import { useState } from 'react';
import { Block, RangeSlider } from '@platform-blocks/ui';

export function Demo() {
  const [priceRange, setPriceRange] = useState<[number, number]>([25, 75]);

  return (
    <Block fullWidth>
      <RangeSlider label="Price range" value={priceRange} onChange={setPriceRange} />
    </Block>
  );
}
