import { GrammyParamtype } from '../../context/grammy-paramtype.enum.ts';
import {
  createGrammyParamDecorator,
  type GrammyParamPipe,
} from './create-grammy-param-decorator.ts';

const createCommandArgsDecorator = createGrammyParamDecorator(GrammyParamtype.COMMAND_ARGS);

/**
 * Injects the command arguments: `ctx.match` split by whitespace, without empty items.
 * Resolves to an empty array when `ctx.match` is not a string.
 *
 * @param pipes Pipes applied to the value, as pipe classes or instances.
 *
 * @example
 * @Command('add')
 * onAdd(@CommandArgs() args: string[]) {
 *   // "/add 2 3" → ['2', '3']
 *   return String(args.map(Number).reduce((a, b) => a + b, 0));
 * }
 */
export function CommandArgs(...pipes: GrammyParamPipe[]): ParameterDecorator {
  return createCommandArgsDecorator(...pipes);
}
