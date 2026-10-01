import { GrammyParamtype } from '../../context/grammy-paramtype.enum.ts';
import { createGrammyParamDecorator } from './create-grammy-param-decorator.ts';

const createNextDecorator = createGrammyParamDecorator(GrammyParamtype.NEXT);

/**
 * Injects the grammY `next` function that passes the update to the next middleware.
 *
 * @example
 * @Use()
 * async log(@Ctx() ctx: Context, @Next() next: NextFunction) {
 *   this.logger.log(`update ${ctx.update.update_id}`);
 *   await next();
 * }
 */
export function Next(): ParameterDecorator {
  return createNextDecorator();
}
