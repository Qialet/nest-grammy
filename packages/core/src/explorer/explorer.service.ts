import { Inject, Injectable, Logger } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import type { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper.js';

import { UPDATE_METADATA } from '../constants.ts';
import { getListenersMetadata } from '../decorators/listeners/create-listener-decorator.ts';
import type { ListenerMetadata } from '../interfaces/listener-metadata.interface.ts';

/** A listener decorator found on a method of an `@Update()` provider instance. */
export interface DiscoveredListener {
  readonly instance: object;
  readonly methodName: string;
  readonly metadata: ListenerMetadata;
}

/**
 * Finds `@Update()` providers and the listener decorators on their methods.
 */
@Injectable()
export class ExplorerService {
  private readonly logger = new Logger(ExplorerService.name);

  constructor(
    @Inject(DiscoveryService) private readonly discoveryService: DiscoveryService,
    @Inject(MetadataScanner) private readonly metadataScanner: MetadataScanner,
  ) {}

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
}

function isUpdateProvider(wrapper: InstanceWrapper): boolean {
  const { metatype } = wrapper;
  return typeof metatype === 'function' && Reflect.getMetadata(UPDATE_METADATA, metatype) === true;
}
