import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useGlobalSearchParams, usePathname, router } from 'expo-router';
import { AppLayoutProvider, AppLayoutRenderer, useOverlayApi } from '@plocks/ui';
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
  const { closeAllOverlays } = useOverlayApi();
  const previousPathname = React.useRef(pathname);

  React.useEffect(() => {
    if (previousPathname.current !== pathname) {
      closeAllOverlays();
      previousPathname.current = pathname;
    }
  }, [pathname, closeAllOverlays]);

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <RootLayoutInner />
      </AppProviders>
    </GestureHandlerRootView>
  );
}
