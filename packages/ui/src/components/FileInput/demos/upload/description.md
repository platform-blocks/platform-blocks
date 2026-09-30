---
title: Upload Progress
description: Upload files with `onUpload` and report each file's progress with its `onProgress` helper.
---

Pass `onUpload` to upload files as soon as they are selected, and call `helpers.onProgress(fileId, percent)` to show each file's progress in the file list. This example simulates the network with a short delay.
