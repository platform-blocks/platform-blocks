import { SankeyChart } from '@platform-blocks/charts';

import { LINKS, NODES } from './data';

export function Demo() {
  return (
    <SankeyChart
      title="Customer journey flow"
      subtitle="Q3 acquisition to retention"
      height={420}
      nodes={NODES}
      links={LINKS}
    />
  );
}
