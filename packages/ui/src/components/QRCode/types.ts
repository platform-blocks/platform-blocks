import { ViewStyle, StyleProp, ImageSourcePropType } from 'react-native';
import { SpacingProps, LayoutProps } from '../../core/utils';
import type { ComponentSizeValue } from '../../core/theme/componentSize';
import type { TextProps } from '../Text';

export interface QRCodeProps extends SpacingProps, LayoutProps {
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
  
  /** Background color of the QR code */
  backgroundColor?: string;
  
  /** Foreground color (the QR code pattern color) */
  color?: string;
  /** 
   * Module shape variant for data modules. 
   * Note: Finder patterns (corner anchors) always remain square for optimal scanner compatibility.
   */
  moduleShape?: 'square' | 'rounded' | 'diamond';
  /** Corner (finder) shape variant - DEPRECATED: Finder patterns always remain square */
  finderShape?: 'square' | 'rounded';
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
   * Defaults to 1 for compact layouts. Set to 4 for strict QR code standard compliance.
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
  
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
  
  /** Test ID for testing */
  testID?: string;
  
  /** Accessibility label */
  accessibilityLabel?: string;
  
  /** Callback when QR code generation fails */
  onError?: (error: Error) => void;
  
  /** Callback when QR code starts loading */
  onLoadStart?: () => void;
  
  /** Callback when QR code finishes loading */
  onLoadEnd?: () => void;
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
