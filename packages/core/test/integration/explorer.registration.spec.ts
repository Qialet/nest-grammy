import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Injectable, Logger, Scope, UseInterceptors } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { Bot, Context, NextFunction } from 'grammy';
import { BotError } from 'grammy';
import type { Update as TelegramUpdate } from 'grammy/types';
import { map, type Observable } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { NestGrammyModuleOptions } from '../../src/index.ts';
import {
  Action,
  Command,
  CommandArgs,
  Ctx,
  getBotToken,
  Hears,
  NestGrammyModule,
  Next,
  On,
  Start,
  Update,
  Use,
} from '../../src/index.ts';
import type { ApiMock } from '../utils/api-mock.ts';
import { installApiMock } from '../utils/api-mock.ts';
import { BOT_INFO } from '../utils/bot-info.ts';
import { callbackQueryUpdate, commandUpdate, messageUpdate } from '../utils/updates.ts';

const TOKEN = '123456:TEST-TOKEN';

/** Records handler calls in the order they happen. */
const trace: string[] = [];

@Update()
class GreeterUpdate {
  @Start()
  async onStart(@Ctx() ctx: Context) {
    trace.push('start');
    await ctx.reply('Hello!');
  }

  @Command('echo')
  onEcho(@CommandArgs() args: string[]) {
    return args.join(',');
  }

  @Command('count')
  onCount() {
    return 42;
  }

  @Hears('ping')
  onPing() {
    return 'pong';
  }

  @Command('fail')
  onFail() {
    throw new Error('boom');
  }

  // Registered after the commands above: it would catch their messages otherwise.
  @On('message:text')
  onText() {
    trace.push('text');
  }

  @Action('buy')
  onBuy() {
    trace.push('buy');
  }
}

@Update()
class MiddlewareUpdate {
  @Command('start')
  onSecondStart() {
    trace.push('second start');
  }

  @Use()
  onAnyUpdate() {
    trace.push('use');
  }

  @Use()
  async around(@Next() next: NextFunction) {
    trace.push('around before');
    await next();
    trace.push('around after');
  }
}

@Injectable()
class UpperCaseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler<string>): Observable<string> {
    return next.handle().pipe(map((value) => value.toUpperCase()));
  }
}

@Update()
class InterceptedUpdate {
  @Command('shout')
  @UseInterceptors(UpperCaseInterceptor)
  onShout() {
    return 'quiet';
  }
}

// @Update() applies @Injectable() too, so the scoped @Injectable() goes on top.
@Injectable({ scope: Scope.REQUEST })
@Update()
class RequestScopedUpdate {
  @Command('request')
  onRequest() {
    return 'request';
  }
}

/** Handles an update the way `bot.start()` does: a failure goes to `bot.catch`. */
async function handleLikePolling(bot: Bot, update: TelegramUpdate): Promise<void> {
  await bot.handleUpdate(update).catch(async (error: unknown) => {
    if (!(error instanceof BotError)) throw error;
    await bot.errorHandler(error);
  });
}

function sentTexts(mock: ApiMock): string[] {
  return mock.payloads('sendMessage').map(({ text }) => text);
}

describe('ExplorerService registration', () => {
  let moduleRef: TestingModule | undefined;

  afterEach(async () => {
    vi.restoreAllMocks();
    trace.length = 0;
    await moduleRef?.close();
    moduleRef = undefined;
  });

  async function createBot(
    providers: NonNullable<Parameters<typeof Test.createTestingModule>[0]['providers']>,
    options: Partial<NestGrammyModuleOptions> = {},
  ): Promise<{ bot: Bot; mock: ApiMock }> {
    moduleRef = await Test.createTestingModule({
      imports: [
        NestGrammyModule.forRoot({ token: TOKEN, botOptions: { botInfo: BOT_INFO }, ...options }),
      ],
      providers,
    }).compile();
    await moduleRef.init();
    const bot = moduleRef.get<Bot>(getBotToken());
    return { bot, mock: installApiMock(bot) };
  }

  it('calls the @Update handler on handleUpdate', async () => {
    const { bot, mock } = await createBot([GreeterUpdate]);

    await bot.handleUpdate(commandUpdate('start'));

    expect(trace).toEqual(['start']);
    expect(sentTexts(mock)).toEqual(['Hello!']);
  });

  it('resolves param decorators of the handler', async () => {
    const { bot, mock } = await createBot([GreeterUpdate]);

    await bot.handleUpdate(commandUpdate('echo', 'a  b c'));

    expect(sentTexts(mock)).toEqual(['a,b,c']);
  });

  it('registers @Hears, @On and @Action handlers', async () => {
    const { bot, mock } = await createBot([GreeterUpdate]);

    await bot.handleUpdate(messageUpdate('ping'));
    await bot.handleUpdate(messageUpdate('hello'));
    await bot.handleUpdate(callbackQueryUpdate('buy'));

    expect(sentTexts(mock)).toEqual(['pong']);
    expect(trace).toEqual(['text', 'buy']);
  });

  it('replies with a string returned by the handler', async () => {
    const { bot, mock } = await createBot([GreeterUpdate]);

    await bot.handleUpdate(messageUpdate('ping'));

    expect(mock.payloads('sendMessage')).toEqual([
      expect.objectContaining({ chat_id: expect.any(Number), text: 'pong' }),
    ]);
  });

  it('ignores a non-string return value', async () => {
    const { bot, mock } = await createBot([GreeterUpdate]);

    await bot.handleUpdate(commandUpdate('count'));

    expect(mock.calls).toEqual([]);
  });

  it('does not reply with autoReply: false', async () => {
    const { bot, mock } = await createBot([GreeterUpdate], { autoReply: false });

    await bot.handleUpdate(messageUpdate('ping'));

    expect(mock.calls).toEqual([]);
  });

  it('replies with the value returned by interceptors', async () => {
    const { bot, mock } = await createBot([InterceptedUpdate]);

    await bot.handleUpdate(commandUpdate('shout'));

    expect(sentTexts(mock)).toEqual(['QUIET']);
  });

  it('runs @Use handlers before commands and does not call next after a command', async () => {
    const { bot } = await createBot([GreeterUpdate, MiddlewareUpdate]);

    await bot.handleUpdate(commandUpdate('start'));

    expect(trace).toEqual(['use', 'around before', 'start', 'around after']);
  });

  it('skips a request-scoped @Update class with a warning', async () => {
    const warn = vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    const { bot, mock } = await createBot([RequestScopedUpdate]);

    await bot.handleUpdate(commandUpdate('request'));

    expect(mock.calls).toEqual([]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[nest-grammy] RequestScopedUpdate'));
  });

  it('logs an unhandled handler error with update_id and handles the next update', async () => {
    const error = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const { bot, mock } = await createBot([GreeterUpdate]);
    const failing = commandUpdate('fail');

    await handleLikePolling(bot, failing);
    await handleLikePolling(bot, messageUpdate('ping'));

    expect(error).toHaveBeenCalledWith(
      expect.stringContaining(`update ${failing.update_id}`),
      expect.stringContaining('Error: boom'),
    );
    expect(sentTexts(mock)).toEqual(['pong']);
  });
});
