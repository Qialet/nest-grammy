import { ParseIntPipe, type PipeTransform } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { PARAM_ARGS_METADATA } from '../../src/constants.ts';
import { GrammyParamtype } from '../../src/context/grammy-paramtype.enum.ts';
import { CommandArgs, Ctx, Message, Next, Payload, Sender } from '../../src/index.ts';

const upperCasePipe: PipeTransform<string, string> = {
  transform: (value) => value.toUpperCase(),
};

class Handlers {
  onAll(
    @Ctx() _ctx: unknown,
    @Next() _next: unknown,
    @Message() _message: unknown,
    @Sender() _sender: unknown,
    @Payload() _payload: unknown,
    @CommandArgs() _args: unknown,
  ): void {}

  onPiped(@Payload(ParseIntPipe, upperCasePipe) _id: number, @Sender() _sender: unknown): void {}
}

function readParams(methodName: keyof Handlers): unknown {
  return Reflect.getMetadata(PARAM_ARGS_METADATA, Handlers, methodName);
}

describe('param decorators', () => {
  it('store each param type under the "<type>:<index>" key', () => {
    expect(readParams('onAll')).toEqual({
      [`${GrammyParamtype.CONTEXT}:0`]: { index: 0, data: undefined, pipes: [] },
      [`${GrammyParamtype.NEXT}:1`]: { index: 1, data: undefined, pipes: [] },
      [`${GrammyParamtype.MESSAGE}:2`]: { index: 2, data: undefined, pipes: [] },
      [`${GrammyParamtype.SENDER}:3`]: { index: 3, data: undefined, pipes: [] },
      [`${GrammyParamtype.PAYLOAD}:4`]: { index: 4, data: undefined, pipes: [] },
      [`${GrammyParamtype.COMMAND_ARGS}:5`]: { index: 5, data: undefined, pipes: [] },
    });
  });

  it('store pipe classes and instances in the given order', () => {
    expect(readParams('onPiped')).toEqual({
      [`${GrammyParamtype.PAYLOAD}:0`]: {
        index: 0,
        data: undefined,
        pipes: [ParseIntPipe, upperCasePipe],
      },
      [`${GrammyParamtype.SENDER}:1`]: { index: 1, data: undefined, pipes: [] },
    });
  });
});

describe('param decorators on a constructor', () => {
  it('store nothing, constructor parameters are left to DI', () => {
    class Service {
      constructor(@Ctx() readonly ctx: unknown) {}
    }
    expect(Reflect.getMetadataKeys(Service)).not.toContain(PARAM_ARGS_METADATA);
  });
});
