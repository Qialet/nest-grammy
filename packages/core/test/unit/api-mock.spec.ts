import { Bot } from 'grammy';
import type { Mock } from 'vitest';
import { describe, expect, it, vi } from 'vitest';

import type { ApiMock } from '../utils/api-mock.ts';
import { installApiMock } from '../utils/api-mock.ts';
import { BOT_INFO } from '../utils/bot-info.ts';
import { callbackQueryUpdate, commandUpdate, messageUpdate } from '../utils/updates.ts';

function createBot(): { bot: Bot; mock: ApiMock; fetch: Mock<typeof globalThis.fetch> } {
  const fetch = vi.fn<typeof globalThis.fetch>();
  const bot = new Bot('test', { botInfo: BOT_INFO, client: { fetch } });
  return { bot, mock: installApiMock(bot), fetch };
}

describe('installApiMock', () => {
  it('records exactly one sendMessage for a replying /start handler', async () => {
    const { bot, mock, fetch } = createBot();
    bot.command('start', (ctx) => ctx.reply('hi'));

    await bot.handleUpdate(commandUpdate('start'));

    expect(mock.calls).toHaveLength(1);
    expect(mock.calls[0]).toMatchObject({
      method: 'sendMessage',
      payload: { chat_id: commandUpdate('start').message?.chat.id, text: 'hi' },
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('returns a text message with an incrementing message_id from sendMessage', async () => {
    const { bot } = createBot();

    const first = await bot.api.sendMessage(1, 'one');
    const second = await bot.api.sendMessage(1, 'two');

    expect(first).toMatchObject({ chat: { id: 1 }, text: 'one', from: { id: BOT_INFO.id } });
    expect(second.message_id).toBe(first.message_id + 1);
  });

  it('stubs answerCallbackQuery, setWebhook and deleteWebhook with true', async () => {
    const { bot, mock, fetch } = createBot();

    await expect(bot.api.answerCallbackQuery('cb')).resolves.toBe(true);
    await expect(bot.api.setWebhook('https://example.com/hook')).resolves.toBe(true);
    await expect(bot.api.deleteWebhook()).resolves.toBe(true);

    expect(mock.calls.map((call) => call.method)).toEqual([
      'answerCallbackQuery',
      'setWebhook',
      'deleteWebhook',
    ]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('answers a callback query from a handler', async () => {
    const { bot, mock } = createBot();
    bot.callbackQuery('ping', (ctx) => ctx.answerCallbackQuery());

    const update = callbackQueryUpdate('ping');
    await bot.handleUpdate(update);

    expect(mock.payloads('answerCallbackQuery')).toEqual([
      { callback_query_id: update.callback_query?.id },
    ]);
  });

  it('returns no updates from getUpdates without a signal', async () => {
    const { bot } = createBot();

    await expect(bot.api.getUpdates({ offset: 1, limit: 1 })).resolves.toEqual([]);
  });

  it('holds getUpdates until bot.stop() aborts the long poll', async () => {
    const { bot, mock, fetch } = createBot();

    await new Promise<void>((resolve, reject) => {
      bot.start({ onStart: () => resolve() }).catch(reject);
    });
    await bot.stop();

    expect(mock.calls.map((call) => call.method)).toContain('getUpdates');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('throws for a method without a stub instead of calling the network', async () => {
    const { bot, mock, fetch } = createBot();

    await expect(bot.api.getChat(1)).rejects.toThrow(/getChat/);

    expect(mock.calls).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('filters payloads by method', async () => {
    const { bot, mock } = createBot();

    await bot.api.sendMessage(1, 'one');
    await bot.api.deleteWebhook();

    expect(mock.payloads('sendMessage')).toEqual([{ chat_id: 1, text: 'one' }]);
  });

  it('clears calls and restarts message ids on reset', async () => {
    const { bot, mock } = createBot();
    const first = await bot.api.sendMessage(1, 'one');

    mock.reset();
    const again = await bot.api.sendMessage(1, 'one');

    expect(mock.calls).toHaveLength(1);
    expect(again.message_id).toBe(first.message_id);
  });

  it('handles a plain message update without calling the API', async () => {
    const { bot, mock } = createBot();
    const handler = vi.fn<() => void>();
    bot.on('message:text', handler);

    await bot.handleUpdate(messageUpdate('hello'));

    expect(handler).toHaveBeenCalledOnce();
    expect(mock.calls).toEqual([]);
  });
});
