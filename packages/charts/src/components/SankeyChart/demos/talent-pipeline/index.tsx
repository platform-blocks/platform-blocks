import { SankeyChart } from '@platform-blocks/charts';

import { LINKS, NODES } from './data';

export function Demo() {
  return (
    <SankeyChart
      title="Engineering talent pipeline"
      subtitle="Campus + lateral hiring"
      height={420}
      nodes={NODES}
      links={LINKS}
    />
  );
}
