import { Inject, Injectable, Module } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Api, Bot } from 'grammy';
import type { UserFromGetMe } from 'grammy/types';
import { afterEach, describe, expect, it } from 'vitest';

import { getApiToken, getBotToken, NestGrammyModule } from '../../src/index.ts';

const TOKEN = '123456:TEST-TOKEN';

const botInfo: UserFromGetMe = {
  id: 123456,
  is_bot: true,
  first_name: 'Test',
  username: 'test_bot',
  can_join_groups: true,
  can_read_all_group_messages: false,
  supports_inline_queries: false,
  can_connect_to_business: false,
  has_main_web_app: false,
  has_topics_enabled: false,
  allows_users_to_create_topics: false,
  can_manage_bots: false,
  supports_join_request_queries: false,
};

@Injectable()
class BotConsumer {
  constructor(
    @Inject(getBotToken()) readonly bot: Bot,
    @Inject(getApiToken()) readonly api: Api,
  ) {}
}

@Module({ providers: [BotConsumer], exports: [BotConsumer] })
class ConsumerModule {}

describe('NestGrammyModule', () => {
  let moduleRef: TestingModule | undefined;

  afterEach(async () => {
    await moduleRef?.close();
    moduleRef = undefined;
  });

  async function compile(
    imports: NonNullable<Parameters<typeof Test.createTestingModule>[0]['imports']>,
  ) {
    moduleRef = await Test.createTestingModule({ imports }).compile();
    return moduleRef;
  }

  describe('forRoot', () => {
    it('provides a Bot created from the options', async () => {
      const ref = await compile([
        NestGrammyModule.forRoot({ token: TOKEN, botOptions: { botInfo } }),
      ]);

      const bot = ref.get<Bot>(getBotToken());
      expect(bot).toBeInstanceOf(Bot);
      expect(bot.token).toBe(TOKEN);
      expect(bot.botInfo).toEqual(botInfo);
    });

    it('provides bot.api as Api', async () => {
      const ref = await compile([NestGrammyModule.forRoot({ token: TOKEN })]);

      const api = ref.get<Api>(getApiToken());
      expect(api).toBeInstanceOf(Api);
      expect(api).toBe(ref.get<Bot>(getBotToken()).api);
    });

    it('injects Bot and Api into a service of another module', async () => {
      const ref = await compile([NestGrammyModule.forRoot({ token: TOKEN }), ConsumerModule]);

      const consumer = ref.get(BotConsumer);
      expect(consumer.bot).toBe(ref.get(getBotToken()));
      expect(consumer.api).toBe(ref.get(getApiToken()));
    });

    it('is not global with isGlobal: false', async () => {
      await expect(
        compile([NestGrammyModule.forRoot({ token: TOKEN, isGlobal: false }), ConsumerModule]),
      ).rejects.toThrow(/NestGrammyBot:default/);
    });
  });

  describe('options validation', () => {
    it('rejects an empty token', async () => {
      await expect(compile([NestGrammyModule.forRoot({ token: '  ' })])).rejects.toThrow(
        '[nest-grammy] token is empty',
      );
    });

    it('rejects webhook mode without webhook.path', async () => {
      await expect(
        compile([NestGrammyModule.forRoot({ token: TOKEN, mode: 'webhook' })]),
      ).rejects.toThrow("[nest-grammy] webhook.path is required when mode is 'webhook'");
    });

    it('rejects a custom botName until multiple bots are supported', async () => {
      await expect(
        compile([NestGrammyModule.forRoot({ token: TOKEN, botName: 'admin' })]),
      ).rejects.toThrow("[nest-grammy] botName 'admin' is not supported yet");
    });
  });
});
