import React from 'react';
import { render } from '@testing-library/react';
import { PlocksProvider } from '../core/theme/PlocksProvider';

export const renderWithPlocks = (ui: React.ReactElement) => render(<PlocksProvider>{ui}</PlocksProvider>);
