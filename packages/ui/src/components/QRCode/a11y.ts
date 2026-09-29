/** Longest slice of the encoded value read out in the default accessible name. */
const SUMMARY_LENGTH = 40;

/**
 * Accessible name for a QR code: the provided label, else `"QR code: <value>"`
 * with long values truncated so screen readers don't spell out a whole payload.
 */
export function getQRCodeLabel(value: string | undefined, provided?: string): string {
  if (provided) return provided;
  const text = (value ?? '').trim();
  if (!text) return 'QR code';
  const summary = text.length > SUMMARY_LENGTH ? `${text.slice(0, SUMMARY_LENGTH - 1)}…` : text;
  return `QR code: ${summary}`;
}
