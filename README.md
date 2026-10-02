# nest-grammy

[grammY](https://grammy.dev) integration for [NestJS](https://nestjs.com): decorators in the style of `nestjs-telegraf`, full support for Nest guards, interceptors, pipes and filters, webhook and long polling modes.

> **Status:** work in progress (`0.0.x`). The public API is not stable yet.

## Requirements

- Node.js >= 22.12
- NestJS 10, 11 or 12
- grammY >= 1.46

## Installation

```bash
pnpm add nest-grammy grammy
```

## Quick start

_Coming in 0.1._

### Graceful shutdown

In polling mode the bot starts when the application bootstraps and stops on
`app.close()`. To stop it on `SIGINT`/`SIGTERM` as well, enable Nest shutdown hooks:

```ts
const app = await NestFactory.create(AppModule);
app.enableShutdownHooks();
await app.listen(3000);
```

## Development

```bash
pnpm install
pnpm build      # build all packages (tsdown, ESM + CJS)
pnpm test       # run tests (Vitest)
pnpm typecheck  # tsc --noEmit
pnpm lint       # oxlint
pnpm format     # oxfmt
pnpm changeset  # describe a change for the next release
```

## License

[MIT](./LICENSE)
