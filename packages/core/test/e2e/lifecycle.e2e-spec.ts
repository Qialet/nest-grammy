import { Logger } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { Bot } from 'grammy';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { NestGrammyModuleOptions } from '../../src/index.ts';
import { getBotToken, NestGrammyModule } from '../../src/index.ts';
import type { ApiMock } from '../utils/api-mock.ts';
import { installApiMock } from '../utils/api-mock.ts';
import { BOT_INFO } from '../utils/bot-info.ts';

const TOKEN = '123456:TEST-TOKEN';

describe('Bot lifecycle', () => {
  let moduleRef: TestingModule | undefined;

  afterEach(async () => {
    vi.restoreAllMocks();
    await moduleRef?.close();
    moduleRef = undefined;
  });

  async function createApp(
    options: Partial<NestGrammyModuleOptions> = {},
  ): Promise<{ app: TestingModule; bot: Bot; mock: ApiMock }> {
    const app = await Test.createTestingModule({
      imports: [
        NestGrammyModule.forRoot({ token: TOKEN, botOptions: { botInfo: BOT_INFO }, ...options }),
      ],
    }).compile();
    moduleRef = app;
    const bot = app.get<Bot>(getBotToken());
    return { app, bot, mock: installApiMock(bot) };
  }

  it('starts polling on init without blocking bootstrap', async () => {
    const { app, bot, mock } = await createApp({ polling: { drop_pending_updates: true } });

    await app.init();

    expect(bot.isRunning()).toBe(true);
    await vi.waitFor(() => expect(mock.payloads('getUpdates')).toHaveLength(1));
    expect(mock.payloads('deleteWebhook')).toEqual([{ drop_pending_updates: true }]);
  });

  it('does not start polling in webhook mode', async () => {
    const { app, bot } = await createApp({ mode: 'webhook', webhook: { path: '/telegram' } });

    await app.init();

    expect(bot.isRunning()).toBe(false);
  });

  it('logs a polling failure instead of crashing bootstrap', async () => {
    const error = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const { app, bot } = await createApp();
    vi.spyOn(bot, 'start').mockRejectedValue(new Error('401: Unauthorized'));

    await app.init();

    await vi.waitFor(() =>
      expect(error).toHaveBeenCalledWith(
        expect.stringContaining('[nest-grammy] Long polling stopped'),
        expect.stringContaining('401: Unauthorized'),
      ),
    );
  });
});
