import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { TableOfContents } from '../TableOfContents';

describe('TableOfContents', () => {
  it('navigates initial headings and reports the selected section', () => {
    const onActiveChange = jest.fn();
    render(<TableOfContents initialData={[
      { id: 'intro', value: 'Intro', depth: 1 },
      { id: 'details', value: 'Details', depth: 2 },
    ]} onActiveChange={onActiveChange} />);
    fireEvent.press(screen.getByText('Details'));
    expect(onActiveChange).toHaveBeenLastCalledWith('details', expect.objectContaining({ id: 'details' }));
  });
});
