import React from 'react';
import { FloatingActions } from '@platform-blocks/react-ui-library';
import { GlobalSpotlight } from './GlobalSpotlight';

// Note: We intentionally avoid React.lazy/dynamic import here because
// EAS export:embed (eager bundling) injects a Metro async-require shim that
// fails to resolve in the local build sandbox. Static imports are safer.

export const GlobalSpotlightLazy: React.FC = () => <GlobalSpotlight />;

export const FloatingActionsLazy: React.FC<any> = (props) => (
  <FloatingActions {...props} />
);

// If DialogRenderer is needed later, import it statically from the correct module
// and expose a passthrough component similarly to avoid dynamic imports.
