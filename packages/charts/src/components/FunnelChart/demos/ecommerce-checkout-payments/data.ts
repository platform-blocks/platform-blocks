export type CheckoutMeta = {
  insight?: string;
  paymentSplit?: {
    stripe: number;
    paypal: number;
    bnpl: number;
  };
};

export const CHECKOUT_FUNNEL = {
  id: 'checkout-flow',
  name: 'Checkout completion',
  steps: [
    { label: 'Product views', value: 158_000 },
    { label: 'Carts', value: 89_400, meta: { insight: 'Shipping cost surprises prompt abandon' } as CheckoutMeta },
    { label: 'Shipping', value: 74_200, meta: { insight: 'Address autocomplete boosted completion +12%' } as CheckoutMeta },
    { label: 'Payment', value: 51_200, meta: { insight: 'Card validations reject 28% due to CVV retries' } as CheckoutMeta },
    { label: 'Orders', value: 38_600, meta: { paymentSplit: { stripe: 0.52, paypal: 0.31, bnpl: 0.17 } } as CheckoutMeta },
  ],
};
