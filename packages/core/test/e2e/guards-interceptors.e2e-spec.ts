import type { CallHandler, CanActivate, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { ForbiddenException, Injectable, UseGuards, UseInterceptors } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import type { Context } from 'grammy';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';

import { Command, Ctx, GrammyExecutionContext, Update } from '../../src/index.ts';
import type { TestingApp } from '../utils/testing-app.ts';
import { createTestingApp } from '../utils/testing-app.ts';
import { commandUpdate, USER } from '../utils/updates.ts';

const events: string[] = [];

@Injectable()
class DenyGuard implements CanActivate {
  canActivate(): boolean {
    events.push('guard');
    return false;
  }
}

@Injectable()
class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    events.push('guard');
    return GrammyExecutionContext.create(context).getContext().from?.id === USER.id;
  }
}

@Injectable()
class TraceInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    events.push('before');
    return next.handle().pipe(tap(() => events.push('after')));
  }
}

@Update()
class MethodGuardUpdate {
  @Command('denied')
  @UseGuards(DenyGuard)
  async onDenied(@Ctx() ctx: Context): Promise<void> {
    events.push('handler');
    await ctx.reply('denied');
  }

  @Command('owner')
  @UseGuards(OwnerGuard)
  async onOwner(@Ctx() ctx: Context): Promise<void> {
    events.push('handler');
    await ctx.reply('owner');
  }

  @Command('open')
  async onOpen(@Ctx() ctx: Context): Promise<void> {
    events.push('handler');
    await ctx.reply('open');
  }
}

@Update()
@UseGuards(DenyGuard)
class ClassGuardUpdate {
  @Command('locked')
  async onLocked(@Ctx() ctx: Context): Promise<void> {
    events.push('handler');
    await ctx.reply('locked');
  }
}

@Update()
class PlainUpdate {
  @Command('plain')
  async onPlain(@Ctx() ctx: Context): Promise<void> {
    events.push('handler');
    await ctx.reply('plain');
  }
}

@Update()
class MethodInterceptorUpdate {
  @Command('traced')
  @UseInterceptors(TraceInterceptor)
  async onTraced(@Ctx() ctx: Context): Promise<void> {
    events.push('handler');
    await ctx.reply('traced');
  }
}

@Update()
@UseInterceptors(TraceInterceptor)
class ClassInterceptorUpdate {
  @Command('traced')
  async onTraced(@Ctx() ctx: Context): Promise<void> {
    events.push('handler');
    await ctx.reply('traced');
  }
}

describe('Guards and interceptors', () => {
  let testing: TestingApp | undefined;

  afterEach(async () => {
    await testing?.app.close();
    testing = undefined;
    events.length = 0;
  });

  async function setup(...providers: Parameters<typeof createTestingApp>[0]): Promise<TestingApp> {
    testing = await createTestingApp(providers);
    return testing;
  }

  describe('guards', () => {
    it('skips the handler when a method guard denies access', async () => {
      const { bot, mock } = await setup(MethodGuardUpdate, DenyGuard);
      await expect(bot.handleUpdate(commandUpdate('denied'))).rejects.toMatchObject({
        error: expect.any(ForbiddenException),
      });
      expect(events).toEqual(['guard']);
      expect(mock.payloads('sendMessage')).toEqual([]);
    });

    it('runs the handler when a method guard reads the grammY context and allows access', async () => {
      const { bot, mock } = await setup(MethodGuardUpdate, OwnerGuard);
      await bot.handleUpdate(commandUpdate('owner'));
      expect(events).toEqual(['guard', 'handler']);
      expect(mock.payloads('sendMessage')).toMatchObject([{ chat_id: USER.id, text: 'owner' }]);
    });

    it('does not apply a method guard to other handlers of the class', async () => {
      const { bot, mock } = await setup(MethodGuardUpdate);
      await bot.handleUpdate(commandUpdate('open'));
      expect(events).toEqual(['handler']);
      expect(mock.payloads('sendMessage')).toMatchObject([{ text: 'open' }]);
    });

    it('applies a class guard to every handler of the class', async () => {
      const { bot, mock } = await setup(ClassGuardUpdate);
      await expect(bot.handleUpdate(commandUpdate('locked'))).rejects.toMatchObject({
        error: expect.any(ForbiddenException),
      });
      expect(events).toEqual(['guard']);
      expect(mock.payloads('sendMessage')).toEqual([]);
    });

    it('applies a global guard registered with APP_GUARD', async () => {
      const { bot, mock } = await setup(PlainUpdate, { provide: APP_GUARD, useClass: DenyGuard });
      await expect(bot.handleUpdate(commandUpdate('plain'))).rejects.toMatchObject({
        error: expect.any(ForbiddenException),
      });
      expect(events).toEqual(['guard']);
      expect(mock.payloads('sendMessage')).toEqual([]);
    });
  });

  describe('interceptors', () => {
    it('wraps the handler with a method interceptor', async () => {
      const { bot, mock } = await setup(MethodInterceptorUpdate);
      await bot.handleUpdate(commandUpdate('traced'));
      expect(events).toEqual(['before', 'handler', 'after']);
      expect(mock.payloads('sendMessage')).toMatchObject([{ text: 'traced' }]);
    });

    it('wraps every handler of the class with a class interceptor', async () => {
      const { bot } = await setup(ClassInterceptorUpdate);
      await bot.handleUpdate(commandUpdate('traced'));
      expect(events).toEqual(['before', 'handler', 'after']);
    });

    it('wraps the handler with a global interceptor registered with APP_INTERCEPTOR', async () => {
      const { bot } = await setup(PlainUpdate, {
        provide: APP_INTERCEPTOR,
        useClass: TraceInterceptor,
      });
      await bot.handleUpdate(commandUpdate('plain'));
      expect(events).toEqual(['before', 'handler', 'after']);
    });

    it('runs guards before interceptors', async () => {
      const { bot } = await setup(MethodInterceptorUpdate, {
        provide: APP_GUARD,
        useClass: OwnerGuard,
      });
      await bot.handleUpdate(commandUpdate('traced'));
      expect(events).toEqual(['guard', 'before', 'handler', 'after']);
    });
  });
});
