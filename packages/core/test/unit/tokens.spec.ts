import { describe, expect, it } from 'vitest';

import { DEFAULT_BOT_NAME, getApiToken, getBotToken, getOptionsToken } from '../../src/index.ts';

const factories = { getBotToken, getApiToken, getOptionsToken };

describe('tokens', () => {
  describe.each(Object.entries(factories))('%s', (_, getToken) => {
    it('uses the default bot name when name is omitted', () => {
      expect(getToken()).toBe(getToken(DEFAULT_BOT_NAME));
    });

    it('returns the same token for the same name', () => {
      expect(getToken('admin')).toBe(getToken('admin'));
    });

    it('returns different tokens for different names', () => {
      expect(getToken('admin')).not.toBe(getToken('support'));
    });
  });

  it('returns different tokens for bot, api and options of one bot', () => {
    const tokens = new Set([getBotToken('admin'), getApiToken('admin'), getOptionsToken('admin')]);

    expect(tokens.size).toBe(3);
  });

  it('includes the bot name in the token', () => {
    expect(getBotToken()).toBe('NestGrammyBot:default');
    expect(getApiToken('admin')).toBe('NestGrammyApi:admin');
    expect(getOptionsToken('admin')).toBe('NestGrammyOptions:admin');
  });
});
