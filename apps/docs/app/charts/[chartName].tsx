import { useLocalSearchParams } from 'expo-router';
import ChartDetailScreen from '../../screens/ChartDetailScreen';
import { CHART_DOCS } from '../../config/charts';

/** Prerender a static page for every documented chart. */
export async function generateStaticParams(): Promise<{ chartName: string }[]> {
  return CHART_DOCS.map((chart) => ({ chartName: chart.slug }));
}

export default function ChartDetailPage() {
  const { chartName } = useLocalSearchParams<{ chartName: string }>();
  return <ChartDetailScreen chart={chartName} />;
}
