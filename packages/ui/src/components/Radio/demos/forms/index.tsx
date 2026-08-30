import { useState } from 'react';
import { Block, Button, RadioGroup, Text } from '@platform-blocks/react-ui-library';

const PLANS = [
  {
    label: 'Starter — $9/mo',
    value: 'starter',
    description: 'Streamline a single project'
  },
  {
    label: 'Team — $19/mo',
    value: 'team',
    description: 'Collaborate with up to 10 teammates'
  },
  {
    label: 'Club — $39/mo',
    value: 'club',
    description: 'Unlock advanced analytics'
  }
];

const BILLING = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Annual (save 20%)', value: 'annual' }
];

export function Demo() {
  const [plan, setPlan] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<string>('monthly');
  const [planError, setPlanError] = useState<string | undefined>();
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!plan) {
      setPlanError('Select a plan to continue');
      setConfirmation(null);
      return;
    }

    setPlanError(undefined);
    setConfirmation(`Subscribed to the ${plan} plan with ${billingCycle} billing.`);
  };

  return (
    <Block>
      <RadioGroup
        label="Select a membership"
        options={PLANS}
        value={plan}
        onChange={(next) => {
          setPlan(next);
          setPlanError(undefined);
        }}
        error={planError}
        required
      />

      <RadioGroup
        label="Billing cadence"
        orientation="horizontal"
        options={BILLING}
        value={billingCycle}
        onChange={setBillingCycle}
      />

      <Button onPress={handleSubmit}>Confirm subscription</Button>

      {confirmation && (
        <Text variant="small" color="success">
          {confirmation}
        </Text>
      )}
    </Block>
  );
}


