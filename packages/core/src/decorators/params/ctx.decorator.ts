import { GrammyParamtype } from '../../context/grammy-paramtype.enum.ts';
import { createGrammyParamDecorator } from './create-grammy-param-decorator.ts';

const createCtxDecorator = createGrammyParamDecorator(GrammyParamtype.CONTEXT);

/**
 * Injects the grammY context of the current update.
 *
 * @example
 * @Start()
 * onStart(@Ctx() ctx: Context) {
 *   return ctx.reply('Hello!');
 * }
 */
export function Ctx(): ParameterDecorator {
  return createCtxDecorator();
}
