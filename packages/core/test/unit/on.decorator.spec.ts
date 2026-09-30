import type { FilterQuery } from 'grammy';
import { describe, expect, expectTypeOf, it } from 'vitest';

import { getListenersMetadata } from '../../src/decorators/listeners/create-listener-decorator.ts';
import { On } from '../../src/index.ts';

class Handlers {
  @On('message:text')
  onText(): void {}

  @On(['message:photo', 'edited_message'])
  onPhoto(): void {}
}

describe('@On', () => {
  it('stores an on listener with a single filter', () => {
    expect(getListenersMetadata(Handlers.prototype, 'onText')).toEqual([
      { type: 'on', args: ['message:text'] },
    ]);
  });

  it('stores an array of filters as is', () => {
    expect(getListenersMetadata(Handlers.prototype, 'onPhoto')).toEqual([
      { type: 'on', args: [['message:photo', 'edited_message']] },
    ]);
  });

  it('accepts only grammY filter queries', () => {
    expectTypeOf(On).parameter(0).toEqualTypeOf<FilterQuery | FilterQuery[]>();
    // @ts-expect-error 'foo' is not a valid filter query
    On('foo');
    // @ts-expect-error 'message:foo' is not a valid filter query
    On(['message:text', 'message:foo']);
  });
});
