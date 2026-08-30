import React from 'react';
import { useDirection } from '@platform-blocks/react-ui-library';
import { NavIconButton, NavIconButtonProps } from './NavIconButton';

type ToggleDirectionProps = Omit<NavIconButtonProps, 'icon' | 'onPress' | 'accessibilityLabel'>;

export const ToggleDirection: React.FC<ToggleDirectionProps> = (props) => {
  const { dir, toggleDirection } = useDirection();
  const icon = dir === 'ltr' ? 'arrowLeft' : 'arrowRight';
  const tooltipLabel = dir === 'ltr' ? 'LTR direction' : 'RTL direction';

  return (
    <NavIconButton
      {...props}
      icon={icon as any}
      onPress={toggleDirection}
      accessibilityLabel={`Switch text direction. Current: ${dir.toUpperCase()}`}
      size="md"
      tooltipLabel={tooltipLabel}
    />
  );
};
