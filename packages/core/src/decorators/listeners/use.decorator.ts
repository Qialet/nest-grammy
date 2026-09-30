import { createListenerDecorator } from './create-listener-decorator.ts';

/**
 * Runs the method for every update, like `bot.use(middleware)`.
 *
 * @example
 * @Use()
 * onAnyUpdate(@Ctx() ctx: Context) {
 *   this.logger.log(`update ${ctx.update.update_id}`);
 * }
 */
export function Use(): MethodDecorator {
  return createListenerDecorator('use');
}
