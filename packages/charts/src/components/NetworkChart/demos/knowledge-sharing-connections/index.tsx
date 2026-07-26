import { useState, useMemo } from 'react';
import { Text } from 'react-native';
import { NetworkChart } from '../../';

import { MENTORSHIPS, TEAMS } from './data';

const linkColorByType = (type: string | undefined) => {
  switch (type) {
    case 'cross-team':
      return '#5F3DC4';
    case 'program':
      return '#1971C2';
    case 'rotation':
      return '#FFA94D';
    case 'pairing':
      return '#15AABF';
    default:
      return '#ADB5BD';
  }
};

const linkOpacityByType = (type: string | undefined) => {
  switch (type) {
    case 'cross-team':
      return 0.72;
    case 'program':
      return 0.6;
    case 'rotation':
      return 0.55;
    case 'pairing':
      return 0.5;
    default:
      return 0.45;
  }
};

export default function Demo() {
  const [focusDetail, setFocusDetail] = useState<string | null>(null);

  const highlightText = useMemo(() => focusDetail, [focusDetail]);

  return (
    <>
      <NetworkChart
        title="Knowledge sharing mentorship graph"
        subtitle="Monthly mentorship hours across guild programs"
        width={660}
        height={440}
        layout="radial"
        nodes={TEAMS}
        links={MENTORSHIPS}
        showLabels
        nodeRadius={14}
        nodeRadiusRange={[12, 26]}
        linkWidthRange={[1.1, 3.8]}
        linkShape="curved"
        linkCurveStrength={0.38}
        linkPalette={['#7048E8', '#4263EB', '#0CA678', '#F08C00']}
        linkColorAccessor={(link) => linkColorByType(link.meta?.type)}
        linkOpacityAccessor={(link) => linkOpacityByType(link.meta?.type)}
        onNodeFocus={(event) =>
          setFocusDetail(
            `${event.node.name ?? event.node.id} • ${Math.round(event.node.value ?? 0)} active mentorship hours`
          )
        }
        onNodeBlur={() => setFocusDetail(null)}
        onLinkFocus={(event) => {
          const sourceName = event.source.node?.name ?? event.link.source;
          const targetName = event.target.node?.name ?? event.link.target;
          setFocusDetail(`${sourceName} mentoring ${targetName}`);
        }}
        onLinkBlur={() => setFocusDetail(null)}
      />
      {highlightText && (
        <Text style={{ marginTop: 12, fontSize: 12, color: '#495057' }}>{highlightText}</Text>
      )}
    </>
  );
}
