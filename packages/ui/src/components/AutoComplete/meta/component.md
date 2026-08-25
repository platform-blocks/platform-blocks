---
name: AutoComplete
title: AutoComplete
category: input
tags: [input, search, typeahead, autocomplete, suggestions]
playground: true
props:
  data: Array of `AutoCompleteOption` to suggest from
  onSearch: Async fetcher for suggestions
  value: Controlled query string
  onChangeText: Fired as the user types
  onSelect: Fired when an option is chosen
  multiSelect: Allow selecting multiple values (renders chips)
  label: Label rendered above the field
  description: Helper text shown beneath the label
  placeholder: Placeholder text
  helperText: Helper text shown beneath the input
  error: Error message
  size: Size token controlling height + label scaling
  clearable: Show a clear button when there is text
  labelProps: Override props applied to the label `<Text>`
  descriptionProps: Override props applied to the description `<Text>`
  placeholderTextColor: Color of the placeholder text (in both inline and modal variants)
  startSectionProps: View props applied to the input's selection-area wrapper (chip area + text input)
  endSectionProps: View props applied to the wrapper around the clear button
---
The AutoComplete component provides search functionality with suggestions, supporting single/multi-select, async data loading, and rich content display