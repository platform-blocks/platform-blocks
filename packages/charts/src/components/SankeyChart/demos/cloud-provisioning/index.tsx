import { SankeyChart } from '@platform-blocks/charts';

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
