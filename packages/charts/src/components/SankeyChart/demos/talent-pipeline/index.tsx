import { SankeyChart } from '@platform-blocks/charts';

import { LINKS, NODES } from './data';

export default function Demo() {
  return (
    <SankeyChart
      title="Engineering talent pipeline"
      subtitle="Campus + lateral hiring"
      width={760}
      height={420}
      nodes={NODES}
      links={LINKS}
    />
  );
}
