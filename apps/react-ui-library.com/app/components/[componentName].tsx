import { useLocalSearchParams } from 'expo-router';
import ComponentDetailScreen from '../../screens/ComponentDetailScreen'
import componentsMeta from '../../data/generated/components-meta.json';

/** Prerender a static page for every documented component. */
export async function generateStaticParams(): Promise<{ componentName: string }[]> {
  return Object.keys(componentsMeta).map((componentName) => ({ componentName }));
}

export default function ComponentDetailPage() {
  const { componentName } = useLocalSearchParams<{
    componentName: string
  }>();

  return <ComponentDetailScreen component={componentName} />;
}
