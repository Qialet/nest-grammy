import { describe, expect, it } from 'vitest';

import {
  createListenerDecorator,
  getListenersMetadata,
} from '../../src/decorators/listeners/create-listener-decorator.ts';

const pattern = /^hi$/;

class Handlers {
  @createListenerDecorator('command', 'start')
  @createListenerDecorator('hears', pattern, 'hello')
  onGreeting(): void {}

  @createListenerDecorator('use')
  onEveryUpdate(): void {}

  plainMethod(): void {}
}

class ChildHandlers extends Handlers {
  @createListenerDecorator('on', 'message:text')
  override onGreeting(): void {}
}

describe('createListenerDecorator', () => {
  it('stores one metadata entry per decorator, top to bottom', () => {
    expect(getListenersMetadata(Handlers.prototype, 'onGreeting')).toEqual([
      { type: 'command', args: ['start'] },
      { type: 'hears', args: [pattern, 'hello'] },
    ]);
  });

  it('stores an empty args array for a decorator without arguments', () => {
    expect(getListenersMetadata(Handlers.prototype, 'onEveryUpdate')).toEqual([
      { type: 'use', args: [] },
    ]);
  });

  it('keeps metadata of each method separate', () => {
    expect(getListenersMetadata(Handlers.prototype, 'onEveryUpdate')).toHaveLength(1);
  });

  it('does not leak metadata between a parent and an overriding child method', () => {
    expect(getListenersMetadata(ChildHandlers.prototype, 'onGreeting')).toEqual([
      { type: 'on', args: ['message:text'] },
    ]);
    expect(getListenersMetadata(Handlers.prototype, 'onGreeting')).toHaveLength(2);
  });

  it('reads metadata from an instance as well as from a prototype', () => {
    expect(getListenersMetadata(new Handlers(), 'onEveryUpdate')).toEqual([
      { type: 'use', args: [] },
    ]);
  });
});

describe('getListenersMetadata', () => {
  it('returns an empty array for a method without listeners', () => {
    expect(getListenersMetadata(Handlers.prototype, 'plainMethod')).toEqual([]);
  });

  it('returns an empty array for a missing or non-function member', () => {
    expect(getListenersMetadata(Handlers.prototype, 'missing')).toEqual([]);
    expect(getListenersMetadata({ value: 1 }, 'value')).toEqual([]);
  });
});
