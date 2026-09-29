import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { Pagination } from '../Pagination';

describe('Pagination', () => {
  it('fires onChange with the pressed page and the prev/next targets', () => {
    const onChange = jest.fn();
    render(<Pagination value={3} total={10} onChange={onChange} />);

    fireEvent.press(screen.getByLabelText('Page 4'));
    expect(onChange).toHaveBeenLastCalledWith(4);
    fireEvent.press(screen.getByLabelText('Previous page'));
    expect(onChange).toHaveBeenLastCalledWith(2);
    fireEvent.press(screen.getByLabelText('Next page'));
    expect(onChange).toHaveBeenLastCalledWith(4);
    fireEvent.press(screen.getByLabelText('First page'));
    expect(onChange).toHaveBeenLastCalledWith(1);
    fireEvent.press(screen.getByLabelText('Last page'));
    expect(onChange).toHaveBeenLastCalledWith(10);
  });

  it('works uncontrolled from defaultValue', () => {
    const onChange = jest.fn();
    render(<Pagination defaultValue={2} total={5} onChange={onChange} />);
    fireEvent.press(screen.getByLabelText('Next page'));
    expect(onChange).toHaveBeenCalledWith(3);
    expect(screen.getByRole('button', { name: 'Page 3', selected: true })).toBeTruthy();
  });

  it('keeps the deprecated `current` alias working', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const onChange = jest.fn();
    render(<Pagination current={5} total={10} onChange={onChange} />);
    fireEvent.press(screen.getByLabelText('Next page'));
    expect(onChange).toHaveBeenCalledWith(6);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('`current` is deprecated'));
    warn.mockRestore();
  });

  it('disables previous/first on the first page and next/last on the last', () => {
    const { rerender } = render(<Pagination value={1} total={3} />);
    expect(screen.getByRole('button', { name: 'Previous page', disabled: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'First page', disabled: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Next page', disabled: false })).toBeTruthy();
    rerender(<Pagination value={3} total={3} />);
    expect(screen.getByRole('button', { name: 'Next page', disabled: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Last page', disabled: true })).toBeTruthy();
  });

  it('renders both ellipses when the current page is in the middle', () => {
    render(<Pagination value={10} total={20} />);
    expect(screen.getAllByText('...', { includeHiddenElements: true })).toHaveLength(2);
  });

  it('hides on a single page when asked', () => {
    render(<Pagination value={1} total={1} hideOnSinglePage testID="pg" />);
    expect(screen.queryByTestId('pg')).toBeNull();
  });
});
