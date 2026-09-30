import React from 'react';
import { FloatingActions } from '@plocks/ui';
import { GlobalSpotlight } from './GlobalSpotlight';
export const GlobalSpotlightLazy: React.FC = () => <GlobalSpotlight />;

export const FloatingActionsLazy: React.FC<any> = (props) => (
  <FloatingActions {...props} />
);
