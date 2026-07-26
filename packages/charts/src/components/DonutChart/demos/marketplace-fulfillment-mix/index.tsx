import { DonutChart } from '../../';

import { FULFILLMENT_PARTNERS } from './data';

const formatOrders = (value: number) => `${value.toFixed(2)}M`;

export default function Demo() {
  return (
    <DonutChart
      title="Marketplace Fulfillment Mix"
      subtitle="Orders fulfilled in Q3"
      size={300}
      data={FULFILLMENT_PARTNERS}
      padAngle={1.6}
      isolateOnClick
      legend={{ position: 'bottom' }}
      centerLabel={() => 'Orders'}
      centerSubLabel={() => 'Fulfilled volume by partner'}
      centerValueFormatter={(value) => `${formatOrders(value)} total`}
    />
  );
}
