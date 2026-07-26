import React from 'react';
import { ViewStyle, ImageStyle, StyleProp, ImageSourcePropType } from 'react-native';
import { SizeValue, ColorValue, SpacingProps } from '../../core/theme/types';
import { LayoutProps } from '../../core/utils';
import { BorderRadiusProps } from '../../core/theme/radius';

export interface BaseComponentProps extends SpacingProps {
  /** Component test ID for testing */
  testID?: string;
  
  /** Additional CSS styles */
  style?: any;
}

export interface ImageProps extends BaseComponentProps, Omit<LayoutProps, 'w' | 'h'>, BorderRadiusProps {
  /** Remote image URI, or a bundled asset from `require('./photo.png')` */
  src?: string | ImageSourcePropType;

  /** Image source object (alternative to src) */
  source?: ImageSourcePropType;
  
  /** Alternative text for accessibility */
  alt?: string;
  
  /** Accessibility label */
  accessibilityLabel?: string;
  
  /** Image resize mode */
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  
  /** Image size preset */
  size?: SizeValue | number;
  
  /** Custom width */
  w?: number | string;
  
  /** Custom height */
  h?: number | string;
  
  /** Aspect ratio */
  aspectRatio?: number;
  
  /** Border width */
  borderWidth?: number;
  
  /** Border color */
  borderColor?: ColorValue;
  
  /** Whether image should be rounded */
  rounded?: boolean;
  
  /** Whether image should be circular */
  circle?: boolean;
  
  /** Fallback element to show on error */
  fallback?: React.ReactNode;
  
  /** Loading state element */
  loading?: React.ReactNode;
  
  /** Called when image loads successfully */
  onLoad?: () => void;
  
  /** Called when image fails to load */
  onError?: (error: any) => void;
  
  /** Called when image starts loading */
  onLoadStart?: () => void;
  
  /** Called when image finishes loading (success or error) */
  onLoadEnd?: () => void;
  
  /** Container style */
  containerStyle?: StyleProp<ViewStyle>;
  
  /** Image style overrides */
  imageStyle?: StyleProp<ImageStyle>;
}