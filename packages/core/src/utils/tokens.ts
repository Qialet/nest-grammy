import { DEFAULT_BOT_NAME } from '../constants.ts';

/**
 * Returns the DI token of the grammY `Bot` instance registered under `name`.
 *
 * @example
 * constructor(@Inject(getBotToken('admin')) private readonly bot: Bot) {}
 */
export function getBotToken(name: string = DEFAULT_BOT_NAME): string {
  return `NestGrammyBot:${name}`;
}

/**
 * Returns the DI token of the grammY `Api` instance (`bot.api`) registered under `name`.
 *
 * @example
 * constructor(@Inject(getApiToken('admin')) private readonly api: Api) {}
 */
export function getApiToken(name: string = DEFAULT_BOT_NAME): string {
  return `NestGrammyApi:${name}`;
}

/**
 * Returns the DI token of the module options registered under `name`.
 *
 * @example
 * constructor(@Inject(getOptionsToken()) private readonly options: NestGrammyModuleOptions) {}
 */
export function getOptionsToken(name: string = DEFAULT_BOT_NAME): string {
  return `NestGrammyOptions:${name}`;
}
