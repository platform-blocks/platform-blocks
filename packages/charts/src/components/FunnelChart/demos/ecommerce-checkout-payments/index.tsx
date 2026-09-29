import { FunnelChart, formatCompactNumber } from '@platform-blocks/charts';

import { CHECKOUT_FUNNEL, CheckoutMeta } from './data';

const formatPaymentSplit = (split: CheckoutMeta['paymentSplit']) => {
  if (!split) return undefined;
  return `Payment mix: ${Math.round(split.stripe * 100)}% Stripe • ${Math.round(split.paypal * 100)}% PayPal • ${Math.round(split.bnpl * 100)}% BNPL`;
};

export function Demo() {
  return (
    <FunnelChart
      title="Ecommerce checkout conversion"
      subtitle="Drop-off by stage"
      maw={520}
      h={440}
      series={CHECKOUT_FUNNEL}
      layout={{
        shape: 'trapezoid',
        gap: 8,
        align: 'center',
        showConversion: false,
        connectors: { show: false },
      }}
      valueFormatter={(value) => formatCompactNumber(value)}
      legend={{ show: false }}
      tooltip={{
        show: true,
        formatter: (step) => {
          const idx = CHECKOUT_FUNNEL.steps.findIndex((candidate) => candidate.label === step.label);
          const previous = idx > 0 ? CHECKOUT_FUNNEL.steps[idx - 1] : undefined;
          const dropValue = previous ? previous.value - step.value : 0;
          const dropRate = previous && previous.value > 0 ? (dropValue / previous.value) * 100 : 0;
          const meta = step.meta as CheckoutMeta | undefined;
          const paymentSplit = formatPaymentSplit(meta?.paymentSplit);
          return [
            step.label,
            `${step.value.toLocaleString()} sessions`,
            previous ? `Drop: ${dropValue.toLocaleString()} (${dropRate.toFixed(1)}%)` : 'Entry point',
            meta?.insight,
            paymentSplit,
          ]
            .filter(Boolean)
            .join('\n');
        },
      }}
    />
  );
}
