import React from 'react';
import type { View } from 'react-native';

import { factory } from '../../core/factory/factory';
import { Block } from '../Block';
import type { BlockProps } from '../Block';
import { Image } from '../Image';
import type { ImageProps } from '../Image';

export interface BackgroundImageProps extends Omit<BlockProps, 'component'>,
  Pick<ImageProps, 'source' | 'src' | 'resizeMode' | 'alt'> {}

/** Image-filled Block that can place labels and controls over the image. */
export const BackgroundImage = factory<{ props: BackgroundImageProps; ref: View }>((props, ref) => {
  const { source, src, resizeMode, alt = '', children, ...blockProps } = props;
  return (
    <Block {...blockProps} ref={ref} gap={blockProps.gap ?? 0} position={blockProps.position ?? 'relative'} overflow="hidden">
      <Block gap={0} position="absolute" inset={0} pointerEvents="none">
        <Image source={source} src={src} resizeMode={resizeMode} alt={alt} w="full" h="full" />
      </Block>
      {children}
    </Block>
  );
}, { displayName: 'BackgroundImage' });
