import type { Type } from '@nestjs/common';
import type { BotConfig, Context, PollingOptions } from 'grammy';

/**
 * Webhook settings used when `mode` is `'webhook'`.
 */
export interface NestGrammyWebhookOptions {
  /** HTTP route that receives updates from Telegram, e.g. `'/telegram'`. */
  path: string;
  /** Public URL passed to `setWebhook`. */
  url?: string;
  /** Value Telegram sends in `X-Telegram-Bot-Api-Secret-Token`; other requests get 401. */
  secretToken?: string;
  /** Call `setWebhook` on bootstrap when `url` is set. Defaults to `true`. */
  setWebhook?: boolean;
}

/**
 * Options of `NestGrammyModule`.
 *
 * @example
 * NestGrammyModule.forRoot({ token: process.env.BOT_TOKEN, mode: 'polling' });
 */
export interface NestGrammyModuleOptions<C extends Context = Context> {
  /** Bot token from @BotFather. */
  token: string;
  /** Name for multi-bot setups, used by `getBotToken(name)`. Defaults to `'default'`. */
  botName?: string;
  /** Passed to `new Bot(token, botOptions)`. */
  botOptions?: BotConfig<C>;
  /** How updates are received. Defaults to `'polling'`. */
  mode?: 'polling' | 'webhook';
  /** Passed to `bot.start(polling)` in polling mode. */
  polling?: PollingOptions;
  /** Required when `mode` is `'webhook'`. */
  webhook?: NestGrammyWebhookOptions;
  /** Reply with the handler's string return value via `ctx.reply`. Defaults to `true`. */
  autoReply?: boolean;
  /** Modules to scan for `@Update()` classes. Defaults to all modules. */
  include?: Type[];
}
