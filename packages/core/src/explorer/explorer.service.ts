import type { OnModuleInit } from '@nestjs/common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { DiscoveryService, ExternalContextCreator, MetadataScanner } from '@nestjs/core';
import type { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper.js';
import type { Bot, BotError, Context, Middleware, NextFunction } from 'grammy';

import { GRAMMY_CONTEXT_TYPE, PARAM_ARGS_METADATA, UPDATE_METADATA } from '../constants.ts';
import type { GrammyContextType } from '../context/grammy-context-type.ts';
import { GrammyParamsFactory } from '../context/grammy-params.factory.ts';
import { getListenersMetadata } from '../decorators/listeners/create-listener-decorator.ts';
import type { ListenerMetadata } from '../interfaces/listener-metadata.interface.ts';
import type { NestGrammyModuleOptions } from '../interfaces/module-options.interface.ts';
import { getBotToken, getOptionsToken } from '../utils/tokens.ts';
import { registerListener } from './register-listener.ts';

/** A listener decorator found on a method of an `@Update()` provider instance. */
export interface DiscoveredListener {
  readonly instance: object;
  readonly methodName: string;
  readonly metadata: ListenerMetadata;
}

/**
 * Finds `@Update()` providers and registers their listener methods on the bot,
 * wrapped by `ExternalContextCreator` so guards, interceptors, pipes and filters apply.
 */
@Injectable()
export class ExplorerService implements OnModuleInit {
  private readonly logger = new Logger(ExplorerService.name);
  private readonly paramsFactory = new GrammyParamsFactory();

  constructor(
    @Inject(DiscoveryService) private readonly discoveryService: DiscoveryService,
    @Inject(MetadataScanner) private readonly metadataScanner: MetadataScanner,
    @Inject(ExternalContextCreator)
    private readonly externalContextCreator: ExternalContextCreator,
    @Inject(getBotToken()) private readonly bot: Bot,
    @Inject(getOptionsToken()) private readonly options: NestGrammyModuleOptions,
  ) {}

  onModuleInit(): void {
    this.bot.catch((error) => this.logUnhandledError(error));
    for (const listener of this.discover()) {
      registerListener(this.bot, listener.metadata, this.createMiddleware(listener));
    }
  }

  /**
   * Returns the listeners of all singleton `@Update()` providers: `@Use()` first,
   * then the rest in discovery order (module, class, method).
   */
  discover(): DiscoveredListener[] {
    const listeners = this.discoveryService
      .getProviders()
      .filter((wrapper) => isUpdateProvider(wrapper))
      .flatMap((wrapper) => this.discoverInstance(wrapper));
    return [
      ...listeners.filter(({ metadata }) => metadata.type === 'use'),
      ...listeners.filter(({ metadata }) => metadata.type !== 'use'),
    ];
  }

  private discoverInstance(wrapper: InstanceWrapper): DiscoveredListener[] {
    const instance: unknown = wrapper.instance;
    // Request and transient instances do not exist when handlers are registered (T1.0-07).
    if (!wrapper.isDependencyTreeStatic() || wrapper.isTransient) {
      this.logger.warn(
        `[nest-grammy] ${wrapper.name} is not a singleton — @Update() classes must use the default scope, its handlers are skipped`,
      );
      return [];
    }
    if (typeof instance !== 'object' || instance === null) {
      this.logger.warn(
        `[nest-grammy] ${wrapper.name} has no instance — provide @Update() classes with useClass, its handlers are skipped`,
      );
      return [];
    }
    const prototype: unknown = Object.getPrototypeOf(instance);
    if (typeof prototype !== 'object' || prototype === null) {
      return [];
    }
    return this.metadataScanner.getAllMethodNames(prototype).flatMap((methodName) =>
      getListenersMetadata(prototype, methodName).map((metadata) => ({
        instance,
        methodName,
        metadata,
      })),
    );
  }

  private createMiddleware({ instance, methodName, metadata }: DiscoveredListener): Middleware {
    const handler = this.externalContextCreator.create<never, GrammyContextType>(
      instance,
      Reflect.get(instance, methodName),
      methodName,
      PARAM_ARGS_METADATA,
      this.paramsFactory,
      undefined,
      undefined,
      undefined,
      GRAMMY_CONTEXT_TYPE,
    );
    const autoReply = this.options.autoReply ?? true;
    const passThrough = metadata.type === 'use';
    return async (ctx: Context, next: NextFunction) => {
      let nextCalled = false;
      const trackedNext: NextFunction = () => {
        nextCalled = true;
        return next();
      };
      // The result has passed the interceptors already.
      const result: unknown = await handler(ctx, trackedNext);
      if (autoReply && typeof result === 'string') {
        await ctx.reply(result);
      }
      // A @Use() method continues the chain unless it called next() itself;
      // other listeners end it, as grammY handlers do.
      if (passThrough && !nextCalled) {
        await next();
      }
    };
  }

  // Replaces grammY's default handler, which stops polling on the first error.
  private logUnhandledError(error: BotError): void {
    const cause: unknown = error.error;
    this.logger.error(
      `[nest-grammy] Unhandled error while processing update ${error.ctx.update.update_id} — handle it with an exception filter`,
      cause instanceof Error ? cause.stack : String(cause),
    );
  }
}

function isUpdateProvider(wrapper: InstanceWrapper): boolean {
  const { metatype } = wrapper;
  return typeof metatype === 'function' && Reflect.getMetadata(UPDATE_METADATA, metatype) === true;
}
