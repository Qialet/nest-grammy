import type { Type } from '@nestjs/common';
import type { BotConfig, Context, PollingOptions } from 'grammy';
import { describe, expectTypeOf, it } from 'vitest';

import type { NestGrammyModuleOptions } from '../../src/index.ts';

interface MyContext extends Context {
  readonly locale: string;
}

describe('NestGrammyModuleOptions', () => {
  it('requires token', () => {
    expectTypeOf<{ token: string }>().toExtend<NestGrammyModuleOptions>();
    expectTypeOf<{ botName: string }>().not.toExtend<NestGrammyModuleOptions>();
  });

  it('accepts only polling or webhook as mode', () => {
    expectTypeOf<NestGrammyModuleOptions['mode']>().toEqualTypeOf<
      'polling' | 'webhook' | undefined
    >();
    expectTypeOf<{ token: string; mode: string }>().not.toExtend<NestGrammyModuleOptions>();
  });

  it('types botOptions with the context from the generic', () => {
    expectTypeOf<NestGrammyModuleOptions<MyContext>['botOptions']>().toEqualTypeOf<
      BotConfig<MyContext> | undefined
    >();
  });

  it('reuses grammY polling options', () => {
    expectTypeOf<NestGrammyModuleOptions['polling']>().toEqualTypeOf<PollingOptions | undefined>();
  });

  it('requires path in webhook options', () => {
    expectTypeOf<{
      token: string;
      webhook: { url: string };
    }>().not.toExtend<NestGrammyModuleOptions>();
    expectTypeOf<{
      token: string;
      webhook: { path: string; url: string; secretToken: string; setWebhook: boolean };
    }>().toExtend<NestGrammyModuleOptions>();
  });

  it('accepts modules in include', () => {
    expectTypeOf<NestGrammyModuleOptions['include']>().toEqualTypeOf<Type[] | undefined>();
  });
});
