import type { Chat, Message, Update, User } from 'grammy/types';

import { BOT_INFO } from './bot-info.ts';

/** The user who sends every fixture update. */
export const USER = {
  id: 1001,
  is_bot: false,
  first_name: 'Alice',
  username: 'alice',
} satisfies User;

/** The private chat between `USER` and the bot. */
export const CHAT: Chat.PrivateChat = {
  id: USER.id,
  type: 'private',
  first_name: USER.first_name,
  username: USER.username,
};

let lastUpdateId = 0;
let lastMessageId = 0;

function now(): number {
  return Math.floor(Date.now() / 1000);
}

function textMessage(
  text: string,
  from: User,
): Message.TextMessage & Update.Private & Update.NonChannel {
  lastMessageId += 1;
  return { message_id: lastMessageId, date: now(), chat: CHAT, from, text };
}

function nextUpdateId(): number {
  lastUpdateId += 1;
  return lastUpdateId;
}

/** A private text message from `USER`. */
export function messageUpdate(text = 'hello'): Update {
  return { update_id: nextUpdateId(), message: textMessage(text, USER) };
}

/** `/<command> [args]` from `USER`, with the `bot_command` entity `bot.command()` matches on. */
export function commandUpdate(command: string, args?: string): Update {
  const commandText = `/${command}`;
  const text = args === undefined ? commandText : `${commandText} ${args}`;
  return {
    update_id: nextUpdateId(),
    message: {
      ...textMessage(text, USER),
      entities: [{ type: 'bot_command', offset: 0, length: commandText.length }],
    },
  };
}

/** A press on an inline button with `data`, attached to a message the bot sent. */
export function callbackQueryUpdate(data: string): Update {
  const updateId = nextUpdateId();
  return {
    update_id: updateId,
    callback_query: {
      id: String(updateId),
      from: USER,
      chat_instance: String(CHAT.id),
      message: textMessage('buttons', BOT_INFO),
      data,
    },
  };
}
