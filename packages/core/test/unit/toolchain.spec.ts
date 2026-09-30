import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';

import { DEFAULT_BOT_NAME, GRAMMY_MODULE_OPTIONS } from '../../src/index.ts';

@Injectable()
class Dependency {
  readonly value = 42;
}

@Injectable()
class Consumer {
  constructor(readonly dependency: Dependency) {}
}

describe('toolchain', () => {
  it('exposes public constants', () => {
    expect(typeof GRAMMY_MODULE_OPTIONS).toBe('symbol');
    expect(DEFAULT_BOT_NAME).toBe('default');
  });

  it('emits decorator metadata for Nest DI', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [Dependency, Consumer],
    }).compile();

    expect(moduleRef.get(Consumer).dependency.value).toBe(42);
  });
});
