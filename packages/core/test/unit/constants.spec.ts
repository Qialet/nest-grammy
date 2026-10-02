import { describe, expect, it } from 'vitest';

import {
  GRAMMY_CONTEXT_TYPE,
  LISTENERS_METADATA,
  PARAM_ARGS_METADATA,
  UPDATE_METADATA,
} from '../../src/constants.ts';

describe('constants', () => {
  it('prefixes metadata keys with nest-grammy:', () => {
    for (const key of [UPDATE_METADATA, LISTENERS_METADATA]) {
      expect(key).toMatch(/^nest-grammy:/);
    }
  });

  it("stores param metadata under Nest's route args key", () => {
    expect(PARAM_ARGS_METADATA).toBe('__routeArguments__');
  });

  it('uses unique metadata keys', () => {
    const keys = new Set([UPDATE_METADATA, LISTENERS_METADATA, PARAM_ARGS_METADATA]);

    expect(keys.size).toBe(3);
  });

  it('names the context type grammy', () => {
    expect(GRAMMY_CONTEXT_TYPE).toBe('grammy');
  });
});
