import { DEFAULT_BOT_NAME } from '../constants.ts';
import type { NestGrammyModuleOptions } from '../interfaces/module-options.interface.ts';

/**
 * Throws on options that would only fail later at runtime. Messages never include the token.
 */
export function validateModuleOptions(options: NestGrammyModuleOptions): void {
  if (typeof options.token !== 'string' || options.token.trim() === '') {
    throw new Error(
      '[nest-grammy] token is empty — pass the token from @BotFather to NestGrammyModule.forRoot({ token })',
    );
  }
  // Providers are registered under the default name; another name would never be injectable.
  if (options.botName !== undefined && options.botName !== DEFAULT_BOT_NAME) {
    throw new Error(
      `[nest-grammy] botName '${options.botName}' is not supported yet — omit botName, multiple bots arrive in 0.2`,
    );
  }
  if (options.mode === 'webhook' && !options.webhook?.path) {
    throw new Error(
      "[nest-grammy] webhook.path is required when mode is 'webhook' — set webhook: { path: '/telegram' }",
    );
  }
}
