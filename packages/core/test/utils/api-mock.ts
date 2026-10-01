import type { ApiCallFn, Bot, Transformer } from 'grammy';
import type { ApiMethods, Message, Opts } from 'grammy/types';

import { BOT_INFO } from './bot-info.ts';
import { CHAT } from './updates.ts';

/** Bot API methods the mock answers. Any other method throws. */
export type MockedMethod =
  | 'sendMessage'
  | 'answerCallbackQuery'
  | 'setWebhook'
  | 'deleteWebhook'
  | 'getUpdates';

/** One intercepted API call: the method and the payload grammY sent. */
export type ApiCall = {
  [M in MockedMethod]: { readonly method: M; readonly payload: Opts<M> };
}[MockedMethod];

/** grammY passes its own AbortSignal shim, not the global type. */
type Signal = Parameters<ApiCallFn>[2];

type Stubs = {
  [M in MockedMethod]: (payload: Opts<M>, signal?: Signal) => Promise<ReturnType<ApiMethods[M]>>;
};

export interface ApiMock {
  /** Calls in the order grammY made them. */
  readonly calls: readonly ApiCall[];
  /** Payloads of the calls to one method. */
  payloads<M extends MockedMethod>(method: M): Opts<M>[];
  /** Forgets the recorded calls and restarts message ids. */
  reset(): void;
}

const MOCKED_METHODS: ReadonlySet<string> = new Set<MockedMethod>([
  'sendMessage',
  'answerCallbackQuery',
  'setWebhook',
  'deleteWebhook',
  'getUpdates',
]);

function isMocked(method: string): method is MockedMethod {
  return MOCKED_METHODS.has(method);
}

/** Resolves with no updates once `signal` aborts, the way `bot.stop()` ends a long poll. */
function waitForAbort(signal: Signal): Promise<[]> {
  if (signal === undefined || signal.aborted) return Promise.resolve([]);
  return new Promise((resolve) => {
    signal.addEventListener('abort', () => resolve([]), { once: true });
  });
}

/**
 * Intercepts every Bot API call of `bot` with a transformer. Stubbed methods
 * are recorded in `calls` and answered locally, other methods throw, so a
 * test never reaches Telegram.
 */
export function installApiMock(bot: Bot): ApiMock {
  const calls: ApiCall[] = [];
  let lastMessageId = 0;

  const stubs: Stubs = {
    sendMessage: async (payload) => {
      lastMessageId += 1;
      const chatId = typeof payload.chat_id === 'number' ? payload.chat_id : CHAT.id;
      return {
        message_id: lastMessageId,
        date: Math.floor(Date.now() / 1000),
        chat: { ...CHAT, id: chatId },
        from: BOT_INFO,
        text: payload.text,
        ...(payload.entities === undefined ? {} : { entities: payload.entities }),
      } satisfies Message.TextMessage;
    },
    answerCallbackQuery: async () => true,
    setWebhook: async () => true,
    deleteWebhook: async () => true,
    getUpdates: async (_payload, signal) => waitForAbort(signal),
  };

  const transformer: Transformer = async (_prev, method, payload, signal) => {
    if (!isMocked(method)) {
      throw new Error(
        `[nest-grammy] API method "${method}" is not mocked — add a stub for it to installApiMock`,
      );
    }
    // TypeScript cannot correlate the generic method with its payload and
    // result, so the stub table is typed per method and the call is widened here.
    const call = { method, payload } as ApiCall;
    calls.push(call);
    const stub = stubs[method] as (payload: unknown, signal?: Signal) => Promise<unknown>;
    const result = await stub(payload, signal);
    return { ok: true, result } as Awaited<ReturnType<Transformer>>;
  };
  bot.api.config.use(transformer);

  return {
    calls,
    payloads: <M extends MockedMethod>(method: M) =>
      calls.flatMap((call) => (call.method === method ? [call.payload as Opts<M>] : [])),
    reset: () => {
      calls.length = 0;
      lastMessageId = 0;
    },
  };
}
