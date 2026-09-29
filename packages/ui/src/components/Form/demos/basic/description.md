---
title: Basic Usage
category: basics
order: 10
tags: [form, fields, validation]
status: stable
since: 1.0.0
hidden: false
---

`Form` manages values, validation, and submission state. Give each `Form.Field` a `name` and put a `Form.Input` inside it (it binds to that field's value, change handler and error), then trigger submission with `Form.Submit`.
