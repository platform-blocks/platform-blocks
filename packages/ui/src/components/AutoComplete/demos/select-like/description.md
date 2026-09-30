---
title: Select-Like Behavior
category: usage
order: 25
tags: [select, dropdown, focus, options]
highlightLines: []
status: stable
hidden: false
---

Behaves like a Select: the field is non-editable (`editable={false}`), so it can't be typed into or filtered. Tapping opens the full option list (`filter={() => true}`) and the value is chosen from it.