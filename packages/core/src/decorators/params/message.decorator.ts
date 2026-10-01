import { GrammyParamtype } from '../../context/grammy-paramtype.enum.ts';
import {
  createGrammyParamDecorator,
  type GrammyParamPipe,
} from './create-grammy-param-decorator.ts';

const createMessageDecorator = createGrammyParamDecorator(GrammyParamtype.MESSAGE);

/**
 * Injects `ctx.msg`: the message of the update, including edited and channel posts.
 *
 * @param pipes Pipes applied to the value, as pipe classes or instances.
 *
 * @example
 * @On('message:text')
 * onText(@Message() message: Message.TextMessage) {
 *   return `You wrote: ${message.text}`;
 * }
 */
export function Message(...pipes: GrammyParamPipe[]): ParameterDecorator {
  return createMessageDecorator(...pipes);
}
