import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';

import { getApiToken, getBotToken, InjectApi, InjectBot } from '../../src/index.ts';

const defaultBot = { name: 'default bot' };
const defaultApi = { name: 'default api' };
const adminBot = { name: 'admin bot' };
const adminApi = { name: 'admin api' };

@Injectable()
class DefaultConsumer {
  constructor(
    @InjectBot() readonly bot: unknown,
    @InjectApi() readonly api: unknown,
  ) {}
}

@Injectable()
class NamedConsumer {
  constructor(
    @InjectBot('admin') readonly bot: unknown,
    @InjectApi('admin') readonly api: unknown,
  ) {}
}

@Injectable()
class PropertyConsumer {
  @InjectBot('admin') readonly bot!: unknown;
  @InjectApi() readonly api!: unknown;
}

async function createModule() {
  return Test.createTestingModule({
    providers: [
      { provide: getBotToken(), useValue: defaultBot },
      { provide: getApiToken(), useValue: defaultApi },
      { provide: getBotToken('admin'), useValue: adminBot },
      { provide: getApiToken('admin'), useValue: adminApi },
      DefaultConsumer,
      NamedConsumer,
      PropertyConsumer,
    ],
  }).compile();
}

describe('@InjectBot and @InjectApi', () => {
  it('inject the default bot and api when name is omitted', async () => {
    const moduleRef = await createModule();
    const consumer = moduleRef.get(DefaultConsumer);

    expect(consumer.bot).toBe(defaultBot);
    expect(consumer.api).toBe(defaultApi);
  });

  it('inject the bot and api registered under the given name', async () => {
    const moduleRef = await createModule();
    const consumer = moduleRef.get(NamedConsumer);

    expect(consumer.bot).toBe(adminBot);
    expect(consumer.api).toBe(adminApi);
  });

  it('support property injection', async () => {
    const moduleRef = await createModule();
    const consumer = moduleRef.get(PropertyConsumer);

    expect(consumer.bot).toBe(adminBot);
    expect(consumer.api).toBe(defaultApi);
  });
});
