import { DataList } from '@platform-blocks/ui';

export function Demo() {
  return (
    <DataList orientation="vertical">
      <DataList.Item>
        <DataList.ItemLabel>Shipping address</DataList.ItemLabel>
        <DataList.ItemValue>2825 Winding Way, Providence, RI 02908</DataList.ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Tracking number</DataList.ItemLabel>
        <DataList.ItemValue>1Z 999 AA1 01 2345 6784</DataList.ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Estimated delivery</DataList.ItemLabel>
        <DataList.ItemValue>July 12, 2026</DataList.ItemValue>
      </DataList.Item>
    </DataList>
  );
}
