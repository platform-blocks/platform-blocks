import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { FormGroup, FormLayout, FormSection } from '..';

describe('FormLayout (native)', () => {
  it('uses surface tokens (no hard-coded white) for the modal variant', () => {
    render(
      <FormLayout variant="modal" testID="layout">
        <Text>Body</Text>
      </FormLayout>
    );
    const style = JSON.stringify(screen.getByTestId('layout').props.style);
    expect(style).not.toContain('"white"');
    expect(style).toContain('"backgroundColor":"#');
  });

  it('caps its width at 600 unless maw is given', () => {
    render(
      <>
        <FormLayout testID="default">
          <Text>A</Text>
        </FormLayout>
        <FormLayout testID="wide" maw={900}>
          <Text>B</Text>
        </FormLayout>
      </>
    );
    const maxWidth = (id: string) => Object.assign({}, ...[screen.getByTestId(id).props.style].flat()).maxWidth;
    expect(maxWidth('default')).toBe(600);
    expect(maxWidth('wide')).toBe(900);
  });

  it('collapses a collapsible section from its header', () => {
    const onExpandedChange = jest.fn();
    render(
      <FormSection title="Advanced" collapsible onExpandedChange={onExpandedChange}>
        <Text>Hidden fields</Text>
      </FormSection>
    );
    const header = screen.getByRole('button', { expanded: true });
    fireEvent.press(header);
    expect(onExpandedChange).toHaveBeenCalledWith(false);
    expect(screen.queryByText('Hidden fields')).toBeNull();
    expect(screen.getByRole('button', { expanded: false })).toBeTruthy();
  });

  it('starts collapsed with defaultExpanded={false}', () => {
    render(
      <FormSection title="Advanced" collapsible defaultExpanded={false}>
        <Text>Hidden fields</Text>
      </FormSection>
    );
    expect(screen.queryByText('Hidden fields')).toBeNull();
  });

  it('lays out a row group in columns', () => {
    render(
      <FormGroup direction="row" columns={2} testID="group">
        <Text>A</Text>
        <Text>B</Text>
        <Text>C</Text>
      </FormGroup>
    );
    expect(screen.getByTestId('group')).toBeTruthy();
    expect(screen.getByText('C')).toBeTruthy();
  });
});
