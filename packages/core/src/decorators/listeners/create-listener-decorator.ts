import { LISTENERS_METADATA } from '../../constants.ts';
import type {
  ListenerMetadata,
  ListenerType,
} from '../../interfaces/listener-metadata.interface.ts';

/**
 * Creates a method decorator that adds a `ListenerMetadata` entry to the method,
 * keeping entries written by other listener decorators on the same method.
 */
export function createListenerDecorator(
  type: ListenerType,
  ...args: readonly unknown[]
): MethodDecorator {
  return (_target, _key, descriptor) => {
    const method: unknown = descriptor.value;
    if (typeof method !== 'function') {
      return;
    }
    // Decorators run bottom to top; prepending keeps the array in source order.
    const listeners: readonly ListenerMetadata[] = [{ type, args }, ...readListeners(method)];
    Reflect.defineMetadata(LISTENERS_METADATA, listeners, method);
  };
}

/**
 * Reads listener metadata of `target[methodName]`; `target` is an instance or a prototype.
 */
export function getListenersMetadata(
  target: object,
  methodName: string | symbol,
): readonly ListenerMetadata[] {
  const method: unknown = Reflect.get(target, methodName);
  return typeof method === 'function' ? readListeners(method) : [];
}

function readListeners(method: object): readonly ListenerMetadata[] {
  const listeners: unknown = Reflect.getOwnMetadata(LISTENERS_METADATA, method);
  return Array.isArray(listeners) ? listeners : [];
}
