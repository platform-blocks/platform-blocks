import React from 'react';
import { render, screen } from '@testing-library/react';
import { PlocksProvider } from '../../../ui/src/core/theme/PlocksProvider';
import { ChartThemeProvider } from '../theme/ChartThemeContext';

/** Verify the authored chart demo produces real web SVG content, not an empty native shell. */
export function expectChartDemo(Demo: React.ComponentType, title?: string) {
  const { container } = render(
    <PlocksProvider>
      <ChartThemeProvider>
        <Demo />
      </ChartThemeProvider>
    </PlocksProvider>
  );
  if (title) expect(screen.queryAllByText(title).length).toBeGreaterThan(0);
  const svg = container.querySelector('svg');
  expect(svg).not.toBeNull();
  expect(svg?.querySelectorAll('path,rect,circle,polygon,line').length).toBeGreaterThan(0);
}
