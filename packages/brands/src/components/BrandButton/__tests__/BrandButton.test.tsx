import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import { BrandButton } from '../BrandButton';

const buttonPropsLog: Array<Record<string, any>> = [];
const brandIconPropsLog: Array<Record<string, any>> = [];

jest.mock('@plocks/ui', () => {
  const React = require('react');
  return {
    ...jest.requireActual('@plocks/ui'),
    useTheme: () => ({
      colorScheme: 'light',
      text: {
        primary: '#111111',
      },
      backgrounds: {
        elevated: '#FFFFFF',
      },
    }),
    Button: (props: any) => {
      const { children, ...rest } = props;
      buttonPropsLog.push(rest);
      return React.createElement(React.Fragment, null, props.startSection, children, props.endSection);
    },
  };
});

jest.mock('../../BrandIcon', () => {
  const React = require('react');
  return {
    BrandIcon: (props: any) => {
      brandIconPropsLog.push(props);
      return React.createElement('BrandIcon', props);
    },
  };
});

describe('BrandButton', () => {
  beforeEach(() => {
    buttonPropsLog.length = 0;
    brandIconPropsLog.length = 0;
  });

  it('renders a plain brand button with a leading BrandIcon by default', () => {
    render(<BrandButton brand="google" title="Continue" />);

    expect(buttonPropsLog).toHaveLength(1);
    const props = buttonPropsLog[0];
    // `plain` renders as Button's neutral `default` with the raised surface fill.
    expect(props.variant).toBe('default');
    expect(props.startSection).toBeTruthy();
    expect(props.endSection).toBeUndefined();
    expect(props.textColor).toBe('#111111');
    expect(props.style[0]).toMatchObject({ backgroundColor: '#FFFFFF', borderColor: 'transparent' });
    expect(brandIconPropsLog[0]).toMatchObject({ brand: 'google', size: 'md', variant: 'full' });
  });

  it('applies brand colors to the filled variant', () => {
    render(<BrandButton brand="google" title="Sign in" variant="filled" />);

    const props = buttonPropsLog[0];
    expect(props.variant).toBe('filled');
    expect(props.textColor).toBe('#FFFFFF');
    expect(props.style[0]).toMatchObject({ backgroundColor: '#4285F4', borderColor: '#4285F4' });
  });

  it('places the icon on the right when iconPosition is set', () => {
    render(<BrandButton brand="google" title="Continue" iconPosition="right" />);

    const props = buttonPropsLog[0];
    expect(props.startSection).toBeUndefined();
    expect(props.endSection).toBeTruthy();
  });

  it('returns null when the visibility props hide the component', () => {
    const { toJSON } = render(<BrandButton brand="google" title="Hidden" lightHidden />);

    expect(toJSON()).toBeNull();
    expect(buttonPropsLog).toHaveLength(0);
  });

  it('accepts breakpoint tokens for hiddenFrom / visibleFrom', () => {
    // The test viewport is wider than `xs`, so hiding from `xs` hides it.
    expect(render(<BrandButton brand="google" title="Token" hiddenFrom="xs" />).toJSON()).toBeNull();
    expect(render(<BrandButton brand="google" title="Shown" visibleFrom="xs" />).toJSON()).not.toBeNull();
  });

  it('uses a custom icon when provided', () => {
    const customIcon = React.createElement('CustomIcon', { testID: 'custom-icon' });
    render(<BrandButton brand="google" title="Continue" icon={customIcon} />);

    const props = buttonPropsLog[0];
    expect(props.startSection.props.testID).toBe('custom-icon');
  });

  it('derives outline styles and text color from brand colors', () => {
    render(<BrandButton brand="google" title="Outline" variant="outline" />);

    const props = buttonPropsLog[0];
    expect(props.textColor).toBe('#4285F4');
    expect(props.style[0]).toMatchObject({ backgroundColor: 'transparent', borderColor: '#4285F4' });
  });

  describe('badge layout', () => {
    it('renders the two-line store badge when badge text is supplied', () => {
      const { getByText, queryByText } = render(
        <BrandButton brand="app-store" primaryText="Download on the" secondaryText="App Store" />
      );

      // The badge shell replaces Button entirely.
      expect(buttonPropsLog).toHaveLength(0);
      expect(getByText('Download on the')).toBeTruthy();
      expect(getByText('App Store')).toBeTruthy();
      expect(queryByText('unused')).toBeNull();
      expect(brandIconPropsLog[0]).toMatchObject({
        brand: 'app-store',
        invertInDarkMode: false,
      });
      // Badge icons are sized in pixels, not tokens.
      expect(typeof brandIconPropsLog[0].size).toBe('number');
    });

    it('stays a button when the badge text props are empty strings', () => {
      render(<BrandButton brand="google" title="Continue" primaryText="" secondaryText="" />);

      expect(buttonPropsLog).toHaveLength(1);
      expect(buttonPropsLog[0].title).toBe('Continue');
    });

    it('labels the badge from both text lines and honors color overrides', () => {
      const { getByLabelText } = render(
        <BrandButton
          brand="spotify"
          primaryText="Listen on"
          secondaryText="Spotify"
          bg="#191414"
          borderColor="#1DB954"
        />
      );

      const badge = getByLabelText('Listen on Spotify');
      expect(StyleSheet.flatten(badge.props.style)).toMatchObject({
        backgroundColor: '#191414',
        borderColor: '#1DB954',
      });
    });

    it('falls back to the md badge metrics for an unrecognized size', () => {
      const { getByLabelText } = render(
        <BrandButton
          brand="app-store"
          primaryText="Download on the"
          secondaryText="App Store"
          size={999 as any}
        />
      );

      // md is derived from a 13px headline: radius 6, height 40.
      expect(
        StyleSheet.flatten(getByLabelText('Download on the App Store').props.style)
      ).toMatchObject({ borderRadius: 6, minHeight: 40 });
    });

    it('returns null when the visibility props hide a badge', () => {
      const { toJSON } = render(
        <BrandButton brand="app-store" primaryText="Download on the" secondaryText="App Store" lightHidden />
      );

      expect(toJSON()).toBeNull();
    });
  });
});
