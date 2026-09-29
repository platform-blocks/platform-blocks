import React from 'react';
import { ScrollView, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { factory } from '../../core/factory/factory';
import { useStyleProps } from '../../core/utils/spacing';
import type { AppShellSectionProps } from './types';

const GROW: ViewStyle = { flex: 1 };
// A scroll area that doesn't grow still has to be allowed to shrink, or it
// never gets a bounded height to scroll within.
const SHRINK: ViewStyle = { flexShrink: 1, minHeight: 0 };

/** Stacks content inside the navbar or aside; `grow` takes the remaining space. */
export const AppShellSection = factory<{ props: AppShellSectionProps; ref: View }>(
  function AppShellSection(props, ref) {
    const { children, grow = false, withScrollArea = false, style, testID } = props;
    const spacingStyles = useStyleProps(props);

    return (
      <View
        ref={ref}
        testID={testID}
        style={[grow ? GROW : null, withScrollArea && !grow ? SHRINK : null, spacingStyles, style]}
      >
        {withScrollArea ? <ScrollView>{children}</ScrollView> : children}
      </View>
    );
  },
  { displayName: 'AppShellSection' }
);
