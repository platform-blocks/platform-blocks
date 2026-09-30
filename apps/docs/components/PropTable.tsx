import React, { useMemo, useState } from 'react';
import { Card, DataTable, Row, Text, Tooltip } from '@plocks/ui';
import type { DataTableColumn, DataTablePagination, DataTableSort } from '@plocks/ui';

export interface PropMetadata {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
  internal?: boolean;
}

interface PropTableProps { props: PropMetadata[]; }

const PAGE_SIZE = 25;
const getPropId = (row: PropMetadata) => row.name;

function PropNameCell({ row }: { row: PropMetadata }) {
  return (
    <Row gap={4} align="center">
      <Text variant="p" fw="semibold" ff="monospace">{row.name}</Text>
      {row.required && (
        <Tooltip label="This prop is required"><Text variant="sup" c="red">*</Text></Tooltip>
      )}
    </Row>
  );
}

export function PropTable({ props }: PropTableProps) {
  const [sortBy, setSortBy] = useState<DataTableSort[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [pagination, setPagination] = useState<DataTablePagination>({ page: 1, pageSize: PAGE_SIZE, total: props.length });
  const publicProps = useMemo(() => props.filter((prop) => !prop.internal), [props]);
  const showDefault = publicProps.some((prop) => prop.defaultValue != null && prop.defaultValue !== '');

  const columns = useMemo<DataTableColumn<PropMetadata>[]>(() => {
    const result: DataTableColumn<PropMetadata>[] = [
      {
        key: 'name', header: 'Name', accessor: 'name', minWidth: 200, sortable: true,
        cell: (_value, row) => <PropNameCell row={row} />,
      },
      {
        key: 'type', header: 'Type', accessor: 'type', minWidth: 180, sortable: true,
        cell: (value: string) => <Text variant="small" ff="monospace">{value}</Text>,
      },
    ];
    if (showDefault) {
      result.push({
        key: 'defaultValue', header: 'Default', accessor: 'defaultValue', minWidth: 120, sortable: true,
        cell: (value: string | undefined) => value != null && value !== ''
          ? <Text variant="small" ff="monospace">{value}</Text>
          : <Text variant="small" c="muted">—</Text>,
      });
    }
    result.push({
      key: 'description', header: 'Description', accessor: 'description', minWidth: 260,
      cell: (value: string | undefined) => value
        ? <Text variant="small" c="secondary">{value}</Text>
        : <Text variant="small" c="muted">—</Text>,
    });
    return result;
  }, [showDefault]);

  if (publicProps.length === 0) {
    return (
      <Card variant="outline" style={{ marginVertical: 16 }}>
        <Text variant="p" c="muted" ta="center">This component has no props.</Text>
      </Card>
    );
  }

  return (
    <DataTable
      data={publicProps}
      columns={columns}
      getRowId={getPropId}
      sortBy={sortBy}
      onSortChange={setSortBy}
      searchable
      searchValue={searchValue}
      onSearchChange={(value) => {
        setSearchValue(value);
        setPagination((current) => ({ ...current, page: 1 }));
      }}
      searchPlaceholder="Search props by name, type, or description..."
      emptyMessage="No props found"
      showColumnVisibilityManager={false}
      showColumnMenu={false}
      showRowDividers
      density="compact"
      fullWidth
      pagination={publicProps.length > PAGE_SIZE ? { ...pagination, total: publicProps.length } : undefined}
      onPaginationChange={publicProps.length > PAGE_SIZE ? setPagination : undefined}
      showRowsPerPageControl={false}
    />
  );
}
