import type { ViewStyle, StyleProp, ImageSourcePropType } from 'react-native';
import type { SizeValue } from '../../core/theme/types';
import type { BrandName } from '../BrandIcon/brands';

export interface BlockquoteAuthor {
  name: string;
  title?: string;
  organization?: string;
  /** Remote avatar URL, or a bundled asset from `require('./avatar.png')` */
  avatar?: string | ImageSourcePropType;
  avatarFallback?: string;
}

export interface BlockquoteLinks {
  website?: string;
  twitter?: string;
  linkedin?: string;
  [key: string]: string | undefined;
}

export interface BlockquoteRating {
  value: number;
  max?: number;
  showValue?: boolean;
}

export interface BlockquoteSource {
  name: string;
  brand?: BrandName;
  icon?: string;
  logo?: string;
  url?: string;
}

export interface BlockquoteProps {
  // Core content
  children: React.ReactNode;
  
  // Styling
  variant?: 'default' | 'testimonial' | 'featured' | 'minimal';
  size?: SizeValue;
  color?: string;
  
  // Quote icon
  quoteIcon?: string | React.ReactNode;
  quoteIconPosition?: 'top-left' | 'top-center' | 'bottom-right' | 'none';
  quoteIconSize?: SizeValue;
  
  // Author attribution
  author?: BlockquoteAuthor;
  
  // Social/profile links
  links?: BlockquoteLinks;
  
  // Metadata
  date?: Date | string;
  rating?: BlockquoteRating;
  
  // Brand/source
  source?: BlockquoteSource;
  
  // Verification
  verified?: boolean;
  verifiedTooltip?: string;
  
  // Layout
  alignment?: 'left' | 'center' | 'right';
  /**
   * Which side the attribution block (avatar, name, source, meta) sits on.
   * Defaults to `'right'`, or `'center'` when `alignment` is `'center'`.
   */
  attributionAlignment?: 'left' | 'center' | 'right';
  border?: boolean;
  shadow?: boolean;
  
  // Standard props
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export interface BlockquoteAttributionProps {
  author?: BlockquoteAuthor;
  date?: Date | string;
  rating?: BlockquoteRating;
  source?: BlockquoteSource;
  links?: BlockquoteLinks;
  verified?: boolean;
  verifiedTooltip?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface BlockquoteAuthorProps {
  author: BlockquoteAuthor;
  alignment?: 'left' | 'center' | 'right';
}

export interface BlockquoteSourceProps {
  source: BlockquoteSource;
  alignment?: 'left' | 'center' | 'right';
}

export interface BlockquoteMetaProps {
  date?: Date | string;
  rating?: BlockquoteRating;
  verified?: boolean;
  verifiedTooltip?: string;
  alignment?: 'left' | 'center' | 'right';
}