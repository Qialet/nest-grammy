import { assignMetadata, type PipeTransform, type Type } from '@nestjs/common';

import { PARAM_ARGS_METADATA } from '../../constants.ts';
import type { GrammyParamtype } from '../../context/grammy-paramtype.enum.ts';

/** A pipe class resolved by Nest DI or a ready pipe instance. */
export type GrammyParamPipe = Type<PipeTransform> | PipeTransform;

/**
 * Creates a parameter decorator factory that records `type` and its pipes in
 * the `ExternalContextCreator` format: `{ '<type>:<index>': { index, data, pipes } }`.
 */
export function createGrammyParamDecorator(
  type: GrammyParamtype,
): (...pipes: GrammyParamPipe[]) => ParameterDecorator {
  return (...pipes) =>
    (target, key, index) => {
      // Constructor parameters (no key) are resolved by DI, not by handler params.
      if (key === undefined) {
        return;
      }
      const args: unknown = Reflect.getMetadata(PARAM_ARGS_METADATA, target.constructor, key);
      Reflect.defineMetadata(
        PARAM_ARGS_METADATA,
        // Positional data and pipes: the signature shared by Nest 10, 11 and 12.
        assignMetadata(isRecord(args) ? args : {}, type, index, undefined, ...pipes),
        target.constructor,
        key,
      );
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
