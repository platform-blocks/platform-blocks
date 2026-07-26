import { DonutChart } from '../../';

import { DEPARTMENT_ALLOCATIONS } from './data';

const formatBudget = (value: number) => `$${Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)}M`;

export default function Demo() {
  return (
    <DonutChart
      title="Annual Expense Allocation"
      subtitle="FY26 operating plan"
      size={300}
      data={DEPARTMENT_ALLOCATIONS}
      padAngle={1.8}
      legend={{ position: 'bottom' }}
      centerLabel={() => 'Budget'}
      centerSubLabel={() => 'Allocation by function'}
      centerValueFormatter={(value) => formatBudget(value)}
    />
  );
}
