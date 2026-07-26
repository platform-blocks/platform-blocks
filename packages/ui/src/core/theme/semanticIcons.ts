/**
 * Semantic icon roles → registry icon names.
 *
 * Single source of truth for icons that convey status/severity, so components
 * like Alert and Toast stay consistent (and can be re-themed in one place)
 * instead of hardcoding names inline.
 */
export type SemanticIconRole = 'info' | 'success' | 'warning' | 'error';

export const semanticIcons: Record<SemanticIconRole, string> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
};
