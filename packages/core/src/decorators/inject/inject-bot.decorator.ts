import { Inject } from '@nestjs/common';

import { getBotToken } from '../../utils/tokens.ts';

/**
 * Injects the grammY `Bot` instance registered under `name`.
 *
 * @param name Bot name from `NestGrammyModuleOptions.botName`; the default bot when omitted.
 *
 * @example
 * constructor(@InjectBot() private readonly bot: Bot) {}
 *
 * @example
 * constructor(@InjectBot('admin') private readonly adminBot: Bot<AdminContext>) {}
 */
export function InjectBot(name?: string): PropertyDecorator & ParameterDecorator {
  return Inject(getBotToken(name));
}
