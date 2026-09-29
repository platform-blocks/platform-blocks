import { useState } from 'react';
import { ControlField } from '@platform-blocks/ui';

export function Demo() {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [airplane, setAirplane] = useState(false);

  return (
    <ControlField.Group
      variant="bordered"
      title="Connectivity"
      footer="Airplane mode disables all wireless radios."
    >
      <ControlField label="Wi-Fi" checked={wifi} onChange={setWifi} />
      <ControlField
        label="Bluetooth"
        checked={bluetooth}
        onChange={setBluetooth}
      />
      <ControlField
        label="Airplane mode"
        description="Turn off all connections"
        checked={airplane}
        onChange={setAirplane}
      />
    </ControlField.Group>
  );
}
