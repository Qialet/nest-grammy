import { Injectable, Logger, Scope } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ExplorerService } from '../../src/explorer/explorer.service.ts';
import { Command, Hears, NestGrammyModule, On, Start, Update, Use } from '../../src/index.ts';
import { BOT_INFO } from '../utils/bot-info.ts';

@Update()
class GreeterUpdate {
  @Start()
  onStart() {}

  @Hears('hi')
  @Command('hello')
  onHello() {}

  helper() {}

  @Use()
  logger() {}
}

@Update()
class TextUpdate {
  @On('message:text')
  onText() {}

  @Use()
  auth() {}
}

@Injectable()
class PlainService {
  @Command('ignored')
  onIgnored() {}
}

// @Update() applies @Injectable() too, so the scoped @Injectable() goes on top.
@Injectable({ scope: Scope.REQUEST })
@Update()
class RequestScopedUpdate {
  @Command('request')
  onRequest() {}
}

@Injectable({ scope: Scope.TRANSIENT })
@Update()
class TransientUpdate {
  @Command('transient')
  onTransient() {}
}

describe('ExplorerService discovery', () => {
  let moduleRef: TestingModule | undefined;

  afterEach(async () => {
    vi.restoreAllMocks();
    await moduleRef?.close();
    moduleRef = undefined;
  });

  async function discover(
    providers: NonNullable<Parameters<typeof Test.createTestingModule>[0]['providers']>,
  ) {
    moduleRef = await Test.createTestingModule({
      imports: [
        NestGrammyModule.forRoot({ token: '123456:TEST-TOKEN', botOptions: { botInfo: BOT_INFO } }),
      ],
      providers,
    }).compile();
    return moduleRef.get(ExplorerService).discover();
  }

  function describeListeners(listeners: Awaited<ReturnType<typeof discover>>) {
    return listeners.map(({ instance, methodName, metadata }) => [
      instance.constructor.name,
      methodName,
      metadata.type,
      metadata.args,
    ]);
  }

  it('finds the listeners of an @Update provider with its instance', async () => {
    const listeners = await discover([GreeterUpdate]);

    expect(describeListeners(listeners)).toEqual([
      ['GreeterUpdate', 'logger', 'use', []],
      ['GreeterUpdate', 'onStart', 'command', ['start']],
      ['GreeterUpdate', 'onHello', 'hears', ['hi']],
      ['GreeterUpdate', 'onHello', 'command', ['hello']],
    ]);
    expect(listeners[0]?.instance).toBe(moduleRef?.get(GreeterUpdate));
  });

  it('puts @Use listeners of all classes before other listeners', async () => {
    const listeners = await discover([GreeterUpdate, TextUpdate]);

    expect(listeners.map(({ methodName }) => methodName)).toEqual([
      'logger',
      'auth',
      'onStart',
      'onHello',
      'onHello',
      'onText',
    ]);
  });

  it('ignores providers without @Update', async () => {
    const listeners = await discover([PlainService]);

    expect(listeners).toEqual([]);
  });

  it.each([
    ['request-scoped', RequestScopedUpdate],
    ['transient', TransientUpdate],
  ])('skips a %s @Update class with a warning', async (_scope, metatype) => {
    const warn = vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);

    const listeners = await discover([GreeterUpdate, metatype]);

    expect(listeners.map(({ instance }) => instance.constructor.name)).not.toContain(metatype.name);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining(`[nest-grammy] ${metatype.name}`));
  });
});
