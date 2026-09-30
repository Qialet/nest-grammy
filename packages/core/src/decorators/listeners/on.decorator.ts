import type { FilterQuery } from 'grammy';

import { createListenerDecorator } from './create-listener-decorator.ts';

/**
 * Handles updates matching the given grammY filter query, like `bot.on(filter)`.
 * An unknown query such as `'foo'` is a compile-time error.
 *
 * @param filter Filter query, or an array of queries matched with OR.
 *
 * @example
 * @On('message:text')
 * onText(@Ctx() ctx: Context) {
 *   return ctx.reply(ctx.msg.text);
 * }
 *
 * @example
 * @On(['message:photo', 'message:video'])
 * onMedia(@Ctx() ctx: Context) {
 *   return ctx.reply('Nice!');
 * }
 */
export function On(filter: FilterQuery | FilterQuery[]): MethodDecorator {
  return createListenerDecorator('on', filter);
}
