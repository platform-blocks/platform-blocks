import React, { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { ReorderableList } from '../ReorderableList';

const original = [{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Beta' }, { id: 'c', name: 'Gamma' }];

function Example({ onReorder = () => {} }: { onReorder?: (from: number, to: number) => void }) {
  const [items, setItems] = useState(original);
  return <PlocksProvider><ReorderableList data={items} keyExtractor={(item) => item.id} getItemLabel={(item) => item.name} renderItem={({ item }) => <span>{item.name}</span>} onReorder={({ data, from, to }) => { onReorder(from, to); setItems(data); }} /></PlocksProvider>;
}

function names() {
  return screen.getAllByRole('listitem').map((item) => item.textContent?.trim());
}

describe('ReorderableList web', () => {
  it('moves a focused handle with the arrow keys and reports indices', () => {
    const onReorder = jest.fn();
    render(<Example onReorder={onReorder} />);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Reorder Beta' }), { key: 'ArrowUp' });
    expect(names()).toEqual(['Beta', 'Alpha', 'Gamma']);
    expect(onReorder).toHaveBeenCalledWith(1, 0);
  });

  it('reorders on drop', () => {
    render(<Example />);
    const transfer = { effectAllowed: '', dropEffect: '', setData: jest.fn(), getData: () => 'a' };
    const first = screen.getAllByRole('listitem')[0];
    const last = screen.getAllByRole('listitem')[2];
    fireEvent.dragStart(first, { dataTransfer: transfer });
    fireEvent.dragOver(last, { dataTransfer: transfer });
    fireEvent.drop(last, { dataTransfer: transfer });
    expect(names()).toEqual(['Beta', 'Gamma', 'Alpha']);
    expect(within(screen.getAllByRole('listitem')[2]).getByText('Alpha')).toBeTruthy();
  });

  it('moves an item when its touch handle is dragged', () => {
    render(<Example />);
    const handle = screen.getByRole('button', { name: 'Reorder Alpha' }).closest('[data-reorder-handle]') as HTMLDivElement;
    handle.setPointerCapture = jest.fn();
    Object.defineProperty(document, 'elementFromPoint', { configurable: true, value: () => screen.getAllByRole('listitem')[2] });
    try {
      fireEvent.pointerDown(handle, { pointerType: 'touch', pointerId: 1 });
      fireEvent.pointerUp(handle, { pointerType: 'touch', pointerId: 1, clientX: 20, clientY: 100 });
      expect(names()).toEqual(['Beta', 'Gamma', 'Alpha']);
    } finally {
      delete (document as unknown as { elementFromPoint?: unknown }).elementFromPoint;
    }
  });
});
