import type { ArgumentsHost, ExceptionFilter, PipeTransform } from '@nestjs/common';
import {
  BadRequestException,
  Catch,
  Injectable,
  ParseIntPipe,
  UseFilters,
  UsePipes,
  Logger,
} from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import type { Context } from 'grammy';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { GrammyContextType } from '../../src/index.ts';
import { Command, Ctx, GrammyArgumentsHost, Payload, Update } from '../../src/index.ts';
import type { TestingApp } from '../utils/testing-app.ts';
import { createTestingApp } from '../utils/testing-app.ts';
import { commandUpdate, USER } from '../utils/updates.ts';

const payloads: unknown[] = [];

@Injectable()
class UpperCasePipe implements PipeTransform {
  transform(value: unknown): unknown {
    return typeof value === 'string' ? value.toUpperCase() : value;
  }
}

/** Replies with the error message of any exception raised in a grammY handler. */
@Catch()
class ReplyFilter implements ExceptionFilter {
  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    if (host.getType<GrammyContextType>() !== 'grammy') throw exception;
    const message = exception instanceof Error ? exception.message : 'unknown error';
    await GrammyArgumentsHost.create(host).getContext().reply(`Error: ${message}`);
  }
}

/** Handles only `BadRequestException`, other exceptions stay unhandled. */
@Catch(BadRequestException)
class BadRequestFilter implements ExceptionFilter {
  async catch(_exception: BadRequestException, host: ArgumentsHost): Promise<void> {
    await GrammyArgumentsHost.create(host).getContext().reply('Bad request');
  }
}

@Update()
class PayloadUpdate {
  @Command('order')
  async onOrder(@Ctx() ctx: Context, @Payload(ParseIntPipe) id: number): Promise<void> {
    payloads.push(id);
    await ctx.reply(`Order #${id}`);
  }

  @Command('shout')
  @UsePipes(UpperCasePipe)
  onShout(@Payload() text: string): void {
    payloads.push(text);
  }

  @Command('echo')
  onEcho(@Payload() text: string): void {
    payloads.push(text);
  }
}

@Update()
@UsePipes(UpperCasePipe)
class ClassPipeUpdate {
  @Command('shout')
  onShout(@Payload() text: string): void {
    payloads.push(text);
  }
}

@Update()
class MethodFilterUpdate {
  @Command('order')
  @UseFilters(ReplyFilter)
  onOrder(@Payload(ParseIntPipe) id: number): void {
    payloads.push(id);
  }

  @Command('fail')
  @UseFilters(BadRequestFilter)
  onFail(): void {
    throw new Error('boom');
  }
}

@Update()
@UseFilters(ReplyFilter)
class ClassFilterUpdate {
  @Command('fail')
  onFail(): void {
    throw new Error('boom');
  }
}

@Update()
class PlainUpdate {
  @Command('fail')
  onFail(): void {
    throw new Error('boom');
  }
}

describe('Pipes and filters', () => {
  let testing: TestingApp | undefined;

  afterEach(async () => {
    await testing?.app.close();
    testing = undefined;
    payloads.length = 0;
    vi.restoreAllMocks();
  });

  async function setup(...providers: Parameters<typeof createTestingApp>[0]): Promise<TestingApp> {
    testing = await createTestingApp(providers);
    return testing;
  }

  describe('pipes', () => {
    it('transforms @Payload() with a param pipe', async () => {
      const { bot, mock } = await setup(PayloadUpdate);
      await bot.handleUpdate(commandUpdate('order', '42'));
      expect(payloads).toEqual([42]);
      expect(mock.payloads('sendMessage')).toMatchObject([{ chat_id: USER.id, text: 'Order #42' }]);
    });

    it('transforms @Payload() with a method pipe', async () => {
      const { bot } = await setup(PayloadUpdate);
      await bot.handleUpdate(commandUpdate('shout', 'hello'));
      expect(payloads).toEqual(['HELLO']);
    });

    it('does not apply a method pipe to other handlers of the class', async () => {
      const { bot } = await setup(PayloadUpdate);
      await bot.handleUpdate(commandUpdate('echo', 'hello'));
      expect(payloads).toEqual(['hello']);
    });

    it('transforms @Payload() with a class pipe', async () => {
      const { bot } = await setup(ClassPipeUpdate);
      await bot.handleUpdate(commandUpdate('shout', 'hello'));
      expect(payloads).toEqual(['HELLO']);
    });

    it('transforms @Payload() with a global pipe registered with APP_PIPE', async () => {
      const { bot } = await setup(PayloadUpdate, { provide: APP_PIPE, useClass: UpperCasePipe });
      await bot.handleUpdate(commandUpdate('echo', 'hello'));
      expect(payloads).toEqual(['HELLO']);
    });

    it('rejects the update with the pipe error when no filter handles it', async () => {
      const { bot, mock } = await setup(PayloadUpdate);
      await expect(bot.handleUpdate(commandUpdate('order', 'abc'))).rejects.toMatchObject({
        error: expect.any(BadRequestException),
      });
      expect(payloads).toEqual([]);
      expect(mock.payloads('sendMessage')).toEqual([]);
    });
  });

  describe('filters', () => {
    it('passes a pipe validation error to a method filter', async () => {
      const { bot, mock } = await setup(MethodFilterUpdate);
      await bot.handleUpdate(commandUpdate('order', 'abc'));
      expect(payloads).toEqual([]);
      expect(mock.payloads('sendMessage')).toMatchObject([
        { chat_id: USER.id, text: expect.stringMatching(/^Error: Validation failed/) },
      ]);
    });

    it('catches handler errors with a class filter', async () => {
      const { bot, mock } = await setup(ClassFilterUpdate);
      await bot.handleUpdate(commandUpdate('fail'));
      expect(mock.payloads('sendMessage')).toMatchObject([{ text: 'Error: boom' }]);
    });

    it('catches handler errors with a global filter registered with APP_FILTER', async () => {
      const { bot, mock } = await setup(PlainUpdate, {
        provide: APP_FILTER,
        useClass: ReplyFilter,
      });
      await bot.handleUpdate(commandUpdate('fail'));
      expect(mock.payloads('sendMessage')).toMatchObject([{ text: 'Error: boom' }]);
    });

    it('logs and rethrows errors that the filter does not catch', async () => {
      const error = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
      const { bot, mock } = await setup(MethodFilterUpdate);
      await expect(bot.handleUpdate(commandUpdate('fail'))).rejects.toMatchObject({
        error: expect.objectContaining({ message: 'boom' }),
      });
      // Nest 12 logs the error itself, Nest 10 and 11 its message and stack.
      expect(error).toHaveBeenCalledOnce();
      expect(mock.payloads('sendMessage')).toEqual([]);
    });
  });
});
