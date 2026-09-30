---
'nest-grammy': minor
---

Add `NestGrammyModule` with `forRoot` and `forRootAsync`. It provides the grammY `Bot` and its `Api` under `getBotToken()` and `getApiToken()`, is global by default (`isGlobal: false` disables it) and fails at startup on an empty token or on `mode: 'webhook'` without `webhook.path`.
