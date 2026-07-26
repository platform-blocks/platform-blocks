---
playground: true
title: PhoneInput
description: A phone number input with masking, raw and formatted value handling, and international support.
category: input
tags: [phone, input, mask, formatting, international]
---

The `PhoneInput` component provides a flexible way to capture telephone numbers with built-in masking and formatting.

It works controlled (`value` + `onChange`) or uncontrolled (`defaultValue`), and stores the **national** digits only — the dial code is rendered as a separate prefix rather than mixed into the value. `onChange` receives `(nationalDigits, formattedDisplay, meta)`, where `meta` carries the resolved `country`, its `dialCode`, a submittable `e164` string, and `isComplete`.

The country mask is authoritative for how many digits the field accepts, so `country` is stable while typing. `autoDetect` is opt-in and only reacts to an explicit `+` dial-code prefix; a recognized dial code is stripped from pasted input either way, so pasting `+1 (555) 123-4567` into a US field yields the right number instead of overflowing the mask.

Pass `selectableCountry` to turn the dial-code prefix into a picker, and `onCountryChange` to observe it. `PHONE_FORMATS`, `PHONE_COUNTRIES`, `getPhoneFormat` and `resolvePhoneCountry` are exported for callers that need the same data. `GB` is the ISO code for the United Kingdom; `UK` is accepted as an alias.

Custom `mask` patterns use `0` for a digit and treat every other character as a literal. Avoid literal digits in a mask — a character that is both a literal and a valid slot is ambiguous, which is why fixed dial codes live outside the mask.
