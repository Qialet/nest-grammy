import type { Provider } from '@nestjs/common';
import { Bot } from 'grammy';

import type { NestGrammyModuleOptions } from '../interfaces/module-options.interface.ts';
import { getApiToken, getBotToken, getOptionsToken } from '../utils/tokens.ts';
import { validateModuleOptions } from './validate-module-options.ts';

export const botProvider: Provider = {
  provide: getBotToken(),
  useFactory: (options: NestGrammyModuleOptions): Bot => {
    validateModuleOptions(options);
    return new Bot(options.token, options.botOptions);
  },
  inject: [getOptionsToken()],
};

export const apiProvider: Provider = {
  provide: getApiToken(),
  useFactory: (bot: Bot) => bot.api,
  inject: [getBotToken()],
};
