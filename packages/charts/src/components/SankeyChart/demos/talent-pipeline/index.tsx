import { SankeyChart } from '@plocks/charts';

import { LINKS, NODES } from './data';

export function Demo() {
  return (
    <SankeyChart
      title="Engineering talent pipeline"
      subtitle="Campus + lateral hiring"
      h={420}
      nodes={NODES}
      links={LINKS}
    />
  );
}
