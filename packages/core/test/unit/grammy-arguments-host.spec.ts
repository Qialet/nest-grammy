import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host.js';
import type { Context, NextFunction } from 'grammy';
import { describe, expect, expectTypeOf, it } from 'vitest';

import { GrammyArgumentsHost } from '../../src/context/grammy-arguments-host.ts';
import type { GrammyContextType } from '../../src/context/grammy-context-type.ts';

interface MyContext extends Context {
  readonly session: { readonly count: number };
}

const ctx = { update: { update_id: 1 } } as unknown as Context;
const next: NextFunction = () => Promise.resolve();

describe('GrammyArgumentsHost', () => {
  it('extracts the context from the host arguments', () => {
    const host = GrammyArgumentsHost.create(new ExecutionContextHost([ctx, next]));
    expect(host.getContext()).toBe(ctx);
  });

  it('extracts the next function from the host arguments', () => {
    const host = GrammyArgumentsHost.create(new ExecutionContextHost([ctx, next]));
    expect(host.getNext()).toBe(next);
  });

  it('keeps the grammy context type of the source host', () => {
    const source = new ExecutionContextHost([ctx, next]);
    source.setType<GrammyContextType>('grammy');
    const host = GrammyArgumentsHost.create(source);
    expect(host.getType<GrammyContextType>()).toBe('grammy');
  });

  it('keeps a non-grammy context type of the source host', () => {
    const host = GrammyArgumentsHost.create(new ExecutionContextHost([ctx, next]));
    expect(host.getType()).toBe('http');
  });

  it('returns an ExecutionContextHost', () => {
    const host = GrammyArgumentsHost.create(new ExecutionContextHost([ctx, next]));
    expect(host).toBeInstanceOf(ExecutionContextHost);
  });

  it('types getContext with the context type argument', () => {
    const host = GrammyArgumentsHost.create(new ExecutionContextHost([ctx, next]));
    expectTypeOf(host.getContext()).toEqualTypeOf<Context>();
    expectTypeOf(host.getContext<MyContext>()).toEqualTypeOf<MyContext>();
    expectTypeOf(host.getNext()).toEqualTypeOf<NextFunction>();
  });
});
