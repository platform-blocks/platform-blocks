import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Button, Text, Card, Block, BrandButton } from '@platform-blocks/ui';
import { Title } from 'platform-blocks/components';

export default function ButtonShowcase() {
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isSmall = width < 768;
  return (
    <View>
      <Title afterline>Buttons</Title>
      <Block direction={isSmall ? 'column' : 'row'} gap={20} wrap={isSmall ? undefined : 'wrap'}>

        {/* Size Options */}
        <Card>
          <Text >Sizes</Text>
          <Block direction="column" gap={6}>
            {['xs', 'sm', 'md', 'lg', 'xl'].map((sz) => (
              <Button
                key={sz}
                size={sz as any}
                loading={loading}
                tooltip={`This is a ${sz} button`}
                // onPress={() => setSize(sz)}
                fullWidth
              >
                {sz.toUpperCase()}
              </Button>
            ))}
          </Block>
        </Card>
        {/* Variant Options */}
        <Card>
          <Text>Variants</Text>
          <Block direction="column" gap={6}>
      {(['filled', 'outline', 'ghost', 'link', 'gradient'] as const).map((variant) => (
              <Button
                key={variant}
        loading={loading}
        variant={variant}
        fullWidth
              >
                {variant.charAt(0).toUpperCase() + variant.slice(1)}
              </Button>
            ))}
          </Block>
        </Card>

        {/* Color Options */}
        <Card>
          <Text>Colors</Text>
          <Block direction="column" gap={6}>
            {['primary', 'secondary', 'success', 'error', 'warning', 'gray'].map((clr) => (
              <Button
                key={clr}
                variant="filled"
                color={clr}
                loading={loading}
                fullWidth
              >
                {clr.charAt(0).toUpperCase() + clr.slice(1)}
              </Button>
            ))}
          </Block>
        </Card>

        {/* Disabled and Loading States */}
        <Card>
          <Text>Disabled and Loading States</Text>
          <Block direction="column" gap={6}>
           
            <Button
              key="loading"
              loading
              loadingTitle="Please wait..."
              fullWidth
            >
              Loading
            </Button><Button
              key="loading2"
              loading
            >

              Loading
            </Button>
             <Button
              key="disabled"
              disabled
              loading={loading}
            >
              Disabled
            </Button>
          </Block>
        </Card>

        {/* Brand Buttons */}
        <Card>
          <Text>Brand Buttons</Text>
          <Block direction="column" gap={6} wrap="wrap">
            {[
              'facebook', 'x', 'google', 'github', 'apple', 'linkedin', 
            ].map((brand,i) => (
              <BrandButton

              variant={'outline' }

                key={brand}
                             title={
                          'Login with ' +    brand.charAt(0).toUpperCase() + brand.slice(1)
                            }
   brand={brand as any}
                loading={loading}
                onPress={() => console.log(`${brand} pressed`)}
                iconVariant="full"
                fullWidth
              >
              </BrandButton>
            ))}
          </Block>
        </Card>
      </Block>
    </View>
  );
}