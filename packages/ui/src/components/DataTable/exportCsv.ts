import { warnOnce } from '../../core/utils/logger';

/**
 * Save a CSV document as a file. Native has no built-in download target, so
 * this reports `false` and asks for `onExport` (share sheet, file system…);
 * the web implementation lives in `exportCsv.web.ts`.
 */
export function downloadCsv(_csv: string, _fileName: string): boolean {
  warnOnce(
    'DataTable.export.native',
    'DataTable: CSV export has no built-in download on native. Pass `onExport` to receive the CSV string.'
  );
  return false;
}
