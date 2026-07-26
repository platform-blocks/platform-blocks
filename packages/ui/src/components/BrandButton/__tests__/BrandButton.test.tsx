import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import { BrandButton } from '../BrandButton';
import { brandColors, resolveBrandConfig } from '../types';

const buttonPropsLog: Array<Record<string, any>> = [];
const brandIconPropsLog: Array<Record<string, any>> = [];
const mockShouldHideComponent = jest.fn<boolean, [Record<string, any>, 'light' | 'dark']>(
  (_props, _scheme) => false
);
const mockExtractUniversalProps = jest.fn((props: any) => {
  const { lightHidden, darkHidden, hiddenFrom, visibleFrom, ...rest } = props;
  return {
    universalProps: { lightHidden, darkHidden, hiddenFrom, visibleFrom },
    componentProps: rest,
  };
});

jest.mock('../../Button', () => {
  const React = require('react');
  return {
    Button: (props: any) => {
      const { children, ...rest } = props;
      buttonPropsLog.push(rest);
      return React.createElement(React.Fragment, null, props.startIcon, children, props.endIcon);
    },
  };
});

jest.mock('../../BrandIcon', () => {
  const React = require('react');
  return {
    brandIcons: jest.requireActual('../../BrandIcon/brands').brandIcons,
    resolveBrandName: jest.requireActual('../../BrandIcon/brands').resolveBrandName,
    BrandIcon: (props: any) => {
      brandIconPropsLog.push(props);
      return React.createElement('BrandIcon', props);
    },
  };
});

jest.mock('../../../core/utils/universalSimple', () => ({
  shouldHideComponent: (props: any, scheme: 'light' | 'dark') =>
    mockShouldHideComponent(props, scheme),
  extractUniversalProps: (props: any) => mockExtractUniversalProps(props),
}));

jest.mock('../../../core/theme', () => ({
  useTheme: () => ({
    colorScheme: 'light',
    text: {
      primary: '#111111',
    },
  }),
}));

describe('BrandButton', () => {
  beforeEach(() => {
    buttonPropsLog.length = 0;
    brandIconPropsLog.length = 0;
    mockShouldHideComponent.mockClear();
    mockExtractUniversalProps.mockClear();
  });

  it('renders a plain brand button with a leading BrandIcon by default', () => {
    render(<BrandButton brand="google" title="Continue" />);

    expect(buttonPropsLog).toHaveLength(1);
    const props = buttonPropsLog[0];
    expect(props.variant).toBe('plain');
    expect(props.startIcon).toBeTruthy();
    expect(props.endIcon).toBeUndefined();
    expect(props.style[0]).toMatchObject({ backgroundColor: 'white', borderColor: 'transparent' });
    expect(brandIconPropsLog[0]).toMatchObject({ brand: 'google', size: 'md', variant: 'full' });
  });

  it('maps primary variant to filled and applies brand colors', () => {
    render(<BrandButton brand="google" title="Sign in" variant={'primary' as any} />);

    const props = buttonPropsLog[0];
    expect(props.variant).toBe('filled');
    expect(props.textColor).toBe('#FFFFFF');
    expect(props.style[0]).toMatchObject({ backgroundColor: '#4285F4', borderColor: '#4285F4' });
  });

  it('places the icon on the right when iconPosition is set', () => {
    render(<BrandButton brand="google" title="Continue" iconPosition="right" />);

    const props = buttonPropsLog[0];
    expect(props.startIcon).toBeUndefined();
    expect(props.endIcon).toBeTruthy();
  });

  it('returns null when universal props hide the component', () => {
    mockShouldHideComponent.mockReturnValueOnce(true);
    const { toJSON } = render(<BrandButton brand="google" title="Hidden" lightHidden />);

    expect(toJSON()).toBeNull();
    expect(buttonPropsLog).toHaveLength(0);
    expect(mockShouldHideComponent).toHaveBeenCalledWith(
      expect.objectContaining({ lightHidden: true }),
      'light'
    );
  });

  it('uses a custom icon when provided', () => {
    const customIcon = React.createElement('CustomIcon', { testID: 'custom-icon' });
    render(<BrandButton brand="google" title="Continue" icon={customIcon} />);

    const props = buttonPropsLog[0];
    expect(props.startIcon.props.testID).toBe('custom-icon');
  });

  it('derives outline styles and text color from brand colors', () => {
    render(<BrandButton brand="google" title="Outline" variant="outline" />);

    const props = buttonPropsLog[0];
    expect(props.textColor).toBe('#4285F4');
    expect(props.style[0]).toMatchObject({ backgroundColor: 'transparent', borderColor: '#4285F4' });
  });

  it('renders the X mark for the deprecated twitter brand', () => {
    render(<BrandButton brand="twitter" title="Share" />);

    expect(brandIconPropsLog[0]).toMatchObject({ brand: 'x' });
  });

  it('gives every registered brand icon a color config', () => {
    const { brandIcons } = jest.requireActual('../../BrandIcon/brands');

    for (const brand of Object.keys(brandIcons)) {
      expect([brand, brand in brandColors]).toEqual([brand, true]);
    }
  });

  it('resolves deprecated camelCase brands onto their canonical config', () => {
    expect(resolveBrandConfig('googlePlay' as any)).toEqual({
      icon: 'google-play',
      ...brandColors['google-play'],
    });
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
          backgroundColor="#191414"
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

    it('returns null when universal props hide a badge', () => {
      mockShouldHideComponent.mockReturnValueOnce(true);
      const { toJSON } = render(
        <BrandButton brand="app-store" primaryText="Download on the" secondaryText="App Store" darkHidden />
      );

      expect(toJSON()).toBeNull();
    });
  });
});
