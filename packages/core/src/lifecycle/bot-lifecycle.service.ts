import type { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Bot } from 'grammy';

import type { NestGrammyModuleOptions } from '../interfaces/module-options.interface.ts';
import { getBotToken, getOptionsToken } from '../utils/tokens.ts';

/**
 * Starts the bot once the application has bootstrapped and stops it on shutdown.
 * Stopping on SIGINT/SIGTERM needs `app.enableShutdownHooks()` in the user's `main.ts`.
 */
@Injectable()
export class BotLifecycleService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(BotLifecycleService.name);

  constructor(
    @Inject(getBotToken()) private readonly bot: Bot,
    @Inject(getOptionsToken()) private readonly options: NestGrammyModuleOptions,
  ) {}

  onApplicationBootstrap(): void {
    if ((this.options.mode ?? 'polling') === 'polling') {
      this.launch();
    }
  }

  async onApplicationShutdown(): Promise<void> {
    if (!this.bot.isRunning()) {
      return;
    }
    try {
      await this.bot.stop();
    } catch (error) {
      this.logger.error(
        '[nest-grammy] Failed to stop the bot — the last update offset may not be saved, so updates can be delivered again',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /**
   * Launch strategy for polling mode, kept separate as the extension point for grammY runner.
   */
  protected launch(): void {
    // `bot.start()` resolves only after `bot.stop()`, so awaiting it would block bootstrap forever.
    this.bot.start(this.options.polling).catch((error: unknown) => {
      this.logger.error(
        '[nest-grammy] Long polling stopped with an error — check the bot token and network access to Telegram',
        error instanceof Error ? error.stack : String(error),
      );
    });
  }
}
