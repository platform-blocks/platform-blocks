import { NetworkChart } from '../../';

import { LINKS, NODES } from './data';

const riskToColor = (risk?: string) => {
  switch (risk) {
    case 'high':
      return '#FA5252';
    case 'medium':
      return '#FCC419';
    case 'low':
      return '#51CF66';
    default:
      return '#ADB5BD';
  }
};

const riskToOpacity = (risk?: string) => {
  switch (risk) {
    case 'high':
      return 0.85;
    case 'medium':
      return 0.65;
    case 'low':
      return 0.55;
    default:
      return 0.45;
  }
};

export default function Demo() {
  return (
    <NetworkChart
      title="Supply chain relationship map"
      subtitle="Tiered flow from suppliers to regional distribution"
      width={780}
      height={440}
      layout="coordinate"
      nodes={NODES}
      links={LINKS}
      showLabels
      nodeRadius={12}
      nodeRadiusRange={[10, 24]}
      linkWidthRange={[1.2, 4.2]}
      linkColorAccessor={(link) => riskToColor(link.meta?.risk)}
      linkOpacityAccessor={(link) => riskToOpacity(link.meta?.risk)}
      grid={false}
      xAxis={{ show: false }}
      yAxis={{ show: false }}
    />
  );
}
