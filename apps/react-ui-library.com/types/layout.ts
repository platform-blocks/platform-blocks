// Enhanced type definitions for better type safety
export interface Theme {
  colors: {
    primary: string[];
    gray: string[];
    surface: string[];
    [key: string]: any;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  backgrounds: {
    border: string;
    [key: string]: any;
  };
}

export interface AppShellState {
  isNavbarRail: boolean;
  toggleNavbar: () => void;
  [key: string]: any;
}

export interface I18nContext {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

export interface LayoutProps {
  children?: React.ReactNode;
  showBottomBar?: boolean;
  pathname?: string;
}
