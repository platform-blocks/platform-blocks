---
title: Read the keyboard height
category: basics
order: 10
tags: [keyboard, inset]
status: stable
hidden: false
---

Open this page on a phone and focus the input: the readout follows the keyboard. `useKeyboardHeight({ enabled? })` returns a number of pixels; use it as a `paddingBottom` or `bottom` offset. Desktop browsers always report 0.

On native it follows the keyboard show and hide events (iOS reports them before the keyboard animates), and inside a `KeyboardManagerProvider` it reads that provider's metrics instead of adding listeners. On the web it measures how much of the layout viewport the keyboard covers, using `visualViewport`. Every instance shares one set of listeners, and static rendering sees 0.
