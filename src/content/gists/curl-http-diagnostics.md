---
title: "Inspect an HTTP endpoint with curl"
description: "Check response headers, redirects, status, and request timing from the command line."
date: 2026-06-25
tags: ["curl", "http", "networking", "debugging"]
---

## Follow redirects and show headers

```bash
curl --include --location
```

## Print status and timing

```bash
curl --silent --show-error --output /dev/null \
  --write-out 'status=%{http_code} total=%{time_total}s\n' \

```

Add endpoint at the end
