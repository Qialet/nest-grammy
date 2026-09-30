import { Inject } from '@nestjs/common';

import { getApiToken } from '../../utils/tokens.ts';

/**
 * Injects the grammY `Api` instance (`bot.api`) of the bot registered under `name`.
 *
 * @param name Bot name from `NestGrammyModuleOptions.botName`; the default bot when omitted.
 *
 * @example
 * constructor(@InjectApi() private readonly api: Api) {}
 *
 * @example
 * constructor(@InjectApi('admin') private readonly adminApi: Api) {}
 */
export function InjectApi(name?: string): PropertyDecorator & ParameterDecorator {
  return Inject(getApiToken(name));
}
