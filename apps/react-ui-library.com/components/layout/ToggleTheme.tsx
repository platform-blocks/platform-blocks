import React from 'react';
import { IconButton, useThemeMode } from '@platform-blocks/react-ui-library';
import { NavIconButton, NavIconButtonProps } from './NavIconButton';

const MODE_ICONS = { light: 'sun', dark: 'moon', auto: 'contrast' } as const;

type HeaderThemeToggleProps = Omit<NavIconButtonProps, 'icon' | 'onPress' | 'accessibilityLabel'>;

export const HeaderThemeToggle: React.FC<HeaderThemeToggleProps> = (props) => {
  const { mode, cycleMode } = useThemeMode();
  const icon = MODE_ICONS[mode];
  const tooltipLabel =
    mode === 'light' ? 'Light mode' : mode === 'dark' ? 'Dark mode' : 'System theme';
  
  return (
    <NavIconButton 
      {...props}
      icon={icon}
      onPress={cycleMode}
      accessibilityLabel={`Switch theme mode. Current: ${mode}`}
      size="md"
      variant="filled"
      tooltipLabel={tooltipLabel}
    />
  );
};

/**
 * Touch-sized variant for the mobile header and the drawer that covers it.
 * Drops the tooltip a touch device can never show, and matches the drawer's
 * close button so the two sides of the bar weigh the same.
 */
export const MobileThemeToggle: React.FC = () => {
  const { mode, cycleMode } = useThemeMode();
  const icon = MODE_ICONS[mode];

  return (
    <IconButton
      icon={icon}
      iconVariant="filled"
      variant="ghost"
      size="lg"
      accessibilityLabel={`Switch theme mode. Current: ${mode}`}
      onPress={cycleMode}
    />
  );
};
