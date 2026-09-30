import { applyDecorators, Injectable, SetMetadata } from '@nestjs/common';

import { UPDATE_METADATA } from '../../constants.ts';

/**
 * Marks a class as a container of grammY update handlers and makes it injectable.
 * The class must still be listed in the module `providers`.
 *
 * @example
 * @Update()
 * export class GreeterUpdate {
 *   @Start()
 *   onStart(@Ctx() ctx: Context) {
 *     return ctx.reply('Hello!');
 *   }
 * }
 */
export function Update(): ClassDecorator {
  return applyDecorators(SetMetadata(UPDATE_METADATA, true), Injectable());
}
