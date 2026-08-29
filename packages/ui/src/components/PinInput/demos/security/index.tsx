import { useState } from 'react';

import { Block, Button, PinInput, Row, Text } from '@platform-blocks/ui';

export function Demo() {
  const [maskedValue, setMaskedValue] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpStatus, setOtpStatus] = useState('');
  const [validationValue, setValidationValue] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);

  const correctPin = '1234';

  const handleValidate = () => {
    if (validationValue !== correctPin) {
      setError('Incorrect PIN. Try again.');
      setValidationMessage('');
      return;
    }

    setError('');
    setValidationMessage('PIN verified successfully.');
  };

  const handleOtpComplete = (value: string) => {
    setOtpStatus(`OTP entered: ${value}`);
  };

  const handleToggleDisabled = () => {
    setDisabled((prev) => !prev);
    setError('');
    setValidationMessage('');
  };

  const handleClear = () => {
    setValidationValue('');
    setError('');
    setValidationMessage('');
  };

  return (
    <Block>
      <Text weight="semibold">Security-focused PIN inputs</Text>

      <Block>
        <Text size="sm" weight="semibold">
          Masked PIN input
        </Text>
        <Text size="sm" color="secondary">
          Conceal characters as they are typed.
        </Text>
        <PinInput
          value={maskedValue}
          onChange={setMaskedValue}
          mask
          label="Secure PIN"
        />
      </Block>

      <Block>
        <Text size="sm" weight="semibold">
          OTP with auto-complete
        </Text>
        <Text size="sm" color="secondary">
          Automatically completes once all digits are entered.
        </Text>
        <PinInput
          value={otpValue}
          onChange={(value) => {
            setOtpValue(value);
            if (otpStatus) setOtpStatus('');
          }}
          onComplete={handleOtpComplete}
          oneTimeCode
          length={6}
          label="One-time password"
        />
        {otpStatus ? (
          <Text size="xs" color="secondary">
            {otpStatus}
          </Text>
        ) : null}
      </Block>

      <Block>
        <Text size="sm" weight="semibold">
          PIN validation state
        </Text>
        <Text size="sm" color="secondary">
          Enter the correct PIN: 1234
        </Text>
        <PinInput
          value={validationValue}
          onChange={(newValue) => {
            setValidationValue(newValue);
            if (error) setError('');
            if (validationMessage) setValidationMessage('');
          }}
          label="Enter PIN"
          error={error}
          disabled={disabled}
          helperText={!error ? 'Enter the correct 4-digit PIN' : undefined}
        />

        <Row gap="sm" wrap="wrap">
          <Button
            variant="filled"
            onPress={handleValidate}
            disabled={validationValue.length !== 4}
          >
            Validate
          </Button>
          <Button variant="outline" onPress={handleToggleDisabled}>
            {disabled ? 'Enable input' : 'Disable input'}
          </Button>
          <Button variant="outline" onPress={handleClear}>
            Clear
          </Button>
        </Row>

        {validationMessage ? (
          <Text size="xs" color="secondary">
            {validationMessage}
          </Text>
        ) : null}
      </Block>
    </Block>
  );
}


