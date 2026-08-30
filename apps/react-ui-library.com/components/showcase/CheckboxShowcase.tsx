import React, { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Checkbox, Text, Card, Block, Icon } from '@platform-blocks/react-ui-library';
import { Title } from 'platform-blocks/components';

export default function CheckboxShowcase() {
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isSmall = width < 768;
  return (
    <View>
      <Title afterline>Checkbox </Title>
      
      <Block direction={isSmall ? 'column' : 'row'} gap={20} wrap={isSmall ? undefined : 'wrap'}>

        {/* Size Options */}
        <Card style={{ minWidth: 280 }}>
          <Text>Sizes</Text>
          <Block direction="column" gap={12}>
            {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((sz) => (
              <Checkbox
                key={sz}
                size={sz}
                defaultChecked
                label={`${sz.toUpperCase()} Checkbox`}
              />
            ))}
          </Block>
        </Card>

        {/* Color Options */}
        <Card style={{ minWidth: 280 }}>
          <Text>Colors</Text>
          <Block direction="column" gap={12}>
            {(['primary', 'secondary', 'success', 'error', 'warning'] as const).map((clr) => (
              <Checkbox
                key={clr}
                color={clr}
                defaultChecked
                label={`${clr.charAt(0).toUpperCase() + clr.slice(1)} color`}
              />
            ))}

            <Checkbox
              defaultChecked
              color="#cd4ea3ff"
              label="Custom pink color"
            />
          </Block>
        </Card>

        {/* States */}
        <Card style={{ minWidth: 280 }}>
          <Text>States</Text>
          <Block direction="column" gap={12}>
            <Checkbox
              defaultChecked={false}
              label="Unchecked"
            />
            <Checkbox
              defaultChecked={true}
              label="Checked"
            />
            <Checkbox
              disabled
              defaultChecked={false}
              label="Disabled unchecked"
            />
            <Checkbox
              disabled
              defaultChecked={true}
              label="Disabled checked"
            />
            <Checkbox
              defaultChecked
              label="Copy icon for action"
              icon={<Icon name="copy" color="blue" />}
            />
            <Checkbox
              defaultChecked
              label="Custom text icon"
              icon={<Text style={{ color: 'purple', fontWeight: 'bold' }}>✨</Text>}
            />
          </Block>
        </Card>

        <Card style={{ minWidth: 280 }}>
          <Text>Label Positions</Text>
          <Block direction="column" gap={12}>
            <Checkbox
              defaultChecked
              label="Label on right (default)"
              labelPosition="right"
            />
            <Checkbox
              defaultChecked
              label="Label on left"
              labelPosition="left"
            />
            {/* custom icon */}
            <Checkbox
              defaultChecked
              label="Custom icon example"
              labelPosition="top"
              icon={<Icon name="close" color="white" />}
            />
            <Checkbox
              defaultChecked
              label="Custom icon example"
              color="#ff0000"
              labelPosition="bottom"
              icon={<Icon name="trash" color="white" />}
            />
          </Block>
        </Card>

        {/* With Descriptions and Errors */}
        <Card style={{ minWidth: 280 }}>
          <Text>Additional Props</Text>
          <Block direction="column" gap={12}>
            <Checkbox
              defaultChecked
              label="With description"
              description="This Checkbox has a helpful description below it"
            />
            <Checkbox
              label="Required Checkbox"
              description="This field is required"
              required
            />
            <Checkbox
              defaultChecked={false}
              label="Checkbox with error"
              error="There was an error with this selection"
            />
          </Block>
        </Card>

       
      </Block>
    </View>
  );
}
