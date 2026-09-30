import React from 'react';
import { KeyboardAvoidingView, type KeyboardAvoidingViewProps, type View } from 'react-native';

import { factory } from '../../core/factory/factory';
import { Block } from '../Block';
import type { BlockProps } from '../Block';

export interface KeyboardAvoidingAreaProps extends Omit<BlockProps, 'component'>,
  Pick<KeyboardAvoidingViewProps, 'behavior' | 'keyboardVerticalOffset' | 'enabled'> {}

/** A Block that moves its content clear of the mobile keyboard. */
export const KeyboardAvoidingArea = factory<{ props: KeyboardAvoidingAreaProps; ref: View }>((props, ref) => (
  <Block {...props as BlockProps} component={KeyboardAvoidingView} ref={ref} />
), { displayName: 'KeyboardAvoidingArea' });
