import { createListenerDecorator } from './create-listener-decorator.ts';

/**
 * Runs the method for every update, like `bot.use(middleware)`. `@Use()` methods
 * run before all other listeners. The next middleware runs after the method
 * returns, unless the method called `@Next()` itself.
 *
 * @example
 * @Use()
 * onAnyUpdate(@Ctx() ctx: Context) {
 *   this.logger.log(`update ${ctx.update.update_id}`);
 * }
 *
 * @example
 * @Use()
 * async timing(@Next() next: NextFunction) {
 *   const start = Date.now();
 *   await next();
 *   this.logger.log(`handled in ${Date.now() - start} ms`);
 * }
 */
export function Use(): MethodDecorator {
  return createListenerDecorator('use');
}
