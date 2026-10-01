import type { ParamData } from '@nestjs/common';
import type { ParamsFactory } from '@nestjs/core';
import type { Context, NextFunction } from 'grammy';

import { GrammyParamtype } from './grammy-paramtype.enum.ts';

/** Handler arguments passed by grammY to a middleware: `[ctx, next]`. */
export type GrammyHandlerArgs = readonly [Context, NextFunction];

/**
 * Resolves `@Ctx()`, `@Payload()` and the other grammY param decorators
 * from the middleware arguments for `ExternalContextCreator`.
 */
export class GrammyParamsFactory implements ParamsFactory {
  exchangeKeyForValue(
    type: number,
    _data: ParamData | undefined,
    args: GrammyHandlerArgs,
  ): unknown {
    const [ctx, next] = args;
    switch (type) {
      case GrammyParamtype.CONTEXT:
        return ctx;
      case GrammyParamtype.NEXT:
        return next;
      case GrammyParamtype.MESSAGE:
        return ctx.msg;
      case GrammyParamtype.SENDER:
        return ctx.from;
      case GrammyParamtype.PAYLOAD:
        return ctx.match;
      case GrammyParamtype.COMMAND_ARGS:
        return splitCommandArgs(ctx.match);
      default:
        return undefined;
    }
  }
}

// Only command-like listeners produce a string match; RegExp matches have no arguments.
function splitCommandArgs(match: Context['match']): string[] {
  return typeof match === 'string' ? match.split(/\s+/).filter(Boolean) : [];
}
