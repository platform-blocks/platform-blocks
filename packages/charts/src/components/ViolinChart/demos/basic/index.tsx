import { ViolinChart } from '@platform-blocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <ViolinChart
      title="Delivery time distribution"
      height={360}
      series={SERIES}
      samples={128}
      bandwidth={3.5}
    />
  );
}
