import { Redirect, useLocalSearchParams } from 'expo-router';
import { componentRoute } from '../../utils/componentRoute';

/** Legacy URLs redirect at runtime; only package URLs are prerendered. */
export async function generateStaticParams(): Promise<{ componentName: string }[]> {
  return [];
}

export default function ComponentDetailPage() {
  const { componentName } = useLocalSearchParams<{
    componentName: string
  }>();

  return <Redirect href={componentRoute(componentName)} />;
}
