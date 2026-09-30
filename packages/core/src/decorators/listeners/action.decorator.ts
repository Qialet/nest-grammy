import type { Composer, Context } from 'grammy';

import { createListenerDecorator } from './create-listener-decorator.ts';

/** Trigger type accepted by grammY `Composer.callbackQuery`. */
type CallbackQueryTrigger = Parameters<Composer<Context>['callbackQuery']>[0];

/**
 * Handles callback queries from inline buttons whose data matches the trigger,
 * like `bot.callbackQuery(data)`. `@CallbackQuery` is an alias.
 *
 * @param data Exact callback data, a RegExp, or an array of them.
 *
 * @example
 * @Action('buy')
 * onBuy(@Ctx() ctx: Context) {
 *   return ctx.answerCallbackQuery('Added to cart');
 * }
 *
 * @example
 * @Action(/^page:(\d+)$/)
 * onPage(@Ctx() ctx: Context) {
 *   return ctx.answerCallbackQuery(`Page ${ctx.match?.[1]}`);
 * }
 */
export function Action(data: CallbackQueryTrigger): MethodDecorator {
  return createListenerDecorator('callbackQuery', data);
}

/**
 * Alias of `@Action`, named after grammY `bot.callbackQuery`.
 *
 * @example
 * @CallbackQuery('cancel')
 * onCancel(@Ctx() ctx: Context) {
 *   return ctx.answerCallbackQuery('Cancelled');
 * }
 */
export const CallbackQuery = Action;
