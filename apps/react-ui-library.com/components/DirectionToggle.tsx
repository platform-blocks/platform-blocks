import React from 'react';
import { Button, useDirection } from '@platform-blocks/react-ui-library';

/**
 * A simple toggle button to switch between LTR and RTL directions
 * Add this to your app header or settings page to test RTL functionality
 */
export const DirectionToggle: React.FC = () => {
  const { dir, toggleDirection } = useDirection();
  
  return (
    <Button
      onPress={toggleDirection}
      variant="outline"
      size="sm"
      aria-label={`Switch to ${dir === 'ltr' ? 'RTL' : 'LTR'} mode`}
    >
      {dir === 'ltr' ? '→ RTL' : '← LTR'}
    </Button>
  );
};
