---
'nest-grammy': minor
---

Register the listener methods of `@Update()` providers on the bot when the module initializes. Handlers run through Nest guards, interceptors, pipes and exception filters, `@Use()` methods run before all other listeners, and a string returned by a handler is sent with `ctx.reply` unless `autoReply: false` is set. Request-scoped and transient `@Update()` classes are skipped with a warning. An error no exception filter handles is logged with the `update_id`, and the bot keeps processing updates.
