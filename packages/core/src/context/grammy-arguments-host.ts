import type { ArgumentsHost } from '@nestjs/common';
// Deep import with the .js extension: Nest 10/11 have no exports map, Nest 12 maps './*.js'.
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host.js';
import type { Context, NextFunction } from 'grammy';

/**
 * Typed access to the grammY middleware arguments `[ctx, next]` of an
 * `ArgumentsHost`, for exception filters.
 *
 * @example
 * @Catch()
 * export class ReplyOnErrorFilter implements ExceptionFilter {
 *   catch(exception: unknown, host: ArgumentsHost) {
 *     if (host.getType<GrammyContextType>() !== 'grammy') return;
 *     const ctx = GrammyArgumentsHost.create(host).getContext();
 *     return ctx.reply('Something went wrong');
 *   }
 * }
 */
export class GrammyArgumentsHost extends ExecutionContextHost {
  /** Wraps the arguments of `host`, keeping its context type. */
  static create(host: ArgumentsHost): GrammyArgumentsHost {
    const grammyHost = new GrammyArgumentsHost(host.getArgs());
    grammyHost.setType(host.getType());
    return grammyHost;
  }

  /** The grammY context of the current update. */
  getContext<C extends Context = Context>(): C {
    return this.getArgByIndex<C>(0);
  }

  /** The `next` function of the grammY middleware chain. */
  getNext(): NextFunction {
    return this.getArgByIndex<NextFunction>(1);
  }
}
