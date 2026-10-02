import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithPlocks } from '../../../__web_tests__/renderWithPlocks';
import { ScrollArea } from '../ScrollArea';

test('keeps content in a scrollable viewport and forwards scroll events', () => {
  const onScroll = jest.fn();
  renderWithPlocks(<ScrollArea testID="scroll" h={100} onScroll={onScroll}><span>Top</span><span>Bottom</span></ScrollArea>);
  const viewport = screen.getByTestId('scroll');
  expect(viewport.textContent).toContain('Bottom');
  fireEvent.scroll(viewport);
  expect(onScroll).toHaveBeenCalledTimes(1);
});
