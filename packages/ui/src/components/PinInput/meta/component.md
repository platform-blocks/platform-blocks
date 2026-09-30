---
playground: true
displayName: PinInput
description: A specialized input component for entering PIN codes, OTP, and other sequential digit/character inputs.
category: input
status: stable
tags: [pin, otp, security, input, verification]
props:
  value: The current PIN value as a string
  onChange: Callback fired when the PIN value changes
  length: Number of input fields (default: 4)
  type: Input type - 'numeric' or 'alphanumeric'
  size: Size variant of the input fields (also scales the label)
  label: Label text displayed above the PIN input
  description: Helper text shown beneath the label
  required: Whether the PIN input is required
  error: Error message displayed below the input
  disabled: Whether the PIN input is disabled
  autoFocus: Whether to auto-focus the first input field
  mask: Whether to mask the input values
  onComplete: Callback fired once when the PIN becomes complete (not on re-renders; again after an edit)
  helperText: Text under the cells while there is no error
  variant: Cell frame variant — 'default' | 'filled' | 'outline' | 'unstyled'
  radius: Cell corner radius (token or px)
  enforceOrderInitialOnly: Only force sequential entry until the PIN has been complete once
  labelProps: Override props applied to the label `<Text>`
  descriptionProps: Override props applied to the description `<Text>`
related:
  - Input
  - PasswordInput
  - Form
examples:
  - Basic 4-digit PIN input
  - 6-digit verification code input
  - Alphanumeric code input
  - Different size variants
  - Masked PIN input for security
  - OTP input with auto-advance
  - Label customization with labelProps / descriptionProps
---

PinInput provides a sequence of fields for entering a PIN or verification code.
