/**
 * Example showing how to integrate the new universal Disclaimer system
 * into existing components. This demonstrates migrating from hardcoded 
 * status text to the universal disclaimer pattern.
 */

import React, { useState } from 'react';
import { 
  ToggleGroup, 
  ToggleButton, 
  ComponentWithDisclaimer,
  Disclaimer,
  Text,
  Block,
  Icon
} from '@platform-blocks/react-ui-library';

export function Demo() {
  const [view, setView] = useState('list');
  const [favorite, setFavorite] = useState(false);

  return (
    <Block>
      <Text variant="h6" mb="md">Updated Toggle with Disclaimer</Text>
      
      {/* Before: Hardcoded status text */}
      <Block mb="lg">
        <Text variant="p" mb="sm">❌ Old Pattern:</Text>
        <ToggleGroup
          value={view}
          exclusive
          onChange={(value) => setView(value as string)}
          orientation="vertical"
        >
          <ToggleButton value="list">List View</ToggleButton>
          <ToggleButton value="grid">Grid View</ToggleButton>
          <ToggleButton value="block">Block View</ToggleButton>
        </ToggleGroup>
        <Text style={{ marginTop: 8, fontSize: 14, color: 'gray' }}>
          Selected view: {view}
        </Text>
      </Block>

      {/* After: Using ComponentWithDisclaimer */}
      <Block mb="lg">
        <Text variant="p" mb="sm">✅ New Pattern (Wrapper):</Text>
        <ComponentWithDisclaimer 
          disclaimer={`Selected view: ${view}`}
          disclaimerProps={{ size: 'sm', color: 'muted' }}
        >
          <ToggleGroup
            value={view}
            exclusive
            onChange={(value) => setView(value as string)}
            orientation="vertical"
          >
            <ToggleButton value="list">List View</ToggleButton>
            <ToggleButton value="grid">Grid View</ToggleButton>
            <ToggleButton value="block">Block View</ToggleButton>
          </ToggleGroup>
        </ComponentWithDisclaimer>
      </Block>

      {/* Alternative: Using separate Disclaimer component */}
      <Block>
        <Text variant="p" mb="sm">✅ New Pattern (Separate):</Text>
        <ToggleGroup
          value={view}
          exclusive
          onChange={(value) => setView(value as string)}
          orientation="vertical"
        >
          <ToggleButton value="list">List View</ToggleButton>
          <ToggleButton value="grid">Grid View</ToggleButton>
          <ToggleButton value="block">Block View</ToggleButton>
        </ToggleGroup>
        <Disclaimer size="sm" color="muted">
          Selected view: {view}
        </Disclaimer>
      </Block>
    </Block>
  );
}
