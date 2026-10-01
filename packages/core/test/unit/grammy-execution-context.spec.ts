import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host.js';
import type { Context, NextFunction } from 'grammy';
import { describe, expect, it } from 'vitest';

import { GrammyArgumentsHost } from '../../src/context/grammy-arguments-host.ts';
import type { GrammyContextType } from '../../src/context/grammy-context-type.ts';
import { GrammyExecutionContext } from '../../src/context/grammy-execution-context.ts';

class TestUpdate {
  onStart(): void {}
}

const ctx = { update: { update_id: 1 } } as unknown as Context;
const next: NextFunction = () => Promise.resolve();

function createSource(): ExecutionContextHost {
  return new ExecutionContextHost([ctx, next], TestUpdate, TestUpdate.prototype.onStart);
}

describe('GrammyExecutionContext', () => {
  it('extracts the context from the execution context arguments', () => {
    expect(GrammyExecutionContext.create(createSource()).getContext()).toBe(ctx);
  });

  it('extracts the next function from the execution context arguments', () => {
    expect(GrammyExecutionContext.create(createSource()).getNext()).toBe(next);
  });

  it('keeps the class of the source context', () => {
    expect(GrammyExecutionContext.create(createSource()).getClass()).toBe(TestUpdate);
  });

  it('keeps the handler of the source context', () => {
    expect(GrammyExecutionContext.create(createSource()).getHandler()).toBe(
      TestUpdate.prototype.onStart,
    );
  });

  it('keeps the grammy context type of the source context', () => {
    const source = createSource();
    source.setType<GrammyContextType>('grammy');
    expect(GrammyExecutionContext.create(source).getType<GrammyContextType>()).toBe('grammy');
  });

  it('is a GrammyArgumentsHost', () => {
    expect(GrammyExecutionContext.create(createSource())).toBeInstanceOf(GrammyArgumentsHost);
  });
});
