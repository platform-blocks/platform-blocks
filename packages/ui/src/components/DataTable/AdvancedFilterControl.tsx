import React, { useState, useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { Input } from '../Input';
import { Select } from '../Select';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { useTheme } from '../../core';
import { useDebouncedCallback } from '../../hooks';
import type { DataTableColumn, DataTableFilter, FilterType } from './types';

interface AdvancedFilterControlProps<T = any> {
  column: DataTableColumn<T>;
  currentFilter?: DataTableFilter;
  onFilterChange: (filter: DataTableFilter | null) => void;
  data?: T[]; // For auto-generating filter options
  /** Show the operator selector by default (used in the header filter popover). */
  showOperators?: boolean;
  /** Auto-focus the value input on mount (used when opened from the header filter popover). */
  autoFocus?: boolean;
}

interface FilterState {
  operator: DataTableFilter['operator'];
  value: any;
}

export function AdvancedFilterControl<T = any>({
  column,
  currentFilter,
  onFilterChange,
  data = [],
  showOperators = false,
  autoFocus = false
}: AdvancedFilterControlProps<T>) {
  const theme = useTheme();

  const [filterState, setFilterState] = useState<FilterState>({
    operator: 'contains',
    value: currentFilter?.value ?? ''
  });

  const [showAdvanced, setShowAdvanced] = useState(showOperators);

  // Update local state when currentFilter changes
  useEffect(() => {
    if (currentFilter) {
      setFilterState({
        operator: currentFilter.operator,
        value: currentFilter.value
      });
    } else {
      setFilterState({
        operator: getDefaultOperator(column.filterType),
        value: ''
      });
    }
  }, [currentFilter, column.filterType]);

  // Get default operator for filter type
  function getDefaultOperator(filterType?: FilterType): DataTableFilter['operator'] {
    switch (filterType) {
      case 'number':
      case 'date':
        return 'eq';
      case 'select':
      case 'boolean':
        return 'eq';
      default:
        return 'contains';
    }
  }

  // Get available operators for filter type
  function getAvailableOperators(filterType?: FilterType): Array<{
    label: string;
    value: DataTableFilter['operator'];
    icon?: string;
  }> {
    switch (filterType) {
      case 'number':
        return [
          { label: 'Equals', value: 'eq', icon: '=' },
          { label: 'Not equals', value: 'ne', icon: '≠' },
          { label: 'Greater than', value: 'gt', icon: '>' },
          { label: 'Greater or equal', value: 'gte', icon: '≥' },
          { label: 'Less than', value: 'lt', icon: '<' },
          { label: 'Less or equal', value: 'lte', icon: '≤' }
        ];
      case 'date':
        return [
          { label: 'Equals', value: 'eq', icon: '=' },
          { label: 'After', value: 'gt', icon: '>' },
          { label: 'Before', value: 'lt', icon: '<' },
          { label: 'Contains', value: 'contains', icon: '∋' }
        ];
      case 'text':
      default:
        return [
          { label: 'Contains', value: 'contains', icon: '∋' },
          { label: 'Equals', value: 'eq', icon: '=' },
          { label: 'Starts with', value: 'startsWith', icon: 'A→' },
          { label: 'Ends with', value: 'endsWith', icon: '→Z' },
          { label: 'Not equals', value: 'ne', icon: '≠' }
        ];
    }
  }

  // Auto-generate select options from data
  function getAutoOptions(): Array<{ label: string; value: any }> {
    if (column.filterOptions) {
      return column.filterOptions;
    }

    // Extract unique values from data
    const accessor = column.accessor;
    const uniqueValues = new Set<any>();
    
    data.forEach(row => {
      let value;
      if (typeof accessor === 'function') {
        value = accessor(row);
      } else {
        value = row[accessor];
      }
      
      if (value !== null && value !== undefined) {
        uniqueValues.add(value);
      }
    });

    return Array.from(uniqueValues)
      .sort()
      .slice(0, 20) // Limit to 20 options
      .map(value => ({
        label: String(value),
        value: value
      }));
  }

  // Commit a specific value/operator to the parent. Empty values clear the filter.
  const commitFilter = (
    value: any,
    operator: DataTableFilter['operator']
  ) => {
    if (!value && value !== 0 && value !== false) {
      onFilterChange(null);
      return;
    }

    onFilterChange({
      column: column.key,
      operator,
      value
    });
  };

  // Auto-apply while the user types, debounced so we don't filter on every keystroke.
  const debouncedCommit = useDebouncedCallback(commitFilter, 300);

  // Clear filter
  const clearFilter = () => {
    setFilterState({
      operator: getDefaultOperator(column.filterType),
      value: ''
    });
    onFilterChange(null);
  };

  // Render different filter types
  const renderFilterInput = () => {
    const commonStyle = {
      flex: 1,
      fontSize: 12
    };

    switch (column.filterType) {
      case 'select': {
        const options = getAutoOptions();
        return (
          <Select
            size="xs"
            placeholder="Select value..."
            options={[{ label: 'Any', value: '' }, ...options]}
            value={filterState.value}
            onChange={(value) => {
              setFilterState(prev => ({ ...prev, value }));
              if (value === '') {
                clearFilter();
              } else {
                onFilterChange({
                  column: column.key,
                  operator: 'eq',
                  value: value
                });
              }
            }}
          />
        );
      }

      case 'boolean': {
        return (
          <Select
            size="xs"
            placeholder="Any"
            options={[
              { label: 'Any', value: '' },
              { label: 'Yes', value: true },
              { label: 'No', value: false }
            ]}
            value={filterState.value === '' ? '' : filterState.value}
            onChange={(value) => {
              setFilterState(prev => ({ ...prev, value }));
              if (value === '') {
                clearFilter();
              } else {
                onFilterChange({
                  column: column.key,
                  operator: 'eq',
                  value: value
                });
              }
            }}
          />
        );
      }

      case 'number': {
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {showAdvanced && (
              <View style={{ width: 50 }}>
                <Select
                  size="xs"
                  placeholder="="
                  options={getAvailableOperators('number').map(op => ({
                    label: op.icon || op.label,
                    value: op.value
                  }))}
                  value={filterState.operator}
                  onChange={(value) => {
                    const operator = value as DataTableFilter['operator'];
                    setFilterState(prev => ({ ...prev, operator }));
                    debouncedCommit.cancel();
                    commitFilter(filterState.value, operator);
                  }}
                />
              </View>
            )}
            <Input
              size="xs"
              placeholder={showAdvanced ? 'Value' : '= Value'}
              value={String(filterState.value ?? '')}
              onChangeText={(text) => {
                const value = text ? parseFloat(text) : '';
                setFilterState(prev => ({ ...prev, value }));
                debouncedCommit(value, filterState.operator);
              }}
              onBlur={debouncedCommit.flush}
              keyboardType="numeric"
              autoFocus={autoFocus}
              style={commonStyle}
            />
          </View>
        );
      }

      case 'date': {
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {showAdvanced && (
              <View style={{ width: 50 }}>
                <Select
                  size="xs"
                  placeholder="="
                  options={getAvailableOperators('date').map(op => ({
                    label: op.icon || op.label,
                    value: op.value
                  }))}
                  value={filterState.operator}
                  onChange={(value) => {
                    const operator = value as DataTableFilter['operator'];
                    setFilterState(prev => ({ ...prev, operator }));
                    debouncedCommit.cancel();
                    commitFilter(filterState.value, operator);
                  }}
                />
              </View>
            )}
            <Input
              size="xs"
              placeholder="YYYY-MM-DD"
              value={String(filterState.value ?? '')}
              onChangeText={(value) => {
                setFilterState(prev => ({ ...prev, value }));
                debouncedCommit(value, filterState.operator);
              }}
              onBlur={debouncedCommit.flush}
              autoFocus={autoFocus}
              style={commonStyle}
            />
          </View>
        );
      }

      default: { // text
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {showAdvanced && (
              <View style={{ width: 50 }}>
                <Select
                  size="xs"
                  placeholder="∋"
                  options={getAvailableOperators('text').map(op => ({
                    label: op.icon || op.label,
                    value: op.value
                  }))}
                  value={filterState.operator}
                  onChange={(value) => {
                    const operator = value as DataTableFilter['operator'];
                    setFilterState(prev => ({ ...prev, operator }));
                    debouncedCommit.cancel();
                    commitFilter(filterState.value, operator);
                  }}
                />
              </View>
            )}
            <Input
              size="xs"
              placeholder={showAdvanced ? 'Value' : 'Search...'}
              value={String(filterState.value ?? '')}
              onChangeText={(value) => {
                setFilterState(prev => ({ ...prev, value }));
                debouncedCommit(value, filterState.operator);
              }}
              onBlur={debouncedCommit.flush}
              autoFocus={autoFocus}
              style={commonStyle}
            />
          </View>
        );
      }
    }
  };

  return (
    <View style={{ padding: 4, gap: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        {renderFilterInput()}
        
        {/* Advanced toggle */}
        {(column.filterType === 'text' || column.filterType === 'number' || column.filterType === 'date') && (
          <Pressable
            onPress={() => setShowAdvanced(!showAdvanced)}
            style={{
              padding: 4,
              borderRadius: 4,
              backgroundColor: showAdvanced ? theme.colors.primary[1] : 'transparent',
            }}
          >
            <Icon 
              name="settings" 
              size={12} 
              color={showAdvanced ? theme.colors.primary[6] : theme.colors.gray[6]}
            />
          </Pressable>
        )}

        {/* Clear filter */}
        {currentFilter && (
          <Pressable
            onPress={clearFilter}
            style={{
              padding: 4,
              borderRadius: 4,
              backgroundColor: theme.colors.gray[1],
            }}
          >
            <Icon name="x" size={12} color={theme.colors.gray[6]} />
          </Pressable>
        )}
      </View>
    </View>
  );
}