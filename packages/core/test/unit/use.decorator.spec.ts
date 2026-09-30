import { describe, expect, expectTypeOf, it } from 'vitest';

import { getListenersMetadata } from '../../src/decorators/listeners/create-listener-decorator.ts';
import { Use } from '../../src/index.ts';

class Handlers {
  @Use()
  onAny(): void {}
}

describe('@Use', () => {
  it('stores a use listener without arguments', () => {
    expect(getListenersMetadata(Handlers.prototype, 'onAny')).toEqual([{ type: 'use', args: [] }]);
  });

  it('takes no parameters', () => {
    expectTypeOf(Use).parameters.toEqualTypeOf<[]>();
  });
});
