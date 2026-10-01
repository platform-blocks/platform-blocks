import React, { useEffect, useState } from 'react';
import { Block, Skeleton, Text } from '@plocks/ui';
import { GlobalChartsRoot } from '@plocks/charts';
import { DOCS_CHART_INTERACTION_CONFIG } from '../../config/chartInteraction';
import { getNewDemos, loadDemoComponentNew } from '../../utils/demosLoader';
import GalleryTableOfContents from './GalleryTableOfContents';

function DemoUnavailable() {
  return <Text c="secondary">This preview is unavailable.</Text>;
}

class DemoBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <DemoUnavailable /> : this.props.children;
  }
}

export default function GalleryDemo({ name, isChart }: { name: string; isChart: boolean }) {
  const [preview, setPreview] = useState<{ Component: React.ComponentType | null } | null>(null);

  useEffect(() => {
    let active = true;
    const demos = getNewDemos(name);
    const demo = demos.find(item => item.id === 'basic') ?? demos[0];
    const load = name === 'TableOfContents'
      ? Promise.resolve(GalleryTableOfContents)
      : demo ? loadDemoComponentNew(name, demo.id) : Promise.resolve(null);
    load.then(Component => {
      if (active) setPreview({ Component });
    }).catch(() => {
      if (active) setPreview({ Component: null });
    });

    return () => { active = false; };
  }, [name]);

  const Component = preview?.Component;

  return (
    <Block fullWidth miw={0} testID={`gallery-demo-${name}`}>
      <Block fullWidth miw={0} maw={name === 'CandlestickChart' ? 400 : undefined} px={name === 'CandlestickChart' ? 'md' : undefined}>
        <DemoBoundary>
          {!preview ? <Skeleton h={120} w="100%" accessibilityLabel={`Loading ${name}`} />
            : Component ? (isChart
              ? <GlobalChartsRoot style={{ width: '100%', alignItems: 'center' }} config={DOCS_CHART_INTERACTION_CONFIG}><Component /></GlobalChartsRoot>
              : <Component />) : <DemoUnavailable />}
        </DemoBoundary>
      </Block>
    </Block>
  );
}
