import type { Composer, Context } from 'grammy';
import { describe, expect, expectTypeOf, it } from 'vitest';

import { getListenersMetadata } from '../../src/decorators/listeners/create-listener-decorator.ts';
import { Command, Help, Start } from '../../src/index.ts';

class Handlers {
  @Start()
  onStart(): void {}

  @Help()
  onHelp(): void {}

  @Command('settings')
  onSettings(): void {}

  @Command(['ping', 'pong'])
  onPing(): void {}

  @Start()
  @Command('begin')
  onBegin(): void {}
}

describe('@Command', () => {
  it('stores a command listener with a single name', () => {
    expect(getListenersMetadata(Handlers.prototype, 'onSettings')).toEqual([
      { type: 'command', args: ['settings'] },
    ]);
  });

  it('stores an array of names as is', () => {
    expect(getListenersMetadata(Handlers.prototype, 'onPing')).toEqual([
      { type: 'command', args: [['ping', 'pong']] },
    ]);
  });

  it('accepts the same name type as Composer.command', () => {
    expectTypeOf(Command).parameter(0).toEqualTypeOf<Parameters<Composer<Context>['command']>[0]>();
  });
});

describe('@Start and @Help', () => {
  it('store the start and help commands', () => {
    expect(getListenersMetadata(Handlers.prototype, 'onStart')).toEqual([
      { type: 'command', args: ['start'] },
    ]);
    expect(getListenersMetadata(Handlers.prototype, 'onHelp')).toEqual([
      { type: 'command', args: ['help'] },
    ]);
  });

  it('combine with other listener decorators in source order', () => {
    expect(getListenersMetadata(Handlers.prototype, 'onBegin')).toEqual([
      { type: 'command', args: ['start'] },
      { type: 'command', args: ['begin'] },
    ]);
  });
});
