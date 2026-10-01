import type { ExecutionContext } from '@nestjs/common';

import { GrammyArgumentsHost } from './grammy-arguments-host.ts';

/**
 * Typed access to the grammY middleware arguments `[ctx, next]` of an
 * `ExecutionContext`, for guards and interceptors. Keeps the class and the
 * handler of the source context.
 *
 * @example
 * @Injectable()
 * export class AdminGuard implements CanActivate {
 *   canActivate(context: ExecutionContext) {
 *     const ctx = GrammyExecutionContext.create(context).getContext();
 *     return ctx.from?.id === ADMIN_ID;
 *   }
 * }
 */
export class GrammyExecutionContext extends GrammyArgumentsHost implements ExecutionContext {
  /** Wraps `context`, keeping its arguments, class, handler and context type. */
  static override create(context: ExecutionContext): GrammyExecutionContext {
    const grammyContext = new GrammyExecutionContext(
      context.getArgs(),
      context.getClass(),
      context.getHandler(),
    );
    grammyContext.setType(context.getType());
    return grammyContext;
  }
}
