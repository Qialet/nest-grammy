import { Command } from './command.decorator.ts';

/**
 * Handles the `/help` command; shorthand for `@Command('help')`.
 *
 * @example
 * @Help()
 * onHelp(@Ctx() ctx: Context) {
 *   return ctx.reply('Send /start to begin.');
 * }
 */
export function Help(): MethodDecorator {
  return Command('help');
}
