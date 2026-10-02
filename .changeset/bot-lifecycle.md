---
'nest-grammy': minor
---

Start long polling on application bootstrap when `mode` is `'polling'` (the default), passing `polling` options to `bot.start()`, and stop the bot on application shutdown. Polling and stop failures are logged instead of crashing the application. Call `app.enableShutdownHooks()` to stop the bot on `SIGINT`/`SIGTERM`.
