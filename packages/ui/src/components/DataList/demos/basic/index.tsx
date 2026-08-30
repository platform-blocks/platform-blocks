import { DataList } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <DataList>
      <DataList.Item>
        <DataList.ItemLabel>Name</DataList.ItemLabel>
        <DataList.ItemValue>John Doe</DataList.ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Email</DataList.ItemLabel>
        <DataList.ItemValue>john@example.com</DataList.ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Role</DataList.ItemLabel>
        <DataList.ItemValue>Software Engineer</DataList.ItemValue>
      </DataList.Item>
    </DataList>
  );
}
