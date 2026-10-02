import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { ExplorerService } from '../explorer/explorer.service.ts';
import { BotLifecycleService } from '../lifecycle/bot-lifecycle.service.ts';
import { getApiToken, getBotToken } from '../utils/tokens.ts';
import { apiProvider, botProvider } from './bot.providers.ts';
import { ConfigurableModuleClass } from './nest-grammy.module-definition.ts';

/**
 * Creates the grammY `Bot` and its `Api` and exposes them via `getBotToken()` and `getApiToken()`.
 * The module is global unless `isGlobal: false` is passed.
 *
 * In polling mode the bot starts on application bootstrap and stops on shutdown;
 * call `app.enableShutdownHooks()` so that `SIGINT`/`SIGTERM` stop it too.
 *
 * @example
 * @Module({
 *   imports: [NestGrammyModule.forRoot({ token: process.env.BOT_TOKEN })],
 * })
 * export class AppModule {}
 *
 * @example
 * NestGrammyModule.forRootAsync({
 *   imports: [ConfigModule],
 *   inject: [ConfigService],
 *   useFactory: (config: ConfigService) => ({ token: config.getOrThrow('BOT_TOKEN') }),
 * });
 */
@Module({
  imports: [DiscoveryModule],
  providers: [botProvider, apiProvider, ExplorerService, BotLifecycleService],
  exports: [getBotToken(), getApiToken()],
})
export class NestGrammyModule extends ConfigurableModuleClass {}
