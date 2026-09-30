import { useLocalSearchParams } from 'expo-router';
import ComponentDetailScreen from '../../screens/ComponentDetailScreen';
import componentsMeta from '../../data/generated/components-meta.json';
import { componentMatchesPackage, componentPackageSlug } from '../../utils/componentRoute';

export async function generateStaticParams(): Promise<{ packageName: string; componentName: string }[]> {
  return Object.keys(componentsMeta).flatMap((componentName) => {
    const packageName = componentPackageSlug(componentName);
    // The charts package has a dedicated route at /charts/[chartName].
    return packageName && packageName !== 'charts' ? [{ packageName, componentName }] : [];
  });
}

export default function PackageComponentDetailPage() {
  const { packageName, componentName } = useLocalSearchParams<{
    packageName: string;
    componentName: string;
  }>();

  return <ComponentDetailScreen component={componentMatchesPackage(componentName, packageName) ? componentName : undefined} />;
}
