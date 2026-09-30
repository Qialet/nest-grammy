/**
 * grammY registration method a listener decorator maps to.
 */
export type ListenerType = 'command' | 'on' | 'hears' | 'callbackQuery' | 'use';

/**
 * Metadata written by a listener decorator. A method stores an array of them,
 * one per decorator, in the order the decorators are applied.
 */
export interface ListenerMetadata {
  readonly type: ListenerType;
  readonly args: readonly unknown[];
}
