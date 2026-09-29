import React, { useState } from 'react';
import {
  Text,
  Card,
  DataTable,
  Row,
  Tooltip,
  useTheme,
  Block,
  Flex
} from '@platform-blocks/ui';
import type { DataTableColumn, DataTableSort } from '@platform-blocks/ui';

// Temporary casts to work around React 19 async FC return type (ReactNode | Promise<ReactNode>)
// causing "cannot be used as a JSX component" until global type strategy decided.
// These casts localize the workaround to this file only.
// TODO: Replace with proper React type shim or update library factory typings.

export interface PropMetadata {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
  deprecated?: boolean;
  internal?: boolean;
}

interface PropTableProps { props: PropMetadata[]; }

export function PropTable({ props }: PropTableProps) {
  const theme = useTheme();
  const [sortBy, setSortBy] = useState<DataTableSort[]>([]);
  const [showInternal, setShowInternal] = useState(false);

  const filtered = props.filter(p => (showInternal || !p.internal));

  if (filtered.length === 0) {
    return (
      <Card variant="outline" style={{ marginVertical: 16 }}>
        <Text variant="p" c="muted" ta="center">
          This component has no props.
        </Text>
      </Card>
    );
  }

  // Define columns for DataTable
  const showDefault = filtered.some(p => p.defaultValue != null && p.defaultValue !== '');
  // Extracted component to safely use hooks per cell instance
  const PropNameCell = ({ value, row }: { value: string; row: PropMetadata }) => {
    return (
      <Row gap={4} align="center">
        <Flex direction="row" align="center">
          <Block>
            <Text variant="p" fw="semibold" ff="monospace">
              {value}
            </Text>
            <Text variant="small" c="secondary">
              {row.description || '—'}
            </Text>
          </Block>
        </Flex>
        {row.required && (
          <Tooltip label="This prop is required"><Text variant="sup" c="red">*</Text></Tooltip>
        )}
        {row.deprecated && (
          <Tooltip label="Deprecated – avoid use"><Text variant="sup" c="orange">D</Text></Tooltip>
        )}
        {row.internal && (
          <Tooltip label="Internal – not part of public API"><Text variant="sup" c="purple">I</Text></Tooltip>
        )}
      </Row>
    );
  };

  const columns: DataTableColumn<PropMetadata>[] = [
    {
      key: 'name',
      header: 'Name',
      accessor: 'name',
      minWidth: 120,
      sortable: true,
      filterable: true,
      filterType: 'text',
      cell: (value: string, row: PropMetadata) => <PropNameCell value={value} row={row} />,
    },
    showDefault ? {
      key: 'defaultValue',
      header: 'Default',
      accessor: 'defaultValue',
      minWidth: 100,
      sortable: true,
      align: 'center',
      cell: (value: string | undefined) => value ? (
        <Text
          variant="small"
          style={{ fontFamily: 'monospace', color: theme.colors.gray[7] }}
        >
          {value}
        </Text>
      ) : null //<Text variant="small" c="muted">—</Text>
    } : undefined,
    {
      key: 'type',
      header: 'Type',
      accessor: 'type',
      minWidth: 150,
      sortable: true,
      filterable: true,
      filterType: 'text',
      align: 'center',
      cell: (value: string) => (
        <Text variant="small" ff="monospace" ta="right" w="full" px={8} py={4} style={{ borderRadius: 4 }}>
          {value}
        </Text>
      ),
    },
  ].filter(Boolean) as DataTableColumn<PropMetadata>[];

  return (
    <DataTable
      data={filtered}
      columns={columns}
      sortBy={sortBy}
      onSortChange={setSortBy}
      searchable
      searchPlaceholder="Search props by name, type, or description..."
      emptyMessage="No props found"
      variant="bordered"
      columnBorderWidth={1}
      density="normal"
      enableColumnResizing
      fullWidth={true}
      // Demonstrate per-row feature toggles:
      // - internal props remain searchable & sortable (could disable if desired)
      // - deprecated props remain visible but excluded from sorting precedence (sortable: false)
      // - required props always searchable & filterable explicitly (though defaults already true)
      rowFeatureToggle={(row: PropMetadata) => ({
        // Don't let deprecated props influence sort order (they'll be appended after sorted rows)
        sortable: !row.deprecated,
        // Keep all rows filterable so column filters still work
        filterable: true,
        // Optionally exclude internal props from global search by setting searchable: !row.internal
        searchable: true,
      })}
      style={{ width: '100%' }}
      pagination={{
        page: 1,
        pageSize: 50, // Show more props per page since they're typically not too many
        total: filtered.length,
      }}
    />
  );
}
