import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';

import { UPDATE_METADATA } from '../../src/constants.ts';
import { Update } from '../../src/index.ts';

@Injectable()
class Dependency {}

@Update()
class UpdateHandlers {
  constructor(readonly dependency: Dependency) {}
}

describe('@Update', () => {
  it('marks the class with update metadata', () => {
    expect(Reflect.getMetadata(UPDATE_METADATA, UpdateHandlers)).toBe(true);
  });

  it('does not mark other injectable classes', () => {
    expect(Reflect.getMetadata(UPDATE_METADATA, Dependency)).toBeUndefined();
  });

  it('makes the class injectable', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [Dependency, UpdateHandlers],
    }).compile();

    expect(moduleRef.get(UpdateHandlers).dependency).toBe(moduleRef.get(Dependency));
  });
});
