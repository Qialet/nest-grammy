---
'nest-grammy': minor
---

Add the `@Ctx()`, `@Next()`, `@Message()`, `@Sender()`, `@Payload()` and `@CommandArgs()` parameter decorators. `@Payload()` resolves to `ctx.match` as is, `@CommandArgs()` to `ctx.match` split by whitespace. Pipes are passed as arguments, for example `@Payload(ParseIntPipe)`.
