import { hasDOM } from '../../core/platform/flags';

/**
 * Save a CSV document as a file download (web): a temporary object URL on an
 * `<a download>` that is clicked and removed. Returns `false` without a DOM
 * (static rendering).
 */
export function downloadCsv(csv: string, fileName: string): boolean {
  if (!hasDOM) return false;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  return true;
}
