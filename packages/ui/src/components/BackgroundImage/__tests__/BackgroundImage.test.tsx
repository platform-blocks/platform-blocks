import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { BackgroundImage } from '../BackgroundImage';
import { Image } from '../../Image';

describe('BackgroundImage', () => {
  it('keeps foreground content above a decorative, full-size image', () => {
    const source = { uri: 'https://example.com/landscape.jpg' };
    render(<BackgroundImage testID="background" source={source} w={320}><Text>Caption</Text></BackgroundImage>);
    expect(screen.getByText('Caption')).toBeTruthy();
    expect(screen.UNSAFE_getByType(Image).props.source).toBe(source);
    expect(screen.UNSAFE_getByType(Image).props.alt).toBe('');
    expect(StyleSheet.flatten(screen.getByTestId('background').props.style)).toMatchObject({
      width: 320,
      position: 'relative',
      overflow: 'hidden',
    });
  });
});
