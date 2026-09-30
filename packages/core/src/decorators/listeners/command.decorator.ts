import type { Composer, Context } from 'grammy';

import { createListenerDecorator } from './create-listener-decorator.ts';

/** Command name type accepted by grammY `Composer.command`. */
type CommandName = Parameters<Composer<Context>['command']>[0];

/**
 * Handles messages with the given bot command(s), like `bot.command(name)`.
 *
 * @param name Command without the leading slash, or an array of commands.
 *
 * @example
 * @Command('settings')
 * onSettings(@Ctx() ctx: Context) {
 *   return ctx.reply('Settings');
 * }
 *
 * @example
 * @Command(['ping', 'health'])
 * onPing(@Ctx() ctx: Context) {
 *   return ctx.reply('pong');
 * }
 */
export function Command(name: CommandName): MethodDecorator {
  return createListenerDecorator('command', name);
}
