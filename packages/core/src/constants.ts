export const GRAMMY_MODULE_OPTIONS = Symbol('GRAMMY_MODULE_OPTIONS');

export const DEFAULT_BOT_NAME = 'default';

export const UPDATE_METADATA = 'nest-grammy:update';

export const LISTENERS_METADATA = 'nest-grammy:listeners';

/**
 * Nest's own `ROUTE_ARGS_METADATA` key: the scanner registers pipe classes
 * from `@Payload(SomePipe)` only under it, so `ExternalContextCreator` can
 * resolve them. The value is the same in Nest 10, 11 and 12.
 */
export const PARAM_ARGS_METADATA = '__routeArguments__';

export const GRAMMY_CONTEXT_TYPE = 'grammy';
