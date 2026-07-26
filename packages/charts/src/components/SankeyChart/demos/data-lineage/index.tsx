import { SankeyChart } from '../../';

import { LINKS, NODES } from './data';

export default function Demo() {
  return (
    <SankeyChart
      title="Analytics data lineage"
      subtitle="Daily load pipeline"
      width={720}
      height={420}
      nodes={NODES}
      links={LINKS}
    />
  );
}
