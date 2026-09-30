import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { Stepper } from '../Stepper';

function renderStepper(props: Partial<React.ComponentProps<typeof Stepper>> = {}) {
  return render(
    <PlocksProvider>
      <Stepper active={1} aria-label="Checkout" {...props}>
        <Stepper.Step label="Cart" />
        <Stepper.Step label="Shipping" />
        <Stepper.Step label="Payment" />
      </Stepper>
    </PlocksProvider>
  );
}

describe('Stepper (react-native-web DOM)', () => {
  it('pressable steps are buttons; the active one has aria-current="step"', () => {
    renderStepper({ onStepClick: jest.fn() });
    expect(screen.getByRole('group', { name: 'Checkout' })).toBeTruthy();
    const steps = screen.getAllByRole('button');
    expect(steps.map((s) => s.getAttribute('aria-label'))).toEqual(['Cart', 'Shipping', 'Payment']);
    expect(steps.map((s) => s.getAttribute('aria-current'))).toEqual([null, 'step', null]);
  });

  it('marks unselectable future steps aria-disabled', () => {
    const onStepClick = jest.fn();
    renderStepper({ onStepClick, allowNextStepsSelect: false });
    const payment = screen.getByRole('button', { name: 'Payment' });
    expect(payment.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(payment);
    expect(onStepClick).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cart' }));
    expect(onStepClick).toHaveBeenCalledWith(0);
  });

  it('shares one tab stop across steps and moves with the arrow keys', () => {
    renderStepper({ onStepClick: jest.fn() });
    const steps = screen.getAllByRole('button');
    expect(steps.map((s) => s.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
    act(() => steps[1].focus());
    fireEvent.keyDown(steps[1], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(steps[2]);
    fireEvent.keyDown(steps[2], { key: 'Home' });
    expect(document.activeElement).toBe(steps[0]);
  });

  it('without onStepClick the steps are a list, not buttons', () => {
    renderStepper();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    const current = screen.getByRole('listitem', { name: 'Shipping' });
    expect(current.getAttribute('aria-current')).toBe('step');
  });
});
