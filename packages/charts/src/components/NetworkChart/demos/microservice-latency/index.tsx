import { NetworkChart } from '@platform-blocks/charts';

import { DEPENDENCIES, SERVICES } from './data';

const latencyToColor = (latency: number) => {
  if (latency <= 150) return '#12B886';
  if (latency <= 220) return '#FAB005';
  return '#FA5252';
};

const latencyToOpacity = (latency: number) => {
  if (latency >= 250) return 0.9;
  if (latency >= 200) return 0.7;
  return 0.5;
};

export default function Demo() {
  return (
    <NetworkChart
      title="Microservice latency map"
      subtitle="Edge-to-core call graph with weighted latency"
      width={680}
      height={460}
      nodes={SERVICES}
      links={DEPENDENCIES}
      showLabels
      nodeRadius={12}
      nodeRadiusRange={[10, 28]}
      linkWidthRange={[1.2, 4.6]}
  linkColorAccessor={(link) => latencyToColor(Number(link.meta?.latency ?? 0))}
  linkOpacityAccessor={(link) => latencyToOpacity(Number(link.meta?.latency ?? 0))}
    />
  );
}
