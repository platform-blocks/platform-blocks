import { NetworkChart } from '@platform-blocks/charts';

import { PROPAGATION, SYSTEMS } from './data';

const severityToColor = (severity?: string) => {
  switch (severity) {
    case 'critical':
      return '#FA5252';
    case 'major':
      return '#FD7E14';
    case 'minor':
      return '#FAB005';
    default:
      return '#ADB5BD';
  }
};

const severityToOpacity = (severity?: string) => {
  switch (severity) {
    case 'critical':
      return 0.88;
    case 'major':
      return 0.68;
    case 'minor':
      return 0.55;
    default:
      return 0.45;
  }
};

export function Demo() {
  return (
    <NetworkChart
      title="Risk propagation path"
      subtitle="Simulated attack progression across services"
      width={640}
      height={420}
      nodes={SYSTEMS}
      links={PROPAGATION}
      showLabels
      nodeRadius={12}
      nodeRadiusRange={[10, 26]}
      linkWidthRange={[1.1, 3.9]}
      linkColorAccessor={(link) => severityToColor(link.meta?.severity)}
      linkOpacityAccessor={(link) => severityToOpacity(link.meta?.severity)}
    />
  );
}
