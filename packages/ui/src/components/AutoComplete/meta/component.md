---
name: AutoComplete
title: AutoComplete
category: input
tags: [input, search, typeahead, autocomplete, suggestions]
playground: true
props:
  data: Array of `AutoCompleteOption` to suggest from
  onSearch: Async fetcher for suggestions
  value: Controlled query string (strictly controlled — update it from `onChangeText`)
  defaultValue: Initial query when uncontrolled
  onChangeText: Fired as the user types
  onSelect: Fired when an option is chosen
  multiSelect: Allow selecting multiple values (renders chips)
  label: Label (ReactNode) rendered above the field and linked to the input
  description: Text shown beneath the label, linked to the input
  required: Marks the field required (announced; asterisk)
  freeSolo: Enter commits the typed text as a new option (`allowCustomValue` is a deprecated alias)
  useModal: Force the top-pinned sheet (true) or the anchored dropdown (false); `usePortal` is deprecated
  onEnter: Called on Enter when it doesn't select an option or commit a free-form value
  placeholder: Placeholder text
  helperText: Helper text shown beneath the input
  error: Error message
  size: Size token controlling height + label scaling
  clearable: Show a clear button when there is text
  labelProps: Override props applied to the label `<Text>`
  descriptionProps: Override props applied to the description `<Text>`
  groupLabelProps: Override props for each group header `<Text>` (theme `sectionLabel` text role by default)
  placeholderTextColor: Color of the placeholder text (in both inline and modal variants)
  startSectionProps: View props applied to the input's selection-area wrapper (chip area + text input)
  endSectionProps: View props applied to the wrapper around the clear button
---
The AutoComplete component provides search functionality with suggestions, supporting single/multi-select, async data loading, and rich content display.

Accessibility: an editable combobox (`role="combobox"`, `aria-autocomplete="list"`). Focus stays in the text input; ArrowUp/ArrowDown move the active option (exposed with `aria-activedescendant`), Enter selects it, Escape closes the list. Options are `role="option"` with `aria-selected`; grouped data renders labelled `role="group"` sections. The `ref` is a FieldHandle (`focus`, `blur`, `clear`).