import { GrammyParamtype } from '../../context/grammy-paramtype.enum.ts';
import {
  createGrammyParamDecorator,
  type GrammyParamPipe,
} from './create-grammy-param-decorator.ts';

const createPayloadDecorator = createGrammyParamDecorator(GrammyParamtype.PAYLOAD);

/**
 * Injects `ctx.match` as is: the text after the command for `@Command`,
 * the `RegExpMatchArray` for RegExp triggers of `@Hears` and `@Action`.
 *
 * @param pipes Pipes applied to the value, as pipe classes or instances.
 *
 * @example
 * @Command('order')
 * onOrder(@Payload(ParseIntPipe) id: number) {
 *   return `Order #${id}`;
 * }
 *
 * @example
 * @Hears(/^buy (\d+)$/)
 * onBuy(@Payload() match: RegExpMatchArray) {
 *   return `Buying ${match[1]}`;
 * }
 */
export function Payload(...pipes: GrammyParamPipe[]): ParameterDecorator {
  return createPayloadDecorator(...pipes);
}
