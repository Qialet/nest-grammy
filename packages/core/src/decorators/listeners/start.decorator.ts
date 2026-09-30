import { Command } from './command.decorator.ts';

/**
 * Handles the `/start` command; shorthand for `@Command('start')`.
 *
 * @example
 * @Start()
 * onStart(@Ctx() ctx: Context) {
 *   return ctx.reply('Hello!');
 * }
 */
export function Start(): MethodDecorator {
  return Command('start');
}
