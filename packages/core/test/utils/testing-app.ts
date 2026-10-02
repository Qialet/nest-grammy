import type { Provider } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { Bot } from 'grammy';

import { getBotToken, NestGrammyModule } from '../../src/index.ts';
import type { ApiMock } from './api-mock.ts';
import { installApiMock } from './api-mock.ts';
import { BOT_INFO } from './bot-info.ts';

export const TOKEN = '123456:TEST-TOKEN';

export interface TestingApp {
  readonly app: TestingModule;
  readonly bot: Bot;
  readonly mock: ApiMock;
}

/**
 * Compiles and initializes an app with `NestGrammyModule` and `providers`,
 * so the `@Update()` handlers among them are registered on a mocked bot.
 */
export async function createTestingApp(providers: Provider[]): Promise<TestingApp> {
  const app = await Test.createTestingModule({
    imports: [NestGrammyModule.forRoot({ token: TOKEN, botOptions: { botInfo: BOT_INFO } })],
    providers,
  }).compile();
  const bot = app.get<Bot>(getBotToken());
  const mock = installApiMock(bot);
  await app.init();
  return { app, bot, mock };
}
