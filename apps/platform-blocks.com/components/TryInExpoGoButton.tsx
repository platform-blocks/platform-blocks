import React, { useCallback } from 'react';
import { Linking, Platform } from 'react-native';
import { Button, Icon } from '@platform-blocks/ui';

interface TryInExpoGoButtonProps {
  /** Snack URL for the whole component, or null when none of its demos can run there. */
  snackUrl: string | null;
  /** Matches the sibling Copy Page button by default. */
  size?: 'xs' | 'sm' | 'md';
}

/**
 * Opens the component's Expo Snack, which lands on the QR tab so the demos can
 * be scanned into Expo Go. Renders nothing when the component has no runnable
 * Snack.
 */
export const TryInExpoGoButton: React.FC<TryInExpoGoButtonProps> = ({ snackUrl, size = 'sm' }) => {
  const openSnack = useCallback(() => {
    if (!snackUrl) return;
    if (Platform.OS === 'web') {
      window.open(snackUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    Linking.openURL(snackUrl).catch(err => console.error('[TryInExpoGoButton] Failed to open Snack:', err));
  }, [snackUrl]);

  if (!snackUrl) return null;

  return (
    <Button
      size={size}
      variant="secondary"
      radius="xl"
      startIcon={<Icon name="qrcode" size="sm" />}
      tooltip="Open these demos in Expo Snack and scan the QR code with Expo Go"
      onPress={openSnack}
    >
      Try in Expo Go
    </Button>
  );
};

export default TryInExpoGoButton;
