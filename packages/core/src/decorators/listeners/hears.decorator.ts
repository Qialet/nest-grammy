import type { Composer, Context } from 'grammy';

import { createListenerDecorator } from './create-listener-decorator.ts';

/** Trigger type accepted by grammY `Composer.hears`. */
type HearsTrigger = Parameters<Composer<Context>['hears']>[0];

/**
 * Handles messages whose text or caption matches the trigger, like `bot.hears(trigger)`.
 *
 * @param trigger Exact text, a RegExp, or an array of them.
 *
 * @example
 * @Hears('ping')
 * onPing(@Ctx() ctx: Context) {
 *   return ctx.reply('pong');
 * }
 *
 * @example
 * @Hears(/^order (\d+)$/)
 * onOrder(@Ctx() ctx: Context) {
 *   return ctx.reply(`Order ${ctx.match?.[1]}`);
 * }
 */
export function Hears(trigger: HearsTrigger): MethodDecorator {
  return createListenerDecorator('hears', trigger);
}
