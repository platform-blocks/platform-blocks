import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithPlocks } from '../../../__web_tests__/renderWithPlocks';
import { Flex } from '../Flex';

test('places children in the requested row direction and wrap mode', () => {
  renderWithPlocks(<Flex direction="row-reverse" wrap="wrap" testID="flex"><span>A</span><span>B</span></Flex>);
  const root = screen.getByTestId('flex');
  expect(root.style.flexDirection).toBe('row-reverse');
  expect(root.style.flexWrap).toBe('wrap');
  expect([...root.querySelectorAll('span')].map(node => node.textContent)).toEqual(['A', 'B']);
});
