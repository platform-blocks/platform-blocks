import React from 'react';
import { Stack, useGlobalSearchParams, usePathname, router } from 'expo-router';
import { AppLayoutProvider, AppLayoutRenderer } from '@platform-blocks/ui';
import { AppProviders } from '../components/layout/Providers';
import { ToastShellOffsetBridge } from '../components/layout/ToastShellOffsetBridge';
import { docsLayout } from '../config/docsLayout';

const PureStackNavigator = React.memo(() => (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="index" />
    <Stack.Screen name="components" />
    <Stack.Screen name="faq/index" />
    <Stack.Screen name="getting-started/index" />
  </Stack>
), () => true);

function RootLayoutInner() {
  const params = useGlobalSearchParams();
  const pathname = usePathname();

  const query = React.useMemo(() => {
    return Object.fromEntries(Object.entries(params ?? {}));
  }, [params]);

  const navigation = React.useMemo(() => ({
    push: (path: string) => router.push(path),
    replace: (path: string) => router.replace(path),
    goBack: () => router.back(),
  }), []);

  return (
    <AppLayoutProvider
      blueprint={docsLayout}
      value={{
        query,
        pathname,
        navigation,
      }}
    >
      <AppLayoutRenderer>
        <ToastShellOffsetBridge />
        <PureStackNavigator />
      </AppLayoutRenderer>
    </AppLayoutProvider>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootLayoutInner />
    </AppProviders>
  );
}
