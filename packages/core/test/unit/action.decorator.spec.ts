import type { Composer, Context } from 'grammy';
import { describe, expect, expectTypeOf, it } from 'vitest';

import { getListenersMetadata } from '../../src/decorators/listeners/create-listener-decorator.ts';
import { Action, CallbackQuery } from '../../src/index.ts';

class Handlers {
  @Action('buy')
  onBuy(): void {}

  @Action(['next', /^page:\d+$/])
  onPage(): void {}

  @CallbackQuery('cancel')
  onCancel(): void {}
}

describe('@Action', () => {
  it('stores a callbackQuery listener with a single trigger', () => {
    expect(getListenersMetadata(Handlers.prototype, 'onBuy')).toEqual([
      { type: 'callbackQuery', args: ['buy'] },
    ]);
  });

  it('stores an array of triggers as is', () => {
    expect(getListenersMetadata(Handlers.prototype, 'onPage')).toEqual([
      { type: 'callbackQuery', args: [['next', /^page:\d+$/]] },
    ]);
  });

  it('accepts the same trigger type as Composer.callbackQuery', () => {
    expectTypeOf(Action)
      .parameter(0)
      .toEqualTypeOf<Parameters<Composer<Context>['callbackQuery']>[0]>();
  });
});

describe('@CallbackQuery', () => {
  it('is the same decorator as @Action', () => {
    expect(CallbackQuery).toBe(Action);
    expect(getListenersMetadata(Handlers.prototype, 'onCancel')).toEqual([
      { type: 'callbackQuery', args: ['cancel'] },
    ]);
  });
});
