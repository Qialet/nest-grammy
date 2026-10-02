import type { Bot, Context, Middleware } from 'grammy';

import type { ListenerMetadata } from '../interfaces/listener-metadata.interface.ts';

type CommandTrigger = Parameters<Bot['command']>[0];
type FilterTrigger = Parameters<Bot['on']>[0];
type HearsTrigger = Parameters<Bot['hears']>[0];
type CallbackQueryTrigger = Parameters<Bot['callbackQuery']>[0];

/**
 * Registers `middleware` on `bot` with the grammY method the listener decorator maps to.
 * The trigger was typed by the decorator, so it is passed to grammY as is.
 */
export function registerListener(
  bot: Bot,
  { type, args }: ListenerMetadata,
  middleware: Middleware<Context>,
): void {
  const [trigger] = args;
  switch (type) {
    case 'command':
      bot.command(trigger as CommandTrigger, middleware);
      return;
    case 'on':
      bot.on(trigger as FilterTrigger, middleware);
      return;
    case 'hears':
      bot.hears(trigger as HearsTrigger, middleware);
      return;
    case 'callbackQuery':
      bot.callbackQuery(trigger as CallbackQueryTrigger, middleware);
      return;
    case 'use':
      bot.use(middleware);
      return;
  }
}
