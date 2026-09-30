import React from 'react';
import { View } from 'react-native';
import { AppHeader } from './Header';
import { DocsHeaderMobile } from './HeaderMobile';

export const DocsHeader: React.FC = () => (
  <>
    <View
      {...({ dataSet: { plocksShellMobileOnly: 'true' } } as any)}
      style={{ width: '100%', height: '100%' }}
    >
      <DocsHeaderMobile />
    </View>
    <View
      {...({ dataSet: { plocksShellDesktopOnly: 'true' } } as any)}
      style={{ width: '100%', height: '100%' }}
    >
      <AppHeader />
    </View>
  </>
);
