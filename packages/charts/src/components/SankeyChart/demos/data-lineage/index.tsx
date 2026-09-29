import { SankeyChart } from '@platform-blocks/charts';

import { LINKS, NODES } from './data';

export function Demo() {
  return (
    <SankeyChart
      title="Analytics data lineage"
      subtitle="Daily load pipeline"
      h={420}
      nodes={NODES}
      links={LINKS}
    />
  );
}
