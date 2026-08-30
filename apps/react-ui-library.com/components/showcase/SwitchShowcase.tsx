import React, { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Switch, Text, Card, Button, Block } from '@platform-blocks/react-ui-library';
import { Title } from 'platform-blocks/components';
import { router } from 'expo-router';

export default function SwitchShowcase() {
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isSmall = width < 768;
  return (
    <Block>
      <Title afterline 
      
      action={<Button
      onPress={() => router.push('/components/Switch')}
      >go to docs</Button>}
      >Switches</Title>
      
      <Block direction={isSmall ? 'column' : 'row'} gap={20} wrap={isSmall ? undefined : 'wrap'}>

        {/* Size Options */}
        <Card>
          <Text>Sizes</Text>
          <Block direction="column" gap={12}>
            {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((sz) => (
              <Switch
                key={sz}
                size={sz}
                defaultChecked
                label={`${sz.toUpperCase()} Switch`}
              />
            ))}
          </Block>
        </Card>

        {/* Color Options */}
        <Card>
          <Text>Colors</Text>
          <Block direction="column" gap={12}>
            {(['primary', 'secondary', 'success', 'error', 'warning'] as const).map((clr) => (
              <Switch
                key={clr}
                color={clr}
                defaultChecked
                label={`${clr.charAt(0).toUpperCase() + clr.slice(1)} color`}
              />
            ))}
          </Block>
        </Card>

        {/* States */}
        <Card>
          <Text>States</Text>
          <Block direction="column" gap={12}>
            <Switch
              defaultChecked={false}
              label="Unchecked"
            />
            <Switch
              defaultChecked={true}
              label="Checked"
            />
            <Switch
              disabled
              defaultChecked={false}
              label="Disabled unchecked"
            />
            <Switch
              disabled
              defaultChecked={true}
              label="Disabled checked"
            />
          </Block>
        </Card>

        {/* Label Positions */}
        <Card>
          <Text>Label Positions</Text>
          <Block direction="column" gap={12}>
            <Switch
              defaultChecked
              label="Label on right (default)"
              labelPosition="right"
            />
            <Switch
              defaultChecked
              label="Label on left"
              labelPosition="left"
            />
          </Block>
        </Card>

        {/* With Descriptions and Errors */}
        <Card>
          <Text>Additional Props</Text>
          <Block direction="column" gap={12}>
            <Switch
              defaultChecked
              label="With description"
              description="This switch has a helpful description below it"
            />
            <Switch
              defaultChecked
              label="Required switch"
              required
            />
            <Switch
              defaultChecked={false}
              label="Switch with error"
              error="This field is required"
            />
          </Block>
        </Card>

      </Block>
    </Block>
  );
}
