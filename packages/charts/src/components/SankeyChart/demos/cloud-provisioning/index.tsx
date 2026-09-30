import { SankeyChart } from '@plocks/charts';

import { LINKS, NODES } from './data';

export function Demo() {
  return (
    <SankeyChart
      title="Cloud provisioning workflow"
      subtitle="Quarterly environment requests"
      nodes={NODES}
      links={LINKS}
    />
  );
}
