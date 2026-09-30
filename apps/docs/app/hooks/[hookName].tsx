import { useLocalSearchParams } from 'expo-router';
import HookDetailScreen from '../../screens/HookDetailScreen';
import hooksMeta from '../../data/generated/hooks-meta.json';

/** Prerender a static page for every documented hook. */
export async function generateStaticParams(): Promise<{ hookName: string }[]> {
  return Object.keys(hooksMeta).map((hookName) => ({ hookName }));
}

export default function HookDetailPage() {
  const params = useLocalSearchParams<{ hookName?: string | string[] }>();
  const value = params?.hookName;
  const hookName = Array.isArray(value) ? value[0] : value;

  return <HookDetailScreen hook={hookName} />;
}
