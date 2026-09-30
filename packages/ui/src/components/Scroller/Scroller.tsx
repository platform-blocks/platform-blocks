import React from 'react';
import { ScrollView, View } from 'react-native';
import { factory } from '../../core/factory';
import { webProps, webStyle } from '../../core/platform';
import { pointerEventsStyles } from '../../core/platform/pointerEvents';
import { useDirection } from '../../core/providers/DirectionProvider';
import { useTheme } from '../../core/theme/ThemeProvider';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { Icon } from '../Icon';
import { IconButton } from '../IconButton';
import type { ScrollerProps } from './types';
import { useScroller } from './useScroller';
const Root = factory<{ props: ScrollerProps; ref: View }>((all, ref) => {
  const { styleProps, otherProps: { children, scrollAmount, draggable = true, controlSize = 'sm', startControlIcon, endControlIcon, startControlProps, endControlProps, showStartControl, showEndControl, edgeGradientColor, style, testID } } = extractStyleProps(all);
  const spacing = useStyleProps(styleProps);
  const theme = useTheme();
  const { isRTL } = useDirection();
  const scroller = useScroller({ scrollAmount, draggable });
  const color = edgeGradientColor ?? theme.backgrounds.base;
  return <View ref={ref} testID={testID} style={[{ position: 'relative', width: '100%' }, spacing, style]}>
    <ScrollView ref={scroller.ref} horizontal showsHorizontalScrollIndicator={false} scrollEventThrottle={16} onScroll={scroller.onScroll} onLayout={scroller.onLayout} onContentSizeChange={scroller.onContentSizeChange} {...webProps({ ...scroller.dragHandlers })} style={webStyle({ cursor: draggable ? scroller.isDragging ? 'grabbing' : 'grab' : 'auto' })}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>{children}</View>
    </ScrollView>
    {(scroller.canScrollStart || showStartControl) && <View style={[{ position: 'absolute', start: 0, top: 0, bottom: 0, justifyContent: 'center', paddingEnd: 8 }, webStyle({ backgroundImage: `linear-gradient(to right, ${color}, transparent)` })]}><IconButton icon={startControlIcon ? <>{startControlIcon}</> : isRTL ? 'chevron-right' : 'chevron-left'} accessibilityLabel="Scroll start" size={controlSize} variant="ghost" onPress={scroller.scrollStart} {...startControlProps} /></View>}
    {(scroller.canScrollEnd || showEndControl) && <View style={[{ position: 'absolute', end: 0, top: 0, bottom: 0, justifyContent: 'center', paddingStart: 8 }, webStyle({ backgroundImage: `linear-gradient(to left, ${color}, transparent)` })]}><IconButton icon={endControlIcon ? <>{endControlIcon}</> : isRTL ? 'chevron-left' : 'chevron-right'} accessibilityLabel="Scroll end" size={controlSize} variant="ghost" onPress={scroller.scrollEnd} {...endControlProps} /></View>}
    <View style={[{ position: 'absolute', top: 0, bottom: 0, start: 0, end: 0 }, pointerEventsStyles.none]} />
  </View>;
}, { displayName: 'Scroller' });
export const Scroller = Root;
