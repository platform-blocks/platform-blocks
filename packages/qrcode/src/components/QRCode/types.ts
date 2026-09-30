import type React from 'react';
import type { ViewStyle, ImageSourcePropType } from 'react-native';

import type { BaseProps, LayoutProps, ComponentSizeValue, TextProps } from '@plocks/ui';

export interface QRCodeProps extends BaseProps<ViewStyle>, LayoutProps {
  /** The data/text to encode in the QR code */
  value: string;

  /**
   * Caption rendered with the code — what the user is being asked to scan.
   * Also supplies the accessibility label when `accessibilityLabel` is unset.
   */
  label?: React.ReactNode;

  /** Secondary line rendered under the label, for the longer explanation. */
  description?: React.ReactNode;

  /** Which side of the code the caption sits on. @default 'bottom' */
  labelPosition?: 'top' | 'bottom';

  /** Override props applied to the label `<Text>` */
  labelProps?: Omit<TextProps, 'children'>;

  /** Override props applied to the description `<Text>` */
  descriptionProps?: Omit<TextProps, 'children'>;

  /**
   * Size of the QR code (both width and height). Accepts a size token
   * (`xs`–`3xl`) or an explicit pixel value.
   */
  size?: ComponentSizeValue;
  
  /** Background of the code itself: a background token, palette color, or any CSS color. */
  bg?: string;
  
  /** Foreground color (the QR code pattern color) */
  color?: string;
  /** 
   * Module shape variant for data modules. 
   * Note: Finder patterns (corner anchors) always remain square for optimal scanner compatibility.
   */
  moduleShape?: 'square' | 'rounded' | 'diamond';
  /** Rounded corner radius factor (0-1) applied when moduleShape='rounded' */
  cornerRadius?: number;
  /** Gradient fill (overrides color) */
  gradient?: {
    type?: 'linear' | 'radial';
    /** Start color */
    from: string;
    /** End color */
    to: string;
    /** (linear) rotation deg (0=left->right) */
    rotation?: number;
  };
  
  /** Error correction level */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  
  /** 
   * Quiet zone size (border modules around the QR code). 
   * Defaults to 4 for QR code standard compliance.
   * Set to 0 to remove all padding around the code.
   */
  quietZone?: number;
  
  /** Logo to display in the center of the QR code */
  logo?: {
  /** Remote/data URI, or a bundled asset from `require('./logo.png')` */
  uri: string | ImageSourcePropType;
  /** Optional React element to render as logo instead of default */
  element?: React.ReactNode;
    size?: number;
    backgroundColor?: string;
    borderRadius?: number;
  };
  
  /**
   * Accessible name of the code (announced as an image). Defaults to a string
   * `label`, else `"QR code: <value>"` (long values truncated).
   */
  accessibilityLabel?: string;
  
  /** Callback when QR code generation fails */
  onError?: (error: Error) => void;
  /** If true (or object), tapping the QR copies the value (or provided value). */
  copyOnPress?: boolean | { value?: string };
  /** Show a floating copy button overlay */
  showCopyButton?: boolean;
  /** Custom toast title when copied */
  copyToastTitle?: string;
  /** Custom toast message when copied */
  copyToastMessage?: string;
}

/**
 * Props for the internal SVG renderer. `QRCode` resolves `size` tokens to a
 * pixel value before rendering, so this layer only ever sees a number.
 */
export type QRCodeSVGProps = Omit<QRCodeProps, 'size'> & { size?: number };
