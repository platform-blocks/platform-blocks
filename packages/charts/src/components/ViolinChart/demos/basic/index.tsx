import { ViolinChart } from '@platform-blocks/charts';

import { SERIES } from './data';

export default function Demo() {
  return (
    <ViolinChart
      title="Delivery time distribution"
      width={560}
      height={360}
      series={SERIES}
      samples={128}
      bandwidth={3.5}
    />
  );
}
