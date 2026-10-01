import type { UserFromGetMe } from 'grammy/types';

/** Bot identity for `new Bot(token, { botInfo })`, so `bot.init()` skips `getMe`. */
export const BOT_INFO: UserFromGetMe = {
  id: 42,
  is_bot: true,
  first_name: 'Test Bot',
  username: 'test_bot',
  can_join_groups: true,
  can_read_all_group_messages: false,
  supports_inline_queries: false,
  can_connect_to_business: false,
  has_main_web_app: false,
  has_topics_enabled: false,
  allows_users_to_create_topics: false,
  can_manage_bots: false,
  supports_join_request_queries: false,
};
