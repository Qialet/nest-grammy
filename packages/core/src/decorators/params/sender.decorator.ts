import { GrammyParamtype } from '../../context/grammy-paramtype.enum.ts';
import {
  createGrammyParamDecorator,
  type GrammyParamPipe,
} from './create-grammy-param-decorator.ts';

const createSenderDecorator = createGrammyParamDecorator(GrammyParamtype.SENDER);

/**
 * Injects `ctx.from`: the user who sent the update.
 *
 * @param pipes Pipes applied to the value, as pipe classes or instances.
 *
 * @example
 * @Start()
 * onStart(@Sender() user: User) {
 *   return `Hello, ${user.first_name}!`;
 * }
 */
export function Sender(...pipes: GrammyParamPipe[]): ParameterDecorator {
  return createSenderDecorator(...pipes);
}
