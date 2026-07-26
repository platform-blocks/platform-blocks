import { SankeyChart } from '../../';

import { LINKS, NODES } from './data';

export default function Demo() {
  return (
    <SankeyChart
      title="Cloud provisioning workflow"
      subtitle="Quarterly environment requests"
      width={720}
      height={420}
      nodes={NODES}
      links={LINKS}
    />
  );
}
