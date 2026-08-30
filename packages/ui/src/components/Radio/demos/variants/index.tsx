import { useState } from 'react';
import { Block, RadioGroup, Text } from '@platform-blocks/react-ui-library';

const PLAN_OPTIONS = [
  { label: 'Starter', value: 'starter', description: 'Up to 3 projects, community support' },
  { label: 'Growth', value: 'growth', description: 'Unlimited projects, priority email support' },
  { label: 'Scale', value: 'scale', description: 'Dedicated success manager + SSO' },
];

const FREQUENCY_OPTIONS = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
  { label: 'Trashed', value: 'trashed' },
];

export function Demo() {
  const [defaultValue, setDefaultValue] = useState('weekly');
  const [planValue, setPlanValue] = useState('growth');
  const [frequencyValue, setFrequencyValue] = useState('weekly');
  const [filterValue, setFilterValue] = useState('active');

  return (
    <Block>
      <Block>
        <Text variant="small" color="muted">default</Text>
        <RadioGroup
          variant="default"
          value={defaultValue}
          onChange={setDefaultValue}
          options={FREQUENCY_OPTIONS}
        />
      </Block>

      <Block>
        <Text variant="small" color="muted">card</Text>
        <RadioGroup
          variant="card"
          value={planValue}
          onChange={setPlanValue}
          options={PLAN_OPTIONS}
        />
      </Block>

      <Block>
        <Text variant="small" color="muted">segmented</Text>
        <RadioGroup
          variant="segmented"
          value={frequencyValue}
          onChange={setFrequencyValue}
          options={FREQUENCY_OPTIONS}
        />
      </Block>

      <Block>
        <Text variant="small" color="muted">chip</Text>
        <RadioGroup
          variant="chip"
          value={filterValue}
          onChange={setFilterValue}
          options={FILTER_OPTIONS}
        />
      </Block>
    </Block>
  );
}
