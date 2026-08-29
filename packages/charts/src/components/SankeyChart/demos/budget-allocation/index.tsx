import { SankeyChart } from '@platform-blocks/charts';

import { LINKS, NODES } from './data';

export function Demo() {
  return (
    <SankeyChart
      title="Budget allocation flow"
      subtitle="FY26 operating plan"
      width={680}
      height={400}
      nodes={NODES}
      links={LINKS}
    />
  );
}
