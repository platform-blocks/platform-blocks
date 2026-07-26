import React from 'react';
import type { Text as RNText } from 'react-native';

import { Text, type TextProps } from './Text';

type TextAliasProps = Omit<TextProps, 'variant'>;

/**
 * Builds an HTML-like alias of `Text` with `variant` pinned. Each alias
 * forwards its ref through to the underlying text node so callers can measure
 * or focus it exactly as they would a plain `Text`.
 */
const createTextAlias = (variant: TextProps['variant'], displayName: string) => {
  const Alias = React.forwardRef<RNText, TextAliasProps>((props, ref) => (
    <Text ref={ref} variant={variant} {...props} />
  ));
  Alias.displayName = displayName;
  return Alias;
};

// Create component aliases for HTML-like usage
export const H1 = createTextAlias('h1', 'H1');
export const H2 = createTextAlias('h2', 'H2');
export const H3 = createTextAlias('h3', 'H3');
export const H4 = createTextAlias('h4', 'H4');
export const H5 = createTextAlias('h5', 'H5');
export const H6 = createTextAlias('h6', 'H6');
export const P = createTextAlias('p', 'P');
export const Small = createTextAlias('small', 'Small');
export const Strong = createTextAlias('strong', 'Strong');
export const Bold = createTextAlias('b', 'Bold');
export const Italic = createTextAlias('i', 'Italic');
export const Emphasis = createTextAlias('em', 'Emphasis');
export const Underline = createTextAlias('u', 'Underline');
export const Code = createTextAlias('code', 'Code');
export const Kbd = createTextAlias('kbd', 'Kbd');
export const Mark = createTextAlias('mark', 'Mark');
export const Blockquote = createTextAlias('blockquote', 'Blockquote');
export const Cite = createTextAlias('cite', 'Cite');
export const Sub = createTextAlias('sub', 'Sub');
export const Sup = createTextAlias('sup', 'Sup');
