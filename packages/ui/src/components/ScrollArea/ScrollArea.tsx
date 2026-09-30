import React, { useMemo } from 'react';
import { ScrollView, type View } from 'react-native';
import type { ScrollViewProps } from 'react-native';

import { factory } from '../../core/factory/factory';
import { useTheme } from '../../core/theme/ThemeProvider';
import type { StyleProps } from '../../core/theme/types';
import { resolveStyleProps } from '../../core/utils/spacing';
import { Block } from '../Block';
import type { BlockProps, BlockStyleProps } from '../Block';
import { getBlockStyles } from '../Block/utils';

type ContentProps = BlockStyleProps & StyleProps;

/** A scrollable Block with the same named layout props on its viewport and content. */
export interface ScrollAreaProps extends Omit<BlockProps, 'component' | 'children'>,
  Omit<ScrollViewProps, keyof BlockProps | 'contentContainerStyle' | 'children' | 'style'> {
  children?: React.ReactNode;
  /** Layout and spacing of the scrollable content. */
  contentProps?: ContentProps;
  /** Escape hatch for native ScrollView content behavior. */
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
}

export const ScrollArea = factory<{ props: ScrollAreaProps; ref: ScrollView }>((props, ref) => {
  const { children, contentProps, contentContainerStyle, ...viewportProps } = props;
  const theme = useTheme();
  const contentStyle = useMemo(() => [
    getBlockStyles({ gap: 0, ...contentProps }, theme),
    resolveStyleProps(contentProps ?? {}, theme),
    contentContainerStyle,
  ], [contentProps, contentContainerStyle, theme]);

  return (
    <Block {...{ ...viewportProps, contentContainerStyle: contentStyle } as BlockProps} component={ScrollView}
      ref={ref as unknown as React.Ref<View>}>
      {children}
    </Block>
  );
}, { displayName: 'ScrollArea' });
