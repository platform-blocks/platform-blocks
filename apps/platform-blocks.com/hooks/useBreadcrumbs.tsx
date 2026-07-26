import { router, usePathname, useRouter } from 'expo-router';
import { NAV_SECTIONS, findNavItem } from '../config/navigationConfig';
import { Icon } from '@platform-blocks/ui';
import path from 'path';

// Define BreadcrumbItem interface locally since it's not exported
interface BreadcrumbItem {
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onPress?: () => void;
  disabled?: boolean;
}

/**
 * Generate breadcrumb items based on the current pathname
 */
export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname();
  const router = useRouter();


  const pathToBreadcrumbMap = {
    '/components': {
      label: 'Components',
      href: '/components',
      onPress: () => {
        router.push('/components');

      }
    },
    '/charts': {
      label: 'Charts',
      href: '/charts',
      onPress: () => {
        router.push('/charts');
      }
    },
    '/localization': {
      label: 'Localization',
      href: '/localization',
      onPress: () => {
        router.push('/localization');
      }
    },
    '/hooks': { 
      label: 'Hooks',
      href: '/hooks',
      onPress: () => {
        router.push('/hooks');
      }
    },
    '/getting-started': {
      label: 'Getting Started',
      href: '/getting-started',
      onPress: () => {
        router.push('/getting-started');
      }
    },
    '/faq': {
      label: 'FAQ',
      href: '/faq',
      onPress: () => {
        router.push('/faq');
      } 
    }
  }


  // Always start with home
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: '',
      icon: <Icon name="home" size={16} />,
      href: '/',
      onPress: () => {
        router.push('/');
      }
    },

  ];

  // Handle root path
  if (pathname === '/') {
    return breadcrumbs;
  }

  // Parse path segments
  const segments = pathname.split('/').filter(Boolean);
  let currentPath = '';

  for (let i = 0; i < segments.length; i++) {
    currentPath += '/' + segments[i];

    // Find matching nav item
    const navMatch = findNavItem(currentPath);

    if (navMatch) {
      // Prefer mapped labels (e.g., Components), else use nav item's label
      breadcrumbs.push((pathToBreadcrumbMap as Record<string, any>)[currentPath] || {
        label: navMatch.item.label,
        href: currentPath,
        onPress: () => {
          router.push(currentPath);
        },
        disabled: currentPath === pathname
      });
    } else {
      // Generate breadcrumb from path segment
      const label = segments[i]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      breadcrumbs.push({
        label,
        href: currentPath,
        onPress: () => {
          router.push(currentPath);
        },
        disabled: currentPath === pathname
      });
    }
  }

  return breadcrumbs;
}

/**
 * Generate breadcrumbs for a specific component page
 */
export function generateComponentBreadcrumbs(componentName: string, router: any): BreadcrumbItem[] {
  return [
    {
      label: 'Platform Blocks',
      href: '/',
      onPress: () => router.push('/')
    },
    {
      label: 'Components',
      href: '/components',
      onPress: () => router.push('/components')
    },
    {
      label: componentName,
      disabled: true // Current page
    }
  ];
}

