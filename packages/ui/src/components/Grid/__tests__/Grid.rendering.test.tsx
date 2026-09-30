import React from 'react';
import { render } from '@testing-library/react-native';
import { Text as RNText } from 'react-native';
import * as ReactNative from 'react-native';

import { Grid, GridItem } from '../Grid';

// Grid reads the viewport from the shared store in core/responsive, which
// measures through Dimensions.get('window').
const useWindowDimensionsSpy = jest.spyOn(ReactNative.Dimensions, 'get');

const createDimensions = (width: number) => ({ width, height: 768, scale: 2, fontScale: 2 });

describe('Grid - rendering', () => {
  beforeEach(() => {
    useWindowDimensionsSpy.mockReturnValue(createDimensions(1024));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('matches snapshot for a standard multi-column grid', () => {
    const tree = render(
      <Grid gap="sm">
        <GridItem span={4}>
          <RNText>Analytics</RNText>
        </GridItem>
        <GridItem span={4}>
          <RNText>Automation</RNText>
        </GridItem>
        <GridItem span={4}>
          <RNText>Engagement</RNText>
        </GridItem>
      </Grid>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for a responsive full-width grid on narrow screens', () => {
    useWindowDimensionsSpy.mockReturnValue(createDimensions(480));

    const tree = render(
      <Grid fullWidth gap="md" columns={{ base: 2, md: 4 }}>
        <GridItem span={{ base: 2, md: 1 }}>
          <RNText>Alpha</RNText>
        </GridItem>
        <GridItem span={{ base: 1, md: 1 }}>
          <RNText>Beta</RNText>
        </GridItem>
        <GridItem span={{ base: 1, md: 2 }}>
          <RNText>Gamma</RNText>
        </GridItem>
      </Grid>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
