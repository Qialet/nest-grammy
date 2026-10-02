---
'nest-grammy': patch
---

Apply pipe classes passed to param decorators, such as `@Payload(ParseIntPipe)`. Previously only pipe instances worked, and pipe classes were silently skipped.
