import { useEffect, useState } from 'react';
import { DataTable } from '@platform-blocks/react-ui-library';
import type { DataTableColumn, DataTablePagination, DataTableSort } from '@platform-blocks/react-ui-library';

type Order = {
  id: number;
  customer: string;
  product: string;
  amount: number;
};

// Pretend this table lives on a server; the component only ever sees one page.
const DB: Order[] = Array.from({ length: 137 }, (_, i) => ({
  id: i + 1,
  customer: `Customer ${String(i + 1).padStart(3, '0')}`,
  product: ['Starter', 'Pro', 'Team', 'Enterprise'][i % 4],
  amount: Math.round(((i * 37) % 900) + 100),
}));

// Simulate an API endpoint: GET /orders?page&pageSize&sort
function fetchOrders(
  page: number,
  pageSize: number,
  sort?: DataTableSort
): Promise<{ rows: Order[]; total: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sorted = [...DB];
      if (sort?.direction) {
        sorted.sort((a, b) => {
          const av = a[sort.column as keyof Order];
          const bv = b[sort.column as keyof Order];
          const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
          return sort.direction === 'desc' ? -cmp : cmp;
        });
      }
      const start = (page - 1) * pageSize;
      resolve({ rows: sorted.slice(start, start + pageSize), total: DB.length });
    }, 500);
  });
}

const columns: DataTableColumn<Order>[] = [
  { key: 'id', header: 'Order', accessor: 'id', sortable: true, dataType: 'number' },
  { key: 'customer', header: 'Customer', accessor: 'customer', sortable: true },
  { key: 'product', header: 'Plan', accessor: 'product', sortable: true },
  { key: 'amount', header: 'Amount', accessor: 'amount', sortable: true, dataType: 'currency' },
];

export function Demo() {
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<DataTableSort[]>([]);
  const [pagination, setPagination] = useState<DataTablePagination>({ page: 1, pageSize: 10, total: 0 });

  // Refetch whenever the page, page size, or sort changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchOrders(pagination.page, pagination.pageSize, sortBy[0]).then((res) => {
      if (cancelled) return;
      setRows(res.rows);
      setPagination((p) => (p.total === res.total ? p : { ...p, total: res.total }));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [pagination.page, pagination.pageSize, sortBy]);

  return (
    <DataTable
      data={rows}
      columns={columns}
      loading={loading}
      manualPagination
      pagination={pagination}
      onPaginationChange={setPagination}
      sortBy={sortBy}
      onSortChange={setSortBy}
      getRowId={(row) => row.id}
      searchable={false}
    />
  );
}
