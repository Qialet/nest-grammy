import type { Composer, Context } from 'grammy';
import { describe, expect, expectTypeOf, it } from 'vitest';

import { getListenersMetadata } from '../../src/decorators/listeners/create-listener-decorator.ts';
import { Hears } from '../../src/index.ts';

const GREETING = /^hi|hello$/i;

class Handlers {
  @Hears('ping')
  onPing(): void {}

  @Hears(GREETING)
  onGreeting(): void {}

  @Hears(['yes', /^no$/])
  onAnswer(): void {}
}

describe('@Hears', () => {
  it('stores a hears listener with a string trigger', () => {
    expect(getListenersMetadata(Handlers.prototype, 'onPing')).toEqual([
      { type: 'hears', args: ['ping'] },
    ]);
  });

  it('stores a RegExp trigger as the same instance', () => {
    const [listener] = getListenersMetadata(Handlers.prototype, 'onGreeting');
    expect(listener?.type).toBe('hears');
    expect(listener?.args[0]).toBe(GREETING);
  });

  it('stores an array of triggers as is', () => {
    expect(getListenersMetadata(Handlers.prototype, 'onAnswer')).toEqual([
      { type: 'hears', args: [['yes', /^no$/]] },
    ]);
  });

  it('accepts the same trigger type as Composer.hears', () => {
    expectTypeOf(Hears).parameter(0).toEqualTypeOf<Parameters<Composer<Context>['hears']>[0]>();
  });
});
