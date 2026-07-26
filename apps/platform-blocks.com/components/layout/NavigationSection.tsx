import React from 'react';
import { usePathname, router } from 'expo-router';
import { Flex, Text, Button, useTheme, Icon } from '@platform-blocks/ui';
import type { NavSection } from '../../config/navigationConfig';
import { isRouteActive as checkRouteActive } from '../../config/navigationConfig';

export interface NavigationSectionProps {
  section: NavSection;
  variant: 'desktop' | 'mobile' | 'rail';
  onItemPress?: () => void; // For mobile modal close
  showSectionTitle?: boolean;
  railCollapsed?: boolean;
}

/**
 * Shared NavigationSection component used across navigation surfaces
 * Eliminates code duplication and ensures consistent rendering
 */
export const NavigationSection: React.FC<NavigationSectionProps> = ({
  section,
  variant,
  onItemPress,
  showSectionTitle = true,
  railCollapsed = false,
}) => {
  const theme = useTheme();
  const pathname = usePathname();

  const isRouteActive = (route: string) => {
    return checkRouteActive(pathname, route);
  };

  const handleItemPress = (route: string) => {
    router.push(route);
    onItemPress?.();
  };

  // Desktop/Rail variant rendering
  if (variant === 'desktop' || variant === 'rail') {
    const showLabels = !railCollapsed;
    
    return (
      <Flex 
        direction="column" 
        gap="xs" 
        style={{ 
          marginBottom: variant === 'rail' ? 4 : 12, 
          alignItems: railCollapsed ? 'center' : 'stretch', 
          width: '100%' 
        }}
      >
        {showLabels && showSectionTitle && (
          <Text size="xs" weight="semibold" colorVariant="info" tracking={1} uppercase p={4}>
            {section.section.toUpperCase()}
          </Text>
        )}
        
        {section.items.map(item => {
          const isActive = isRouteActive(item.route);
          const iconColor = isActive ? theme.colors.primary[6] : theme.text.primary;
          
          if (railCollapsed) {
            // Rail collapsed mode - icon only buttons
            return (
              <Button
                key={item.route}
                variant="ghost"
                size="lg"
                onPress={() => handleItemPress(item.route)}
                style={{
                  width: 48,
                  height: 48,
                  // borderRadius: 999,
                  backgroundColor: isActive ? theme.colors.primary[1] : 'transparent',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Icon name={item.icon} size={24} color={iconColor} />
              </Button>
            );
          }
          
          // Normal desktop mode
          return (
            <Button
              key={item.route}
              variant="ghost"
              size="md"
              startIcon={<Icon name={item.icon} size={16} color={iconColor} />}
              title={item.label}
              onPress={() => handleItemPress(item.route)}
              style={{
                justifyContent: 'flex-start',
                backgroundColor: isActive ? theme.colors.primary[1] : 'transparent',
              }}
            />
          );
        })}
      </Flex>
    );
  }

  // Mobile variant rendering
  return (
    <Flex direction="column" style={{ marginBottom: 12 }}>
      {showSectionTitle && (
        <Text 
          size="xs" 
          weight="semibold" 
          colorVariant="secondary" 
          style={{ marginBottom: 4, paddingHorizontal: 8 }}
        >
          {section.section.toUpperCase()}
        </Text>
      )}
      
      <Flex direction="column" gap="xs">
        {section.items.map(item => {
          const isActive = isRouteActive(item.route);

          // No leading icon here: the mobile drawer is a plain list of labels,
          // where a column of icons is noise rather than a scanning aid. The
          // current page is marked the same way the desktop sidebar marks it —
          // a tinted row — plus a heavier label, since there's no icon left to
          // carry the accent color.
          return (
            <Button
              key={item.route}
              size="sm"
              variant="ghost"
              title={item.label}
              onPress={() => handleItemPress(item.route)}
              labelProps={isActive ? { weight: 'semibold', color: theme.colors.primary[6] } : undefined}
              style={{
                justifyContent: 'flex-start',
                backgroundColor: isActive ? theme.colors.primary[1] : 'transparent',
              }}
            />
          );
        })}
      </Flex>
    </Flex>
  );
};

/**
 * Shared helper function to determine if a route is active
 * Centralizes the active route logic used across navigation components
 * Re-exported for backward compatibility
 */
export const isRouteActive = checkRouteActive;
