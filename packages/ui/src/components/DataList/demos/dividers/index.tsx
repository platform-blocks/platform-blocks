import { DataList } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <DataList withDivider labelWidth={120}>
      <DataList.Item>
        <DataList.ItemLabel>Plan</DataList.ItemLabel>
        <DataList.ItemValue>Pro (annual)</DataList.ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Seats</DataList.ItemLabel>
        <DataList.ItemValue>12 of 20 used</DataList.ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Renews</DataList.ItemLabel>
        <DataList.ItemValue>January 1, 2027</DataList.ItemValue>
      </DataList.Item>
    </DataList>
  );
}
