import { Bot } from 'grammy';
import { describe, expect, it, vi } from 'vitest';

import { installApiMock } from '../utils/api-mock.ts';
import { BOT_INFO } from '../utils/bot-info.ts';
import { callbackQueryUpdate, commandUpdate, messageUpdate } from '../utils/updates.ts';

describe('update fixtures', () => {
  it('gives every update a fresh update_id', () => {
    const first = messageUpdate('a');
    const second = messageUpdate('b');

    expect(second.update_id).toBeGreaterThan(first.update_id);
  });

  it('builds a private text message', () => {
    expect(messageUpdate('hello').message).toMatchObject({
      text: 'hello',
      chat: { type: 'private' },
      from: { is_bot: false },
    });
  });

  it('marks the command with a bot_command entity', () => {
    expect(commandUpdate('start').message).toMatchObject({
      text: '/start',
      entities: [{ type: 'bot_command', offset: 0, length: 6 }],
    });
  });

  it('appends arguments after the command, outside the entity', () => {
    expect(commandUpdate('echo', 'a b').message).toMatchObject({
      text: '/echo a b',
      entities: [{ type: 'bot_command', offset: 0, length: 5 }],
    });
  });

  it('builds a callback query with data and a message from the bot', () => {
    expect(callbackQueryUpdate('ping').callback_query).toMatchObject({
      data: 'ping',
      from: { is_bot: false },
      message: { from: { id: BOT_INFO.id } },
    });
  });

  it('passes command arguments to grammY as ctx.match', async () => {
    const bot = new Bot('test', { botInfo: BOT_INFO });
    installApiMock(bot);
    const handler = vi.fn<(match: string) => void>();
    bot.command('echo', (ctx) => handler(ctx.match));

    await bot.handleUpdate(commandUpdate('echo', 'a b'));

    expect(handler).toHaveBeenCalledWith('a b');
  });
});
