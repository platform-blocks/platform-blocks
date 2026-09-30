import React, { ReactNode } from 'react';
// import { IconName } from '@plocks/ui';

export interface SpotlightActionData {
  /** Unique action identifier */
  id: string;
  /** Action label */
  label: string;
  /** Action description */
  description?: string;
  /** Action keywords for better search matching */
  keywords?: string[];
  /** Icon to display */
  icon?: string | ReactNode;
  /** Action press handler */
  onPress?: () => void;
  /** Whether action is disabled */
  disabled?: boolean;
  /** Custom component to render instead of default action */
  component?: ReactNode;
}

export interface SpotlightActionGroupData {
  /** Group label */
  group: string;
  /** Actions in this group */
  actions: SpotlightActionData[];
}

export type SpotlightItem = SpotlightActionData | SpotlightActionGroupData;

export function isActionGroup(item: SpotlightItem): item is SpotlightActionGroupData {
  return 'group' in item && 'actions' in item;
}

export function isAction(item: SpotlightItem): item is SpotlightActionData {
  return 'id' in item && 'label' in item;
}

export function filterActions(
  items: SpotlightItem[],
  query: string,
  limit?: number
): SpotlightItem[] {
  if (!query.trim()) {
    if (limit) {
      // Flatten all actions and apply limit
      const allActions: SpotlightActionData[] = [];
      items.forEach(item => {
        if (isAction(item)) {
          allActions.push(item);
        } else {
          allActions.push(...item.actions);
        }
      });
      return allActions.slice(0, limit);
    }
    return items;
  }

  const queryLower = query.toLowerCase().trim();
  const filteredItems: SpotlightItem[] = [];
  let actionCount = 0;

  for (const item of items) {
    if (limit && actionCount >= limit) break;

    if (isAction(item)) {
      if (matchesAction(item, queryLower)) {
        filteredItems.push(item);
        actionCount++;
      }
    } else {
      const matchingActions = item.actions.filter(action => {
        if (limit && actionCount >= limit) return false;
        if (matchesAction(action, queryLower)) {
          actionCount++;
          return true;
        }
        return false;
      });

      if (matchingActions.length > 0) {
        filteredItems.push({
          group: item.group,
          actions: matchingActions,
        });
      }
    }
  }

  return filteredItems;
}

function matchesAction(action: SpotlightActionData, query: string): boolean {
  const searchText = [
    action.label,
    action.description || '',
    ...(action.keywords || []),
  ].join(' ').toLowerCase();

  return searchText.includes(query);
}
