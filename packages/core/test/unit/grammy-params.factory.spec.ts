import type { Context, NextFunction } from 'grammy';
import { describe, expect, it } from 'vitest';

import { GrammyParamsFactory } from '../../src/context/grammy-params.factory.ts';
import { GrammyParamtype } from '../../src/context/grammy-paramtype.enum.ts';

function createContext(stub: Partial<Record<'msg' | 'from' | 'match', unknown>>): Context {
  return stub as unknown as Context;
}

const next: NextFunction = () => Promise.resolve();

describe('GrammyParamsFactory', () => {
  const factory = new GrammyParamsFactory();

  it('returns the context for CONTEXT', () => {
    const ctx = createContext({});
    expect(factory.exchangeKeyForValue(GrammyParamtype.CONTEXT, undefined, [ctx, next])).toBe(ctx);
  });

  it('returns the next function for NEXT', () => {
    const ctx = createContext({});
    expect(factory.exchangeKeyForValue(GrammyParamtype.NEXT, undefined, [ctx, next])).toBe(next);
  });

  it('returns ctx.msg for MESSAGE', () => {
    const msg = { message_id: 1, text: 'hi' };
    const ctx = createContext({ msg });
    expect(factory.exchangeKeyForValue(GrammyParamtype.MESSAGE, undefined, [ctx, next])).toBe(msg);
  });

  it('returns ctx.from for SENDER', () => {
    const from = { id: 42, is_bot: false, first_name: 'Ann' };
    const ctx = createContext({ from });
    expect(factory.exchangeKeyForValue(GrammyParamtype.SENDER, undefined, [ctx, next])).toBe(from);
  });

  it('returns a string ctx.match as is for PAYLOAD', () => {
    const ctx = createContext({ match: ' 42  foo ' });
    expect(factory.exchangeKeyForValue(GrammyParamtype.PAYLOAD, undefined, [ctx, next])).toBe(
      ' 42  foo ',
    );
  });

  it('returns a RegExp ctx.match as is for PAYLOAD', () => {
    const match = /(\d+)/.exec('order 42');
    const ctx = createContext({ match });
    expect(factory.exchangeKeyForValue(GrammyParamtype.PAYLOAD, undefined, [ctx, next])).toBe(
      match,
    );
  });

  it('splits ctx.match by whitespace for COMMAND_ARGS', () => {
    const ctx = createContext({ match: ' 42  foo\tbar ' });
    expect(
      factory.exchangeKeyForValue(GrammyParamtype.COMMAND_ARGS, undefined, [ctx, next]),
    ).toEqual(['42', 'foo', 'bar']);
  });

  it('returns an empty array for COMMAND_ARGS without arguments', () => {
    const ctx = createContext({ match: '' });
    expect(
      factory.exchangeKeyForValue(GrammyParamtype.COMMAND_ARGS, undefined, [ctx, next]),
    ).toEqual([]);
  });

  it('returns an empty array for COMMAND_ARGS when ctx.match is not a string', () => {
    const ctx = createContext({ match: /(\d+)/.exec('order 42') });
    expect(
      factory.exchangeKeyForValue(GrammyParamtype.COMMAND_ARGS, undefined, [ctx, next]),
    ).toEqual([]);
  });

  it('returns undefined for an unknown type', () => {
    const ctx = createContext({});
    expect(factory.exchangeKeyForValue(-1, undefined, [ctx, next])).toBeUndefined();
  });
});
